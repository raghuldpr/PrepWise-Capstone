package com.prepwise.controller;

import com.prepwise.service.ai.AIProviderClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping({"/api/health", "/health"})
@RequiredArgsConstructor
public class HealthController {

    private final AIProviderClient aiProviderClient;

    @GetMapping
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Collections.singletonMap("status", "UP"));
    }

    @GetMapping("/ai")
    public ResponseEntity<Map<String, Object>> aiHealthCheck() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("provider", aiProviderClient.getProvider());
        result.put("model", aiProviderClient.getModel());
        try {
            boolean available = aiProviderClient.verifyModelAvailability();
            result.put("status", available ? "CONNECTED" : "UNAVAILABLE");
            result.put("modelAvailable", available);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("status", "ERROR");
            result.put("modelAvailable", false);
            result.put("error", e.getMessage());
            return ResponseEntity.status(503).body(result);
        }
    }
}
