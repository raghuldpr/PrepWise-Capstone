package com.prepwise.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeDto {
    private Long id;
    private Long userId;
    private String originalFilename;
    private String storagePath;
    private String fileType;
    private Long fileSize;
    private ResumeAnalysisDto analysis;
    private LocalDateTime uploadedAt;
}
