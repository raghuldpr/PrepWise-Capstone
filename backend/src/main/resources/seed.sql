-- ===================================================================
-- PrepWise PostgreSQL Seed Data (Supabase Compatible)
-- ===================================================================

-- 1. Companies Seed
INSERT INTO companies (id, name, description, website, industry) VALUES
(1, 'Google', 'Multinational technology company focusing on search, AI, cloud computing, and consumer electronics.', 'https://about.google', 'Technology / Software'),
(2, 'Amazon', 'Global leader in e-commerce, cloud computing (AWS), digital streaming, and artificial intelligence.', 'https://amazon.com', 'E-Commerce / Cloud'),
(3, 'Microsoft', 'Leader in OS, enterprise software, gaming (Xbox), cloud services (Azure), and AI innovations.', 'https://microsoft.com', 'Enterprise Software'),
(4, 'TCS', 'Tata Consultancy Services - Indian IT services and consulting leader serving global enterprise clients.', 'https://tcs.com', 'IT Services / Consulting'),
(5, 'Infosys', 'Global leader in next-generation digital services and consulting for digital transformation.', 'https://infosys.com', 'IT Services / Consulting')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    website = EXCLUDED.website,
    industry = EXCLUDED.industry;

-- 2. Skills Seed (27 Comprehensive Technical & Aptitude Placement Skills)
INSERT INTO skills (name, category, description) VALUES
('Java', 'Programming Languages', 'Core Java, OOPs concepts, Collections Framework, Multithreading, Streams, and JVM internals.'),
('Python', 'Programming Languages', 'Python 3, scripting, data analysis, algorithms, and backend development with FastAPI/Django.'),
('C++', 'Programming Languages', 'Modern C++, STL algorithms & containers, memory management, pointers, and competitive programming.'),
('C', 'Programming Languages', 'Pointers, dynamic memory allocation (malloc/free), low-level system programming, and data structures.'),
('JavaScript', 'Programming Languages', 'ES6+, asynchronous programming, closures, event loop, Promises, and DOM manipulation.'),
('TypeScript', 'Programming Languages', 'Static typing, interfaces, generics, type guards, and enterprise application development.'),
('SQL', 'Programming Languages', 'Complex queries, aggregations, subqueries, indexing, window functions, and schema design.'),
('Data Structures & Algorithms', 'Core Computer Science', 'Arrays, linked lists, stacks, queues, trees, graphs, heaps, dynamic programming, and complexity analysis.'),
('Operating Systems', 'Core Computer Science', 'Processes, threads, CPU scheduling, memory management, virtual memory, paging, deadlocks, and IPC.'),
('Database Management Systems', 'Core Computer Science', 'Relational database design, ACID properties, normalization (1NF-BCNF), indexing, and concurrency control.'),
('Computer Networks', 'Core Computer Science', 'OSI model, TCP/IP stack, routing protocols, flow control, DNS, HTTP/HTTPS, and network security.'),
('System Design & Architecture', 'Core Computer Science', 'Scalable architecture, microservices, load balancing, caching (Redis), message queues, and DB partitioning.'),
('Object-Oriented Programming (OOP)', 'Core Computer Science', 'Encapsulation, inheritance, polymorphism, abstraction, design patterns, and SOLID design principles.'),
('Spring Boot', 'Backend & Cloud', 'Enterprise REST API development, Dependency Injection, Spring Security, Spring Data JPA, and Microservices.'),
('Node.js & Express', 'Backend & Cloud', 'Asynchronous event-driven backend services, RESTful APIs, middleware architecture, and JWT authentication.'),
('PostgreSQL', 'Backend & Cloud', 'Advanced relational database design, indexing, transactions, JSONB querying, and SQL optimization.'),
('MySQL', 'Backend & Cloud', 'Relational schema design, normalization, indexing, complex JOIN queries, and query tuning.'),
('RESTful APIs', 'Backend & Cloud', 'HTTP methods, REST architectural constraints, JSON formatting, status codes, and API security.'),
('Docker & Containers', 'Backend & Cloud', 'Containerization, Dockerfiles, multi-stage builds, docker-compose orchestration, and deployment.'),
('Git & GitHub', 'Backend & Cloud', 'Version control workflows, branching models, pull requests, rebase/merge, and collaborative development.'),
('AWS & Cloud Fundamentals', 'Backend & Cloud', 'Cloud hosting concepts, EC2, S3, RDS, Serverless compute, and basic cloud security.'),
('React.js', 'Frontend Development', 'Modern UI development, React hooks (useState, useEffect, useMemo), component lifecycle, and state management.'),
('HTML5 & CSS3', 'Frontend Development', 'Semantic markup, responsive layouts, Flexbox, CSS Grid, animations, and cross-browser styling.'),
('Tailwind CSS', 'Frontend Development', 'Utility-first styling, responsive UI design systems, dark mode theming, and layout utilities.'),
('Quantitative Aptitude', 'Aptitude & Reasoning', 'Time & work, speed & distance, percentages, ratio & proportion, interest, and probability for placement exams.'),
('Logical Reasoning', 'Aptitude & Reasoning', 'Syllogisms, blood relations, series completion, analytical reasoning, and coding-decoding puzzles.'),
('Verbal Ability & Communication', 'Aptitude & Reasoning', 'Reading comprehension, sentence correction, technical articulation, and interview communication.')
ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description;

-- 3. Question Categories Seed (8 Categories)
INSERT INTO question_categories (id, name, module_type, description) VALUES
(1, 'Quantitative Aptitude', 'APTITUDE', 'Arithmetic, percentages, speed-distance, algebra, probability, and numerical problem solving.'),
(2, 'Logical & Verbal Reasoning', 'APTITUDE', 'Syllogisms, blood relations, series completion, logical deduction, and verbal comprehension.'),
(3, 'Data Structures & Algorithms', 'DSA', 'Arrays, linked lists, trees, graphs, heaps, dynamic programming, and complexity analysis.'),
(4, 'Operating Systems', 'TECHNICAL', 'Processes, threads, CPU scheduling, memory management, virtual memory, deadlocks, and IPC.'),
(5, 'Database Management Systems', 'TECHNICAL', 'ACID properties, relational schema design, normalization, indexing, SQL queries, and transactions.'),
(6, 'Computer Networks', 'TECHNICAL', 'OSI layers, TCP/IP, routing protocols, flow control, DNS, HTTP/HTTPS, and network security.'),
(7, 'Object-Oriented Programming', 'TECHNICAL', 'OOP pillars, design patterns, inheritance, polymorphism, encapsulation, and SOLID principles.'),
(8, 'Coding Challenges', 'CODING', 'Algorithmic coding problems, edge case handling, and data structure implementations.')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    module_type = EXCLUDED.module_type, 
    description = EXCLUDED.description;

-- 4. Initial Users Seed (Password: Password123!)
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

-- 5. Initial Profiles Seed
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

-- 6. Synchronize ID Sequences
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval(pg_get_serial_sequence('profiles', 'id'), COALESCE((SELECT MAX(id) FROM profiles), 1));
SELECT setval(pg_get_serial_sequence('companies', 'id'), COALESCE((SELECT MAX(id) FROM companies), 1));
SELECT setval(pg_get_serial_sequence('skills', 'id'), COALESCE((SELECT MAX(id) FROM skills), 1));
SELECT setval(pg_get_serial_sequence('question_categories', 'id'), COALESCE((SELECT MAX(id) FROM question_categories), 1));
