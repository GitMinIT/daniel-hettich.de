# Agent Guide for DHde Project

## Environment
- **Project Root**: `/var/www/daniel-hettich.de`
- **Domain**: `daniel-hettich.de` (+ `www.daniel-hettich.de`)
- **Subdomain**: `gj.daniel-hettich.de` — Garden Journal moved to pompui.de (see `/var/www/pompui.de`)
- **Architecture**: Dockerized with a global Nginx proxy (`global-proxy`) routing to internal containers.

## Credentials & Secrets
- **GitHub Token**: `secrets/github.token` (chmod 600, git-ignored) — used in remote URLs
- **GitHub Repository**: `https://github.com/GitMinIT/daniel-hettich.de.git`
- **SSL Certificates**: Located in `/etc/letsencrypt` (mapped to `/etc/nginx/ssl` in proxy container). Wildcard `*.daniel-hettich.de`, valid until 2026-11-27.

## Infrastructure Map
- **global-proxy**: Nginx Alpine, handles SSL termination and routing for ALL projects on this server (also pompui.de sites). Config lives in `infrastructure/nginx/conf.d/` and is volume-mounted read-only into the container. Contains a catch-all hardening config (`00-hardening.conf`: unknown Host → 444, rate limiting) and `nginx.conf` with `server_tokens off`.
- **landing-page**: Simple landing page on `daniel-hettich.de` / `www.daniel-hettich.de` (nginx-unprivileged, non-root, port 8080 internally).
- Routes for pompui.de sites (`pompui-landing`, `pompui-garden-journal`, `pompui-snapotter`) also live in this project's `conf.d/` — see the pompui.de project for their container definitions.

## Git & Deployment Workflow (mandatory)
- **Never push directly to `main`** — all changes go through a fork + PR (see `CONTRIBUTING.md`). Applies to humans and agents alike.
- After a PR is merged on GitHub: `git pull` on the server, then `docker compose up -d --build` for affected services.
- After routing changes: mirror confs into `infrastructure/nginx/conf.d/` (this IS the mounted dir), then `nginx -t && nginx -s reload` inside `global-proxy`.

## Scaling & Extensibility
- To add a new site:
  1. Create a new directory under `sites/`.
  2. Add a service definition to `docker-compose.yml` (container names globally unique on the host).
  3. Add a new `.conf` file in `infrastructure/nginx/conf.d/` to define the routing and SSL.
  4. Reload the proxy and verify with `curl --resolve`.

## Security
- See `SECURITY-AUDIT.md` in the pompui.de project for the latest audit findings and open items.