# DHde Project Implementation Guide

Welcome to the DHde infrastructure. This project uses a modular, container-centric architecture designed for scalability, security, and isolation.

## 🏗 System Architecture
The system follows a **Hub-and-Spoke** model:
- **The Hub (Global Proxy)**: A single Nginx container acting as a Reverse Proxy. It is the only container exposed to the internet (Ports 80/443). It handles SSL termination and routes traffic to internal services based on the hostname.
- **The Spokes (Services)**: Isolated Docker containers (e.g., `landing-page`, `nextcloud`) that run on an internal Docker network. They are not accessible directly from the outside.

## 📂 Directory Structure
```text
/DHde
├── docker-compose.yml       # Orchestration file for all services
├── .gitignore               # Prevents secrets/certs from being committed
├── infrastructure/
│   └── nginx/
│       └── conf.d/          # Virtual Host configurations (Proxy rules)
└── sites/                   # Lightweight static sites (Landing page, etc.)
    └── [site-name]/
        ├── Dockerfile        # Site-specific build instructions
        └── html/             # Static assets
└── services/                # Complex apps with their own DBs (Nextcloud, etc.)
    └── [service-name]/
```

## 🛠 Implementation Rules for New Projects

### 1. Adding a New Service
When adding a new project (e.g., `nextcloud.daniel-hettich.de`):
1. **Create Service Folder**: Add the app and its configuration in `/services/[service-name]`.
2. **Update Compose**: Add the service to `docker-compose.yml`. 
   - **Crucial**: Do NOT map public ports (e.g., no `80:80`). Use only internal networking.
   - Assign it to the `web-network`.
3. **Configure Proxy**: Create a new config file in `infrastructure/nginx/conf.d/[service-name].conf`.
   - Use `proxy_pass http://[service-container-name]:[port];` to route traffic.
4. **Apply Changes**: Run `docker compose up -d --build`.

### 2. Security Requirements
- **SSL/TLS**: All external traffic MUST be HTTPS. Redirects from 80 $\rightarrow$ 443 must be handled by the Global Proxy.
- **Secrets**: Never commit `.env` files, private keys, or tokens to GitHub. Use the `.gitignore`.
- **Least Privilege**: Containers should run as non-root users where possible.
- **Headers**: All new proxy configs must include the standard security headers (HSTS, X-Frame-Options, CSP).

### 3. Deployment Workflow
1. Develop locally or in a dev-branch.
2. Commit changes to GitHub.
3. Pull changes on the server.
4. Run `docker compose up -d --build` to apply updates.

## 🤝 Collaboration Guidelines (fork & branch model)

Multiple people work on this project. These guidelines are **not set in stone** — propose improvements via PR.

### How we work
1. **Fork** the repo on GitHub — this applies to **everyone**, including maintainers with write access. No direct commits to `main`, ever.
2. Branch naming:
   - `feature/<topic>` — new functionality
   - `fix/<topic>` — bug fixes
   - `docs/<topic>` — documentation only
3. **One logical change-set per branch/PR.** Don't mix unrelated fixes.
4. Test locally before opening a PR (build the affected containers, verify routing).
5. Open a **Pull Request** against `main` and let a maintainer review it.
6. **Nobody pushes to `main` directly** — all changes (including maintainers' and agent changes) go through a PR. Emergency hotfixes may land directly but require a retro-PR documenting the change.

### Commit etiquette
- Small, focused commits with clear messages:
  - Good: `Add security headers to garden-journal proxy config`
  - Bad: `changes`, `wip final FINAL`
- Rebase onto `main` before merging; keep history linear.
- Never force-push to shared branches.

### Hard rules (because this host runs multiple projects)
- **Container names** must be globally unique on the host.
- **No public ports** other than the Global Proxy (80/443).
- **No secrets in git**: `.env`, tokens, private keys stay out via `.gitignore`.
- **Routing changes** must be mirrored to the actual proxy mount on the server and reloaded (`nginx -t && nginx -s reload`).
- **Docs**: update this file and `AGENTS.md` when architecture, containers or routing change.

### AI-notice requirement (mandatory)

This project discloses that its content, design, images and source code were created with AI assistance. **Every new page must include the AI-notice badge**; impressum pages additionally need the "KI-Hinweis" section.

**Badge** — fixed top-left, always visible, slightly transparent, links to `/impressum`:

```html
<a class="ai-note" href="/impressum" title="Diese Seite wurde mit Unterstützung von KI erstellt" aria-label="Hinweis: Diese Seite wurde mit Unterstützung von KI erstellt. Zum Impressum.">✳ Mit KI erstellt</a>
```

The badge CSS lives in `sites/landing-page/assets/css/style.css` (`.ai-note`) — new static pages just add the HTML snippet above.

**Impressum "KI-Hinweis" section** (required text):

```html
<h2>KI-Hinweis</h2>
<p>Alle Inhalte, das Design sowie die zugrunde liegenden Bilder und Quelltexte dieser Website
wurden mit Unterstützung durch Künstliche Intelligenz (KI) erstellt und von
Daniel Hettich kuratiert.</p>
```

Checklist for new pages/PRs:
- [ ] AI badge present and linking to the impressum
- [ ] If it's an impressum: "KI-Hinweis" section included

A PR that adds a page without the badge will be asked to fix it before merge.

### Agent note

> **Applies to agents too:** automated agents (including AI coding agents working on this server) follow the same fork & PR flow as humans. The agent's fork/branch should indicate the task, e.g. `agent/<topic>` or `feature/<topic>`. Emergency hotfixes follow the retro-PR rule above.
