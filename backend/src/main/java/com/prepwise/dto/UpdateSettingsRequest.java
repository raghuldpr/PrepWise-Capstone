package com.prepwise.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateSettingsRequest {

    private String name;
    private String avatarUrl;
    private String settingsData;
}
