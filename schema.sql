-- PrepWise MySQL Database Schema
-- Version: 1.0.0

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS ai_requests;
DROP TABLE IF EXISTS interview_reports;
DROP TABLE IF EXISTS interview_answers;
DROP TABLE IF EXISTS interview_questions;
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS ai_messages;
DROP TABLE IF EXISTS ai_conversations;
DROP TABLE IF EXISTS study_plans;
DROP TABLE IF EXISTS learning_roadmaps;
DROP TABLE IF EXISTS skill_gap_analyses;
DROP TABLE IF EXISTS user_projects;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS resume_analyses;
DROP TABLE IF EXISTS resumes;
DROP TABLE IF EXISTS progress;
DROP TABLE IF EXISTS attempts;
DROP TABLE IF EXISTS question_options;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS question_categories;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS user_skills;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Profiles Table
CREATE TABLE profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    education VARCHAR(255),
    college VARCHAR(255),
    graduation_year INT,
    target_role VARCHAR(100),
    target_company VARCHAR(100),
    career_goal TEXT,
    bio TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_profiles_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Skills Table
CREATE TABLE skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100),
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. User Skills Table
CREATE TABLE user_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    proficiency_level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL DEFAULT 'BEGINNER',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_skills_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_skill UNIQUE (user_id, skill_id),
    INDEX idx_user_skills_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Companies Table
CREATE TABLE companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    website VARCHAR(255),
    industry VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Question Categories Table
CREATE TABLE question_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    module_type ENUM('APTITUDE', 'CODING', 'DSA', 'TECHNICAL', 'HR') NOT NULL,
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Questions Table
CREATE TABLE questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    company_id BIGINT,
    title VARCHAR(255) NOT NULL,
    question_text TEXT NOT NULL,
    difficulty ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL DEFAULT 'MEDIUM',
    question_type ENUM('MCQ', 'CODING', 'DESCRIPTIVE', 'TECHNICAL') NOT NULL DEFAULT 'MCQ',
    topic VARCHAR(100),
    expected_answer TEXT,
    explanation TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_questions_category FOREIGN KEY (category_id) REFERENCES question_categories(id) ON DELETE CASCADE,
    CONSTRAINT fk_questions_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    INDEX idx_questions_category (category_id),
    INDEX idx_questions_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Question Options Table
CREATE TABLE question_options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_options_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_options_question (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Attempts Table
CREATE TABLE attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_answer TEXT,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    score DECIMAL(5,2) DEFAULT 0.00,
    time_taken_seconds INT DEFAULT 0,
    attempted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attempts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_attempts_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_attempts_user_question (user_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Progress Table
CREATE TABLE progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    questions_attempted INT NOT NULL DEFAULT 0,
    questions_correct INT NOT NULL DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0.00,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_category FOREIGN KEY (category_id) REFERENCES question_categories(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_category UNIQUE (user_id, category_id),
    INDEX idx_progress_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Resumes Table
CREATE TABLE resumes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resumes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_resumes_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Resume Analyses Table
CREATE TABLE resume_analyses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_id BIGINT NOT NULL UNIQUE,
    overall_score INT NOT NULL,
    strengths TEXT,
    weaknesses TEXT,
    missing_skills TEXT,
    suggestions TEXT,
    analysis_model VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_analyses_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    INDEX idx_resume_analyses_resume (resume_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Projects Table
CREATE TABLE projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL DEFAULT 'MEDIUM',
    domain VARCHAR(100),
    technology_stack TEXT,
    skills_covered TEXT,
    placement_relevance TEXT,
    development_roadmap TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. User Projects Table
CREATE TABLE user_projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    status ENUM('SAVED', 'PLANNED', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'SAVED',
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_projects_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_projects_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_project UNIQUE (user_id, project_id),
    INDEX idx_user_projects_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Skill Gap Analyses Table
CREATE TABLE skill_gap_analyses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    target_role VARCHAR(100) NOT NULL,
    existing_skills TEXT,
    missing_skills TEXT,
    recommendations TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_skill_gap_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_skill_gap_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Learning Roadmaps Table
CREATE TABLE learning_roadmaps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    target_role VARCHAR(100) NOT NULL,
    roadmap_data JSON NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_roadmaps_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_roadmaps_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Study Plans Table
CREATE TABLE study_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    target_role VARCHAR(100),
    duration_weeks INT NOT NULL DEFAULT 4,
    plan_data JSON NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_study_plans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_study_plans_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. AI Conversations Table
CREATE TABLE ai_conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    context VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_conversations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ai_conversations_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. AI Messages Table
CREATE TABLE ai_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    message_text TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_messages_conversation FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE,
    INDEX idx_ai_messages_conversation (conversation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Interviews Table
CREATE TABLE interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    target_role VARCHAR(100) NOT NULL,
    company_id BIGINT,
    interview_type VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    status ENUM('CREATED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED') NOT NULL DEFAULT 'CREATED',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_interviews_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    INDEX idx_interviews_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Interview Questions Table
CREATE TABLE interview_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 1,
    question_type VARCHAR(50) NOT NULL DEFAULT 'TECHNICAL',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interview_questions_interview FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
    INDEX idx_interview_questions_interview (interview_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. Interview Answers Table
CREATE TABLE interview_answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_question_id BIGINT NOT NULL UNIQUE,
    answer_text TEXT NOT NULL,
    evaluation_data JSON,
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interview_answers_question FOREIGN KEY (interview_question_id) REFERENCES interview_questions(id) ON DELETE CASCADE,
    INDEX idx_interview_answers_question (interview_question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. Interview Reports Table
CREATE TABLE interview_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_id BIGINT NOT NULL UNIQUE,
    overall_score DECIMAL(5,2) NOT NULL,
    technical_score DECIMAL(5,2) NOT NULL,
    communication_feedback TEXT,
    strengths TEXT,
    weaknesses TEXT,
    recommendations TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interview_reports_interview FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
    INDEX idx_interview_reports_interview (interview_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. AI Requests Table
CREATE TABLE ai_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    feature VARCHAR(100) NOT NULL,
    tokens_used INT DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_requests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ai_requests_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
