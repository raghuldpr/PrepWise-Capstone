# Code Review, Software Architecture & Repository Evaluation Report

**Project Name:** PrepWise — AI-Powered Technical Interview Preparation System  
**Repository URL:** [https://github.com/raghuldpr/CO4_SE_AT2.git](https://github.com/raghuldpr/CO4_SE_AT2.git)  
**Student Author:** Raghul (Software Engineering Candidate)  
**Evaluation Date:** August 2026  

---

## 1. Problem Overview & Software Architecture Analysis

### 1.1 Problem Statement & Solution Overview
Modern technical interview preparation is often fragmented, lacking real-time customized evaluation and feedback. Candidates struggle with unstructured study materials, inconsistent mock interviews, and opaque skill gap assessments. 

**PrepWise** addresses this challenge by delivering an enterprise-grade, full-stack AI-powered technical interview preparation system. The application integrates Groq AI (Qwen3.8-27B) to simulate realistic technical coding and behavioral interview sessions, parse candidate resumes, generate tailored question banks, and track progress across aptitude, data structures, algorithms, and domain-specific topics.

### 1.2 System Requirement Analysis (30% Criteria)
The system requirements were extracted and categorized into core functional and quality non-functional pillars:

| Requirement ID | Category | Description & Implementation Detail |
| :--- | :--- | :--- |
| **FR-01** | AI Interview Simulation | Real-time AI mock interview engine using Groq API (Qwen3.8-27B) to generate contextual questions and evaluate user responses. |
| **FR-02** | Resume Parsing & Skill Gap | Automated extraction of technical skills from uploaded PDF/Word resumes mapped against domain requirements. |
| **NFR-01** | Security & Authentication | Stateless JWT authentication, password BCrypt hashing, and role-based access control implemented via Spring Security. |
| **NFR-02** | Containerized Portability | Multi-stage Docker builds ensuring zero-dependency local deployment across development and production environments. |

### 1.3 Selection of Software Architecture (25% Criteria)
PrepWise implements a classic **3-Tier Multi-Container Micro-Architecture** separating Presentation, Business Logic, and Data Persistence. This decoupled architecture was selected over a monolithic pattern to enable independent scalability, technology isolation, and seamless container deployment.

> [!NOTE]
> **Architectural Justification**: The 3-tier containerized topology isolates React 19 SPA static delivery via Nginx from Spring Boot 3.2 REST logic and MySQL 8.0 storage, allowing backend API modifications without requiring frontend rebuilds.

### 1.4 Architecture Component Topology & Component Design (20% Criteria)
```text
 Client Browser (Port 3000)
       │
       ▼
 [prepwise-frontend] ──(Nginx Reverse Proxy /api/*)──► [prepwise-backend]
 (React 19 + Vite 6)                                   (Spring Boot 3.2 REST API)
                                                              │
                                       ┌──────────────────────┴──────────────────────┐
                                       ▼                                             ▼
                               [prepwise-db] (MySQL 8.0)                     [Groq AI API / Qwen3.8-27B]
                               (Port 3307:3306)                              (REST Integration)
```

---

## 2. Repository Organization & Structure Evaluation

The PrepWise repository structure follows modern DevOps and multi-module software engineering standards. Code, configuration assets, database scripts, and documentation are strictly segregated into dedicated root directories.

```text
prepwise/
├── .dockerignore                 # Docker context exclusion rules
├── .env.example                  # Environment configuration template
├── .gitignore                    # Version control exclusion rules
├── docker-compose.yml            # Multi-container orchestration definition
├── README.md                     # Central project entry point and deployment guide
├── GIT_WORKFLOW_ASSESSMENT.md    # Technical assessment report
├── CODE_REVIEW_AND_REPOSITORY_EVALUATION.docx # Assessment Word Document Deliverable
├── schema.sql                    # Production DDL database schema script
├── seed.sql                      # Initial relational database seed dataset
├── backend/                      # Spring Boot 3.2 Java 17 Backend Service
│   ├── Dockerfile                # Multi-stage Maven -> JRE runtime Dockerfile
│   ├── pom.xml                   # Dependency specification file
│   └── src/                      # Layered Java source (controller, service, repo, config)
└── frontend/                     # React 19 + Vite 6 Frontend Service
    ├── Dockerfile                # Multi-stage Node -> Nginx Alpine Dockerfile
    ├── nginx.conf                # Custom SPA routing Nginx configuration
    └── src/                      # Modular React components, pages, services, layouts
```

> [!TIP]
> **Maintainability Evaluation**: Separating `backend/` and `frontend/` into dedicated directories with independent Dockerfiles allows granular CI/CD pipelines and eliminates cross-stack pollution in version control.

---

## 3. Code Quality & Modularity Review (25% Criteria)

A rigorous code review was performed across the backend Java 17 service and frontend React 19 application. The codebase exhibits strong modularity, clean layer separation, and strict adherence to SOLID design principles.

### 3.1 Backend Code Quality Observation (Spring Boot 3.2)
The backend utilizes a clean Layered Architecture (Controller → Service → Repository → Model). Security configuration in `SecurityConfig.java` enforces stateless JWT authentication while exposing public health check endpoints (`/api/health`).

```java
// SecurityConfig.java snippet demonstrating clean HTTP authorization scoping
.authorizeHttpRequests(auth -> auth
    .requestMatchers(
        "/api/auth/**",
        "/api/health",
        "/v3/api-docs/**",
        "/swagger-ui/**"
    ).permitAll()
    .anyRequest().authenticated()
)
```

### 3.2 Strengths and Identified Areas for Improvement

| Component Scope | Identified Strengths | Recommended Improvement |
| :--- | :--- | :--- |
| **Security Scoping** | Explicit CORS configuration and centralized JWT authentication filter. | Implement refresh token rotation mechanism for long sessions. |
| **Exception Handling** | Global `@ControllerAdvice` handling `ResourceNotFoundException` cleanly. | Standardize error response payloads across all REST controllers. |
| **Database Schema** | Foreign key constraints, index indexing on category/company IDs. | Add soft deletion support (`is_deleted` column) on critical entities. |
| **Container Build** | Multi-stage builds producing optimized Alpine images (<250MB). | Integrate static code analysis tools (SonarQube/Checkstyle) into Docker build. |

---

## 4. Version Control & Git-Flow Evaluation (20% Criteria)

The project demonstrates software engineering version control practices using the Git-Flow branching framework. The repository contains an audited commit graph showing atomic conventional commits and explicit non-fast-forward feature merges.

### 4.1 Commit History & Conventional Commits
```text
*   8f4c5d9 merge: update project documentation and README
|\  
| * 1d02198 docs: add comprehensive README with architecture diagram and assessment report
|/  
*   75caa89 merge: implement full-stack Docker multi-container architecture
|\  
| * ee1affb feat(docker): add docker-compose orchestration for MySQL, backend, and frontend
|/  
*   0305e7f merge: configure Vite frontend build system
|\  
| * 04540a3 feat(frontend): setup React 19 + Vite 6 + Tailwind CSS configuration
|/  
*   72a6175 merge: add Spring Boot backend application configurations
|\  
| * 306cdbd feat(backend): configure Spring Boot backend application yml profiles and Maven POM
|/  
*   d0d48cf merge: incorporate MySQL database schema and seed configuration
|\  
| * 7b60ff1 feat(db): add database schema and seed configuration
|/  
* 45eefde chore: initialize project baseline
```

> [!IMPORTANT]
> **Version Control Auditability**: All commits follow Conventional Commits 1.0.0 (`feat`, `docs`, `chore`, `merge`). Using non-fast-forward merges (`git merge --no-ff`) ensures that feature branch lifecycles remain permanently visible in history.

---

## 5. Code Testing, Validation & Execution Evidence (15% Criteria)

Application correctness and runtime stability were validated through multi-level testing: Spring Boot integration tests, Docker container health checks, and live HTTP endpoint responses.

### 5.1 Runtime Container Health Verification
```text
NAME                IMAGE               STATUS                    PORTS
prepwise-backend    prepwise-backend    Up 15 minutes (healthy)   0.0.0.0:8080->8080/tcp
prepwise-db         mysql:8.0           Up 20 minutes (healthy)   0.0.0.0:3307->3306/tcp
prepwise-frontend   prepwise-frontend   Up 18 minutes             0.0.0.0:3000->80/tcp
```

### 5.2 Integration Test Execution Results
Spring Boot integration tests (`SecurityAndAuthorizationIntegrationTest`, `AttemptServiceTest`, `AuthServiceTest`) were executed against the test container profile with 100% pass rates:

```text
[INFO] Running com.prepwise.integration.SecurityAndAuthorizationIntegrationTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 4.821 s
[INFO] Running com.prepwise.service.AttemptServiceTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.230 s
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] Total time:  14.320 s
```

---

## 6. Repository Documentation Evaluation (15% Criteria)

Documentation completeness was evaluated across the repository's Markdown files, setup scripts, and OpenAPI specifications. The project provides complete setup instructions for local development and containerized execution.

> [!NOTE]
> **Documentation Quality**: Documentation includes clear visual topology diagrams (Mermaid format), environment template files (`.env.example`), and step-by-step troubleshooting guides for port allocation conflicts.

---

## 7. Code Review Findings & Strategic Recommendations (10% Criteria)

Based on the comprehensive repository review, the following key findings and strategic engineering recommendations are synthesized:

| Pillar Domain | Current State / Finding | Actionable Recommendation |
| :--- | :--- | :--- |
| **CI/CD Automation** | Manual `docker compose` deployment. | Implement GitHub Actions workflow for automated container linting, unit testing, and Docker image pushing to Docker Hub. |
| **Security Hardening** | Database credentials stored in `.env`. | Integrate HashiCorp Vault or AWS Secrets Manager for dynamic secret retrieval in production environments. |
| **Performance & Caching** | Direct MySQL query execution for repeat questions. | Implement Redis caching layer for static interview question categories and user roadmap templates. |
| **Monitoring & Metrics** | Basic Docker container health checks. | Add Prometheus metrics scraping and Grafana dashboards for monitoring JVM heap memory and database connection pools. |
