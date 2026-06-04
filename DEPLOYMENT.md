# Deployment Procedure - Todo API

## Scope

This document is prepared for part 3 practical work. Only phases 0 to 3 are implemented in this branch.

## Current status

- Phase 0: repository structure and required files in place
- Phase 1: CI unit test job configured
- Phase 2: CI integration test job with PostgreSQL service configured
- Phase 3: CI Docker build and push job with protected secrets configured

## Required CI/CD variables (GitLab)

- DOCKERHUB_USER
- DOCKERHUB_TOKEN

Use Masked and Protected for secret values.

## Next phases

Kubernetes deployment and monitoring are intentionally out of scope in this branch.
