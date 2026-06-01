# 🛡️ AuthSentinel

> **Privileged Access Monitoring System** — Real-time IAM threat detection with an integrated SOC dashboard.

---

## What is AuthSentinel?

AuthSentinel is a full-stack cybersecurity platform that simulates an enterprise Identity and Access Management (IAM) environment and monitors it for identity-based threats in real time. It bridges the gap between access control and security operations — when something suspicious happens to an identity, the SOC team knows instantly.

Built as a group project by two B.Tech Cybersecurity students at NIIT University, Neemrana.

---

## The Problem It Solves

In most organizations, IAM and SOC operate in silos. User accounts get compromised, privilege escalations go unnoticed, and brute force attempts aren't caught until damage is done. AuthSentinel puts identity events directly in front of the security team — live.

---

## Features

- **Role-Based Access Control (RBAC)** — Admin, Analyst, Viewer, and Guest roles with enforced permission boundaries at both API and UI level
- **Multi-Factor Authentication (MFA)** — TOTP-based 2FA with QR code setup, mandatory for privileged roles
- **Google OAuth** — One-click sign in via Google (in progress)
- **Threat Detection Engine** — Real-time rules for:
  - Brute force login attempts (5+ failures → Critical alert + account lock)
  - Off-hours access detection (outside 08:00–20:00 IST)
  - Account lockout triggers
  - MFA failure tracking
  - Suspicious role changes
- **SOC Alert Dashboard** — Live WebSocket feed with Critical / High / Medium / Low severity classification
- **Audit Log** — Immutable timestamped record of every identity event (LOGIN, LOGOUT, ROLE_CHANGE, LOCKOUT, MFA_FAIL)
- **User Management Panel** — View all users, roles, MFA status, and last login (Admin only)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Authentication | JWT + bcrypt + TOTP (speakeasy) + Google OAuth (passport) |
| Real-time | WebSockets (ws) |
| Frontend | Vanilla HTML + CSS + JavaScript |
| Dev Server | Python HTTP Server |
| Deployment | Docker + Docker Compose |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│   HTML/CSS/JS  │  SOC Dashboard  │  Users   │
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
│  Users  │  Alerts  │  AuditLog              │
└─────────────────────────────────────────────┘
```

---

## Project Structure

```
authsentinel/
├── backend/
│   ├── src/
│   │   ├── routes/          # auth, users, alerts, audit
│   │   ├── middleware/       # RBAC, JWT verify
│   │   ├── detection/        # threat detection rule engine
│   │   ├── models/           # User, Alert, AuditLog schemas
│   │   └── utils/            # auditLogger, websocket
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/            # login, dashboard, users, alerts, audit
│   │   ├── components/       # navbar
│   │   ├── hooks/            # auth.js, websocket.js
│   │   └── css/              # style.css, dashboard.css
│   └── index.html
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- Python 3 (for frontend dev server)

### Backend Setup

```bash
git clone https://github.com/nirvaan8/authsentinel
cd authsentinel/backend
cp .env.example .env        # fill in your credentials
npm install
node src/server.js
```

API runs at `http://localhost:5000`  
WebSocket runs at `ws://localhost:5001`

### Frontend Setup

```bash
cd frontend
python3 -m http.server 3000
```

Open `http://localhost:3000`

---

## Environment Variables

Create a `.env` file inside `/backend` using `.env.example` as reference:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
TOTP_SECRET_KEY=your_totp_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
NODE_ENV=development
```

Never commit your `.env` file — it is already in `.gitignore`.

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
| Account Lockout | Account locked after repeated failures | High |
| MFA Failure | Consecutive TOTP failures | High |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login + receive JWT |
| POST | `/api/auth/verify-totp` | Verify TOTP code |
| POST | `/api/auth/setup-mfa` | Generate MFA QR code |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/google` | Google OAuth login |

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
| Nirvaan Katyal | Backend — Auth engine, RBAC, threat detection, WebSocket, audit logging |
| Aryan Kaushik | Frontend — SOC dashboard, alert UI, user panel, CSS |

---

## Roadmap

- [ ] Google OAuth (in progress)
- [ ] Register page for demo use
- [ ] SIEM export (Splunk/Elastic push)
- [ ] Geo-based anomaly detection
- [ ] PDF incident report export
- [ ] Kubernetes deployment

---

## License

MIT License — free to use, modify, and distribute with attribution.
