# Budget AI Tracker - Production Deployment Manual

This guide describes how to configure, run, and host the **Budget AI Tracker** application in local development, containerized staging, and cloud production environments (Render, Vercel, Railway).

---

## Table of Contents
1. [Environment Configurations Overview](#1-environment-configurations-overview)
2. [Local Development Setup](#2-local-development-setup)
3. [Docker Containerization (Local / VPS)](#3-docker-containerization-local-vps)
4. [Cloud Deployment Strategy (Production)](#4-cloud-deployment-strategy-production)
   - [A. Database Hosting (Railway MySQL)](#a-database-hosting-railway-mysql)
   - [B. Backend Hosting (Render)](#b-backend-hosting-render)
   - [C. Frontend Hosting (Vercel)](#c-frontend-hosting-vercel)
5. [Troubleshooting & Common Pipeline Errors](#5-troubleshooting--common-pipeline-errors)

---

## 1. Environment Configurations Overview

The application has been prepared for production by detaching all hardcoded configurations, endpoints, and credentials, replacing them with standard environment variables.

### Local Variables (.env)
Create a `.env` file in the project root directory following this format:

```env
# Database Configuration
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/jwt_demo?allowPublicKeyRetrieval=true&useSSL=false&createDatabaseIfNotExist=true
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=yourpassword
SPRING_JPA_HIBERNATE_DDL_AUTO=update

# Backend Configuration
PORT=8080
JWT_SECRET=your_super_secure_jwt_secret_key_at_least_32_bytes_long
FRONTEND_URL=http://localhost:3000,http://localhost:5173

# Frontend Configuration (Vite)
VITE_API_URL=http://localhost:8080
```

### Reference Templates
- **Root Environment Template**: [.env.example](file:///d:/Budget-AI/.env.example)
- **Spring Boot Template**: [application-example.properties](file:///d:/Budget-AI/backend/src/main/resources/application-example.properties)

---

## 2. Local Development Setup

To run the application locally without Docker containers:

### A. Pre-requisites
- **Java JDK 17+**
- **NodeJS 20+**
- **MySQL Server**

### B. Launching Database & Backend
1. Start your local MySQL service and verify a database instance matches your url properties.
2. In terminal, navigate to `/backend`:
   ```bash
   cd backend
   mvn clean spring-boot:run
   ```

### C. Launching Frontend
1. Open a new terminal and navigate to `/frontend/expensive_tracker`:
   ```bash
   cd frontend/expensive_tracker
   npm install
   npm run dev
   ```
2. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 3. Docker Containerization (Local / VPS)

We have provided a complete Docker orchestration system enabling single-command deployment.

### A. File Structure
- **Backend Dockerfile**: [backend/Dockerfile](file:///d:/Budget-AI/backend/Dockerfile) (Multi-stage Maven build + Eclipse Temurin runtime)
- **Frontend Dockerfile**: [frontend/expensive_tracker/Dockerfile](file:///d:/Budget-AI/frontend/expensive_tracker/Dockerfile) (Node alpine builder + Nginx SPA hosting)
- **Nginx Config Router**: [frontend/expensive_tracker/nginx.conf](file:///d:/Budget-AI/frontend/expensive_tracker/nginx.conf) (Redirects all SPA client routes to `index.html`)
- **Docker Compose**: [docker-compose.yml](file:///d:/Budget-AI/docker-compose.yml) (Spins up isolated database, backend, and frontend containers on a named bridge network)

### B. Execution
Run this command from the project root directory:
```bash
docker compose up --build -d
```

Verify status:
```bash
docker compose ps
```

The stack exposes:
- **Frontend Dashboard**: `http://localhost:3000`
- **Spring Boot REST APIs**: `http://localhost:8080`
- **Persistent DB Volume**: Persistent data is written to a Docker volume named `mysql_data`.

---

## 4. Cloud Deployment Strategy (Production)

We deploy the stack across:
1. **Railway** for the MySQL Database.
2. **Render** for the Java API Backend.
3. **Vercel** for the React static page frontend.

---

### A. Database Hosting (Railway MySQL)

1. Sign up / log into [Railway.app](https://railway.app).
2. Click **New Project** -> **Provision MySQL**.
3. Once the database container is ready:
   - Go to the **Variables** tab to view your credentials.
   - Click **Connect** and copy your **Private TCP Connection String** or construct it:
     ```text
     jdbc:mysql://[MYSQLHOST]:[MYSQLPORT]/[MYSQLDATABASE]
     ```
   - Make a note of `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLHOST`, `MYSQLPORT`, and `MYSQLDATABASE`.

---

### B. Backend Hosting (Render)

We use Render's native auto-deployment connected with your GitHub branch:

1. Push your code changes to GitHub.
2. Log into [Render.com](https://render.com).
3. Click **New +** > **Web Service**.
4. Link your git repository.
5. In the builder parameters:
   - **Name**: `budget-ai-backend`
   - **Environment / Runtime**: `Docker` (Render auto-reads Backend `Dockerfile`)
   - **Docker Build Context**: `backend` (Select the subfolder context relative to root root)
   - **DockerfilePath**: `Dockerfile`
6. Click the **Advanced / Environment** dropdown and define these Variables:
   - `PORT`: `8080`
   - `SPRING_DATASOURCE_URL`: your JDBC URL from Railway.
   - `SPRING_DATASOURCE_USERNAME`: your `MYSQLUSER` from Railway.
   - `SPRING_DATASOURCE_PASSWORD`: your `MYSQLPASSWORD` from Railway.
   - `JWT_SECRET`: A long secure custom secret key.
   - `FRONTEND_URL`: `https://your-frontend-subdomain.vercel.app` (You can update this after deploying the frontend).
7. Select **Deploy Web Service**. Once green, write down your backend domain (e.g. `https://budget-ai-backend.onrender.com`).

---

### C. Frontend Hosting (Vercel)

Vercel hosts the compiled static SPA containing Nginx-like rewriting automatically:

1. Log into [Vercel.com](https://vercel.com).
2. Click **Add New** > **Project** and select your GitHub repository.
3. In configure parameters:
   - **Framework Preset**: `Vite` (Vite is auto-configured)
   - **Root Directory**: `frontend/expensive_tracker` (Make sure to point to this subfolder!)
4. In the **Environment Variables** group, insert:
   - `VITE_API_URL`: Use the Render backend URL (e.g. `https://budget-ai-backend.onrender.com`).
5. Click **Deploy**. Vercel will build and render your project.
6. Note down your final deployment URL (e.g. `https://budget-ai-tracker-xxxx.vercel.app`).
7. **Crucial Step**: Go back to your **Render Web Service Settings**, go to your environment variables list, update `FRONTEND_URL` to your Vercel domain URL, and hit deploy again. This white-lists CORS requests!

---

## 5. Troubleshooting & Common Pipeline Errors

### I. CORS Handshake Denied
- **Issue**: Frontend network console logs `CORS policy blocked requested URL...`.
- **Solution**: The backend `FRONTEND_URL` variable does not match your Vercel address. Ensure you copy the full path (including `https://` but without trailing slashes). Multiple allowed domains must be comma-separated without spaces.

### II. JWT Tokens Invalidation on Restart
- **Issue**: Deploying backend updates signs out all active users.
- **Solution**: Ensure you set a static `JWT_SECRET` in local and cloud environment variables. If left undefined, the backend defaults to a secure key that works, but changing it restarts session states.

### III. Vite Client Router Refresh yields 404
- **Issue**: Navigating to Sub-routes (like `/dashboard`) works, but pressing refresh causes standard hosting servers to yield `404 Not Found`.
- **Solution**:
  - In **Docker**, Nginx must have the `try_files` rule redirecting routing to `index.html`. This is handled inside our [nginx.conf](file:///d:/Budget-AI/frontend/expensive_tracker/nginx.conf).
  - In **Vercel**, this is configured automatically by Vercel for SPA routes, but if you experience issues you can add a `vercel.json` rewrite file:
    ```json
    {
      "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
    }
    ```

### IV. MySQL Public Key Retrieval Error
- **Issue**: The logs display `java.sql.SQLNonTransientConnectionException: Public Key Retrieval is not allowed`.
- **Solution**: Add `allowPublicKeyRetrieval=true` and `useSSL=false` (or `useSSL=true` on secured DB links) to your `SPRING_DATASOURCE_URL` connection keys.
