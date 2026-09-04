-- ===================================================================
-- PrepWise Initial Users & Profiles Seed for Supabase PostgreSQL
-- Default Password for all seeded accounts: Password123!
-- ===================================================================

-- Initial Users
INSERT INTO users (id, name, email, password_hash, role, is_active, onboarding_completed) VALUES
(1, 'PrepWise Student', 'student@prepwise.com', '$2b$10$9WCweUgaaWVUvZo7Qoj8A.dBbm3RaoHswGubGmVp0fxKE0qtCIUnG', 'STUDENT', true, true),
(2, 'Demo User', 'demo@prepwise.com', '$2b$10$9WCweUgaaWVUvZo7Qoj8A.dBbm3RaoHswGubGmVp0fxKE0qtCIUnG', 'STUDENT', true, false),
(3, 'Admin User', 'admin@prepwise.com', '$2b$10$9WCweUgaaWVUvZo7Qoj8A.dBbm3RaoHswGubGmVp0fxKE0qtCIUnG', 'ADMIN', true, true)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    onboarding_completed = EXCLUDED.onboarding_completed;

-- Initial Profiles
INSERT INTO profiles (user_id, degree, branch, current_semester, college, graduation_year, target_role, target_company, preferred_industry) VALUES
(1, 'B.Tech', 'Computer Science and Engineering', 'Semester 7', 'Institute of Technology', 2025, 'Software Development Engineer', 'Google', 'Technology / Software'),
(2, 'B.E', 'Information Technology', 'Semester 6', 'National Engineering College', 2025, 'Full Stack Developer', 'Amazon', 'E-Commerce / Cloud'),
(3, 'M.Tech', 'Computer Science', 'Alumni', 'University Campus', 2023, 'System Architect', 'Microsoft', 'Enterprise Software')
ON CONFLICT (user_id) DO UPDATE SET
    degree = EXCLUDED.degree,
    branch = EXCLUDED.branch,
    current_semester = EXCLUDED.current_semester,
    college = EXCLUDED.college,
    graduation_year = EXCLUDED.graduation_year,
    target_role = EXCLUDED.target_role,
    target_company = EXCLUDED.target_company,
    preferred_industry = EXCLUDED.preferred_industry;

-- Reset sequences to prevent next manual registration from colliding
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval(pg_get_serial_sequence('profiles', 'id'), COALESCE((SELECT MAX(id) FROM profiles), 1));
