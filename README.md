# Todo API - DevOps TP

API REST Todo en Node.js, dockerisee avec Docker Compose, PostgreSQL (persistance) et Redis.

## Stack

- Node.js 18+
- Express
- PostgreSQL 15
- Redis 7
- Docker / Docker Compose

## Lancer le projet

1. Construire et demarrer:

```bash
docker compose build
docker compose up -d
```

2. Verifier les services:

```bash
docker compose ps
```

3. Tester la sante API:

```bash
curl http://localhost:3000/health
```

## Endpoints

- POST /api/tasks
- GET /api/tasks
- GET /api/tasks/:id
- PUT /api/tasks/:id
- DELETE /api/tasks/:id

Exemple creation:

```bash
curl -X POST http://localhost:3000/api/tasks \
	-H "Content-Type: application/json" \
	-d '{"title":"Tache persistante","description":"TP DevOps","status":"todo"}'
```

## Persistance

- Les donnees PostgreSQL sont conservees dans le volume nomme `postgres-data`.
- Les logs applicatifs sont conserves dans le volume nomme `api-logs`.

Verification persistance:

```bash
docker compose down
docker compose up -d
curl http://localhost:3000/api/tasks
```

Si vous faites `docker compose down -v`, les volumes sont supprimes et les donnees repartent de zero.

## Tests

```bash
npm test
```

Les tests tournent en mode memoire (sans dependre de PostgreSQL) pour rester rapides et reproductibles.
