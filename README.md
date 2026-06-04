# Todo API - DevOps TP

## Partie 3 - Scope de cette branche

Branche: partie-3

Cette branche couvre les phases pratiques 0 a 6:

- Phase 0: setup structure de projet
- Phase 1: premiere pipeline verte (tests unitaires)
- Phase 2: tests d integration avec service PostgreSQL
- Phase 3: build + push DockerHub via variables CI/CD
- Phase 4: deploiement K3S via pipeline
- Phase 5: monitoring Prometheus + Grafana + endpoint /metrics
- Phase 6: optimisation et hardening (audit, probes, deploy manuel prod)

Voir les details de runbook dans DEPLOYMENT.md et le recap des mesures dans METRICS.md.

## Livrables de groupe (template)

### Membres

- A completer

### Image DockerHub

`<pseudo-dockerhub>/todo-api`

### Deploiement

Voir DEPLOYMENT.md

### Metriques

Voir METRICS.md

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

## Historique Exercice Pratique Volumes

Objectif de l exercice pratique: prouver la persistance des donnees dans un volume partage, meme apres suppression des conteneurs.

### 1. Creation du volume partage

```powershell
docker volume create shared-stuff
```

### 2. Nettoyage des anciens conteneurs de test

```powershell
docker rm -f todo-writer todo-reader todo-reader-2 2>$null
```

### 3. Ecriture de logs dans le volume depuis un conteneur writer

```powershell
docker run --name todo-writer -v shared-stuff:/data node:22-alpine sh -lc 'echo mon_premier_log > /data/first_log.log; echo mon_second_log > /data/second_log.log; ls -la /data; cat /data/first_log.log; cat /data/second_log.log'
```

### 4. Lecture des logs depuis un conteneur reader

```powershell
docker run --name todo-reader -v shared-stuff:/data node:22-alpine sh -lc 'ls -la /data; cat /data/first_log.log; cat /data/second_log.log'
```

### 5. Suppression des conteneurs de test

```powershell
docker rm todo-writer todo-reader
```

### 6. Recreation d un nouveau reader pour verifier la persistance

```powershell
docker run --name todo-reader-2 -v shared-stuff:/data node:22-alpine sh -lc 'ls -la /data; cat /data/first_log.log; cat /data/second_log.log'
```

### 7. Inspection du volume

```powershell
docker volume inspect shared-stuff
```

Resultat attendu et constate:

- Les fichiers `first_log.log` et `second_log.log` existent toujours apres suppression/recreation des conteneurs.
- Le contenu `mon_premier_log` et `mon_second_log` reste lisible.

## Partie 2 - Approfondissement Docker

Travail realise sur la branche `partie-2`.

### Ce qui a ete implemente dans le projet principal

- Dockerfile passe en multi-stage avec `npm ci --only=production`.
- Healthcheck ajoute au Dockerfile et au service API dans compose.
- Separation reseau dans compose (`frontend` et `backend`).
- Base PostgreSQL et Redis non exposes a l hote (usage de `expose` uniquement).
- Ajout de `env_file` avec `.env` local et template `.env.example` committe.
- Endpoint `/config` pour visualiser les variables runtime.
- Endpoint `/db-test` pour verifier la connectivite applicative vers la base.
- `.dockerignore` et `.gitignore` renforces pour les bonnes pratiques.

### Exercice guide 1 - Network custom (execute)

Commandes executees:

```powershell
docker network create app-network
docker run -dit --name serveur --network app-network alpine sh
docker exec serveur apk add --no-cache iputils
docker run -dit --name client --network app-network alpine sh
docker exec client apk add --no-cache iputils
docker exec client ping -c 3 serveur
docker network inspect app-network
docker network create other-network
docker run -dit --name isole --network other-network alpine sh
docker exec client ping -c 3 isole
```

Constat:

- `client` ping `serveur` OK sur le meme network.
- ping vers `isole` en echec (`bad address`) car network different.

### Exercice guide 2 - Network dans docker compose (execute)

Fichier utilise: `exercises/network-compose/docker-compose.yml`

Commandes executees:

```powershell
docker compose -f exercises/network-compose/docker-compose.yml up -d
docker compose -f exercises/network-compose/docker-compose.yml exec api sh -lc "apk add --no-cache iputils >/tmp/apk.log 2>&1; ping -c 2 database"
docker compose -f exercises/network-compose/docker-compose.yml exec nginx sh -lc "apk add --no-cache iputils >/tmp/apk.log 2>&1; ping -c 2 database"
docker compose -f exercises/network-compose/docker-compose.yml down
```

Constat:

- `api` atteint `database` (network backend partage).
- `nginx` ne resolvait pas `database` (isolation frontend/backend validee).

### Exercice guide - Variables d environnement (execute)

Fichiers utilises:

- `exercises/env-test/server.js`
- `exercises/env-test/Dockerfile`
- `exercises/env-test/docker-compose.yml`
- `exercises/env-test/.env.example`

Commandes executees:

```powershell
docker build -t env-test exercises/env-test
docker run -d --name env-test-no-vars -p 3005:3000 env-test
Invoke-RestMethod -Uri "http://localhost:3005/config"
docker stop env-test-no-vars

docker run -d --name env-test-with-vars -p 3006:3000 -e NODE_ENV=production -e API_KEY=secret123 -e PORT=3000 env-test
Invoke-RestMethod -Uri "http://localhost:3006/config"
docker stop env-test-with-vars

docker compose -f exercises/env-test/docker-compose.yml up -d
Invoke-RestMethod -Uri "http://localhost:3010/config"
docker compose -f exercises/env-test/docker-compose.yml down
```

Constat:

- Sans variables: `development`, `hasApiKey=false`.
- Avec variables: `production`, `hasApiKey=true`.
- Avec `env_file`: valeurs reprises depuis `.env` local.

### Expose vs Ports (execute)

Commandes executees:

```powershell
docker compose down --remove-orphans
docker compose up -d --build
docker compose ps
Invoke-RestMethod -Uri "http://localhost:3000/health"
Invoke-RestMethod -Uri "http://localhost:3000/db-test"
Test-NetConnection -ComputerName localhost -Port 5432
```

Constat:

- API exposee sur `3000:3000`.
- DB non exposee a l hote (`5432/tcp` interne uniquement).
- `TcpTestSucceeded: False` sur `localhost:5432` (isolation OK).
- `/db-test` repond `success: true` via network interne Docker.

### Exercice debug - Dockerfiles casses (execute)

Fichiers utilises:

- `exercises/debug/Dockerfile.debug1.broken`
- `exercises/debug/Dockerfile.debug1.fixed`
- `exercises/debug/Dockerfile.debug2.bad-order`
- `exercises/debug/Dockerfile.debug2.good-order`
- `exercises/debug/Dockerfile.debug3.giant`
- `exercises/debug/Dockerfile.debug3.optimized`

Commandes executees:

```powershell
docker build -f exercises/debug/Dockerfile.debug1.broken -t debug-1 .
docker run --rm --name debug-1-run debug-1

docker build -f exercises/debug/Dockerfile.debug2.bad-order -t debug-2-bad .
docker build -f exercises/debug/Dockerfile.debug2.good-order -t debug-2-good .

docker build -f exercises/debug/Dockerfile.debug3.giant -t debug-3-giant .
docker build -f exercises/debug/Dockerfile.debug3.optimized -t debug-3-optimized .
docker images | findstr /I "debug-3"
```

Constat:

- Warning observe sur `CMD npm start` (JSON args recommandes).
- `debug-3-giant` environ `1.58GB`.
- `debug-3-optimized` environ `187MB`.

### Exercice debug - docker-compose casse (execute)

Fichiers utilises:

- `exercises/debug/docker-compose-broken.yml`
- `exercises/debug/docker-compose-fixed.yml`

Commandes executees:

```powershell
docker compose -f exercises/debug/docker-compose-broken.yml up -d
docker compose -f exercises/debug/docker-compose-broken.yml logs web
docker compose -f exercises/debug/docker-compose-broken.yml down

docker compose -f exercises/debug/docker-compose-fixed.yml up -d
Invoke-RestMethod -Uri "http://localhost:3002/health"
Invoke-RestMethod -Uri "http://localhost:3002/db-test"
docker compose -f exercises/debug/docker-compose-fixed.yml down
```

Constat:

- Version broken echoue (mauvaise config/build).
- Version fixed fonctionne et la connectivite DB est validee.

### Challenge optimisation (execute)

Fichier de depart non optimise:

- `exercises/optimization/Dockerfile.v1.unoptimized`

Commandes executees:

```powershell
docker build -f exercises/optimization/Dockerfile.v1.unoptimized -t todo-v1 .
docker build -t todo-v2-optimized .
docker images | findstr /I "todo-v1 todo-v2-optimized"
```

Resultat constate:

- `todo-v1` environ `1.58GB`.
- `todo-v2-optimized` environ `187MB`.

### Nettoyage execute (trace)

Commandes executees:

```powershell
docker stop serveur client isole todo-reader-2
docker rm serveur client isole todo-reader-2
docker network rm app-network other-network
docker network ls
```

Le nettoyage a ete fait apres validation des exercices pour laisser un environnement propre.
