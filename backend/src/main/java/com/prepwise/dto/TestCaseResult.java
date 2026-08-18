package com.prepwise.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCaseResult {
    private String input;
    private String expectedOutput;
    private String actualOutput;
    private boolean passed;
    private String description;
}
