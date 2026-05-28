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
