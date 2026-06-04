# Deployment Procedure - Todo API

## Scope

This document covers phases 4 to 6 on top of the existing CI/CD baseline.

## Required GitHub Secrets

- DOCKERHUB_USER
- DOCKERHUB_TOKEN
- KUBE_CONFIG (base64 kubeconfig or raw kubeconfig content)
- PROD_KUBE_CONFIG (optional, for manual production deploy)

## Phase 4 - K3s deployment flow

1. Apply manifests once on the cluster:

```bash
kubectl apply -f k8s/service.yaml
sed "s|your-dockerhub-user|<dockerhub-user>|g" k8s/deployment.yaml | kubectl apply -f -
```

2. Push to `master` or `main`:
   - CI runs tests + security audit + image push
   - Job `deploy-k3s` updates deployment image to `sha-${GITHUB_SHA}`
   - CI waits for `kubectl rollout status`

3. Verify rollout:

```bash
kubectl get pods -l app=todo-api
kubectl rollout status deployment/todo-api
```

### Edge case validation (ImagePullBackOff)

```bash
kubectl set image deployment/todo-api todo-api=<dockerhub-user>/todo-api:nexistepas
kubectl get pods -l app=todo-api
kubectl describe pod <pod-name>
kubectl set image deployment/todo-api todo-api=<dockerhub-user>/todo-api:latest
kubectl rollout status deployment/todo-api
```

### Adverse scenario validation (self-healing)

```bash
kubectl get pods -l app=todo-api
kubectl delete pod <pod-name>
kubectl get pods -l app=todo-api -w
```

## Phase 5 - Monitoring

1. Start local stack:

```bash
docker compose -f monitoring/docker-compose.monitoring.yml up -d
```

2. Verify metrics endpoint:

```bash
curl http://localhost:3000/metrics
```

3. Open tools:
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3001 (default admin/admin)

4. In Grafana, add Prometheus datasource URL: `http://prometheus:9090`

## Phase 6 - Optimization and hardening

- `readinessProbe` and `livenessProbe` are enabled in `k8s/deployment.yaml`
- Security gate is enabled with `npm audit --audit-level=critical`
- Manual production deploy is available via `workflow_dispatch` job `deploy-prod`

## Rollback

```bash
kubectl rollout undo deployment/todo-api
kubectl rollout status deployment/todo-api
kubectl get pods -l app=todo-api
curl http://<service-url>/health
```
