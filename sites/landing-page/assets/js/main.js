/* daniel-hettich.de — cozy visitor shell
   DOM glue only; all command logic lives in commands.js (pure, unit-tested). */

import { TEXT, boot, card, createRepl } from './commands.js';

const windowEl = document.getElementById('term-window');
const outputEl = document.getElementById('term-output');
const linesEl = document.getElementById('term-lines');
const inputEl = document.getElementById('term-input');
const promptUserEl = document.querySelector('.p-user');
const promptHostEl = document.querySelector('.p-host');

let repl = null;
let lang = detectLang();

function detectLang() {
    const saved = localStorage.getItem('pref-lang');
    if (saved === 'de' || saved === 'en') return saved;
    return (navigator.language || 'en').toLowerCase().startsWith('de') ? 'de' : 'en';
}

/* ================= i18n ================= */

function T() {
    return TEXT[lang];
}

function applyChrome() {
    const t = T();
    document.title = t.chrome.title;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-chrome]').forEach((el) => {
        const key = el.dataset.chrome;
        if (t.chrome[key] !== undefined) el.textContent = t.chrome[key];
    });
    document.querySelectorAll('[data-chrome-title]').forEach((el) => {
        const key = el.dataset.chromeTitle;
        if (t.chrome[key] !== undefined) el.title = t.chrome[key];
    });
    const themed = document.documentElement.getAttribute('data-theme') === 'dark';
    const themeBtn = document.getElementById('theme-toggle');
    themeBtn.title = themed ? t.chrome.theme_to_light : t.chrome.theme_to_dark;
    themeBtn.textContent = themed ? '☀' : '☾';
    document.querySelectorAll('.tb-lang').forEach((b) => {
        b.classList.toggle('active', b.dataset.lang === lang);
    });
    document.getElementById('term-input').setAttribute('aria-label', t.chrome.input_aria);
    outputEl.setAttribute('aria-label', t.chrome.output_aria);
    promptUserEl.textContent = t.prompt.user;
    promptHostEl.textContent = t.prompt.host;
}

function setLang(next) {
    lang = next;
    localStorage.setItem('pref-lang', next);
    applyChrome();
}

/* ================= theme ================= */

function setTheme(next) {
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('pref-theme', next);
    applyChrome();
}

function initTheme() {
    const saved = localStorage.getItem('pref-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        setTheme(cur === 'dark' ? 'light' : 'dark');
    });
}

/* ================= card ================= */

function buildCard() {
    const c = card(lang);
    const wrap = document.createElement('div');
    wrap.className = 'term-card';
    wrap.setAttribute('aria-label', 'neofetch');
    const art = document.createElement('pre');
    art.className = 'card-art';
    art.textContent = c.art.join('\n');
    const info = document.createElement('div');
    info.className = 'card-info';
    const name = document.createElement('p');
    name.className = 'card-name';
    name.textContent = c.name;
    const tag = document.createElement('p');
    tag.className = 'card-tagline';
    tag.textContent = c.tagline;
    const rows = document.createElement('dl');
    rows.className = 'card-rows';
    c.rows.forEach((row) => {
        const dt = document.createElement('dt');
        dt.textContent = row.k;
        const dd = document.createElement('dd');
        if (row.href) {
            const a = document.createElement('a');
            a.href = row.href;
            a.textContent = row.v;
            if (row.href.startsWith('http')) {
                a.target = '_blank';
                a.rel = 'noopener';
            }
            dd.appendChild(a);
        } else {
            dd.textContent = row.v;
        }
        rows.append(dt, dd);
    });
    const sw = document.createElement('div');
    sw.className = 'card-swatches';
    sw.setAttribute('aria-hidden', 'true');
    c.swatches.forEach((hex) => {
        const i = document.createElement('i');
        i.style.background = hex;
        sw.appendChild(i);
    });
    info.append(name, tag, rows, sw);
    wrap.append(art, info);
    return wrap;
}

/* ================= terminal rendering ================= */

function makeLine(obj) {
    if (obj.t === 'card') return buildCard();
    const div = document.createElement('div');
    div.className = 'tline' + (obj.t === 'err' ? ' err' : obj.t === 'dim' ? ' dim' : obj.t === 'ok' ? ' ok' : '');
    if (obj.href) {
        const a = document.createElement('a');
        a.href = obj.href;
        if (obj.href.startsWith('http')) {
            a.target = '_blank';
            a.rel = 'noopener';
        }
        a.textContent = obj.s;
        div.appendChild(a);
    } else {
        div.textContent = obj.s ?? '';
    }
    return div;
}

function printMany(objs) {
    for (const obj of objs) {
        linesEl.appendChild(makeLine(obj));
    }
    outputEl.scrollTop = outputEl.scrollHeight;
}

function promptString() {
    const t = T();
    return `${t.prompt.user}@${t.prompt.host}:~$`;
}

function ensureRepl() {
    if (!repl) repl = createRepl({ lang });
    return repl;
}

function submitCommand(raw) {
    const echo = document.createElement('div');
    echo.className = 'tline';
    echo.textContent = `${promptString()} ${raw}`;
    linesEl.appendChild(echo);
    const res = ensureRepl().execute(raw);
    if (res.actions.clear) {
        linesEl.innerHTML = '';
        return;
    }
    if (res.actions.theme) setTheme(res.actions.theme);
    if (res.actions.lang) setLang(res.actions.lang);
    if (res.actions.close) {
        printMany(res.lines);
        setTimeout(() => closeWindow(), 1200);
        return;
    }
    printMany(res.lines);
}

/* ================= window controls ================= */

function closeWindow() {
    windowEl.classList.add('minimized');
    inputEl.blur();
}

function restoreWindow() {
    windowEl.classList.remove('minimized');
    inputEl.focus({ preventScroll: true });
}

function initWindowControls() {
    document.getElementById('win-min').addEventListener('click', closeWindow);
    document.getElementById('win-close').addEventListener('click', closeWindow);
    document.getElementById('win-max').addEventListener('click', () => {
        if (windowEl.classList.contains('maximized')) {
            windowEl.classList.remove('maximized');
            restoreGeometry();
        } else {
            stashGeometry();
            windowEl.classList.add('maximized');
        }
    });
    document.getElementById('tb-logo').addEventListener('click', restoreWindow);
    windowEl.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && windowEl.classList.contains('maximized')) {
            windowEl.classList.remove('maximized');
            restoreGeometry();
        }
    });
}

/* ================= drag (titlebar) ================= */

const desktopEl = document.getElementById('desktop');
let stashedGeometry = null;

function clampToDesktop(x, y) {
    const dRect = desktopEl.getBoundingClientRect();
    const wRect = windowEl.getBoundingClientRect();
    // keep at least the titlebar (and a bit of the window) reachable
    const minX = dRect.left - wRect.width + 80;
    const maxX = dRect.right - 80;
    const minY = dRect.top;
    const maxY = dRect.bottom - 40;
    return {
        x: Math.min(Math.max(x, minX), maxX),
        y: Math.min(Math.max(y, minY), maxY)
    };
}

function initDrag() {
    const titlebar = windowEl.querySelector('.term-titlebar');
    const title = titlebar.querySelector('.term-title');
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let origX = 0;
    let origY = 0;

    titlebar.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.win-btn')) return; // controls stay clickable
        dragging = true;
        const rect = windowEl.getBoundingClientRect();
        // switch from flex-centering to absolute positioning on first drag
        if (!windowEl.classList.contains('moved')) {
            windowEl.classList.add('moved');
            windowEl.style.left = `${rect.left}px`;
            windowEl.style.top = `${rect.top}px`;
        }
        origX = rect.left;
        origY = rect.top;
        startX = e.clientX;
        startY = e.clientY;
        titlebar.setPointerCapture(e.pointerId);
        titlebar.classList.add('dragging');
        e.preventDefault();
    });

    titlebar.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const { x, y } = clampToDesktop(origX + e.clientX - startX, origY + e.clientY - startY);
        windowEl.style.left = `${x}px`;
        windowEl.style.top = `${y}px`;
    });

    const stop = () => {
        if (!dragging) return;
        dragging = false;
        titlebar.classList.remove('dragging');
    };
    titlebar.addEventListener('pointerup', stop);
    titlebar.addEventListener('pointercancel', stop);
    // keep the title text out of the way of pointer events for dragging
    title.style.pointerEvents = 'none';
}

/* ================= resize (corner handle) ================= */

const MIN_W = 320;
const MIN_H = 220;

function initResize() {
    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    handle.setAttribute('aria-hidden', 'true');
    windowEl.appendChild(handle);

    let resizing = false;
    let startX = 0;
    let startY = 0;
    let origW = 0;
    let origH = 0;

    handle.addEventListener('pointerdown', (e) => {
        resizing = true;
        const rect = windowEl.getBoundingClientRect();
        origW = rect.width;
        origH = rect.height;
        startX = e.clientX;
        startY = e.clientY;
        if (!windowEl.classList.contains('moved')) {
            windowEl.classList.add('moved');
            windowEl.style.left = `${rect.left}px`;
            windowEl.style.top = `${rect.top}px`;
        }
        handle.setPointerCapture(e.pointerId);
        e.preventDefault();
    });

    handle.addEventListener('pointermove', (e) => {
        if (!resizing) return;
        const dRect = desktopEl.getBoundingClientRect();
        const rect = windowEl.getBoundingClientRect();
        const maxW = dRect.right - rect.left;
        const maxH = dRect.bottom - rect.top;
        const w = Math.min(Math.max(origW + e.clientX - startX, MIN_W), maxW);
        const h = Math.min(Math.max(origH + e.clientY - startY, MIN_H), maxH);
        windowEl.style.width = `${w}px`;
        windowEl.style.height = `${h}px`;
    });

    const stop = () => { resizing = false; };
    handle.addEventListener('pointerup', stop);
    handle.addEventListener('pointercancel', stop);
}

function stashGeometry() {
    const r = windowEl.getBoundingClientRect();
    stashedGeometry = { left: r.left, top: r.top, width: r.width, height: r.height };
}

function restoreGeometry() {
    if (!stashedGeometry) return;
    const g = stashedGeometry;
    windowEl.style.left = `${g.left}px`;
    windowEl.style.top = `${g.top}px`;
    windowEl.style.width = `${g.width}px`;
    windowEl.style.height = `${g.height}px`;
}

/* ================= input wiring ================= */

function initInput() {
    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const raw = inputEl.value;
            if (!raw.trim()) return;
            inputEl.value = '';
            submitCommand(raw);
        } else if (e.key === 'l' && e.ctrlKey) {
            e.preventDefault();
            submitCommand('clear');
        }
    });

    outputEl.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        inputEl.focus({ preventScroll: true });
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('.term-window, .taskbar, .desk-icons, .footer, .desk-icon')) return;
        inputEl.focus({ preventScroll: true });
    });
}

/* ================= konami ================= */

function initKonami() {
    const seq = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
    let idx = 0;
    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (e.target === inputEl && key.length === 1) return; // typing in the prompt is fine
        if (key === seq[idx]) idx++;
        else idx = key === seq[0] ? 1 : 0;
        if (idx === seq.length) {
            idx = 0;
            printMany(ensureRepl().execute('konami').lines);
        }
    });
}

/* ================= taskbar clock ================= */

function initClock() {
    const clockEl = document.getElementById('tb-clock');
    const fmt = T().chrome.taskbar_clock_fmt;
    const tick = () => {
        clockEl.textContent = new Date().toLocaleTimeString(fmt, { hour: '2-digit', minute: '2-digit' });
    };
    tick();
    setInterval(tick, 15000);
}

/* ================= init ================= */

window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    document.querySelectorAll('.tb-lang').forEach((b) => {
        b.addEventListener('click', () => setLang(b.dataset.lang));
    });
    applyChrome();
    initWindowControls();
    initDrag();
    initResize();
    initInput();
    initKonami();
    initClock();
    ensureRepl();
    printMany(boot(lang));
    inputEl.focus({ preventScroll: true });
});