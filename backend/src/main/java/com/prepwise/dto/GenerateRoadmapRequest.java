package com.prepwise.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerateRoadmapRequest {
    private String targetRole;
    private String targetTechnology;
}
