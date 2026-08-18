package com.prepwise.service;

/**
 * Service Package Marker
 * 
 * Purpose: Contains core business logic and authorization/ownership filtering.
 * Rule: All student-owned resources (attempts, resumes, interviews, ai_conversations, progress, projects) 
 * are filtered by authenticated user ID retrieved directly from the Spring SecurityContext.
 */
public interface ServicePackageMarker {
}
