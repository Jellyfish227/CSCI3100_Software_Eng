
# Kaiju Academy: Full Stack E-Learning Platform

> **CSCI3100 Software Engineering Project – Group A2**

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture](#architecture)
- [Directory Structure](#directory-structure)
- [Backend](#backend)
  - [Rust AWS Lambda Backend](#rust-aws-lambda-backend)
  - [Node.js Lambda API](#nodejs-lambda-api)
- [Frontend](#frontend)
- [Database](#database)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Testing & Quality](#testing--quality)
- [Documentation](#documentation)
- [Contributors](#contributors)

---

## Project Overview

Kaiju Academy is a web-based e-learning platform for interactive programming education. It provides a modern LMS experience, real-time code assessment, progress tracking, and a secure payment/credit system. The platform supports students, educators, and administrators with robust authentication, scalable cloud infrastructure, and a responsive UI.

---

## Features

- **Role-based User Management:** Students, Educators, Admins
- **Multi-factor Authentication (MFA):** Secure login, JWT sessions
- **Course Creation & Enrollment:** Educators can create/manage; students enroll via credits
- **Interactive Code Assessment:** In-browser code editor, real-time execution, auto-grading
- **Progress Tracking:** Visual dashboards, completion metrics, student analytics
- **Assignment & Quiz System:** MC, coding, essay questions, auto/manual grading
- **Credit/Payment System:** Buy credits to unlock courses (integrated with payment gateway)
- **File Uploads:** Course materials, assignment submissions, profile images
- **Responsive UI:** Works on desktop, tablet, and mobile
- **Internationalization:** Designed with multi-language support in mind
- **Security:** OAuth2, RBAC, AES-256 encryption, TLS 1.2+, sandboxed code execution

---

## Architecture

- **Frontend:** React + TypeScript (Material-UI), SPA, API-driven
- **Backend:** Rust (main, AWS Lambda), Node.js (legacy/alternative), RESTful APIs
- **Database:** SurrealDB (multi-model ACID DB for core data), MongoDB (for Node.js API)
- **Cloud:** AWS (Lambda, API Gateway, Cognito, S3, CloudFront, EC2/ECS)
- **DevOps:** AWS SAM/CDK, CI/CD, Docker, scripts for build & deployment
- **Diagrams:** Mermaid diagrams for architecture, sequence, and ER models

---

## Directory Structure

```
CSCI3100_Software_Eng/
│
├─ app/
│  ├─ backend/           # Rust AWS Lambda backend (core)
│  │  ├─nodejs-lambda/   # Node.js Lambda API (legacy/alternative)
│  ├─ kaiju-coding/      # Frontend (React, TypeScript, MUI)
│  └─ KaijuAcademyAPI/   # API test collections (Bruno)
│
├─ docs/
│  ├─ design_impl/       # Design & implementation docs, diagrams (Mermaid)
│  ├─ release_notes/     # Release notes
│  ├─ srs/               # Software Requirements Specification
│  ├─ testing/           # Test plans & reports
│  └─ user_manual/       # User manual (PDF, LaTeX)
│
└─ spec.pdf              # Project specification document
```

---

## Backend

### Rust AWS Lambda Backend

- **Location:** `app/backend/`
- **Stack:** Rust, AWS Lambda, SurrealDB, API Gateway, Cognito
- **Features:**
  - RESTful API: authentication, course, assessment, forum, file upload
  - SurrealDB integration: multi-model (relational, document, graph), ACID, role permissions
  - Serverless: auto-scaling, cost-efficient, stateless functions
  - Secure (OAuth2, JWT, RBAC), high performance (2s load, 5s code exec)

- **Setup & Deployment:**
  - See `app/backend/README.md`
  - Build with `cargo lambda build --release`
  - Deploy with AWS SAM (`sam deploy --guided`)

### Node.js Lambda API

- **Location:** `app/backend/nodejs-lambda/`
- **Stack:** Node.js, MongoDB, AWS Lambda, API Gateway
- **Purpose:** Alternative/legacy implementation, useful for rapid prototyping and API compatibility
- **API Docs:** `app/backend/nodejs-lambda/src/API_DOCUMENTATION.md`
- **Setup:** See `app/backend/nodejs-lambda/README.md`

---

## Frontend

- **Location:** `app/kaiju-coding/`
- **Stack:** React, TypeScript, Material-UI (MUI)
- **Features:**
  - Dashboard with analytics, enrolled courses, course search
  - Code editor, quizzes, assignments, file uploads
  - Auth: JWT, context-based, role-based navigation
  - Responsive, modern dashboard UI

- **Setup:**
  - See `app/kaiju-coding/README.md`
  - Install: `npm install`
  - Dev server: `npm run dev`
  - Connects to backend via REST APIs

---

## Database

- **Primary:** SurrealDB (multi-model, ACID, real-time, WebSocket support)
- **Schema:** Defined in `dbinit.surql` (see `Database.md` for rationale and details)
- **Entities:** User, Course, Module, Assessment, Progress, Forum, Files, etc.
- **Security:** Row-level permissions, encrypted fields, access control

---

## Deployment

- **Frontend:** AWS S3 (static site), CloudFront (CDN, HTTPS, SPA routing), see `DEPLOYMENT.md`
- **Backend:** AWS Lambda (Rust, Node.js), API Gateway, Cognito, S3, SurrealDB on EC2/ECS
- **DevOps:** Scripts (`deploy.sh`, `build.sh`), AWS SAM/CDK templates
- **Custom Domain:** Supported (see deployment guide)

---

## API Documentation

- **Core API Docs:** 
  - `app/backend/nodejs-lambda/src/API_DOCUMENTATION.md`
  - `app/kaiju-coding/API_DOCUMENTATION.md`
- **Key Endpoints:** Auth (`/auth/login`, `/auth/register`), Courses (`/courses`), Code Execution (`/code/execute`), File Upload (`/upload`, `/files`), Enrollments, Progress, Assignments, Assessments, Forum
- **Authentication:** JWT Bearer, OAuth2 (via Cognito), see endpoint docs for details
- **Rate Limits:** 1000 req/min/IP, 100 req/min/user

---

## Testing & Quality

- **Test Plan:** `docs/testing/GroupA2_Testing.pdf`
- **Automated Tests:** Unit, integration, E2E (Cypress, Jest, Rust tests)
- **Manual Testing:** UI/UX, accessibility, device/browser compatibility
- **CI/CD:** GitHub Actions (recommended), test coverage targets (≥80%)
- **Quality Goals:**
  - Response time <2s for 95% users
  - Code exec <5s for 99% submissions
  - 99.9% uptime, daily encrypted backups

---

## Documentation

- **Requirements:** `docs/srs/GroupA2_Requirements_Specification.pdf`
- **Design & Implementation:** `docs/design_impl/GroupA2_Design_Implementation.pdf`
- **Release Notes:** `docs/release_notes/GroupA2_Release_Notes.pdf`
- **User Manual:** `docs/user_manual/GroupA2_User_Manual.pdf`
- **API Docs:** See API section above
- **Architecture Diagrams:** `docs/design_impl/diagrams/` (`.mmd` and `.svg`)
- **Component Design:** See codebase and `docs/design_impl/svg_source/component design part.md`

---

## Contributors

- **YU Ching Hei** – Backend, authentication, API design  
- **Lei Hei Tung** – Frontend, UI/UX, educator dashboard  
- **Ankhbayar Enkhtaivan** – Error handling, code assessment, documentation  
- **Yum Ho Kan** – Frontend, user profile, testing  
- **Leung Chung Wang** – Documentation, deployment, configuration

---

## Acknowledgments

- Prepared for CSCI3100 Software Engineering, The Chinese University of Hong Kong
- AI tools (e.g., ChatGPT 4.1) assisted in drafting, review, and documentation

---

## License

This project is for educational purposes only.
```
This README gives an overview, technology stack, features, directory map, deployment and documentation pointers, and contributor credits, tailored for developers, testers, and stakeholders. Adjust and expand as needed for your course or future contributions!
```
