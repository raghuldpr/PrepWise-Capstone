package com.prepwise.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prepwise.dto.ResumeAnalysisDto;
import com.prepwise.dto.ResumeDto;
import com.prepwise.entity.Profile;
import com.prepwise.entity.Resume;
import com.prepwise.entity.ResumeAnalysis;
import com.prepwise.entity.User;
import com.prepwise.exception.ResourceNotFoundException;
import com.prepwise.mapper.ResumeAnalysisMapper;
import com.prepwise.mapper.ResumeMapper;
import com.prepwise.repository.ProfileRepository;
import com.prepwise.repository.ResumeAnalysisRepository;
import com.prepwise.repository.ResumeRepository;
import com.prepwise.repository.UserRepository;
import com.prepwise.service.ai.AIProviderClient;
import com.prepwise.service.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final FileStorageService fileStorageService;
    private final TextExtractionService textExtractionService;
    private final AIProviderClient aiProviderClient;
    private final ResumeMapper resumeMapper;
    private final ResumeAnalysisMapper resumeAnalysisMapper;
    private final ObjectMapper objectMapper;

    @Value("${ai.model:${AI_MODEL:gemini-2.5-flash}}")
    private String aiModelName;

    @Value("${resume.upload.max-size-bytes:10485760}")
    private long maxFileSizeBytes;

    private static final List<String> ALLOWED_MIME_TYPES = List.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
            "application/docx",
            "application/x-docx"
    );

    @Transactional
    public ResumeDto uploadResume(Long userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }

        // 1. File size check (configurable)
        if (file.getSize() > maxFileSizeBytes) {
            long maxMb = maxFileSizeBytes / (1024 * 1024);
            throw new IllegalArgumentException("File size exceeds maximum allowed limit of " + maxMb + "MB");
        }

        // 2. File extension check
        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.toLowerCase().endsWith(".pdf") && !filename.toLowerCase().endsWith(".docx"))) {
            throw new IllegalArgumentException("Only PDF and DOCX files are supported.");
        }

        // 3. Server-side MIME type validation
        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank()) {
            throw new IllegalArgumentException("File MIME type could not be verified.");
        }

        String lowerContentType = contentType.toLowerCase().trim();
        boolean isValidMime = ALLOWED_MIME_TYPES.stream().anyMatch(lowerContentType::contains);
        if (!isValidMime) {
            throw new IllegalArgumentException("Invalid file MIME type (" + contentType + "). Only PDF and DOCX files are allowed.");
        }

        // 4. Server-side Magic bytes content structure validation
        try {
            byte[] headerBytes = file.getBytes();
            if (headerBytes.length < 4) {
                throw new IllegalArgumentException("File content is invalid or corrupted.");
            }
            boolean isPdfMagic = headerBytes[0] == 0x25 && headerBytes[1] == 0x50 && headerBytes[2] == 0x44 && headerBytes[3] == 0x46; // %PDF
            boolean isZipMagic = headerBytes[0] == 0x50 && headerBytes[1] == 0x4B && headerBytes[2] == 0x03 && headerBytes[3] == 0x04; // PK..
            if (!isPdfMagic && !isZipMagic) {
                throw new IllegalArgumentException("Invalid file header. File content does not match PDF or DOCX format.");
            }
        } catch (IllegalArgumentException iae) {
            throw iae;
        } catch (Exception e) {
            log.error("Failed to read file bytes for MIME/header validation", e);
            throw new IllegalArgumentException("Failed to read file content for validation.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // 5. Server-side generated storage path (never accepts client path)
        String storagePath = fileStorageService.storeFile(file, userId);

        Resume resume = Resume.builder()
                .user(user)
                .originalFilename(filename)
                .storagePath(storagePath)
                .fileType(contentType)
                .fileSize(file.getSize())
                .build();

        resume = resumeRepository.save(resume);
        return resumeMapper.toDto(resume);
    }

    @Transactional
    public ResumeAnalysisDto analyzeResume(Long userId, Long resumeId) {
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));

        byte[] fileBytes = fileStorageService.loadFileAsBytes(resume.getStoragePath());
        String extractedText = textExtractionService.extractText(fileBytes, resume.getFileType(), resume.getOriginalFilename());

        Optional<Profile> profileOpt = profileRepository.findByUserId(userId);
        String targetRole = profileOpt.map(Profile::getTargetRole).orElse("Software Engineer");
        String targetCompany = profileOpt.map(Profile::getTargetCompany).orElse("Tech Companies");

        String systemPrompt = "You are an expert ATS & Resume Reviewer for campus placements and technical roles. " +
                "Analyze the resume text provided by the candidate aiming for the target role: " + targetRole + " at " + targetCompany + ". " +
                "Return a JSON object with strictly these keys: " +
                "\"overallScore\" (integer 0-100), \"strengths\" (string), \"weaknesses\" (string), \"missingSkills\" (string), \"suggestions\" (string). " +
                "Do not include any extra keys or outer text markdown wrappers if possible.";

        String userPrompt = "TARGET ROLE: " + targetRole + "\nTARGET COMPANY: " + targetCompany + "\n\nRESUME CONTENT:\n" + extractedText;

        String aiResponse = aiProviderClient.complete(systemPrompt, userPrompt, "RESUME_ANALYSIS", resume.getUser());

        // Parse AI JSON response
        ParsedResumeAnalysis parsed = parseAiAnalysisResponse(aiResponse);

        ResumeAnalysis analysis = resumeAnalysisRepository.findByResumeId(resumeId)
                .orElse(ResumeAnalysis.builder().resume(resume).build());

        analysis.setOverallScore(parsed.overallScore);
        analysis.setStrengths(parsed.strengths);
        analysis.setWeaknesses(parsed.weaknesses);
        analysis.setMissingSkills(parsed.missingSkills);
        analysis.setSuggestions(parsed.suggestions);
        analysis.setAnalysisModel(aiModelName);

        analysis = resumeAnalysisRepository.save(analysis);
        resume.setResumeAnalysis(analysis);

        return resumeAnalysisMapper.toDto(analysis);
    }

    @Transactional(readOnly = true)
    public ResumeAnalysisDto getResumeAnalysis(Long userId, Long resumeId) {
        ResumeAnalysis analysis = resumeAnalysisRepository.findByResumeIdAndResumeUserId(resumeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume analysis not found for resume id: " + resumeId));
        return resumeAnalysisMapper.toDto(analysis);
    }

    @Transactional(readOnly = true)
    public List<ResumeDto> getUserResumes(Long userId) {
        List<Resume> resumes = resumeRepository.findByUserIdOrderByUploadedAtDesc(userId);
        return resumes.stream().map(resumeMapper::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ResumeDto getResume(Long userId, Long resumeId) {
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));
        return resumeMapper.toDto(resume);
    }

    private ParsedResumeAnalysis parseAiAnalysisResponse(String aiResponse) {
        try {
            String cleanJson = aiResponse.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            } else if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();

            JsonNode root = objectMapper.readTree(cleanJson);
            int score = root.path("overallScore").asInt(75);
            String strengths = root.path("strengths").asText("Good structure and technical skills.");
            String weaknesses = root.path("weaknesses").asText("Lacks quantified impact metrics in project descriptions.");
            String missingSkills = root.path("missingSkills").asText("System Design, Microservices, CI/CD");
            String suggestions = root.path("suggestions").asText("Add action verbs and quantify achievements with percentages or numbers.");

            return new ParsedResumeAnalysis(score, strengths, weaknesses, missingSkills, suggestions);
        } catch (Exception e) {
            log.warn("Failed to parse JSON response from AI. Falling back to default raw text parsing. Response was: {}", aiResponse);
            return new ParsedResumeAnalysis(70, aiResponse, "Review project section details.", "Advanced System Architecture", "Tailor resume bullets to match job descriptions.");
        }
    }

    private static class ParsedResumeAnalysis {
        int overallScore;
        String strengths;
        String weaknesses;
        String missingSkills;
        String suggestions;

        ParsedResumeAnalysis(int overallScore, String strengths, String weaknesses, String missingSkills, String suggestions) {
            this.overallScore = overallScore;
            this.strengths = strengths;
            this.weaknesses = weaknesses;
            this.missingSkills = missingSkills;
            this.suggestions = suggestions;
        }
    }
}
