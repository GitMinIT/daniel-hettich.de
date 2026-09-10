/* daniel-hettich.de — the windows-vm joke
   After a few seconds a notification toast announces the VM booted.
   Clicking the toast or the taskbar logo opens a VM console window:
   a short fake BIOS boot that runs straight into a BSOD.
   Content lives in commands.js (vmBootScript/bsodContent), pure and tested. */

import { TEXT, vmBootScript, bsodContent, qrPattern } from './commands.js';
import { makeDraggable, registerWindow } from './popup.js';

const desktopEl = document.getElementById('desktop');
const TOAST_DELAY = 5000;
const TOAST_LIFETIME = 9000;

let vmWin = null;
let vmRunning = false;
let bootTimer = null;

function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function qrHtml(seed) {
    const grid = qrPattern(seed);
    let html = '';
    for (const row of grid) {
        html += '<div class="qr-row">';
        for (const cell of row) html += `<i class="${cell ? 'on' : ''}"></i>`;
        html += '</div>';
    }
    return html;
}

function positionVmWindow(el) {
    const dRect = desktopEl.getBoundingClientRect();
    const w = Math.min(640, dRect.width - 40);
    const h = Math.min(400, dRect.height - 40);
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    el.style.left = `${Math.max(12, dRect.left + dRect.width / 2 - w / 2)}px`;
    el.style.top = `${Math.max(12, dRect.top + dRect.height / 2 - h / 2)}px`;
}

function closeVm() {
    if (bootTimer) {
        clearTimeout(bootTimer);
        bootTimer = null;
    }
    vmRunning = false;
    if (vmWin) {
        vmWin.remove();
        vmWin = null;
    }
}

function buildVmWindow() {
    const lang = document.documentElement.lang || 'en';
    const win = document.createElement('section');
    win.className = 'popup-window vm-window';
    win.setAttribute('aria-label', 'Windows VM');
    win.innerHTML = `
        <div class="term-titlebar">
            <span class="popup-icon win-logo" aria-hidden="true">⊞</span>
            <span class="term-title">windows11 — cozy-hypervisor</span>
            <div class="term-controls">
                <button class="win-btn win-close" type="button" aria-label="VM schließen">✕</button>
            </div>
        </div>
        <div class="vm-screen"></div>`;
    win.querySelector('.win-close').addEventListener('click', closeVm);
    positionVmWindow(win);
    desktopEl.appendChild(win);
    registerWindow(win);
    makeDraggable(win);
    return win;
}

function renderBsod(container) {
    const lang = document.documentElement.lang || 'en';
    const b = bsodContent(lang);
    container.innerHTML = `
        <div class="bsod" role="img" aria-label="${esc(b.text)} ${esc(b.code)}">
            <div class="bsod-face">${esc(b.emoji)}</div>
            <p class="bsod-text">${esc(b.text)}</p>
            <div class="bsod-progress"><span class="bsod-pct">0</span> ${esc(b.progress)}</div>
            <p class="bsod-hint">${esc(b.hint)}</p>
            <div class="bsod-footer">
                <div class="bsod-qr">${qrHtml(42)}</div>
                <div class="bsod-meta">
                    <div class="bsod-code">${esc(b.code)}</div>
                    <div class="bsod-stop">${esc(b.stop)}</div>
                </div>
            </div>
        </div>`;
    // the counter climbs and settles at 100 — it never restarts the vm, of course
    const pct = container.querySelector('.bsod-pct');
    let val = 0;
    const iv = setInterval(() => {
        val = Math.min(100, val + Math.ceil(Math.random() * 9));
        pct.textContent = val;
        if (val >= 100) clearInterval(iv);
    }, 260);
}

function runBoot(win) {
    const screen = win.querySelector('.vm-screen');
    const lang = document.documentElement.lang || 'en';
    const steps = vmBootScript(lang);
    let acc = 0;
    steps.forEach((step) => {
        acc += step.delay;
        bootTimer = setTimeout(() => {
            if (step.t === 'bsod') {
                renderBsod(screen);
                return;
            }
            const div = document.createElement('div');
            div.className = 'vm-line';
            div.textContent = step.s;
            screen.appendChild(div);
            screen.scrollTop = screen.scrollHeight;
        }, acc);
    });
}

export function openVm() {
    if (vmWin) {
        registerWindow(vmWin);
        return;
    }
    vmRunning = true;
    vmWin = buildVmWindow();
    runBoot(vmWin);
}

/* ================= notification toast ================= */

function buildToast() {
    const lang = document.documentElement.lang || 'en';
    const t = TEXT[lang].vm;
    const toast = document.createElement('div');
    toast.className = 'vm-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-label', t.toast_aria);
    toast.innerHTML = `
        <span class="vm-toast-icon win-logo" aria-hidden="true">⊞</span>
        <span class="vm-toast-text">
            <strong>${esc(t.toast_title)}</strong>
            <span>${esc(t.toast_body)}</span>
        </span>`;
    toast.addEventListener('click', () => {
        dismissToast();
        openVm();
    });
    return toast;
}

let toastEl = null;
let toastTimer = null;

function dismissToast() {
    if (toastTimer) {
        clearTimeout(toastTimer);
        toastTimer = null;
    }
    if (toastEl) {
        toastEl.remove();
        toastEl = null;
    }
}

export function initVm() {
    // the taskbar logo opens the vm directly
    const btn = document.getElementById('vm-toggle');
    if (btn) {
        btn.addEventListener('click', () => {
            dismissToast();
            openVm();
        });
    }

    // ...and once per visit, after a few seconds, we proudly announce the vm
    const shown = sessionStorage.getItem('vm-toast-shown');
    if (shown) return;
    setTimeout(() => {
        if (vmRunning || sessionStorage.getItem('vm-toast-shown')) return;
        sessionStorage.setItem('vm-toast-shown', '1');
        toastEl = buildToast();
        document.body.appendChild(toastEl);
        toastTimer = setTimeout(dismissToast, TOAST_LIFETIME);
    }, TOAST_DELAY);
}