package com.prepwise.mapper;

import com.prepwise.dto.ResumeDto;
import com.prepwise.entity.Resume;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ResumeMapper {

    private final ResumeAnalysisMapper resumeAnalysisMapper;

    public ResumeDto toDto(Resume entity) {
        if (entity == null) return null;
        return ResumeDto.builder()
                .id(entity.getId())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .originalFilename(entity.getOriginalFilename())
                .storagePath(entity.getStoragePath())
                .fileType(entity.getFileType())
                .fileSize(entity.getFileSize())
                .analysis(entity.getResumeAnalysis() != null ? resumeAnalysisMapper.toDto(entity.getResumeAnalysis()) : null)
                .uploadedAt(entity.getUploadedAt())
                .build();
    }
}
