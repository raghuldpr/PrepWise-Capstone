package com.prepwise.service.storage;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String storeFile(MultipartFile file, Long userId);
    byte[] loadFileAsBytes(String storagePath);
    void deleteFile(String storagePath);
}
