# DESIGN.md

## 🎯 Purpose

Provide DevOps teams with a real-time, self-hosted incident management system that integrates with Prometheus and runs on scalable, cloud-native infrastructure (AKS). The goal is to own the full alert-to-resolution lifecycle with observability, alert routing, and team visibility.

---

## 📐 Architecture Overview

### 🔁 Core Flow

1. **Prometheus** triggers alerts based on rules.
2. **Alertmanager** groups and routes alerts to the backend API via webhook.
3. **FastAPI backend** receives the alert and creates an incident.
4. **PostgreSQL + TimescaleDB** stores incidents with metadata and timelines.
5. **React frontend** pulls incidents via REST API to display on the dashboard.
6. **Prometheus** scrapes custom incident metrics (`/metrics`) from backend.
7. **Grafana** visualizes incident trends and SLOs.

---

## 🗃️ Incident Data Model

```json
{
  "id": "uuid",
  "title": "High CPU on web-server-01",
  "service": "web-server",
  "environment": "production",
  "severity": "critical",
  "status": "open|acknowledged|resolved",
  "assignee": "user@company.com",
  "source_alert": {
    "fingerprint": "abc123",
    "startsAt": "2025-09-01T13:55:00Z",
    "labels": {
      "instance": "web-server-01",
      "job": "node_exporter"
    }
  },
  "timeline": [
    { "status": "open", "timestamp": "..." },
    { "status": "acknowledged", "timestamp": "..." }
  ],
  "runbook_url": "https://runbooks.company.com/cpu-issues"
}
```

---

## 🔄 Alert Handling Logic

- **Deduplication**: Alerts are deduplicated using `fingerprint` from Alertmanager.
- **Correlation**: Group similar incidents by `service`, `environment`, and `severity`.
- **Notification Routing**: Service-based alert routing to Slack channels (configurable).
- **Replay Protection**: Alerts processed asynchronously with retry + TTL via Redis queue.

---

## 🧱 Backend API Design (FastAPI)

| Endpoint        | Method | Description                                |
|-----------------|--------|--------------------------------------------|
| `/alerts`       | POST   | Ingest Prometheus alerts (Alertmanager webhook) |
| `/incidents`    | GET    | List incidents (filterable by status, service, env) |
| `/resolve`      | POST   | Mark incident as resolved or acknowledged  |
| `/metrics`      | GET    | Prometheus metrics endpoint                |
| `/health`       | GET    | Health check                              |
| `/ready`        | GET    | Readiness check (for K8s probes)          |

---

## 💻 Frontend Design (React + Tailwind)

### Pages:
- **Dashboard View** — Active/open incidents by service + severity
- **Incident History** — Timeline view of past resolved incidents
- **Filters** — By environment, severity, service, time range
- **Dark Mode** — Enabled for better visibility in NOC displays

---

## ☁️ Infrastructure & DevOps

### Kubernetes on AKS
- Deployed via **Helm charts**
- Infrastructure provisioned via **Terraform**

### Components
- **services/api** → FastAPI backend
- **services/web** → React frontend
- **infrastructure/helm** → Helm chart with templates
- **infrastructure/terraform** → AKS, DNS, PostgreSQL, Storage

---

## 🧪 Observability

### Prometheus
- Scrapes custom metrics from `/metrics` endpoint
- Example metrics:
  - `incident_active_total`
  - `incident_resolved_total`
  - `incident_duration_seconds`

### Grafana Dashboards
- Incident frequency by service
- MTTR and MTTA visualized over time
- Open vs Resolved incidents per team/environment
- Heatmaps for services with most alerts

---

## 💾 Data Retention & Backups

- Retention Policy: 90 days in TimescaleDB
- Archival: Optional export to S3 or Azure Blob
- Backup:
  - Daily scheduled job (via cron or K8s CronJob)
  - Stored in blob storage with timestamped archive files

---

## ✅ Testing Strategy

| Type           | Tool        | Description                                 |
|----------------|-------------|---------------------------------------------|
| Unit Tests     | `pytest`    | Backend service logic, models               |
| Integration    | `httpx`     | Simulate end-to-end webhook ingestion       |
| Load Testing   | `k6` / `locust` | Simulate burst of alerts hitting `/alerts` |
| Frontend       | `Jest` + RTL | Component-level tests                       |
| CI/CD          | GitHub Actions | Lint → Test → Build → Helm Lint            |

---

## 📦 MVP Scope

### Must-Have (v1)
- [x] Receive alerts from Alertmanager
- [x] Store incident in PostgreSQL
- [x] Show incidents in dashboard
- [x] Resolve incidents via UI
- [x] Prometheus metrics + Grafana dashboard

### Nice-to-Have (v2)
- [ ] Slack/Teams integration
- [ ] Filtering by service, environment
- [ ] Email notifications
- [ ] GitHub bot for auto-issue creation

---

## 🔁 Development Practices

- Follow [issue-first development](https://docs.github.com/en/issues/tracking-your-work-with-issues/about-issues)
- Branch naming: `feat/DIC-3-db-model`, `infra/DIC-5-helm-chart`
- Every PR must reference an issue and follow checklist:
  - [ ] Code follows style guide
  - [ ] Tests written/updated
  - [ ] Docs updated (if needed)
  - [ ] Does not break existing functionality

---

## 🔐 Security Considerations

- API access secured via token-based header (can integrate with Azure AD later)
- TLS termination at Ingress layer (via cert-manager or App Gateway)
- Rate limiting for `/alerts` endpoint
- Optional IP allowlist for Alertmanager ingress
