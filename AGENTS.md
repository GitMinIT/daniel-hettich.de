# Agent Guide for DHde Project

## Environment
- **Project Root**: `/tmp/opencode/DHde`
- **Domain**: `daniel-hettich.de`
- **Subdomain**: `gj.daniel-hettich.de` (Garden Journal)
- **Architecture**: Dockerized with a global Nginx proxy (`global-proxy`) routing to internal containers.

## Credentials & Secrets
- **GitHub Token**: Located at `/tmp/ssl-certs/github.token`
- **GitHub Repository**: `https://github.com/GitMinIT/DHde.git`
- **SSL Certificates**: Located in `/etc/letsencrypt` (mapped to `/etc/nginx/ssl` in proxy container).

## Infrastructure Map
- **global-proxy**: Nginx Alpine, handles SSL termination and routing.
- **landing-page**: Simple landing page served on `daniel-hettich.de`.
- **garden-journal**: Garden journal application served on `gj.daniel-hettich.de`.

## Scaling & Extensibility
- To add a new site:
  1. Create a new directory under `sites/`.
  2. Add a service definition to `docker-compose.yml`.
  3. Add a new `.conf` file in `infrastructure/nginx/conf.d/` to define the routing and SSL.
