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
