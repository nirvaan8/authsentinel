# 🛡️ AuthSentinel

> **Privileged Access Monitoring System** — Real-time IAM threat detection with an integrated SOC dashboard.

---

## What is AuthSentinel?

AuthSentinel is a full-stack cybersecurity platform that simulates an enterprise Identity and Access Management (IAM) environment and monitors it for identity-based threats in real time. It bridges the gap between access control and security operations — when something suspicious happens to an identity, the SOC team knows instantly.

Built as a group project by two B.Tech Cybersecurity students.

---

## The Problem It Solves

In most organizations, IAM and SOC operate in silos. User accounts get compromised, privilege escalations go unnoticed, and brute force attempts aren't caught until damage is done. AuthSentinel puts identity events directly in front of the security team — live.

---

## Features

- **Role-Based Access Control (RBAC)** — Admin, Analyst, Viewer, and Guest roles with enforced permission boundaries
- **Multi-Factor Authentication (MFA)** — TOTP-based 2FA mandatory for privileged roles
- **Session Management** — Active session tracking, forced logout, concurrent session limits
- **Threat Detection Engine** — Rules for:
  - Brute force login attempts
  - Off-hours access (configurable time window)
  - Privilege escalation events
  - Account lockout triggers
  - Suspicious role changes
- **SOC Alert Dashboard** — Live WebSocket feed with Critical / High / Medium severity classification
- **Audit Log** — Immutable timestamped record of every identity event (LOGIN, LOGOUT, ROLE_CHANGE, LOCKOUT, MFA_FAIL)
- **User Management Panel** — Provision, suspend, and manage users with full activity history

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Authentication | JWT + bcrypt + TOTP (speakeasy) |
| Real-time | WebSockets (ws) |
| Frontend | React + Tailwind CSS |
| Deployment | Docker + Docker Compose |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│   React Dashboard  │  User Management Panel  │
└────────────┬────────────────────────────────┘
             │ REST API + WebSocket
┌────────────▼────────────────────────────────┐
│                  Backend                     │
│  Auth Engine  │  RBAC Middleware  │  Logger  │
│         Threat Detection Rules               │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│               MongoDB Atlas                  │
│  Users  │  Sessions  │  Alerts  │  AuditLog │
└─────────────────────────────────────────────┘
```

---

## Project Structure

```
authsentinel/
├── backend/
│   ├── src/
│   │   ├── routes/          # auth, users, alerts
│   │   ├── middleware/       # RBAC, JWT verify, rate limit
│   │   ├── detection/        # threat detection rule engine
│   │   ├── models/           # Mongoose schemas
│   │   └── utils/            # logger, totp, helpers
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/            # Login, Dashboard, Users, Alerts
│   │   ├── components/       # AlertFeed, AuditTable, StatCards
│   │   └── hooks/            # useWebSocket, useAuth
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier works)
- Docker (optional, for containerized setup)

### Installation

```bash
# Clone the repo
git clone https://github.com/nirvaan8/authsentinel
cd authsentinel

# Backend setup
cd backend
cp .env.example .env        # fill in your MongoDB URI + JWT secret
npm install
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm start
```

### With Docker

```bash
docker-compose up --build
```

App runs at `http://localhost:3000`, API at `http://localhost:5000`.

---

## Environment Variables

Create a `.env` file inside `/backend` using `.env.example` as a reference:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri_here
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
TOTP_SECRET_KEY=your_totp_base_secret
NODE_ENV=development
```

Never commit your `.env` file. It is already listed in `.gitignore`.

---

## Default Roles

| Role | Permissions |
|---|---|
| Admin | Full access — provision users, change roles, view all logs |
| Analyst | View alerts, acknowledge incidents, read audit logs |
| Viewer | Read-only dashboard access |
| Guest | Login only, no dashboard access |

---

## Threat Detection Rules

| Rule | Trigger | Severity |
|---|---|---|
| Brute Force | 5+ failed logins within 2 minutes | Critical |
| Off-Hours Access | Login outside 08:00–20:00 IST | Medium |
| Privilege Escalation | Role changed to Admin without approval | High |
| Account Lockout | Account locked after repeated failures | High |
| MFA Failure | 3+ consecutive TOTP failures | High |
| Suspicious Role Change | Role changed by non-Admin user | Critical |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login + receive JWT |
| POST | `/api/auth/verify-totp` | Verify TOTP code |
| POST | `/api/auth/logout` | Invalidate session |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all users (Admin only) |
| PATCH | `/api/users/:id/role` | Change user role (Admin only) |
| PATCH | `/api/users/:id/suspend` | Suspend a user (Admin only) |

### Alerts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/alerts` | Get all alerts |
| PATCH | `/api/alerts/:id/acknowledge` | Acknowledge an alert |

### Audit Log
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/audit` | Get full audit log (Admin/Analyst) |

---

## Team

| Name | Role |
|---|---|
| Nirvaan Katyal | Backend — Auth engine, RBAC, threat detection, audit logging |
| [Partner Name] | Frontend — SOC dashboard, alert UI, user panel, WebSocket integration |

---

## Roadmap

- [ ] SIEM export (Splunk/Elastic push)
- [ ] Geo-based anomaly detection (login from new country)
- [ ] Email/SMS alert notifications
- [ ] PDF incident report export
- [ ] Kubernetes deployment config

---

## License

MIT License — free to use, modify, and distribute with attribution.
