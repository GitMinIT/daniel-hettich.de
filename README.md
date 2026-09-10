# daniel-hettich.de

Source code and infrastructure for [daniel-hettich.de](https://daniel-hettich.de) — a Dockerized
multi-project host with a global Nginx reverse proxy (`global-proxy`) that terminates SSL and
routes traffic for all sites on this server, including the [pompui.de](https://github.com/GitMinIT/pompui.de)
projects.

## Structure

```
infrastructure/nginx/   Shared proxy configuration (nginx.conf + conf.d server blocks)
sites/landing-page/     Cozy terminal business card (nginx-unprivileged, port 8080)
```

## Deployment

Containers are built and run via `docker compose`; the proxy mounts its configuration
read-only from `infrastructure/nginx/`. See `AGENTS.md` for the infrastructure map and
`CONTRIBUTING.md` for the fork & PR workflow (direct pushes to `main` are not allowed).

## Licence

- **Code** (everything under `infrastructure/`, `sites/*/assets/js/`,
  `sites/*/Dockerfile`, `sites/*/nginx.conf`, `docker-compose.yml`): [MIT](LICENSE)
- **Content** (texts, design, images and other media under `sites/*/html/`, e.g.
  impressum, Datenschutzerklärung, page copy): © Daniel Hettich, all rights reserved —
  not covered by the MIT licence and not licensed for reuse without permission.

Third-party components keep their own licences; see the notice files shipped with them.