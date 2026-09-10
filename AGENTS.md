# Agent Guide for DHde Project

## Environment
- **Project Root**: `/var/www/daniel-hettich.de` (production host)
- **Testing Host**: `/home/daniel/Projects/daniel-hettich.de` (HomeGate home server, debugging/testing only — production stack on `80`/`443` is NOT this machine; ports are taken by other services there)
- **Domain**: `daniel-hettich.de` (+ `www.daniel-hettich.de`)
- **Subdomain**: `gj.daniel-hettich.de` — Garden Journal moved to pompui.de (see `/var/www/pompui.de`)
- **Architecture**: Dockerized with a global Nginx proxy (`global-proxy`) routing to internal containers.

## Testing Host (HomeGate)
- This host exists to **implement, test and debug** this project. Nothing is published from here before being verified — the workflow is intentionally **HTTP-only**, no proxy, no TLS.
- The stack runs via a compose override: `docker compose -f docker-compose.yml -f infrastructure/compose/homegate-testing.yml up -d --build`
- Only the site container runs, exposed directly: **daniel-hettich.de -> 6009** (the `global-proxy` service is parked under the `production-only` compose profile and does not start here; ports 80/443 are occupied by other services on this host anyway).
- `global-proxy` port plan for reference: daniel-hettich.de -> 6009, pompui.de -> 6010 (pompui.de runs its own direct port, see the pompui.de project).
- Verify: `curl http://192.168.178.60:6009/` (or `http://<LAN-IP>:6009` from any device on the network)

## Credentials & Secrets
- **GitHub Token**: `secrets/github.token` (chmod 600, git-ignored) — used in remote URLs
- **GitHub Repository**: `https://github.com/GitMinIT/daniel-hettich.de.git`
- **SSL Certificates**: Located in `/etc/letsencrypt` (mapped to `/etc/nginx/ssl` in proxy container). Wildcard `*.daniel-hettich.de`, valid until 2026-11-27.

## Infrastructure Map
- **global-proxy**: Nginx Alpine, handles SSL termination and routing for ALL projects on this server (also pompui.de sites). Config lives in `infrastructure/nginx/conf.d/` and is volume-mounted read-only into the container. Contains a catch-all hardening config (`00-hardening.conf`: unknown Host → 444, rate limiting) and `nginx.conf` with `server_tokens off`.
- **landing-page**: The cozy desktop business card on `daniel-hettich.de` / `www.daniel-hettich.de` (nginx-unprivileged, non-root, port 8080 internally). Vanilla HTML/CSS/JS — no framework, no cookies, no tracking.
- Routes for pompui.de sites (`pompui-landing`, `pompui-garden-journal`, `pompui-snapotter`) also live in this project's `conf.d/` — see the pompui.de project for their container definitions.

## Site Architecture (landing-page)
- **`assets/js/commands.js`** — pure logic: command engine, all DE/EN copy, boot/BSOD/QR content. No DOM access; imported by Node tests.
- **`assets/js/main.js`** — DOM glue for terminal + desktop (i18n, theme, drag/resize, window controls).
- **`assets/js/popup.js`** — popup window manager; exports `makeDraggable`/`registerWindow`, reused by the VM window.
- **`assets/js/vm.js`** — the Windows-VM joke (toast + BSOD console).
- **`assets/js/legal.js`** — theme toggle only, for standalone legal pages.
- **i18n contract**: every `data-chrome`/`data-chrome-title` key in HTML must exist in `TEXT.de.chrome` and `TEXT.en.chrome` — wiring tests enforce this.
- **Tests**: `docker run --rm -v "$PWD/sites/landing-page:/app" -w /app node:22-alpine node --test test/*.test.mjs` — run before every PR. `test/wiring.test.mjs` also guards layout invariants (fixed window size, scrolling output, BSOD stays hardcoded blue).

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