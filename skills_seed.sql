-- ===================================================================
-- PrepWise Comprehensive Technical & Aptitude Skills Seed (27 Skills)
-- Safely upserts on unique constraint 'name' without ID collision
-- ===================================================================

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

-- Synchronize sequence
SELECT setval(pg_get_serial_sequence('skills', 'id'), COALESCE((SELECT MAX(id) FROM skills), 1));
