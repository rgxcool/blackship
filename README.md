# centralize-directory


for the branch name 
for backend use:
BE/feature name

## Stack

| Part | Tools |
|---|---|
| Backend | Go, Huma, Gorilla Mux, GORM with pgx, FX |
| Data | PostgreSQL, Atlas migrations |
| Config | Viper |
| Backend tests | Testify, testcontainers |
| Frontend | React, TanStack, Tailwind |
| Dev | Docker, Makefile |

## Folders

```text
backend/    Go API (hexagonal: domain, port, app, adapter)
  internal/university/   one module for universities
  internal/course/       one module for courses
  internal/enterprise/   companies and agent links
  internal/platform/     config, database, redis, server
  schema/                Atlas SQL files
frontend/   React app
  src/features/university/
  src/features/course/
  e2e/                   Playwright tests
```

The folder names match: `backend/internal/university` pairs with
`frontend/src/features/university`.

## Run it

Backend:

```bash
cd backend
cp .env.example .env
docker compose up -d        # Postgres and Redis
# apply the schema with Atlas (see atlas.hcl)
go run ./cmd/api
```

Frontend:

```bash
cd frontend
cp .env.example .env        # set VITE_API_URL to the backend address
npm install
npm run dev
```

## Test it

```bash
cd backend && go test ./...          # needs Docker for testcontainers
cd frontend && npx playwright test
```
