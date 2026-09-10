/* Daniel Hettich — punk edition
   i18n + theme + flippable card + draggable stickers + page-wide water
   Water & body physics live in pure functions (WaterSim / BodySim below)
   so they can be unit-tested in Node (see test/water.test.mjs). */

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
        water_hint: "Wasser-Werkzeug aktiv — gedrückt halten zum Gießen 💧",
        water_hint_off: "Wasser aus — 💧 zum Aktivieren",
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
        water_hint: "Water tool active — hold to pour 💧",
        water_hint_off: "Water off — click 💧 to activate",
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
    document.querySelectorAll(".sticker").forEach(sticker => {
        let rot = 0;
        sticker.addEventListener("dblclick", () => {
            rot += (Math.random() < 0.5 ? -22 : 22);
            sticker.style.transform = `rotate(${rot}deg)`;
        });

        sticker.addEventListener("pointerdown", (e) => {
            if (e.button !== 0 && e.pointerType === "mouse") return;
            // don't fight with water toolbar
            e.preventDefault();
            const rect = sticker.getBoundingClientRect();
            const startX = e.clientX, startY = e.clientY;
            const grabDX = startX - (rect.left + rect.width / 2);
            const grabDY = startY - (rect.top + rect.height / 2);
            let droppedFree = false;

            sticker.classList.add("dragging");

            function move(ev) {
                sticker.classList.add("free");
                sticker.style.left = (ev.clientX - rect.width / 2) + "px";
                sticker.style.top = (ev.clientY - rect.height / 2 - grabDY + rect.height / 2) + "px";
                sticker.style.transform = `rotate(${rot}deg)`;
            }

            function up(ev) {
                window.removeEventListener("pointermove", move);
                window.removeEventListener("pointerup", up);
                window.removeEventListener("pointercancel", up);
                sticker.classList.remove("dragging");
                // sticker stays exactly where dropped — it's a physics body now
                sticker.classList.add("free");
                sticker._vx = 0; sticker._vy = 0; sticker._vr = 0;
                sticker._rot = rot;
            }

            window.addEventListener("pointermove", move);
            window.addEventListener("pointerup", up);
            window.addEventListener("pointercancel", up);
        });
    });
}

/* ================= pure simulation cores =================
   WaterSim: cellular water on a wrapless grid (walls at borders).
   0 empty, 1 water. Pure — no DOM access. Unit-tested.
   BodySim: point-mass physics for dropped stickers.
=========================================================== */

const WaterSim = {
    create(rows, cols) {
        return {
            rows, cols,
            grid: new Uint8Array(rows * cols),
            frame: 0
        };
    },

    at(sim, x, y) {
        if (x < 0 || x >= sim.cols || y < 0 || y >= sim.rows) return 1; // border = wall
        return sim.grid[y * sim.cols + x];
    },

    set(sim, x, y, v) {
        if (x >= 0 && x < sim.cols && y >= 0 && y < sim.rows) sim.grid[y * sim.cols + x] = v;
    },

    /** one water step; returns number of cells that moved */
    step(sim) {
        const moved = { n: 0 };
        const dirFlip = (sim.frame % 2 === 0);
        sim.frame++;
        // viscosity: sideways spreading happens only every 3rd frame.
        // This lets pools settle instead of oscillating forever.
        const canSpread = (sim.frame % 3 === 0);
        for (let y = sim.rows - 1; y >= 0; y--) {
            for (let i = 0; i < sim.cols; i++) {
                const x = dirFlip ? i : sim.cols - 1 - i;
                if (sim.grid[y * sim.cols + x] !== 1) continue;
                if (WaterSim.at(sim, x, y + 1) === 0) {
                    WaterSim.set(sim, x, y, 0); WaterSim.set(sim, x, y + 1, 1);
                    moved.n++;
                    continue;
                }
                if (!canSpread) continue;
                const dir = ((y + sim.frame) % 2 === 0) ? 1 : -1;
                for (const dx of [dir, -dir]) {
                    // spread only if the water can eventually fall that way:
                    // diagonal-below in that direction must be free, or the
                    // side cell itself must have space to sink into
                    if (WaterSim.at(sim, x + dx, y + 1) === 0) {
                        WaterSim.set(sim, x, y, 0); WaterSim.set(sim, x + dx, y + 1, 1);
                        moved.n++;
                        break;
                    }
                    const sideEmpty = WaterSim.at(sim, x + dx, y) === 0;
                    const sideCanFall = WaterSim.at(sim, x + 2 * dx, y + 1) === 0;
                    if (sideEmpty && sideCanFall) {
                        WaterSim.set(sim, x, y, 0); WaterSim.set(sim, x + dx, y, 1);
                        moved.n++;
                        break;
                    }
                }
            }
        }
        return moved.n;
    },

    /** pour a circular blob of water */
    pour(sim, cx, cy, r = 2) {
        for (let dy = -r; dy <= r; dy++)
            for (let dx = -r; dx <= r; dx++)
                if (dx * dx + dy * dy <= r * r) WaterSim.set(sim, cx + dx, cy + dy, 1);
    },

    /** push water cells in a radius sideways (stir) */
    stir(sim, cx, cy, r = 3) {
        for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
                const x = cx + dx, y = cy + dy;
                if (WaterSim.at(sim, x, y) !== 1) continue;
                const push = dx >= 0 ? 2 : -2;
                if (WaterSim.at(sim, x + push, y) === 0) {
                    WaterSim.set(sim, x, y, 0);
                    WaterSim.set(sim, x + push, y, 1);
                }
            }
        }
    }
};

const BodySim = {
    /** integrate one body for one tick; returns nothing, mutates body */
    step(body, world) {
        const { width, height } = world;
        body.vy += 0.5;                                  // gravity
        if (body.inWater) {                              // buoyant drag
            body.vy = body.vy * 0.82 - 0.35;
            body.vx *= 0.9;
            body.vr *= 0.9;
        }
        body.x += body.vx;
        body.y += body.vy;
        body.r += body.vr;

        const floor = height - body.h;
        if (body.y > floor) { body.y = floor; body.vy *= -0.3; body.vx *= 0.7; body.vr *= 0.6; }
        if (body.y < 0) { body.y = 0; body.vy = Math.abs(body.vy) * 0.3; }
        if (body.x < 0) { body.x = 0; body.vx *= -0.4; }
        if (body.x > width - body.w) { body.x = width - body.w; body.vx *= -0.4; }
    },

    /** water splash impulse: does any part of the body touch a water cell? */
    waterKick(body, waterSim, cell, chance = 0.6, rng = Math.random) {
        const x0 = Math.floor(body.x / cell), x1 = Math.floor((body.x + body.w) / cell);
        const y0 = Math.floor(body.y / cell), y1 = Math.floor((body.y + body.h) / cell);
        for (let y = y0; y <= y1; y++) {
            for (let x = x0; x <= x1; x++) {
                if (WaterSim.at(waterSim, x, y) === 1) {
                    body.vy -= 1.6;
                    body.vx += (rng() - 0.5) * 1.6;
                    body.vr += (rng() - 0.5) * 6;
                    return true;
                }
            }
        }
        return false;
    }
};

/* ================= page-wide water (DOM glue) ================= */

function initWater() {
    const canvas = document.getElementById("water-canvas");
    const ctx = canvas.getContext("2d");
    const CELL = 8;
    const dropBtn = document.getElementById("wt-drop");
    const stirBtn = document.getElementById("wt-stir");
    const drainBtn = document.getElementById("wt-drain");
    const hint = document.getElementById("water-hint");

    let W, H, cols, rows, sim, img, px;
    let mode = "drop";
    let pointerDown = false;
    let mx = -1, my = -1;

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        W = innerWidth; H = innerHeight;
        canvas.width = Math.floor(W * dpr);
        canvas.height = Math.floor(H * dpr);
        canvas.style.width = W + "px";
        canvas.style.height = H + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cols = Math.ceil(W / CELL);
        rows = Math.ceil(H / CELL);
        sim = WaterSim.create(rows, cols);
        img = ctx.createImageData(cols, rows);
        px = img.data;
    }

    function render() {
        for (let i = 0; i < cols * rows; i++) {
            const o = i * 4;
            if (sim.grid[i] === 0) { px[o + 3] = 0; continue; }
            px[o] = 86; px[o + 1] = 134; px[o + 2] = 214;
            px[o + 3] = 170;
        }
        ctx.clearRect(0, 0, W, H);
        const off = document.createElement("canvas");
        off.width = cols; off.height = rows;
        off.getContext("2d").putImageData(img, 0, 0);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(off, 0, 0, cols * CELL, rows * CELL, 0, 0, cols * CELL, rows * CELL);
    }

    const bodies = [];

    function collectBodies() {
        bodies.length = 0;
        document.querySelectorAll(".sticker.free").forEach(el => {
            const r = el.getBoundingClientRect();
            bodies.push({
                el,
                x: r.left, y: r.top, w: r.width, h: r.height,
                vx: el._vx || 0, vy: el._vy || 0,
                r: el._rot || 0, vr: el._vr || 0
            });
        });
    }

    function applyBody(b) {
        b.el.style.left = b.x + "px";
        b.el.style.top = b.y + "px";
        b.el.style.transform = `rotate(${b.r}deg)`;
        b.el._vx = b.vx; b.el._vy = b.vy; b.el._rot = b.r; b.el._vr = b.vr;
    }

    function cellAt(x, y) {
        return WaterSim.at(sim, Math.floor(x / CELL), Math.floor(y / CELL));
    }

    let tick = 0;

    function loop() {
        tick++;
        if (mode === "drop" && pointerDown && mx >= 0) WaterSim.pour(sim, Math.floor(mx / CELL), Math.floor(my / CELL));
        if (mode === "stir" && pointerDown && mx >= 0) WaterSim.stir(sim, Math.floor(mx / CELL), Math.floor(my / CELL));

        WaterSim.step(sim);

        // physics bodies (dropped stickers)
        if (tick % 2 === 0) {
            collectBodies();
            for (const b of bodies) {
                b.inWater = cellAt(b.x + b.w / 2, b.y + b.h / 2) === 1;
                if (tick % 6 === 0) BodySim.waterKick(b, sim, CELL);
                BodySim.step(b, { width: W, height: H });
                applySoakedStyle(b);
                applyBody(b);
            }
        }

        render();
        requestAnimationFrame(loop);
    }

    function applySoakedStyle(b) {
        // mark stickers wet while they sit in water
        const soaked = cellAt(b.x + b.w / 2, b.y + b.h / 2) === 1;
        b.el.classList.toggle("st-soaked", soaked);
    }

    /* input: pour/stir anywhere on the page; drain clears */
    window.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".water-toolbar") || e.target.closest(".sticker")) return;
        if (mode === "drop" || mode === "stir") {
            pointerDown = true;
            mx = e.clientX; my = e.clientY;
        }
    });
    window.addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; });
    ["pointerup", "pointercancel"].forEach(ev =>
        window.addEventListener(ev, () => { pointerDown = false; }));

    function setMode(m) {
        if (m === "drain") { sim.grid.fill(0); drainBtn.classList.remove("active"); return; }
        mode = (mode === m) ? "drop" : m;     // toolbar buttons toggle
        [dropBtn, stirBtn].forEach(b => b.classList.remove("active"));
        ({ drop: dropBtn, stir: stirBtn })[mode].classList.add("active");
        const t = TRANSLATIONS[currentLang] || TRANSLATIONS.de;
        hint.textContent = mode === "stir" ? t.water_hint + " 🌀" : t.water_hint;
    }

    dropBtn.addEventListener("click", () => setMode("drop"));
    stirBtn.addEventListener("click", () => setMode("stir"));
    drainBtn.addEventListener("click", () => setMode("drain"));

    window.addEventListener("keydown", (e) => {
        if (e.target.closest("input, textarea")) return;
        if (e.key === "w" || e.key === "W") setMode("drop");
        if (e.key === "r" || e.key === "R") setMode("stir");
        if (e.key === "d" || e.key === "D") setMode("drain");
    });

    window.addEventListener("resize", resize);
    resize();

    // welcoming puddle at the bottom
    for (let x = 0; x < cols; x++) {
        WaterSim.set(sim, x, rows - 1, 1);
        WaterSim.set(sim, x, rows - 2, 1);
    }

    requestAnimationFrame(loop);
}

let currentLang = "de";

window.addEventListener("DOMContentLoaded", () => {
    initLang();
    currentLang = localStorage.getItem("pref-lang") || "de";
    initTheme();
    initCard();
    initStickers();
    initWater();
});