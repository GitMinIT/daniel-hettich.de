# daniel-hettich.de

Source code and infrastructure for [daniel-hettich.de](https://daniel-hettich.de) — a Dockerized
multi-project host with a global Nginx reverse proxy (`global-proxy`) that terminates SSL and
routes traffic for all sites on this server, including the [pompui.de](https://github.com/GitMinIT/pompui.de)
projects.

## The site: a cozy desktop

`daniel-hettich.de` is a digital business card styled as a small, warm desktop OS:

- A **terminal window** with an interactive visitor shell (`help`, `whoami`, `neofetch`, `cat`,
  `sudo`, `vim`, easter eggs) — the window is draggable and resizable
- **Impressum/Datenschutz open as popup windows** on the desktop; the pages also work standalone
- A **Windows-VM joke**: a toast announces the VM "booted", and the console runs straight into a BSOD
- Taskbar with start button, theme toggle, DE/EN and a clock; English is the default language
- No frameworks, no cookies, no tracking — vanilla HTML/CSS/JS, ~800 lines total

## Structure

```
infrastructure/nginx/        Shared proxy configuration (nginx.conf + conf.d server blocks)
infrastructure/compose/      Compose overrides (HomeGate testing stack on :6009)
sites/landing-page/
├── html/                    Pages (index, impressum, datenschutz, 404)
├── assets/
│   ├── css/style.css        All styling, warm light/dark themes
│   └── js/
│       ├── commands.js      Pure command engine + all copy (unit-tested)
│       ├── main.js          Terminal/desktop DOM glue
│       ├── popup.js         Popup window manager (legal pages)
│       ├── vm.js            The Windows-VM joke
│       └── legal.js         Minimal theme toggle for standalone legal pages
└── test/                    node --test suites (commands + wiring)
```

## Testing

```sh
docker run --rm -v "$PWD/sites/landing-page:/app" -w /app node:22-alpine node --test test/*.test.mjs
```

`test/commands.test.mjs` covers the pure engine (commands, boot, BSOD content, QR pattern);
`test/wiring.test.mjs` checks that HTML, CSS, JS and i18n keys stay in sync — the class of
bug where the page renders but the script crashes at runtime.

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