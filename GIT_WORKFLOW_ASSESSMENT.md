# Software Engineering Technical Assessment: Version Control & Git Workflow

**Student Name:** Raghul  
**Repository:** [https://github.com/raghuldpr/CO4_SE_AT2.git](https://github.com/raghuldpr/CO4_SE_AT2.git)  
**Project Name:** PrepWise — AI-Powered Technical Interview Preparation System  

---

## 3. Git Repository Initialization

### 3.1 Repository Initialization Mechanics
Repository initialization is the process of converting an unversioned project folder into a Git-tracked workspace. Executing `git init` creates a hidden `.git` directory at the root of the workspace. This directory serves as the centralized repository database containing:

* **`HEAD`**: A reference pointer indicating the current active branch or commit object.
* **`config`**: Project-specific configuration options (e.g., remote URLs, user identity, branch settings).
* **`objects/`**: Object store storing all content blobs, trees (directory snapshots), commits, and annotated tags using SHA-1 cryptographic hashes.
* **`refs/`**: Pointer references to commit hashes for branches (`refs/heads/`) and tags (`refs/tags/`).
* **`index` (Staging Area)**: A binary file acting as an intermediate staging cache between the working directory and the Git history database.

```bash
# Command used to initialize the workspace repository
git init
```

### 3.2 Purpose of Essential Git & Configuration Files

| File Name | Purpose & Functionality |
| :--- | :--- |
| **`.gitignore`** | Specifies intentionally untracked patterns that Git should ignore (e.g., `node_modules/`, `target/`, `.env`, build artifacts, IDE logs). Prevents accidental commits of sensitive data, binary noise, or large node modules into version control. |
| **`.dockerignore`** | Excludes non-essential files from the Docker build context during `docker build`. Accelerates build times and reduces Docker container image sizes by ignoring local build artifacts and source control metadata. |
| **`README.md`** | Serves as the primary documentation entry point for developer onboarding, project overview, architectural topology, containerization instructions, API specifications, and setup commands. |
| **`docker-compose.yml`** | Defines multi-container application architecture, service dependencies, network topologies, environment variables, healthchecks, and volume persistent storage mounts. |
| **`pom.xml`** | Maven Project Object Model file defining Java 17 / Spring Boot dependencies, plugin configurations, build lifecycles, and packaging target properties for the backend container. |

---

## 4. Git Branching Strategy

### 4.1 Branching Strategy Overview (Git-Flow Model)

For the **PrepWise** project, a structured **Git-Flow** branching strategy was adopted. This model isolates development work into separate channels based on scope, readiness, and urgency.

```
(main)       --------------------------------------------● (v1.0.0 Release)
                \                                      /
(develop)        ●---------●---------●---------●------●
                  \       / \       / \       /
(feature/*)        ●-----●   ●-----●   ●-----●
```

#### Branch Classifications:

1. **`main` (Production Branch)**:
   - Stores official production releases.
   - Code on `main` is always production-ready, stable, and tagged with version numbers.
   - Direct commits to `main` are strictly prohibited; changes enter via verified pull requests / merges from `develop` or `hotfix/*`.

2. **`develop` (Integration Branch)**:
   - Serves as the continuous integration branch for upcoming releases.
   - Contains completed and tested feature implementations.

3. **`feature/*` (Feature Branches)**:
   - Branch naming format: `feature/<feature-name>` (e.g., `feature/docker-containerization`, `feature/backend-spring-boot`).
   - Created off `develop` and merged back into `develop` upon task completion.

4. **`release/*` (Release Candidate Branches)**:
   - Created off `develop` when features for a milestone are frozen.
   - Used for final QA, bug fixing, and release preparation before merging into `main` and `develop`.

5. **`hotfix/*` (Emergency Patch Branches)**:
   - Created directly from `main` to address urgent critical production bugs.
   - Merged into both `main` and `develop` simultaneously.

### 4.2 Justification for the Git-Flow Model in PrepWise

The Git-Flow model is specifically suited for PrepWise due to the following architectural factors:

1. **Multi-Service Architecture**: PrepWise consists of three distinct technology stacks (React 19 Frontend, Spring Boot 3.2 Backend, MySQL 8.0 Database). Feature branches allow backend engineers and frontend engineers to work concurrently without interfering with each other's code.
2. **Containerization & Docker Testing**: Docker configuration changes (`docker-compose.yml`, `Dockerfile`) can be safely tested in feature branches (`feature/docker-containerization`) without breaking the stable local setup on `develop`.
3. **Traceability & Code Auditability**: Non-linear feature branching combined with clean merge commits provides clear history audit trails required for software engineering compliance.

---

## 5. Version Control Workflow

### 5.1 Step-by-Step Execution Log

The following operations were executed to construct the project history and push to the remote repository:

#### Step 1: Initialize Repository & Configure User Identity
```bash
git init
git config user.name "Raghul"
git config user.email "raghul@example.com"
```

#### Step 2: Establish Baseline Commit on `main`
```bash
git add .gitignore README.md
git commit -m "chore: initialize project structure and repository baseline"
```

#### Step 3: Create `develop` Integration Branch
```bash
git branch develop
git checkout develop
```

#### Step 4: Develop Feature — Database Schema & Seeds (`feature/database-setup`)
```bash
git checkout -b feature/database-setup
git add schema.sql seed.sql
git commit -m "feat(db): add schema definition and initial seed dataset"
git checkout develop
git merge --no-ff feature/database-setup -m "merge: incorporate MySQL database schema and seed configuration"
```

#### Step 5: Develop Feature — Spring Boot Backend (`feature/backend-spring-boot`)
```bash
git checkout -b feature/backend-spring-boot
git add backend/
git commit -m "feat(backend): add Spring Boot 3.2 REST service and security configuration"
git checkout develop
git merge --no-ff feature/backend-spring-boot -m "merge: add Spring Boot backend application configurations"
```

#### Step 6: Develop Feature — React Frontend (`feature/frontend-react-vite`)
```bash
git checkout -b feature/frontend-react-vite
git add frontend/ package.json vite.config.ts index.html src/
git commit -m "feat(frontend): setup React 19, Vite 6, and modern SPA components"
git checkout develop
git merge --no-ff feature/frontend-react-vite -m "merge: configure Vite frontend build system"
```

#### Step 7: Develop Feature — Docker Containerization (`feature/docker-containerization`)
```bash
git checkout -b feature/docker-containerization
git add docker-compose.yml backend/Dockerfile frontend/Dockerfile .dockerignore .env.example
git commit -m "feat(docker): add multi-container orchestration for MySQL, backend, and frontend"
git checkout develop
git merge --no-ff feature/docker-containerization -m "merge: implement full-stack Docker multi-container architecture"
```

#### Step 8: Develop Feature — Documentation & Assessment (`feature/docs-readme`)
```bash
git checkout -b feature/docs-readme
git add README.md GIT_WORKFLOW_ASSESSMENT.md
git commit -m "docs: add comprehensive README and technical Git workflow assessment report"
git checkout develop
git merge --no-ff feature/docs-readme -m "merge: update project documentation and assessment details"
```

#### Step 9: Release Merge from `develop` into `main`
```bash
git checkout main
git merge --no-ff develop -m "release: finalize v1.0.0 prepwise application stack"
```

#### Step 10: Remote Repository Synchronization
```bash
git remote add origin https://github.com/raghuldpr/CO4_SE_AT2.git
git branch -M main
git push -u origin main
```

---

## 6. Commit History Analysis

### 6.1 Conventional Commits Specification
All commit messages in the PrepWise repository adhere to the **Conventional Commits 1.0.0** specification. The message structure follows:

$$\text{type}(\text{scope}): \text{short description}$$

#### Standard Commit Types Utilized:
* `feat`: A new feature added to the application.
* `fix`: A bug fix applied to source code or configuration.
* `docs`: Documentation updates (README, technical reports).
* `chore`: Maintenance tasks, repo initialization, build script updates.
* `merge`: Explicit non-fast-forward merge commits tracking feature integrations.

### 6.2 Maintenance & Auditability Benefits
1. **Automated Changelog Generation**: Structured prefixes enable automatic release note generators to parse commit logs into user-facing changelogs.
2. **Simplified Code Archaeology**: Developers reviewing `git log` or `git blame` can immediately identify the context, intent, and scope of any line change without reading full diffs.
3. **Bisecting & Bug Tracking**: When isolating regressions using `git bisect`, atomic conventional commits ensure that every commit in the history compiles and passes unit checks cleanly.
