
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
│  .gitignore
│  spec.pdf
│
├─app
│  ├─backend
│  │  │  .gitignore
│  │  │  build-lambda.sh
│  │  │  build.sh
│  │  │  Cargo.toml
│  │  │  Dockerfile
│  │  │  README.md
│  │  │  template.yaml
│  │  │
│  │  ├─nodejs-lambda
│  │  │  │  .gitignore
│  │  │  │  build-and-deploy.sh
│  │  │  │  frontend-upload-example.js
│  │  │  │  local-secrets.template.json
│  │  │  │  package-lock.json
│  │  │  │  package.json
│  │  │  │  packaged.yaml
│  │  │  │  README.md
│  │  │  │  template.yaml
│  │  │  │  test-db.js
│  │  │  │
│  │  │  └─src
│  │  │      │  API_DOCUMENTATION.md
│  │  │      │  FRONTEND_AUTH_SETUP.md
│  │  │      │  index.js
│  │  │      │  local-server.js
│  │  │      │
│  │  │      ├─db
│  │  │      │      dbinit.surql
│  │  │      │
│  │  │      ├─handlers
│  │  │      │  ├─auth
│  │  │      │  │      get-user.js
│  │  │      │  │      index.js
│  │  │      │  │      login.js
│  │  │      │  │      register.js
│  │  │      │  │      update-profile.js
│  │  │      │  │      validate.js
│  │  │      │  │
│  │  │      │  ├─code-execution
│  │  │      │  │      evaluate.js
│  │  │      │  │      execute.js
│  │  │      │  │      index.js
│  │  │      │  │
│  │  │      │  ├─courses
│  │  │      │  │      assessments.js
│  │  │      │  │      assignments.js
│  │  │      │  │      content.js
│  │  │      │  │      create.js
│  │  │      │  │      delete.js
│  │  │      │  │      enrollment.js
│  │  │      │  │      featured.js
│  │  │      │  │      get.js
│  │  │      │  │      index.js
│  │  │      │  │      list.js
│  │  │      │  │      update.js
│  │  │      │  │
│  │  │      │  └─files
│  │  │      │          index.js
│  │  │      │
│  │  │      ├─middleware
│  │  │      │      auth.js
│  │  │      │
│  │  │      ├─models
│  │  │      │      Course.js
│  │  │      │      User.js
│  │  │      │
│  │  │      ├─scripts
│  │  │      │      create-tables.js
│  │  │      │      seed-db.js
│  │  │      │
│  │  │      └─utils
│  │  │              db.js
│  │  │              response.js
│  │  │
│  │  └─src
│  │      │  main.rs
│  │      │
│  │      ├─common
│  │      │      auth.rs
│  │      │      config.rs
│  │      │      db.rs
│  │      │      error.rs
│  │      │      logger.rs
│  │      │      mod.rs
│  │      │
│  │      ├─db
│  │      │      test.js
│  │      │
│  │      ├─lambda
│  │      │  │  mod.rs
│  │      │  │
│  │      │  ├─auth
│  │      │  │      login.rs
│  │      │  │      mod.rs
│  │      │  │      register.rs
│  │      │  │      verify.rs
│  │      │  │
│  │      │  ├─code_execution
│  │      │  │      evaluate.rs
│  │      │  │      execute.rs
│  │      │  │      mod.rs
│  │      │  │      submission.rs
│  │      │  │
│  │      │  ├─course
│  │      │  │      create.rs
│  │      │  │      delete.rs
│  │      │  │      get.rs
│  │      │  │      list.rs
│  │      │  │      mod.rs
│  │      │  │      update.rs
│  │      │  │
│  │      │  ├─forum
│  │      │  │      mod.rs
│  │      │  │
│  │      │  ├─quiz
│  │      │  │      mod.rs
│  │      │  │
│  │      │  └─user
│  │      │          mod.rs
│  │      │
│  │      └─models
│  │          │  course.rs
│  │          │  forum.rs
│  │          │  mod.rs
│  │          │  quiz.rs
│  │          │  submission.rs
│  │          │  user.rs
│  │          │
│  │          └─user
│  │                  index.js
│  │
│  ├─kaiju-coding
│  │  │  .gitignore
│  │  │  API_DOCUMENTATION.md
│  │  │  bun.lockb
│  │  │  cloudfront-function.js
│  │  │  components.json
│  │  │  deploy.sh
│  │  │  DEPLOYMENT.md
│  │  │  eslint.config.js
│  │  │  index.html
│  │  │  package-lock.json
│  │  │  package.json
│  │  │  README.md
│  │  │  s3-policy.json
│  │  │  test.txt
│  │  │  tsconfig.app.json
│  │  │  tsconfig.json
│  │  │  tsconfig.node.json
│  │  │  vite-env.d.ts
│  │  │  vite.config.production.ts
│  │  │  vite.config.ts
│  │  │
│  │  ├─public
│  │  │      vite.svg
│  │  │
│  │  └─src
│  │      │  App.css
│  │      │  App.tsx
│  │      │  index.css
│  │      │  main.tsx
│  │      │
│  │      ├─assets
│  │      │      react.svg
│  │      │
│  │      ├─components
│  │      │  │  footer.tsx
│  │      │  │  hero.tsx
│  │      │  │  main-nav.tsx
│  │      │  │  user-nav.tsx
│  │      │  │
│  │      │  └─ui
│  │      │          accordion.tsx
│  │      │          alert.tsx
│  │      │          avatar.tsx
│  │      │          badge.tsx
│  │      │          button.tsx
│  │      │          card.tsx
│  │      │          checkbox.tsx
│  │      │          dropdown-menu.tsx
│  │      │          input.tsx
│  │      │          label.tsx
│  │      │          progress.tsx
│  │      │          radio-group.tsx
│  │      │          select.tsx
│  │      │          sheet.tsx
│  │      │          tabs.tsx
│  │      │          textarea.tsx
│  │      │          toast.tsx
│  │      │          toaster.tsx
│  │      │          use-toast.tsx
│  │      │
│  │      ├─lib
│  │      │      auth.tsx
│  │      │      utils.ts
│  │      │
│  │      ├─pages
│  │      │  │  course-content.tsx
│  │      │  │  course-overview.tsx
│  │      │  │  dashboard.tsx
│  │      │  │
│  │      │  ├─assessment
│  │      │  │      assessment-form.tsx
│  │      │  │      assessment-page.tsx
│  │      │  │      assessment-view.tsx
│  │      │  │      grade-submission.tsx
│  │      │  │
│  │      │  ├─auth
│  │      │  │      password-reset.tsx
│  │      │  │      sign-in.tsx
│  │      │  │      sign-up.tsx
│  │      │  │
│  │      │  ├─course
│  │      │  │      course-card.tsx
│  │      │  │      course-editor.tsx
│  │      │  │      course-form.tsx
│  │      │  │      course-management.tsx
│  │      │  │      course-search.tsx
│  │      │  │      course-tabs.tsx
│  │      │  │
│  │      │  ├─educator
│  │      │  │      course-content-management.tsx
│  │      │  │      course-management.tsx
│  │      │  │
│  │      │  ├─profile
│  │      │  │      StudentProfile.tsx
│  │      │  │      TeacherProfile.tsx
│  │      │  │
│  │      │  └─student
│  │      │          content-detail.tsx
│  │      │          course-content.tsx
│  │      │          enrolled-courses.tsx
│  │      │          quiz.tsx
│  │      │
│  │      ├─services
│  │      │      apiService.ts
│  │      │      assessment-service.ts
│  │      │
│  │      └─types
│  │              course.ts
│  │              courseContent.ts
│  │
│  └─KaijuAcademyAPI
│          bruno.json
│          Check.bru
│
├─docs
│  │  .gitignore
│  │
│  ├─design_impl
│  │  │  GroupA2_Design_Implementation.pdf
│  │  │  GroupA2_Design_Implementation.tex
│  │  │  impl.sty
│  │  │
│  │  ├─diagrams
│  │  │      admin_account_actions.mmd
│  │  │      admin_managing_users.mmd
│  │  │      admin_user_listing.mmd
│  │  │      admin_user_management.mmd
│  │  │      api_domains.mmd
│  │  │      Arch.mmd
│  │  │      backend_architecture.mmd
│  │  │      code_assessment_autograding.mmd
│  │  │      code_assessment_grading.mmd
│  │  │      code_assessment_history.mmd
│  │  │      code_assessment_solving.mmd
│  │  │      code_assessment_starting.mmd
│  │  │      component_relationships.mmd
│  │  │      database_schema.mmd
│  │  │      educator_content_management.mmd
│  │  │      educator_course_creation.mmd
│  │  │      educator_course_publishing.mmd
│  │  │      educator_managing_courses.mmd
│  │  │      general_sequence.mmd
│  │  │      moderator_actions.mmd
│  │  │      moderator_dashboard.mmd
│  │  │      moderator_forum_settings.mmd
│  │  │      moderator_managing_forum.mmd
│  │  │      moderator_reviewing_content.mmd
│  │  │      README.md
│  │  │      render_mermaid.js
│  │  │      render_mermaid.py
│  │  │      security_implementation.mmd
│  │  │      student_accessing_course.mmd
│  │  │      student_completing_course.mmd
│  │  │      student_purchasing_course.mmd
│  │  │      student_purchasing_course_browse.mmd
│  │  │      student_purchasing_course_enrollment.mmd
│  │  │      student_purchasing_course_payment.mmd
│  │  │      student_taking_course.mmd
│  │  │      student_viewing_materials.mmd
│  │  │      temp_render.html
│  │  │      temp_render_save.html
│  │  │      user_authentication.mmd
│  │  │
│  │  ├─example
│  │  │  │  index.html
│  │  │  │
│  │  │  └─img
│  │  │          10_quality_tree.png
│  │  │          3.1_business-context(1).png
│  │  │          3.2_technical-context(1).png
│  │  │          5.0_level0.png
│  │  │          5.1_level1-biking_api.png
│  │  │          5.2_level2-bikes.png
│  │  │          5.2_level2-bikingPictures.png
│  │  │          5.2_level2-galleryPictures.png
│  │  │          5.2_level2-locations.png
│  │  │          5.2_level2-tracks.png
│  │  │          5.2_level2-trips.png
│  │  │          6.1_creating-new-tracks.png
│  │  │          6.2_fetching-biking-pictures-from-dailyfratze.png
│  │  │          7_deployment.png
│  │  │          8.1_domain-model.png
│  │  │          8.1_er-diagram.png
│  │  │          arc42-logo.png
│  │  │
│  │  ├─img
│  │  │  │  admin_managing_users.png
│  │  │  │  api_domains.png
│  │  │  │  backend_architecture.png
│  │  │  │  class_diagram.png
│  │  │  │  code_assessment_autograding.png
│  │  │  │  code_grade.png
│  │  │  │  component_relationships.png
│  │  │  │  credit_purchase_flow.png
│  │  │  │  database_schema.png
│  │  │  │  data_flow.png
│  │  │  │  educator_managing_courses.png
│  │  │  │  eduContentMan.png
│  │  │  │  moderator_managing_forum.png
│  │  │  │  security_implementation.png
│  │  │  │  serverless_deployment.png
│  │  │  │  student_access_course.png
│  │  │  │  student_purchasing_course.png
│  │  │  │  student_taking_course.png
│  │  │  │  user_authentication.png
│  │  │  │
│  │  │  └─UI
│  │  │          CourseDetail.jpg
│  │  │          description.md
│  │  │          eduFlow.jpg
│  │  │          modFlow.jpg
│  │  │          myCourse.jpg
│  │  │          SignIn.jpg
│  │  │          SignUp.jpg
│  │  │          StudentAssessment.jpg
│  │  │          StudentProfile.jpg
│  │  │          stuFlow.jpg
│  │  │          TeacherAssessment.jpg
│  │  │          TeacherCreateAssessment.jpg
│  │  │          TeacherEditCourse.jpg
│  │  │          TeacherManageCourse.jpg
│  │  │          TeacherProfile.jpg
│  │  │          UI flow.svg
│  │  │          UI_flow.png
│  │  │
│  │  └─svg_source
│  │          Backend.md
│  │          backend_architecture.svg
│  │          component design part.md
│  │          component_relationships.svg
│  │          Database.md
│  │          database_schema.svg
│  │          data_flow.svg
│  │          front_end.md
│  │          KaijuAcademyArchitecture-ClassDiagram.svg
│  │          KaijuAcademyAWSServerlessDeploymentArchitectureDiagram.svg
│  │          markdown.md
│  │          security_implementation.svg
│  │          svgtopng.zip
│  │
│  ├─release_notes
│  │      GroupA2_Release_Notes.pdf
│  │      GroupA2_Release_Notes.tex
│  │      releasenotes.sty
│  │
│  ├─srs
│  │      GroupA2_Requirements_Specification.pdf
│  │      GroupA2_Requirements_Specification.tex
│  │      srs.sty
│  │
│  └─testing
│          GroupA2_Testing.pdf
│          GroupA2_Testing.tex
│          testing.sty
│
└─user_manual
        GroupA2_User_Manual.aux
        GroupA2_User_Manual.log
        GroupA2_User_Manual.out
        GroupA2_User_Manual.pdf
        GroupA2_User_Manual.synctex.gz
        GroupA2_User_Manual.tex
        GroupA2_User_Manual.toc
        releasenotes.sty
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

- **YU Ching Hei** – Backend 
- **Lei Hei Tung** – UI/UX Design
- **Ankhbayar Enkhtaivan** – Deployment
- **Yum Ho Kan** – Frontend 
- **Leung Chung Wang** – Documentation

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
