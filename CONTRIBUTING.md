# Contributing to SmartRail

Thank you for your interest in contributing to **SmartRail (Smart Railway Operations & Passenger Management Platform)**! We welcome contributions from developers, designers, and testers of all skill levels.

This document outlines the guidelines and best practices for submitting issues, contributing code, and maintaining the repository.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Submitting Pull Requests](#submitting-pull-requests)
- [Local Development Setup](#local-development-setup)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Seeding Demo Data](#seeding-demo-data)
- [Branching & Git Workflow](#branching--git-workflow)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Coding Conventions & Architecture](#coding-conventions--architecture)
  - [Backend (Express & MongoDB)](#backend-express--mongodb)
  - [Frontend (React & Vite)](#frontend-react--vite)
- [Pull Request Checklist](#pull-request-checklist)
- [Community & Contact](#community--contact)

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. By participating in this project, you agree to treat all contributors with respect and professionalism.

- Be polite, constructive, and open to feedback.
- Respect differing viewpoints and technical approaches.
- Focus on what is best for the project and community.

---

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please verify that the issue has not already been reported in the GitHub Issues tracker.

When creating a bug report, include as much context as possible:
1. **Clear Title**: A concise summary of the issue.
2. **Steps to Reproduce**: Detailed step-by-step instructions.
3. **Expected vs. Actual Behavior**: What you expected to happen vs. what actually occurred.
4. **Environment Details**: Operating system, Node.js version, browser (for frontend issues).
5. **Screenshots or Console Logs**: Visual evidence or error stack traces.

### Suggesting Enhancements

We are always looking to improve SmartRail! Feature requests should be submitted through GitHub Issues:
- Describe the problem your suggestion addresses.
- Provide a clear, detailed explanation of the proposed feature or enhancement.
- If possible, include wireframes, API mockups, or architectural diagrams.

### Submitting Pull Requests

1. **Fork** the repository and clone your fork locally.
2. Create a feature or bugfix branch (`git checkout -b feature/my-new-feature`).
3. Make your changes adhering to project conventions.
4. Test changes locally (both backend API and frontend UI).
5. Commit your changes with clear, semantic commit messages.
6. Push your branch to GitHub (`git push origin feature/my-new-feature`).
7. Open a **Pull Request** against the `main` branch.

---

## Local Development Setup

### Prerequisites

- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)
- **MongoDB**: Community Server installed and running locally on port 27017 (`mongod`)
- **Git**: Installed and configured

### Backend Setup

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables in `backend/.env`:
   ```env
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/railway_management
   JWT_SECRET=railway_secret_key_2026
   ```

3. Start the backend server:
   ```bash
   node server.js
   # Or with automatic reload during development:
   npx nodemon server.js
   ```
   Verify that you see:
   ```text
   Server running on 5001
   MongoDB Connected
   ```

### Frontend Setup

1. In a separate terminal tab, navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev -- --port 5173
   ```

3. Open your browser at `http://localhost:5173`.
   - The Vite dev server automatically proxies API requests (`/api/*`) to the backend on `http://localhost:5001`.

### Loading Demo Data

To populate your local MongoDB with demo stations and trains, log into the frontend portal and click:
- **"Load Demo Fleet"** in the **Search & Book / Fleet** tab.
- **"Load Major Junctions"** in the **Station Hubs** tab.
- Or use the **"1-Click Quick Demo Switcher"** in the Sign In modal to instantly access pre-configured Admin, Staff, and Passenger accounts.

---

## Branching & Git Workflow

We follow standard Git Feature Branching:

| Branch | Purpose |
|---|---|
| `main` | Production-ready, stable codebase |
| `feature/<name>` | New features or UI components (e.g. `feature/export-manifest-pdf`) |
| `fix/<name>` | Bug fixes and patches (e.g. `fix/pnr-search-race-condition`) |
| `docs/<name>` | Documentation updates and guides (e.g. `docs/api-reference`) |
| `refactor/<name>` | Code refactoring without changing functionality |

---

## Commit Message Guidelines

We recommend the **Conventional Commits** specification:

```text
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Common Types:
- **`feat`**: A new feature (e.g., `feat(booking): add IRCTC berth preference algorithm`)
- **`fix`**: A bug fix (e.g., `fix(auth): resolve token expiration error on refresh`)
- **`docs`**: Documentation changes only (e.g., `docs(readme): add frontend feature screenshots`)
- **`style`**: Changes that do not affect code logic (formatting, white-space, etc.)
- **`refactor`**: Code changes that neither fix bugs nor add features
- **`perf`**: Performance optimizations
- **`test`**: Adding or correcting tests
- **`chore`**: Maintenance tasks, dependency updates, build configs

---

## Coding Conventions & Architecture

### Backend (Express & MongoDB)
- **MVC Structure**: Keep business logic within `controllers/`, schema definitions in `models/`, route endpoints in `routes/`, and reusable guards in `middleware/`.
- **Validation**: Use `express-validator` to validate and sanitize request payloads before reaching controllers.
- **RBAC Enforcement**: Protect administrative and staff routes with `authMiddleware` and `roleMiddleware(['admin', 'staff'])`.
- **Error Handling**: Pass asynchronous errors to Express error handling via `next(error)`. Avoid unhandled promise rejections.
- **Database Operations**: Prefer atomic Mongoose updates (e.g. `$inc`, `$set`, `$lookup`) over manual read-modify-write loops to prevent race conditions in seat allocations.

### Frontend (React & Vite)
- **Modular Components**: Keep components self-contained, clean, and reusable under `frontend/src/components/`.
- **Design System**: Use CSS tokens and utility variables defined in `index.css` and `App.css`. Maintain cohesive visual styling, dark glassmorphism backdrops, and accessible color contrasts.
- **Icons**: Use `lucide-react` icons uniformly across components.
- **State Management**: Manage authentication and global notification states centrally in `App.jsx`, cascading down via props.

---

## Pull Request Checklist

Before submitting your pull request, please ensure you have completed the following:

- [ ] My code adheres to the project's coding and style guidelines.
- [ ] I have tested my changes locally on both backend and frontend.
- [ ] No extraneous console logs, debugging artifacts, or sensitive credentials are committed.
- [ ] Relevant documentation (README, API docs, comments) has been updated.
- [ ] Commit history is clean and follows conventional commit messages.
- [ ] The PR title and description clearly describe what was changed and why.

---

## Community & Contact

Have questions, ideas, or feedback?

- Open an issue on GitHub.
- Reach out to the core project maintainers:
  - **Daksh Srivastava**
  - **Yuvraj Mishra**
  - **Prathamesh More**
  - **Sumit Shingole**
  - **Rudra Yadav**

Thank you for helping make **SmartRail** better for passengers and operators alike!
