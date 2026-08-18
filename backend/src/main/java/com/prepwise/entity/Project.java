package com.prepwise.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Difficulty difficulty = Difficulty.MEDIUM;

    @Column(length = 100)
    private String domain;

    @Column(name = "technology_stack", columnDefinition = "TEXT")
    private String technologyStack;

    @Column(name = "skills_covered", columnDefinition = "TEXT")
    private String skillsCovered;

    @Column(name = "placement_relevance", columnDefinition = "TEXT")
    private String placementRelevance;

    @Column(name = "development_roadmap", columnDefinition = "TEXT")
    private String developmentRoadmap;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
