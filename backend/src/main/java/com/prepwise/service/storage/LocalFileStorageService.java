package com.prepwise.service.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
public class LocalFileStorageService implements FileStorageService {

    private final Path fileStorageLocation;

    public LocalFileStorageService(@Value("${file.upload-dir:uploads/resumes}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            log.error("Could not create directory for uploaded files: {}", uploadDir, ex);
        }
    }

    @Override
    public String storeFile(MultipartFile file, Long userId) {
        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String fileExtension = "";
        int dotIndex = originalFileName.lastIndexOf('.');
        if (dotIndex >= 0) {
            fileExtension = originalFileName.substring(dotIndex);
        }

        String fileName = "user_" + userId + "_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + fileExtension;

        try {
            if (fileName.contains("..")) {
                throw new IllegalArgumentException("Filename contains invalid path sequence " + fileName);
            }

            Path targetLocation = this.fileStorageLocation.resolve(fileName).normalize();
            if (!targetLocation.startsWith(this.fileStorageLocation)) {
                throw new IllegalArgumentException("Invalid path sequence in filename " + fileName);
            }

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return targetLocation.toString();
        } catch (IOException ex) {
            log.error("Could not store file {}. Please try again!", fileName, ex);
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    @Override
    public byte[] loadFileAsBytes(String storagePath) {
        try {
            Path path = Paths.get(storagePath).toAbsolutePath().normalize();
            if (!path.startsWith(this.fileStorageLocation)) {
                throw new IllegalArgumentException("Access denied: file path is outside the allowed upload directory");
            }
            if (!Files.exists(path)) {
                throw new RuntimeException("File not found at path: " + storagePath);
            }
            return Files.readAllBytes(path);
        } catch (IOException ex) {
            log.error("Error reading file at path {}", storagePath, ex);
            throw new RuntimeException("Error reading file at path: " + storagePath, ex);
        }
    }

    @Override
    public void deleteFile(String storagePath) {
        try {
            Path path = Paths.get(storagePath);
            Files.deleteIfExists(path);
        } catch (IOException ex) {
            log.warn("Could not delete file at path {}", storagePath, ex);
        }
    }
}
