# Deployment Guide — OpenCBS Production (Ubuntu EC2)

All commands are run from the repository root unless stated otherwise.

---

## Prerequisites

- Docker Engine ≥ 24 and Docker Compose V2 installed
- `make` installed (`sudo apt install make`)
- Repository cloned on the target server

---

## 1. Configure Environment Variables

Copy the example env file and fill in every `CHANGE_ME_*` value:

```bash
cp .env.example .env
```

| Variable              | Description                              |
|-----------------------|------------------------------------------|
| `POSTGRES_DB`         | Database name                            |
| `POSTGRES_USER`       | Must remain `postgres` (Flyway requires) |
| `POSTGRES_PASSWORD`   | Strong password for PostgreSQL           |
| `RABBITMQ_USER`       | RabbitMQ username                        |
| `RABBITMQ_PASSWORD`   | RabbitMQ password                        |
| `JWT_SECRET`          | HS512 secret for signing JWT tokens      |
| `API_HEAP_MAX`        | JVM max heap (default `512m`)            |
| `API_MEMORY_LIMIT`    | Container memory limit (default `768M`)  |

> **Security:** Never commit `.env` to version control.

---

## 2. Copy Report Templates

Templates (JasperReports / Excel) are served from `~/opencbs_templates/templates` on the host
and mounted read-only into the API container. Run once on first deployment, or whenever
templates in `server/templates/` are updated:

```bash
make copy-templates
```

This copies `server/templates/` → `~/opencbs_templates/templates/`.

---

## 3. Deploy

Build images and start all services in the background:

```bash
make deploy
```

This runs `copy-templates` automatically, then:

```
docker compose -f docker-compose-production.yml up -d --build
```

Services started:

| Service    | Description                              | Network          |
|------------|------------------------------------------|------------------|
| `db`       | PostgreSQL 14                            | backend (internal)|
| `rabbitmq` | RabbitMQ 3 (no management UI)            | backend (internal)|
| `api`      | Spring Boot API on port 8080 (internal)  | backend + frontend|
| `web`      | Angular + Nginx, exposed on port `9000`  | frontend          |

---

## 4. Verify Deployment

Check that all containers are healthy:

```bash
make ps
```

Tail the API logs:

```bash
make logs
```

The API is ready when the healthcheck (`GET /api/info`) returns `200`. The frontend is
accessible at `http://<server-ip>:9000`.

---

## 5. Redeploy After a Code Change

Pull the latest code, then redeploy:

```bash
git pull
make redeploy
```

`redeploy` rebuilds all images and restarts changed containers. Data volumes are preserved.

If templates changed in the repository, `make copy-templates` is run automatically as part
of `redeploy`.

---

## 6. Stop Services

Stop all containers without removing data:

```bash
make down
```

---

## 7. Full Teardown (Destructive)

> **WARNING:** This deletes all data volumes — database, RabbitMQ, and attachments are
> permanently lost. Only use this when decommissioning or resetting a server.

```bash
make teardown
```

A 5-second abort window is given before the command executes.

---

## Quick Reference

| Command              | Description                                          |
|----------------------|------------------------------------------------------|
| `make copy-templates`| Copy templates to `~/opencbs_templates/templates`    |
| `make deploy`        | Copy templates + build images + start all services   |
| `make redeploy`      | Same as deploy — use after a code change             |
| `make ps`            | Show service status and health                       |
| `make logs`          | Follow API logs                                      |
| `make down`          | Stop services (data preserved)                       |
| `make teardown`      | Stop services and destroy all data (irreversible)    |
</content>
</invoke>