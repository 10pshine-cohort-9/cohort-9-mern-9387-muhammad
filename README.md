# Shine Notes

A full-stack note-taking app I built as part of my MERN internship at 10Pearls Shine (Cohort 9) — React on the front, Express + MongoDB on the back, all in TypeScript. It covers the basics you'd expect (sign up, log in, create/edit/delete notes) plus tagging, search, pinning, and per-note colors.

I built this with an eye toward how a real small-scale note app would actually be structured in production, not just a CRUD demo: proper auth, input validation that fails loudly instead of silently, structured logging, and tests on both ends.

## Tech stack and why I picked it

- **React 19 + Vite** on the frontend — fast dev reloads, modern component patterns, and a much lighter build setup than something like CRA.
- **React Router v7** for navigation between the dashboard, auth pages, and profile.
- **Express 5 + Mongoose** on the backend. Express is well-documented and predictable, and Mongoose's schema validation pairs naturally with MongoDB's flexible document model for something like notes (variable tags, optional fields, etc.).
- **JWT + bcryptjs** for auth. Passwords are hashed with bcrypt before they ever touch the database; a signed JWT is issued on login and required on every protected route afterward.
- **Helmet, CORS, and rate-limiting** are on by default. Small things, but they matter even in a learning project — Helmet sets sane security headers, CORS is locked to the known client origin, and rate-limiting slows down brute-force attempts on the auth endpoints.
- **Pino + Pino HTTP** for logging instead of scattering `console.log` calls everywhere. Structured JSON logs are easier to filter, and Pino HTTP gives me request-level logging (method, path, status, response time) for free.
- **TypeScript** on both ends, mainly for the DTO validation on the backend and to catch prop/shape mismatches on the frontend before they become runtime bugs.

## Architecture notes

**Backend request flow:** `routes/` → `middleware/` (auth check, validation) → `controllers/` (request/response handling) → `services/` (business logic) → `models/` (Mongoose schemas). I kept controllers thin — they parse the request, call a service, and shape the response. Anything that looks like "business logic" (checking ownership of a note before allowing an update, for example) lives in `services/`, not the controller, so it's testable in isolation from Express.

**Auth flow:** On login, the backend verifies the password hash and issues a JWT signed with `JWT_SECRET`, containing the user ID and an expiry (`JWT_EXPIRES_IN`, default 7 days). The frontend stores this token and attaches it as a Bearer token on every request to a protected route. The `middleware/` auth guard verifies the signature and expiry before the request ever reaches a controller — if it fails, the request is rejected with a 401 before touching any business logic.

**Note ownership:** Every note document stores the ID of the user who created it. Every read/update/delete on `/api/notes/:id` checks that the note's owner matches the authenticated user's ID from the JWT — not just that *a* valid token was presented. This is what "user-level isolation" means in practice: without this check, a logged-in user could guess another user's note ID and read or modify it.

**Frontend state:** Auth state (current user, token) lives in `AuthContext` and is read by a custom hook rather than passed down through props. Notes themselves are fetched and cached through a `useNotes` hook, which centralizes the fetch/create/update/delete calls so components don't talk to the API client directly.

**Graceful shutdown:** `server.ts` listens for `SIGTERM`/`SIGINT` and closes the HTTP server and MongoDB connection cleanly before exiting, rather than just killing the process — this matters if the app is ever deployed behind something like a container orchestrator that sends shutdown signals during redeploys.

## Security details

- **Password storage:** bcrypt with a standard salt round count — plaintext passwords are never logged or stored anywhere, including in error messages.
- **JWT secret:** the app fails to start if `JWT_SECRET` is missing or too short. I'd rather it crash on boot in a misconfigured environment than run with a weak or default secret.
- **Input validation:** every write endpoint validates its request body against a DTO shape before it reaches the database layer. Invalid input is rejected with a 400 and a specific error message, rather than being passed through to Mongoose and surfacing as an unhandled exception.
- **Environment variables:** `.env` is gitignored; `.env.example` documents what's needed without exposing real values. Config is loaded and validated once at startup (fail-closed), so a missing variable is caught immediately instead of causing a confusing failure three requests later.
- **Rate limiting:** applied to the auth routes specifically, since those are the most likely target for brute-force or credential-stuffing attempts.
- **CORS:** locked to `CLIENT_URL` from the environment rather than left open to any origin.

## Project layout

```
cohort-9-mern-9387-muhammad/
├── backend/
│   └── src/
│       ├── config/        # env vars, DB connection
│       ├── controllers/   # auth + notes route logic
│       ├── middleware/    # JWT auth guard, error handling
│       ├── models/        # User and Note schemas
│       ├── routes/        # Express route definitions
│       ├── services/      # business logic, event publishing
│       ├── utils/         # JWT helpers
│       ├── app.ts
│       └── server.ts
├── frontend/
│   └── src/
│       ├── components/    # Navbar, NoteModal, etc.
│       ├── context/       # AuthContext
│       ├── hooks/         # useNotes, etc.
│       ├── pages/         # Login, SignUp, Dashboard, Profile
│       ├── services/      # API client
│       ├── App.tsx
│       └── main.tsx
└── sonar-project.properties
```

## Running it locally

You'll need Node 18+, npm 9+, and a local MongoDB instance running.

**1. Clone it**

```bash
git clone https://github.com/ikramullahrumi/cohort-9-mern-9387-muhammad.git
cd cohort-9-mern-9387-muhammad
```

**2. Backend**

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/shine_notes_cohort9
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_super_secret_key_at_least_32_bytes_long
JWT_EXPIRES_IN=7d
```

Then:

```bash
npm run dev
```

The API comes up on `http://localhost:4000`.

**3. Frontend**

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Optionally point it at a different API URL via `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000/api
```

Visit `http://localhost:5173`.

## API reference

**Auth**

| Method | Endpoint | What it does | Needs a token? |
|---|---|---|---|
| POST | `/api/auth/register` | Create an account | No |
| POST | `/api/auth/login` | Log in, get a JWT back | No |
| PUT | `/api/auth/change-password` | Change your password | Yes |

**Notes**

| Method | Endpoint | What it does | Needs a token? |
|---|---|---|---|
| GET | `/api/notes` | List your notes | Yes |
| GET | `/api/notes/:id` | Get one note | Yes |
| POST | `/api/notes` | Create a note | Yes |
| PUT | `/api/notes/:id` | Update a note | Yes |
| DELETE | `/api/notes/:id` | Delete a note | Yes |

## Scripts

**Backend**
- `npm run dev` — live-reloading dev server (`tsx watch`)
- `npm run build` — compile TypeScript to `dist/`
- `npm run typecheck` — type-check without emitting files
- `npm run lint` — ESLint

**Frontend**
- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run lint` — ESLint

## Testing

Both sides use Vitest. The backend adds Supertest for API-level integration tests (hitting real routes with a test database), and the frontend uses React Testing Library for component-level behavior (form validation, rendering states, user interactions). CodeRabbit reviews every PR automatically and flags issues before a human reviewer looks at it; I make it a rule to resolve anything marked HIGH or CRITICAL before requesting review. SonarCloud runs alongside that for code quality and duplication checks — config for it is in `sonar-project.properties` at the repo root.

## Troubleshooting

**Backend won't start / crashes immediately on boot**
Check that every variable in `.env` is set and matches the format in `.env.example` — the app validates config at startup and will refuse to run rather than fall back to insecure defaults. A common cause is a `JWT_SECRET` that's missing or shorter than 32 bytes.

**"Cannot connect to MongoDB" on startup**
Make sure a local MongoDB instance is actually running before starting the backend, and that `MONGODB_URI` in `.env` points to the right host/port/database name. If you're using MongoDB Atlas instead of a local instance, swap in the Atlas connection string here.

**Frontend loads but API calls fail with a CORS error**
`CLIENT_URL` in the backend's `.env` has to exactly match the origin the frontend is actually running on (protocol, host, and port). If you change the Vite dev server's port, update `CLIENT_URL` to match.

**Login works but protected routes return 401**
Usually means the token isn't being attached to the request, or it's expired. Check that the frontend is sending an `Authorization: Bearer <token>` header, and that `JWT_EXPIRES_IN` hasn't lapsed since you logged in.

**Port already in use**
Something else is already listening on 4000 or 5173. Either stop that process or change `PORT` (backend) / the Vite dev server port (frontend) accordingly.

---

Built by **Muhammad Ikram Ullah** for 10Pearls Shine, Cohort 9.