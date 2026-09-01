# ✨ Shine Notes - Full-Stack MERN Application

A feature-rich, high-performance Personal Knowledge Base and Notes Management web application built with TypeScript, React, Node.js, Express, MongoDB, and Vitest.

---

## 🚀 Features

- **🔐 Robust Authentication & Security**:
  - JWT-based authentication with bcrypt password hashing.
  - Route protection middleware with role validation and token verification.
  - Secure profile management with password change modal.

- **📝 Rich-Text Note Taking & Management**:
  - Full CRUD operations with instant optimistic UI updates.
  - Rich text editor with formatting controls (Bold, Italic, Underline, Lists, Headers) and keyboard shortcuts (`Ctrl+B`, `Ctrl+I`, `Ctrl+U`, `Ctrl+N`).
  - Color-coding palette (6 curated pastel themes) and responsive see-more modals.
  - Note organization: Pinning, Archiving, and Soft-deletion Trash lifecycle with restore/permanent delete.

- **🏷️ Tagging & Instant Search**:
  - Interactive multi-tag chips (with Enter and comma shortcuts).
  - Client-side search filtering across note titles and content bodies.
  - Sidebar counts and active navigation filtering.

- **📥 Data Portability (Import & Export)**:
  - Export individual notes or batch exports to Markdown (`.md`) and JSON format.
  - Import notes from `.md` or `.json` backup files with client-side payload validation.

- **🧪 Enterprise Test Suite & Static Analysis**:
  - Over 200 automated unit and integration tests using Vitest (100% passing).
  - ~97% Backend and ~89% Frontend test coverage.
  - Clean ESLint configuration (0 errors, 0 warnings) and SonarCloud Grade A ratings.

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Lucide Icons, Vanilla CSS |
| **Backend** | Node.js, Express, TypeScript, Mongoose, MongoDB, JWT, bcryptjs |
| **Testing** | Vitest, React Testing Library, JSDOM, V8 Coverage |
| **Code Quality** | ESLint, TypeScript Strict Mode, SonarCloud |

---

## 📂 Project Structure

```text
cohort-9-mern-9387-muhammad/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment & event bus configuration
│   │   ├── controllers/     # Authentication & Notes CRUD logic
│   │   ├── middleware/      # JWT route protection middleware
│   │   ├── models/          # Mongoose schemas (User, Note)
│   │   ├── routes/          # Express API route declarations
│   │   ├── services/        # Publisher & event services
│   │   └── tests/           # Backend unit and integration test suites
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (NoteCard, Modals, Navbar, Sidebar, etc.)
│   │   ├── context/         # AuthContext with persistent localStorage hydration
│   │   ├── hooks/           # useNotes and useRichEditor state hooks
│   │   ├── pages/           # Dashboard, Login, SignUp, Profile
│   │   ├── services/        # Fetch API utilities
│   │   └── utils/           # Markdown parsing and sanitization utilities
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
├── sonar-project.properties # SonarCloud quality metrics configuration
└── README.md
```

---

## ⚙️ Getting Started & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas connection string)
- [Git](https://git-scm.com/)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/10pshine-cohort-9/cohort-9-mern-9387-muhammad.git
cd cohort-9-mern-9387-muhammad
```

---

### Step 2: Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/shine_notes
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

Start the backend development server:
```bash
npm run dev
```
*(Server will start on `http://localhost:4000`)*

---

### Step 3: Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*(Application will be available at `http://localhost:5173`)*

---

## 🧪 Running Automated Tests

Run the complete test suite with coverage reports locally:

### Run Backend Tests:
```bash
cd backend
npx vitest run --coverage
```

### Run Frontend Tests:
```bash
cd frontend
npx vitest run --coverage
```

### Run Linters:
```bash
# Frontend
cd frontend
npx eslint src

# Backend
cd backend
npx eslint src
```

### Run Production Builds:
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

---

## 📄 License
This project was developed as part of the **10P Shine MERN Internship Program (Cohort 9)**.
