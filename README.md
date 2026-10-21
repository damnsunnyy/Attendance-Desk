# PM Core Attendance & Leave Management

**Live demo:** [https://damnsunnyy.github.io/Attendance-Desk/](https://damnsunnyy.github.io/Attendance-Desk/)

> **Demo only:** The Pages site uses sample data and simulated actions; it is not connected to the attendance API or a database. Changes in the demo are not saved, and the demo must not be used for real employee records.

Private, local-first attendance and leave management workspace for the PM Core department. The interface uses a responsive blue and white design. The stack is React + Vite, Express, PostgreSQL, and JWT sessions.

## Included

- Role-based access for Super Admin, Admin, Manager, and Employee.
- Daily attendance check-in and check-out, configurable late and half-day thresholds, automatic previous-day absent records, employee correction requests, manager review, attendance history, and CSV export.
- First-login password change, hashed passwords, rotating refresh tokens, login rate limits, role checks, Helmet, and input validation.
- Employee register, account activation, PM Core department assignment, join-date prorated CL and fixed SL setup.
- Leave requests with working-day preview, Sunday and holiday exclusion, split leave allocation, LWP request flag, manager review, escalation, decisions, cancellation, and approval-time balance deduction in a transaction.
- Annual holiday management, holiday CSV import, leave-balance CSV import, row-level import feedback, manual audited balance adjustments, Comp Off grants, notifications, reports, CSV export, and audit history.
- PostgreSQL migrations, seed account, Docker Compose, PM2 example, Nginx proxy configuration, and optional SMTP email delivery.

## Run locally

Requirements: Node.js 20+ and Docker Desktop (or an existing PostgreSQL 16 database).

1. Copy `.env.example` to `.env`. Change both JWT secrets and the initial administrator password before using the system.
2. Start PostgreSQL with `docker compose up -d db`.
3. Install dependencies with `npm install`.
4. Create the schema using `npm run migrate`.
5. Create the first Super Admin with `npm run seed`.
6. Start the UI and API with `npm run dev`.
7. Open `http://localhost:5173`.

For a containerized local preview instead, run `docker compose up --build` after creating `.env`, then open `http://localhost:8080`. This starts PostgreSQL, the API + built UI, and Nginx.

Initial local seed credentials come from `.env`: `admin@pmcore.local` / `ChangeMe123!`. Change the seed password before using the environment outside a private local preview. The seed command does not overwrite an existing account.

The API listens on port 4000. Vite forwards `/api` calls to it in development. `npm run build && npm start` serves the built frontend from Express. The default Docker Compose file starts PostgreSQL; `Dockerfile` builds a single app container. SMTP is optional and disabled unless `SMTP_HOST` and `SMTP_FROM` are configured. In-app notifications work without SMTP.

## First setup workflow

1. Sign in with the seeded Super Admin.
2. Open Employees and create Manager accounts. The initial Super Admin can also create Admin accounts. Create managers before registering employees so you can assign L1/L2 reporting lines.
3. Register PM Core employees and assign their L1/L2 managers.
4. Upload the approved opening balances and the annual holiday list.
5. Review the current open PM Core leave period. The migration closes expired periods and opens the upcoming January–July cycle automatically. Admins can add additional periods through the periods API.

Employees get CL prorated by remaining months and one SL on registration; Comp Off starts at zero. Full-period CL and Comp Off allocations can be imported. SL is excluded from the balance CSV.

Attendance uses `BUSINESS_TIMEZONE` (default `Asia/Kolkata`). Check-ins at or after `ATTENDANCE_LATE_AFTER_HOUR` (default 10) are marked late. Check-outs before `ATTENDANCE_HALF_DAY_HOURS` (default 4) after check-in are marked half-day. A daily background task marks the prior date absent for active employees on non-Sundays and non-holidays; corrections go through manager review.

## CSV formats

Holiday import (UTF-8 CSV):

```csv
date,holiday_name,type
2026-01-26,Republic Day,national
2026-08-15,Independence Day,optional
```

Opening leave balances:

```csv
emp_code,cl_balance,comp_off_balance
PM001,7,0
```

Invalid and duplicate rows are reported and skipped; valid rows are imported. CSV uploads are limited to 2 MB.

## Access roles

- **Super Admin:** full workspace access and initial account ownership.
- **Admin:** PM Core employee, balance, holiday, reporting, and audit administration.
- **Manager:** assigned leave review, escalation, and Comp Off grants.
- **Employee:** own balances, leave requests, notifications, and holiday calendar.

## Deployment notes

- `.env` is ignored by Git. Keep secrets out of source control and replace the local database password before any shared deployment.
- Set `WEB_ORIGIN` to the exact production web origin and use HTTPS at the edge. Configure the Nginx TLS certificate and domain for a real deployment; the checked-in Nginx config is a local HTTP reverse proxy.
- Run migrations as a release step. Back up PostgreSQL and test restores before production use.
- The included Compose setup is intended for local evaluation. Production needs managed secrets, TLS, database backups, monitoring, SMTP credentials, and a reviewed employee data retention policy.

## Project map

```text
server/src/          Express API, auth, database, mail and calendar services
server/migrations/   PostgreSQL schema migrations
web/src/             React application and blue/white design system
docker-compose.yml   Local PostgreSQL service
nginx/               Reverse proxy example
ecosystem.config.cjs PM2 process example
```
