-- PrepWise Seed Data

-- 1. Companies Seed
INSERT INTO companies (id, name, description, website, industry) VALUES
(1, 'Google', 'Multinational technology company focusing on search, AI, cloud computing, and consumer electronics.', 'https://about.google', 'Technology / Software'),
(2, 'Amazon', 'Global leader in e-commerce, cloud computing (AWS), digital streaming, and artificial intelligence.', 'https://amazon.com', 'E-Commerce / Cloud'),
(3, 'Microsoft', 'Leader in OS, enterprise software, gaming (Xbox), cloud services (Azure), and AI innovations.', 'https://microsoft.com', 'Enterprise Software'),
(4, 'TCS', 'Tata Consultancy Services - Indian IT services and consulting leader serving global enterprise clients.', 'https://tcs.com', 'IT Services / Consulting'),
(5, 'Infosys', 'Global leader in next-generation digital services and consulting for digital transformation.', 'https://infosys.com', 'IT Services / Consulting');

-- 2. Skills Seed
INSERT INTO skills (id, name, category, description) VALUES
(1, 'Java', 'Programming Language', 'Core Java, OOPs concepts, Collections Framework, Multithreading, and JVM internals.'),
(2, 'Spring Boot', 'Backend Framework', 'Spring Boot 3, REST API design, Dependency Injection, Spring Security, and Data JPA.'),
(3, 'MySQL', 'Database', 'Relational database design, indexing, complex JOIN queries, and SQL performance tuning.'),
(4, 'Data Structures & Algorithms', 'Computer Science Core', 'Arrays, Linked Lists, Trees, Graphs, Sorting, Searching, Dynamic Programming, and Greedy Algorithms.'),
(5, 'System Design', 'Software Engineering', 'Microservices architecture, caching strategies, load balancing, message queues, and DB sharding.'),
(6, 'React.js', 'Frontend Framework', 'Modern UI creation with hooks, state management, SPA routing, and component architecture.'),
(7, 'Python', 'Programming Language', 'Scripting, backend development with FastAPI/Django, and data analysis basics.'),
(8, 'RESTful APIs', 'Web Architecture', 'HTTP protocols, REST architectural constraints, JSON payloads, and API status codes.'),
(9, 'Git & GitHub', 'DevOps / Tooling', 'Version control workflows, branching strategies, pull requests, and merge conflict resolution.'),
(10, 'Aptitude & Problem Solving', 'Core Competency', 'Quantitative aptitude, logical reasoning, numerical problem solving, and verbal ability.');

-- 3. Question Categories Seed
INSERT INTO question_categories (id, name, module_type, description) VALUES
(1, 'Quantitative Aptitude & Reasoning', 'APTITUDE', 'Basic arithmetic, algebra, percentages, permutations, logical reasoning, and speed math.'),
(2, 'Core Data Structures & Algorithms', 'DSA', 'Fundamental computer science topics including arrays, trees, graphs, dynamic programming, and recursion.'),
(3, 'Java & Backend Coding', 'CODING', 'Practical coding challenges, Object-Oriented principles, multi-threading, and Spring Boot REST API exercises.');
