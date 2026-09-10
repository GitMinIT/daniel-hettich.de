/* Daniel Hettich — digital business card
   i18n (DE first) + theme toggle + flippable card + mini falling-sand game */

/* ================= i18n ================= */

const TRANSLATIONS = {
    de: {
        title: "Daniel Hettich",
        hero_title: "Moin! Ich bin Daniel",
        hero_sub: "Das hier ist meine digitale Visitenkarte — entspannt, ein bisschen pixelig, ehrlich.",
        card_role: "Zuhause-Laborant · Tüftler · Sandkasten-Architekt",
        card_hint: "⟲ Klick für die Rückseite",
        card_back_title: "Lass uns quatschen!",
        copy: "kopieren",
        copied: "clipboard ✓",
        interests_title: "Zeug, das ich mag",
        sandbox_title: "Mini-Sandkasten",
        sandbox_hint: "Malen mit Physik: Sand rieselt, Wasser fließt, Samen wachsen, wenn sie nass werden.",
        mat_sand: "Sand",
        mat_water: "Wasser",
        mat_wall: "Wand",
        mat_seed: "Samen",
        mat_erase: "Radierer",
        mat_reset: "Leeren",
        contact_title: "Kontakt",
        contact_hint: "Schreib mir einfach — ich freu mich über Post von Menschen."
    },
    en: {
        title: "Daniel Hettich",
        hero_title: "Hi! I'm Daniel",
        hero_sub: "This is my digital business card — relaxed, a bit pixelated, honest.",
        card_role: "Home-lab tinkerer · maker · sandbox architect",
        card_hint: "⟲ Click to flip",
        card_back_title: "Let's chat!",
        copy: "copy",
        copied: "clipboard ✓",
        interests_title: "Things I like",
        sandbox_title: "Mini sandbox",
        sandbox_hint: "Paint with physics: sand falls, water flows, seeds grow when watered.",
        mat_sand: "Sand",
        mat_water: "Water",
        mat_wall: "Wall",
        mat_seed: "Seed",
        mat_erase: "Erase",
        mat_reset: "Clear",
        contact_title: "Contact",
        contact_hint: "Drop me a line — I love hearing from people."
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
        if (copyBtn.contains(e.target)) return;          // don't flip when copying
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

/* ================= mini falling-sand sandbox =================
   Grid: 0 empty, 1 sand, 2 water, 3 wall, 4 seed.
   Sand sinks through water, water flows sideways, seeds grow
   upwards when touching water, walls are static.
   Rendering into ImageData, upscaled by CSS (image-rendering: pixelated).
=============================================================== */

function initSandbox() {
    const canvas = document.getElementById("sandbox");
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;

    let grid = new Uint8Array(W * H);
    let currentMat = 1;
    let painting = false;
    let lastX = -1, lastY = -1;
    let tick = 0;

    // materials & their colours (same palette as the page)
    const COLORS = {
        1: [224, 178, 106],   // sand
        2: [86, 134, 214],    // water
        3: [90, 90, 110],     // wall
        4: [104, 192, 122]    // seed
    };

    const idx = (x, y) => y * W + x;
    const get = (x, y) => (x < 0 || x >= W || y < 0 || y >= H) ? 3 : grid[idx(x, y)];
    const set = (x, y, v) => { if (x >= 0 && x < W && y >= 0 && y < H) grid[idx(x, y)] = v; };

    const img = ctx.createImageData(W, H);
    const px = img.data;

    function render() {
        for (let i = 0; i < W * H; i++) {
            const v = grid[i];
            const [r, g, b] = COLORS[v] || [0, 0, 0];
            const o = i * 4;
            px[o] = r; px[o + 1] = g; px[o + 2] = b; px[o + 3] = v === 0 ? 0 : 255;
        }
        ctx.putImageData(img, 0, 0);
    }

    function paintLine(x0, y0, x1, y1) {
        const dx = x1 - x0, dy = y1 - y0;
        const steps = Math.max(Math.abs(dx), Math.abs(dy)) || 1;
        for (let s = 0; s <= steps; s++) {
            paintBrush(Math.round(x0 + dx * s / steps), Math.round(y0 + dy * s / steps));
        }
    }

    function paintBrush(cx, cy) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx * dx + dy * dy <= 2) set(cx + dx, cy + dy, currentMat);
            }
        }
    }

    function canvasPos(e) {
        const rect = canvas.getBoundingClientRect();
        return [
            Math.floor((e.clientX - rect.left) / rect.width * W),
            Math.floor((e.clientY - rect.top) / rect.height * H)
        ];
    }

    canvas.addEventListener("pointerdown", (e) => {
        painting = true;
        [lastX, lastY] = canvasPos(e);
        paintBrush(lastX, lastY);
        canvas.setPointerCapture(e.pointerId);
    });

    canvas.addEventListener("pointermove", (e) => {
        if (!painting) return;
        const [x, y] = canvasPos(e);
        paintLine(lastX, lastY, x, y);
        lastX = x; lastY = y;
    });

    ["pointerup", "pointercancel", "pointerleave"].forEach(ev =>
        canvas.addEventListener(ev, () => { painting = false; lastX = -1; lastY = -1; }));

    document.querySelectorAll(".tool").forEach(btn => {
        if (btn.id === "sandbox-reset") return;
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tool").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentMat = parseInt(btn.dataset.mat, 10);
        });
    });

    document.getElementById("sandbox-reset").addEventListener("click", () => {
        grid.fill(0);
        render();
    });

    function step() {
        tick++;
        // bottom-up sweep, alternate direction to avoid drift artifacts
        for (let y = H - 1; y >= 0; y--) {
            const leftToRight = (y + tick) % 2 === 0;
            for (let i = 0; i < W; i++) {
                const x = leftToRight ? i : W - 1 - i;
                const v = grid[idx(x, y)];
                if (v === 0 || v === 3) continue;

                if (v === 1) { // sand
                    if (get(x, y + 1) === 0 || get(x, y + 1) === 2) {
                        set(x, y, get(x, y + 1)); set(x, y + 1, 1);
                        continue;
                    }
                    const dir = ((tick + y) % 2 === 0) ? 1 : -1;
                    for (const dx of [dir, -dir]) {
                        if (get(x + dx, y + 1) === 0) { set(x, y, 0); set(x + dx, y + 1, 1); break; }
                        if (get(x + dx, y + 1) === 2) { set(x, y, 2); set(x + dx, y + 1, 1); break; }
                    }
                } else if (v === 2) { // water
                    if (get(x, y + 1) === 0) { set(x, y, 0); set(x, y + 1, 2); continue; }
                    const dir = ((tick + y) % 2 === 0) ? 1 : -1;
                    for (const dx of [dir, -dir]) {
                        if (get(x + dx, y) === 0) { set(x, y, 0); set(x + dx, y, 2); break; }
                    }
                } else if (v === 4) { // seed: grows up when watered
                    const waterNear = get(x, y + 1) === 2 || get(x - 1, y) === 2 ||
                                      get(x + 1, y) === 2 || get(x, y - 1) === 2;
                    if (waterNear && tick % 12 === 0 && get(x, y - 1) === 0) {
                        set(x, y - 1, 4);
                        // consume a bit of the water
                        if (get(x, y + 1) === 2) set(x, y + 1, 0);
                    }
                }
            }
        }
        render();
    }

    // initial scene: a little sand pile + water pocket
    for (let x = 20; x < 60; x++) set(x, 30, 3);
    for (let x = 100; x < 140; x++) for (let y = 20; y < 30; y++) set(x, y, 2);
    for (let x = 60; x < 100; x++) set(x, 12, 4);
    set(40, 29, 4); set(41, 29, 4);

    render();
    setInterval(step, 50);
}

window.addEventListener("DOMContentLoaded", () => {
    initLang();
    initTheme();
    initCard();
    initSandbox();
});