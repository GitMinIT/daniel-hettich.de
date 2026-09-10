/* Wiring tests: catch the class of bug where the HTML and the JS disagree —
   a script tag missing type=module, a missing DOM id, an i18n key referenced
   by main.js but absent from commands.js, or a legal page loading the wrong
   script. Runs on the real files from the repo — no browser needed. */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { TEXT, commandNames } from '../assets/js/commands.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const read = (rel) => readFileSync(path.join(root, rel), 'utf8');

const indexHtml = read('html/index.html');
const mainJs = read('assets/js/main.js');
const commandsJs = read('assets/js/commands.js');
const styleCss = read('assets/css/style.css');

const legalPages = ['impressum.html', 'datenschutz.html'].map((f) => ({
  name: f,
  html: read(`html/${f}`)
}));

const static404 = { name: '404.html', html: read('html/404.html') };

/* ---------- script/module consistency ---------- */

test('every interactive page loads exactly one script tag', () => {
  const pages = [{ name: 'index.html', html: indexHtml }, ...legalPages];
  for (const { name, html } of pages) {
    const tags = [...html.matchAll(/<script\b[^>]*>/g)];
    assert.equal(tags.length, 1, `${name} should load exactly one script, found ${tags.length}`);
  }
  // 404 is fully static by design — CSS only, no JS
  assert.equal([...static404.html.matchAll(/<script\b[^>]*>/g)].length, 0, '404.html should stay script-free');
});

test('pages with module imports use type="module"', () => {
  assert.match(commandsJs, /export /, 'commands.js is expected to be a module');
  const tag = indexHtml.match(/<script[^>]*src="\/assets\/js\/main\.js"[^>]*>/);
  assert.ok(tag, 'index.html must load main.js');
  assert.match(tag[0], /type="module"/, 'main.js needs type="module" (it imports commands.js)');
});

test('commands.js is never referenced by a script tag', () => {
  for (const { name, html } of [{ name: 'index.html', html: indexHtml }, ...legalPages]) {
    assert.equal(html.match(/<script[^>]*commands\.js[^>]*>/), null, `${name} must not load commands.js directly`);
  }
});

test('legal pages load legal.js, not main.js', () => {
  for (const { name, html } of legalPages) {
    assert.match(html, /src="\/assets\/js\/legal\.js"/, `${name} must load legal.js`);
    assert.doesNotMatch(html, /main\.js/, `${name} must not load main.js (needs terminal DOM)`);
  }
});

/* ---------- import sanity ---------- */

test('main.js imports everything it uses from commands.js', () => {
  const imports = mainJs.match(/import\s*\{([^}]*)\}\s*from\s*'\.\/commands\.js'/);
  assert.ok(imports, "main.js must import from './commands.js'");
  const names = imports[1].split(',').map((s) => s.trim()).filter(Boolean);
  assert.ok(names.length >= 4);
  for (const n of names) {
    assert.match(commandsJs, new RegExp(`\\b(?:export)\\s+(?:function|const)\\s+${n}\\b`), `commands.js must export ${n}`);
  }
});

/* ---------- DOM ids referenced by main.js exist in index.html ---------- */

test('every getElementById target exists in index.html', () => {
  const ids = [...mainJs.matchAll(/getElementById\('([^']+)'\)/g)].map((m) => m[1]);
  assert.ok(ids.length >= 4, 'expected several getElementById calls in main.js');
  for (const id of ids) {
    assert.match(indexHtml, new RegExp(`id="${id}"`), `index.html is missing id="${id}"`);
  }
});

test('every querySelector target used by main.js exists in index.html', () => {
  const sels = [...mainJs.matchAll(/querySelector\('([^']+)'\)/g)].map((m) => m[1]);
  assert.ok(sels.length >= 2);
  const classSels = sels.filter((s) => s.startsWith('.'));
  for (const s of classSels) {
    assert.match(indexHtml, new RegExp(`class="[^"]*\\b${s.slice(1)}\\b[^"]*"`), `index.html is missing class "${s.slice(1)}"`);
  }
});

test('every data-chrome key used in HTML exists in both languages', () => {
  const keys = [...indexHtml.matchAll(/data-chrome(?:-title|-label)?="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(keys.length >= 4, 'expected data-chrome attributes in index.html');
  for (const k of keys) {
    assert.ok(TEXT.de.chrome[k], `TEXT.de.chrome.${k} missing (used in index.html)`);
    assert.ok(TEXT.en.chrome[k], `TEXT.en.chrome.${k} missing (used in index.html)`);
  }
});

test('main.js chrome lookups are all defined in commands.js', () => {
  const lookedUp = [...mainJs.matchAll(/(?:t|T\(\))\.chrome\.(\w+)/g)].map((m) => m[1]);
  const unique = [...new Set(lookedUp)];
  assert.ok(unique.length >= 3);
  for (const k of unique) {
    assert.ok(TEXT.de.chrome[k] !== undefined, `main.js uses chrome.${k} but TEXT.de.chrome.${k} is undefined`);
    assert.ok(TEXT.en.chrome[k] !== undefined, `main.js uses chrome.${k} but TEXT.en.chrome.${k} is undefined`);
  }
});

/* ---------- desktop structure ---------- */

test('terminal window has the three classic controls at the top right', () => {
  for (const id of ['win-min', 'win-max', 'win-close']) {
    assert.match(indexHtml, new RegExp(`id="${id}"`), `index.html missing window control #${id}`);
  }
  // the buttons share one style (.win-btn) and the close button gets its own hover tint
  assert.match(styleCss, /\.win-btn\s*\{/, 'style.css missing .win-btn styling');
  assert.match(styleCss, /\.win-close:hover/, 'style.css missing the close-button hover style');
  // controls container must sit at the titlebar's right end
  assert.match(styleCss, /\.term-controls\s*\{[^}]*margin-left:\s*auto/, '.term-controls must be pushed right (margin-left: auto)');
});

test('desk icons cover the important links as plain HTML links', () => {
  assert.match(indexHtml, /desk-icon[^>]*href="mailto:/, 'mail must be a desk icon');
  assert.match(indexHtml, /desk-icon[^>]*href="https:\/\/github\.com\/GitMinIT"/, 'github must be a desk icon');
  assert.match(indexHtml, /desk-icon[^>]*href="\/impressum"/, 'impressum must be a desk icon');
  assert.match(indexHtml, /desk-icon[^>]*href="\/datenschutz"/, 'datenschutz must be a desk icon');
});

test('window state classes exist in CSS and are toggled by main.js', () => {
  assert.match(styleCss, /\.term-window\.minimized/, 'CSS must support the minimized state');
  assert.match(styleCss, /\.term-window\.maximized/, 'CSS must support the maximized state');
  assert.match(mainJs, /classList\.add\('minimized'\)/, 'main.js must add minimized on close');
  assert.match(mainJs, /classList\.remove\('minimized'\)/, 'main.js must remove minimized to restore');
  assert.match(mainJs, /classList\.(add|remove)\('maximized'\)/, 'main.js must switch the maximized class');
});

test('window is draggable via the titlebar and clamped to the desktop', () => {
  assert.match(styleCss, /\.term-titlebar\s*\{[^}]*cursor:\s*grab/, 'titlebar must signal draggability (cursor: grab)');
  assert.match(styleCss, /\.term-window\.moved/, 'CSS must switch the window to absolute positioning when dragged');
  assert.match(mainJs, /function initDrag/, 'main.js must implement initDrag');
  assert.match(mainJs, /\.term-titlebar/, 'initDrag must bind to the titlebar');
  assert.match(mainJs, /setPointerCapture/, 'drag must use pointer capture');
  assert.match(mainJs, /classList\.add\('moved'\)/, 'drag must mark the window as moved');
  assert.match(mainJs, /clampToDesktop/, 'drag position must be clamped to the desktop');
  // the window controls must not start a drag
  assert.match(mainJs, /e\.target\.closest\('\.win-btn'\)/, 'drag must ignore clicks on window controls');
});

test('window is resizable via a corner handle with sane bounds', () => {
  assert.match(styleCss, /\.resize-handle\s*\{/, 'CSS must style the resize handle');
  assert.match(styleCss, /\.resize-handle\s*\{[^}]*cursor:\s*nwse-resize/, 'handle must show the resize cursor');
  assert.match(mainJs, /function initResize/, 'main.js must implement initResize');
  assert.match(mainJs, /resize-handle/, 'main.js must create the resize handle');
  assert.match(mainJs, /MIN_W\s*=\s*320/, 'resize needs a minimum width constant');
  assert.match(mainJs, /MIN_H\s*=\s*220/, 'resize needs a minimum height constant');
});

test('maximize stashes and restores the previous window geometry', () => {
  assert.match(mainJs, /function stashGeometry/, 'main.js must stash geometry');
  assert.match(mainJs, /function restoreGeometry/, 'main.js must restore geometry');
  assert.match(mainJs, /stashGeometry\(\)/, 'maximize must stash before expanding');
  assert.match(mainJs, /restoreGeometry\(\)/, 'un-maximize must restore the stash');
});

test('maximized window overrides inline width/height/position in CSS', () => {
  for (const prop of ['width', 'height', 'left', 'top']) {
    assert.match(styleCss, new RegExp(`\\.term-window\\.maximized\\s*\\{[^}]*${prop}:[^}]*!important`), `maximized must force ${prop}`);
  }
  assert.match(styleCss, /\.term-window\.maximized \.resize-handle\s*\{\s*display:\s*none/, 'no resizing while maximized');
});

test('english is the default language', () => {
  // engine default
  assert.match(commandsJs, /createRepl\(\{ lang = 'en'/, 'createRepl must default to en');
  // page default
  assert.match(indexHtml, /<html lang="en"/, 'index.html must ship as lang="en"');
  assert.match(indexHtml, /<title>Daniel Hettich — digital business card<\/title>/, 'index title must be English');
  // main.js: unknown saved pref and non-DE browser locale must fall back to en
  assert.match(mainJs, /navigator\.language \|\| 'en'/, "browser locale fallback must be 'en'");
  // static visible labels must be English so the first paint matches
  for (const label of ['>mail<', '>github<', '>imprint<', '>privacy<']) {
    assert.ok(indexHtml.includes(label), `static label ${label} must be English`);
  }
  assert.ok(indexHtml.includes('visitor@daniel-home'), 'window title must be English');
});

test('taskbar hosts theme, language and clock', () => {
  assert.match(indexHtml, /id="theme-toggle"/);
  assert.match(indexHtml, /class="tb-lang"/);
  assert.match(indexHtml, /id="tb-clock"/);
  assert.match(mainJs, /tb-clock/, 'main.js must drive the clock');
});

/* ---------- i18n completeness ---------- */

test('all TEXT sections exist in both languages', () => {
  for (const section of ['chrome', 'prompt', 'welcome', 'card']) {
    assert.ok(TEXT.de[section], `TEXT.de.${section} missing`);
    assert.ok(TEXT.en[section], `TEXT.en.${section} missing`);
  }
});

test('every command name the engine claims is handled and has output', () => {
  const names = commandNames();
  for (const c of ['help', 'whoami', 'neofetch', 'ls', 'cat', 'mail', 'github', 'theme', 'lang', 'clear', 'exit', 'konami']) {
    assert.ok(names.includes(c), `commandNames missing ${c}`);
    assert.match(commandsJs, new RegExp(`case '${c}'`), `handle() has no case for '${c}'`);
  }
});

/* ---------- fixed layout: the original resize bug must stay dead ---------- */

test('terminal window keeps a fixed size independent of content', () => {
  assert.match(styleCss, /\.term-window\s*\{[^}]*height:/, '.term-window needs a fixed height');
  assert.match(styleCss, /\.term-output\s*\{[^}]*overflow-y:\s*auto/, '.term-output must scroll (not resize the window)');
  assert.match(styleCss, /\.term-output\s*\{[^}]*min-height:\s*0/, '.term-output must be allowed to shrink (flexbox min-height fix)');
});

test('output lines never use absolute/fixed positioning (the "random spots" bug)', () => {
  const block = styleCss.match(/\.tline\s*\{[^}]*\}/);
  assert.ok(block, '.tline rules missing');
  assert.doesNotMatch(block[0], /position:\s*(absolute|fixed)/, '.tline must stay in normal flow');
});

/* ---------- legal pages keep their meta posture ---------- */

test('legal pages stay noindex and correctly titled', () => {
  for (const { name, html } of legalPages) {
    assert.match(html, /name="robots"\s+content="noindex, follow"/, `${name} must stay noindex`);
    assert.ok(html.includes('daniel-hettich.de</title>'), `${name} title must mention daniel-hettich.de`);
    assert.doesNotMatch(html, /pompui/i, `${name} must not mention pompui (regression)`);
  }
});

test('404 page links back home', () => {
  assert.match(static404.html, /href="\/"/);
});