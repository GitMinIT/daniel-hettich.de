/* Daniel Hettich — punk edition
   i18n + theme + flippable card + draggable stickers + page-wide water */

/* ================= i18n ================= */

const TRANSLATIONS = {
    de: {
        title: "Daniel Hettich",
        hero_title: "Moin! Ich bin Daniel",
        hero_sub: "Digitale Visitenkarte. Handgemacht, ein bisschen chaos, von unten links.",
        card_role: "Zuhause-Laborant · Tüftler · Sandkasten-Rebell",
        card_hint: "⟲ Klick für die Rückseite",
        card_back_title: "Lass uns quatschen!",
        copy: "kopieren",
        copied: "clipboard ✓",
        interests_title: "Zeug, das ich mag",
        sticker_hint: "Sticker: ziehen zum Umsortieren, Doppelklick zum Drehen. Gieß sie nass!",
        contact_title: "Kontakt",
        contact_hint: "Schreib mir einfach — ich freu mich über Post von Menschen.",
        water_hint: "Wasser an: gedrückt halten zum Gießen 💧",
        wt_drop: "Wasser gießen (W)",
        wt_stir: "Rühren (R)",
        wt_drain: "Abfließen lassen (D)"
    },
    en: {
        title: "Daniel Hettich",
        hero_title: "Hi! I'm Daniel",
        hero_sub: "Digital business card. Handmade, slightly chaotic, bottom-left aligned.",
        card_role: "Home-lab tinkerer · maker · sandbox rebel",
        card_hint: "⟲ Click to flip",
        card_back_title: "Let's chat!",
        copy: "copy",
        copied: "clipboard ✓",
        interests_title: "Things I like",
        sticker_hint: "Stickers: drag to rearrange, double-click to spin. Water them!",
        contact_title: "Contact",
        contact_hint: "Drop me a line — I love hearing from people.",
        water_hint: "Water on: hold to pour 💧",
        wt_drop: "Pour water (W)",
        wt_stir: "Stir (R)",
        wt_drain: "Drain (D)"
    }
};

const CONTACT = {
    de: "kontakt@daniel-hettich.de",
    en: "contact@daniel-hettich.de"
};

function initLang() {
    const fallbackLang = "en";
    let currentLang = localStorage.getItem("pref-lang") || "de";

    function setLanguage(lang) {
        const t = TRANSLATIONS[lang] || TRANSLATIONS[fallbackLang];
        document.title = t.title;
        document.documentElement.lang = lang;

        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.dataset.i18n;
            if (t[key]) el.textContent = t[key];
        });
        document.querySelectorAll("[data-i18n-title]").forEach(el => {
            const key = el.dataset.i18nTitle;
            if (t[key]) el.title = t[key];
        });

        const email = CONTACT[lang] || CONTACT.de;
        document.getElementById("email").textContent = email;
        document.getElementById("contact-mail").textContent = "✉ " + email;
        document.getElementById("contact-mail").href = "mailto:" + email;

        document.querySelectorAll(".lang-btn").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.lang === lang);
        });

        localStorage.setItem("pref-lang", lang);
        currentLang = lang;
    }

    document.querySelectorAll(".lang-btn").forEach(btn => {
        btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
    });

    setLanguage(currentLang);
}

/* ================= theme ================= */

function initTheme() {
    const savedTheme = localStorage.getItem("pref-theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);

    document.getElementById("theme-toggle").addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("pref-theme", next);
        updateThemeIcon(next);
    });
}

function updateThemeIcon(theme) {
    document.getElementById("theme-toggle").textContent = theme === "dark" ? "☀️" : "🌙";
}

/* ================= business card ================= */

function initCard() {
    const card = document.getElementById("business-card");
    const copyBtn = document.getElementById("copy-btn");
    const feedback = document.getElementById("copy-feedback");

    card.addEventListener("click", (e) => {
        if (copyBtn.contains(e.target)) return;
        const flipped = card.classList.toggle("flipped");
        card.setAttribute("aria-pressed", String(flipped));
    });

    async function copyEmail() {
        const email = document.getElementById("email").textContent;
        try {
            await navigator.clipboard.writeText(email);
        } catch {
            const ta = document.createElement("textarea");
            ta.value = email;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            ta.remove();
        }
        feedback.classList.add("show");
        setTimeout(() => feedback.classList.remove("show"), 1600);
    }

    copyBtn.addEventListener("click", (e) => { e.stopPropagation(); copyEmail(); });
    copyBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); copyEmail(); }
    });
}

/* ================= stickers: drag + dblclick spin ================= */

function initStickers() {
    const stickers = document.querySelectorAll(".sticker");

    stickers.forEach(sticker => {
        // natural resting rotation from CSS class is overridden inline when dragged
        let rot = 0;
        sticker.addEventListener("dblclick", () => {
            rot += (Math.random() < 0.5 ? -22 : 22);
            sticker.style.transform = `rotate(${rot}deg)`;
        });

        sticker.addEventListener("pointerdown", (e) => {
            // ignore drags starting on links inside stickers (none yet, but safe)
            if (e.button !== 0 && e.pointerType === "mouse") return;
            e.preventDefault();
            const board = sticker.parentElement;
            const boardRect = board.getBoundingClientRect();
            const rect = sticker.getBoundingClientRect();

            // switch from static flow to fixed positioning at current spot
            const startX = e.clientX, startY = e.clientY;
            const origLeft = rect.left, origTop = rect.top;
            let curX = origLeft, curY = origTop;

            // remember the slot so cancel can restore layout
            sticker.classList.add("dragging");

            function move(ev) {
                curX = origLeft + (ev.clientX - startX);
                curY = origTop + (ev.clientY - startY);
                sticker.classList.add("free");
                sticker.style.left = curX + "px";
                sticker.style.top = curY + "px";
                sticker.style.transform = `rotate(${rot}deg) scale(1.08)`;
            }

            function up() {
                window.removeEventListener("pointermove", move);
                window.removeEventListener("pointerup", up);
                window.removeEventListener("pointercancel", up);
                sticker.classList.remove("dragging");
                // decide: back into flow (if near board) or stay free-floating
                const r = sticker.getBoundingClientRect();
                const b = board.getBoundingClientRect();
                const nearBoard = r.top < b.bottom + 80 && r.bottom > b.top - 120;
                if (nearBoard) {
                    sticker.classList.remove("free");
                    sticker.style.left = sticker.style.top = "";
                    sticker.style.transform = "";   // CSS class rotation takes over
                    rot = 0;
                } else {
                    // keep floating at dropped position (fixed)
                    sticker.style.transform = `rotate(${rot}deg)`;
                }
            }

            window.addEventListener("pointermove", move);
            window.addEventListener("pointerup", up);
            window.addEventListener("pointercancel", up);
        });
    });
}

/* ================= page-wide water =================
   Cellular water on a coarse grid spanning the whole viewport.
   - canvas is fixed, pointer-events none, z-index above content
   - pouring: hold mouse/touch anywhere (when tool = drop)
   - stickers are read as rects; water kicks them (impulse) on contact
   - free (dropped) stickers fall & tumble like physics objects
==================================================== */

function initWater() {
    const canvas = document.getElementById("water-canvas");
    const ctx = canvas.getContext("2d");
    const CELL = 7;                      // px per cell
    let W, H, cols, rows, grid, img, px, dpr;

    const dropBtn = document.getElementById("wt-drop");
    const stirBtn = document.getElementById("wt-stir");
    const drainBtn = document.getElementById("wt-drain");
    const hint = document.getElementById("water-hint");

    let mode = "drop";                   // drop | stir | drain
    let pouring = false, stirring = false;
    let mx = -1, my = -1, frame = 0;

    // draggable "free" stickers + their physics
    const bodies = [];                   // {el, x, y, vx, vy, w, h, r}

    function resize() {
        dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(innerWidth * dpr / CELL) * CELL;
        canvas.height = Math.floor(innerHeight * dpr / CELL) * CELL;
        cols = canvas.width / CELL;
        rows = canvas.height / CELL;
        grid = new Uint8Array(cols * rows);
        img = ctx.createImageData(cols, rows);
        px = img.data;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        canvas.style.width = innerWidth + "px";
        canvas.style.height = innerHeight + "px";
        ctx.scale(dpr, dpr);
    }

    function collectBodies() {
        bodies.length = 0;
        document.querySelectorAll(".sticker.free").forEach(el => {
            const r = el.getBoundingClientRect();
            bodies.push({
                el, x: r.left, y: r.top, w: r.width, h: r.height,
                vx: el._vx || 0, vy: el._vy || 0, r: el._rot || 0,
                vr: el._vr || 0
            });
        });
    }

    function idx(x, y) { return y * cols + x; }
    function get(x, y) { return (x < 0 || x >= cols || y < 0 || y >= rows) ? 1 : grid[idx(x, y)]; }
    function set(x, y, v) { if (x >= 0 && x < cols && y >= 0 && y < rows) grid[idx(x, y)] = v; }

    function render() {
        for (let i = 0; i < cols * rows; i++) {
            const v = grid[i];
            const o = i * 4;
            if (v === 0) { px[o + 3] = 0; continue; }
            px[o] = 86; px[o + 1] = 134; px[o + 2] = 214;
            px[o + 3] = 170;
        }
        ctx.putImageData(img, 0, 0);
    }

    function step() {
        // alternate sweep direction
        sweep((frame % 2 === 0));
        frame++;

        // bodies physics: gravity + water interaction
        collectBodies();
        for (const b of bodies) {
            b.vy += 0.5;
            // water buoyancy/drag: if body's center is in water
            const cx = Math.floor((b.x + b.w / 2) / CELL);
            const cy = Math.floor((b.y + b.h / 2) / CELL);
            if (get(cx, cy) === 1) {
                b.vy *= 0.82; b.vx *= 0.9; b.vy -= 0.35;   // buoyant drag
                b.vr *= 0.9;
            }
            b.x += b.vx; b.y += b.vy; b.r += b.vr;
            // floor
            const floor = innerHeight - b.h;
            if (b.y > floor) { b.y = floor; b.vy *= -0.3; b.vx *= 0.7; b.vr *= 0.6; }
            // walls
            if (b.x < 0) { b.x = 0; b.vx *= -0.4; }
            if (b.x > innerWidth - b.w) { b.x = innerWidth - b.w; b.vx *= -0.4; }
            el_apply(b);
        }

        render();
    }

    function el_apply(b) {
        b.el.style.left = b.x + "px";
        b.el.style.top = b.y + "px";
        b.el.style.transform = `rotate(${b.r}deg)`;
        b.el._vx = b.vx; b.el._vy = b.vy; b.el._rot = b.r; b.el._vr = b.vr;
    }

    function sweep(leftToRight) {
        for (let y = rows - 1; y >= 0; y--) {
            for (let i = 0; i < cols; i++) {
                const x = leftToRight ? i : cols - 1 - i;
                const v = grid[idx(x, y)];
                if (v === 0 || v === 2) continue;
                const below = get(x, y + 1);
                if (below === 0) { set(x, y, 0); set(x, y + 1, 1); continue; }
                const dir = ((y + frame) % 2 === 0) ? 1 : -1;
                for (const dx of [dir, -dir]) {
                    if (get(x + dx, y + 1) === 0) { set(x, y, 0); set(x + dx, y + 1, 1); break; }
                    if (get(x + dx, y) === 0) { set(x, y, 0); set(x + dx, y, 1); break; }
                }
            }
        }
        // stirring: push water sideways near cursor
        if (stirring && mx > 0) {
            const cx = Math.floor(mx / CELL), cy = Math.floor(my / CELL);
            for (let dy = -3; dy <= 3; dy++) {
                for (let dx = -3; dx <= 3; dx++) {
                    if (get(cx + dx, cy + dy) === 1 && get(cx + dx + (dx >= 0 ? 2 : -2), cy + dy) === 0) {
                        set(cx + dx, cy + dy, 0);
                        set(cx + dx + (dx >= 0 ? 2 : -2), cy + dy, 1);
                    }
                }
            }
        }
        // kick "free" stickers that touch water
        if (frame % 4 === 0) {
            collectBodies();
            for (const b of bodies) {
                const x0 = Math.floor(b.x / CELL), x1 = Math.floor((b.x + b.w) / CELL);
                const y0 = Math.floor(b.y / CELL), y1 = Math.floor((b.y + b.h) / CELL);
                for (let yy = y0; yy <= y1; yy++) {
                    for (let xx = x0; xx <= x1; xx++) {
                        if (get(xx, yy) === 1) {
                            b.vy -= 1.6; b.vx += (Math.random() - 0.5) * 1.6;
                            b.vr += (Math.random() - 0.5) * 6;
                            xx = x1 + 1; break;
                        }
                    }
                }
            }
        }
    }

    /* -------- input -------- */

    function pos(e) { return [e.clientX, e.clientY]; }

    window.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".water-toolbar")) return;
        if (e.target.closest(".sticker")) return;      // stickers handle their own drag
        if (mode === "drop") { pouring = true; [mx, my] = pos(e); }
        if (mode === "stir") { stirring = true; [mx, my] = pos(e); }
    });

    window.addEventListener("pointermove", (e) => {
        [pmx, pmy] = [mx, my];
        [mx, my] = pos(e);
    });

    ["pointerup", "pointercancel"].forEach(ev =>
        window.addEventListener(ev, () => { pouring = false; stirring = false; }));

    // keyboard shortcuts
    window.addEventListener("keydown", (e) => {
        if (e.target.closest("input, textarea")) return;
        if (e.key === "w" || e.key === "W") setMode("drop");
        if (e.key === "r" || e.key === "R") setMode("stir");
        if (e.key === "d" || e.key === "D") setMode("drain");
    });

    function setMode(m) {
        mode = m;
        [dropBtn, stirBtn, drainBtn].forEach(b => b.classList.remove("active"));
        ({ drop: dropBtn, stir: stirBtn, drain: drainBtn })[m].classList.add("active");
        if (m !== "drop") hint.textContent = ({ stir: "🌀", drain: "🚱" })[m];
        else hint.textContent = (currentLang === "en") ? "Water on: hold to pour 💧" : "Wasser an: gedrückt halten zum Gießen 💧";
    }

    dropBtn.addEventListener("click", () => setMode("drop"));
    stirBtn.addEventListener("click", () => setMode("stir"));
    drainBtn.addEventListener("click", () => { grid.fill(0); });

    window.addEventListener("resize", resize);

    // main loop
    let tick = 0;
    function loop() {
        tick++;
        if (mode === "drop" && pouring) {
            // pour a blob of water at pointer
            const cx = Math.floor(mx / CELL), cy = Math.floor(my / CELL);
            for (let dy = -2; dy <= 2; dy++)
                for (let dx = -2; dx <= 2; dx++)
                    if (dx * dx + dy * dy <= 4) set(cx + dx, cy + dy, 1);
        }
        step();
        requestAnimationFrame(loop);
    }

    resize();
    // pre-fill: a little welcoming puddle at the bottom
    for (let x = 0; x < cols; x++) {
        for (let y = rows - 2; y < rows; y++) set(x, y, 1);
    }
    render();
    requestAnimationFrame(loop);
}

/* current language shared with water hint */
let currentLang = "de";

window.addEventListener("DOMContentLoaded", () => {
    initLang();
    currentLang = localStorage.getItem("pref-lang") || "de";
    initTheme();
    initCard();
    initStickers();
    initWater();
});