/* daniel-hettich.de — popup windows for the legal pages
   Reuses the same window chrome as the terminal: titlebar, drag, close.
   Content is fetched from the real pages (single source of truth),
   so deep links like /impressum still work as standalone pages. */

import { TEXT } from './commands.js';

const desktopEl = document.getElementById('desktop');

const POPUPS = {
    '/impressum': { chromeKey: 'win_imp_title', icon: '§' },
    '/datenschutz': { chromeKey: 'win_dat_title', icon: '🔒' }
};

const openPopups = new Map();
let topZ = 100;
let popupLang = document.documentElement.lang || 'en';

function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function setPopupLang(lang) {
    popupLang = lang;
    for (const [, win] of openPopups) {
        win.querySelector('.term-title').textContent = TEXT[lang].chrome[POPUPS[win.dataset.path].chromeKey];
    }
}

function bringToFront(el) {
    topZ += 1;
    el.style.zIndex = topZ;
}

/* shared with the VM window (vm.js) */
export function registerWindow(el) {
    bringToFront(el);
    el.addEventListener('pointerdown', () => bringToFront(el));
    return el;
}

export function makeDraggable(win, { minXPad = 80, minYPad = 40 } = {}) {
    const titlebar = win.querySelector('.term-titlebar');
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let origX = 0;
    let origY = 0;

    titlebar.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.win-btn')) return;
        dragging = true;
        const rect = win.getBoundingClientRect();
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
        const dRect = desktopEl.getBoundingClientRect();
        const rect = win.getBoundingClientRect();
        const minX = dRect.left - rect.width + minXPad;
        const maxX = dRect.right - minXPad;
        const minY = dRect.top;
        const maxY = dRect.bottom - minYPad;
        const x = Math.min(Math.max(origX + e.clientX - startX, minX), maxX);
        const y = Math.min(Math.max(origY + e.clientY - startY, minY), maxY);
        win.style.left = `${x}px`;
        win.style.top = `${y}px`;
    });

    const stop = () => {
        dragging = false;
        titlebar.classList.remove('dragging');
    };
    titlebar.addEventListener('pointerup', stop);
    titlebar.addEventListener('pointercancel', stop);
}

function extractContent(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const main = doc.querySelector('main.legal');
    return main ? main.innerHTML : null;
}

function positionWindow(el, index, total) {
    // open slightly offset from the terminal, cascading if several are open
    const dRect = desktopEl.getBoundingClientRect();
    const w = Math.min(560, dRect.width - 40);
    const h = Math.min(480, dRect.height - 40);
    const baseX = dRect.width / 2 - w / 2 + (index - (total - 1) / 2) * 36;
    const baseY = dRect.height / 2 - h / 2 + (index - (total - 1) / 2) * 28;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    el.style.left = `${Math.max(12, dRect.left + baseX)}px`;
    el.style.top = `${Math.max(12, dRect.top + baseY)}px`;
}

function buildWindow(path, html) {
    const conf = POPUPS[path];
    const lang = document.documentElement.lang || popupLang;
    const title = TEXT[lang].chrome[conf.chromeKey];

    const win = document.createElement('section');
    win.className = 'popup-window moved';
    win.dataset.path = path;
    win.setAttribute('aria-label', title);
    win.innerHTML = `
        <div class="term-titlebar">
            <span class="popup-icon" aria-hidden="true">${conf.icon}</span>
            <span class="term-title">${esc(title)}</span>
            <div class="term-controls">
                <button class="win-btn win-close" type="button" aria-label="${esc(title)} schließen">✕</button>
            </div>
        </div>
        <div class="popup-body">
            <div class="popup-content">${html}</div>
        </div>`;

    // close via button
    win.querySelector('.win-close').addEventListener('click', () => closePopup(path));

    // focus stack: handled by registerWindow (shared with vm.js)
    makeDraggable(win);
    desktopEl.appendChild(win);
    registerWindow(win);
    return win;
}

export function openPopup(path) {
    const existing = openPopups.get(path);
    if (existing) {
        bringToFront(existing);
        return Promise.resolve(existing);
    }
    if (!POPUPS[path]) return Promise.reject(new Error(`no popup for ${path}`));

    return fetch(path)
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.text();
        })
        .then((html) => {
            const content = extractContent(html);
            if (!content) throw new Error('no content found');
            const win = buildWindow(path, content);
            openPopups.set(path, win);
            positionWindow(win, Array.from(openPopups.keys()).indexOf(path), openPopups.size);
            return win;
        });
}

export function closePopup(path) {
    const win = openPopups.get(path);
    if (!win) return;
    win.remove();
    openPopups.delete(path);
}

export function closeAllPopups() {
    for (const [path] of openPopups) closePopup(path);
}

/* Intercept every internal link to a popup route — desk icons, footer,
   terminal output — so they open as windows instead of navigating. */
export function initPopupLinks() {
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a[href="/impressum"], a[href="/datenschutz"]');
        if (!a) return;
        e.preventDefault();
        openPopup(a.getAttribute('href')).catch((err) => {
            console.error('popup failed, falling back to navigation', err);
            window.location.href = a.getAttribute('href');
        });
    });
}