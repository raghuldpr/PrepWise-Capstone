# 🚀 PrepWise — AI-Powered Interview Preparation System

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.2-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![React 19](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL_8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_Qwen3.8--27B-F55036?style=for-the-badge&logo=groq&logoColor=white)

---

## 📌 Project Overview

**PrepWise** is a full-stack, enterprise-grade AI-powered interview preparation platform. It provides candidates with real-time simulated technical interviews, resume parsing, customized feedback, and AI-generated question banks powered by Groq (Qwen3.8-27B).

This repository is containerized using **Docker** and **Docker Compose**, adhering to production-ready DevOps best practices, multi-stage image optimization, non-root container security, and a git-flow version control architecture.

---

## 🏗️ Architecture & Component Topology

```mermaid
graph TD
    Client[Browser / Client] -->|Port 3000| Nginx[prepwise-frontend / Nginx Web Server]
    Nginx -->|Serves Static Build| SPA[React 19 + Vite App]
    Nginx -->|Reverse Proxy /api/*| Backend[prepwise-backend / Spring Boot 3.2]
    Backend -->|JDBC Port 5432 / SSL| Database[(prepwise-db / Supabase PostgreSQL)]
    Backend -->|REST API| Groq[Groq Cloud AI API / Qwen3.8-27B]
    Backend -->|Local Volume| Uploads[/var/app/uploads / Volume]
```

### Container Services Summary

| Container Name | Service | Tech Stack | Exposed Port | Base Image | Multi-Stage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `prepwise-frontend` | Web Server / Reverse Proxy | React 19 + Nginx | `3000:80` | `node:20-alpine` → `nginx:1.27-alpine` | Yes |
| `prepwise-backend` | REST API Backend | Java 17 + Spring Boot | `8080:8080` | `maven:3.9-alpine` → `eclipse-temurin:17-jre-alpine` | Yes |
| `prepwise-db` | Database Server | PostgreSQL 16 (Supabase Compatible) | `5432:5432` | `postgres:16-alpine` | N/A |

---

## 🐳 Docker Containerization Highlights

1. **Multi-Stage Builds**:
   - **Frontend**: Stage 1 compiles Vite static assets (~600MB intermediate); Stage 2 copies built assets into Nginx Alpine (**final size ~30MB**).
   - **Backend**: Stage 1 compiles Spring Boot JAR using Maven; Stage 2 copies executable `.jar` into lightweight JRE Alpine (**final size ~240MB**).
2. **Security Hardening**:
   - Non-root execution in Spring Boot container (`USER spring:spring`).
   - Read-only database initialization mounts (`:ro`).
   - Minimal attack surface via Alpine Linux distributions.
3. **Orchestration & Healthchecks**:
   - PostgreSQL healthcheck (`pg_isready`) guarantees database readiness before backend startup.
   - Persistent volumes for PostgreSQL data (`prepwise_pg_data`) and document uploads (`prepwise_uploads_data`).

---

## ⚙️ Quick Start Guide

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v20.10+)
* [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/raghuldpr/CO4_SE_AT2.git
cd CO4_SE_AT2
```

### 2. Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
*(Optional: Add your `GROQ_API_KEY` inside `.env` to enable live AI feedback)*

### 3. Build & Run Containers
Launch the entire application stack using Docker Compose:
```bash
docker compose up --build -d
```

---

## 🌐 Access Points

* **Frontend Web Application**: [http://localhost:3000](http://localhost:3000)
* **Backend API Swagger Documentation**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
* **Backend OpenAPI Specification**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## 🛠️ Command Reference

| Action | Command |
| :--- | :--- |
| **Build images** | `docker compose build` |
| **Start containers (background)** | `docker compose up -d` |
| **Start with rebuild** | `docker compose up --build -d` |
| **Check container status** | `docker compose ps` |
| **View logs (All)** | `docker compose logs -f` |
| **View logs (Backend)** | `docker compose logs -f backend` |
| **View logs (Database)** | `docker compose logs -f db` |
| **Stop containers** | `docker compose stop` |
| **Remove containers & network** | `docker compose down` |
| **Full clean reset (Deletes volumes)** | `docker compose down -v` |

---

## 🔀 Git Version Control & Branching Strategy

This repository follows Git-Flow best practices with feature branching and clean merge commits:

```text
*   merge: update project documentation and README (main)
|\  
| * docs: add comprehensive README with architecture diagram, Docker instructions, and API docs (feature/docs-readme)
|/  
*   merge: implement full-stack Docker multi-container architecture
|\  
| * feat(docker): add docker-compose orchestration for PostgreSQL, backend, and frontend
| * feat(docker): add multi-stage Dockerfile for Spring Boot backend
| * feat(docker): add multi-stage Dockerfile for React frontend and custom Nginx SPA routing (feature/docker-containerization)
|/  
*   merge: configure Vite frontend build system
|\  
| * feat(frontend): setup React 19 + Vite 6 + Tailwind CSS configuration (feature/frontend-react-vite)
|/  
*   merge: add Spring Boot backend application configurations
|\  
| * feat(backend): configure Spring Boot backend application yml profiles and Maven POM (feature/backend-spring-boot)
|/  
*   merge: incorporate Supabase PostgreSQL database schema and seed configuration
|\  
| * feat(db): add database schema and seed data for PrepWise (feature/database-setup)
|/  
* init: project structure, initial React frontend and Spring Boot backend codebase
```

---

## 📄 License

This project is submitted as part of the **Software Engineering Git & Docker Technical Assignment**.
Developed with ❤️ by Raghul for **PrepWise**.