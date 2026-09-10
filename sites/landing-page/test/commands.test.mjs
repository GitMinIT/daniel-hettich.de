import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRepl, card, cat, boot, commandNames, EMAIL, GITHUB, TEXT, vmBootScript, bsodContent, qrPattern } from '../assets/js/commands.js';

const plain = (lines) => lines.map((l) => l.s ?? '').filter((s) => s !== undefined);

function replWith(lang = 'de') {
  return createRepl({ lang, now: () => Date.now() });
}

test('exports expose the real contact data', () => {
  assert.equal(EMAIL, 'kontakt@daniel-hettich.de');
  assert.equal(GITHUB, 'https://github.com/GitMinIT');
  assert.ok(GITHUB.startsWith('https://'));
});

test('both languages provide every chrome key', () => {
  const deKeys = Object.keys(TEXT.de.chrome).sort();
  const enKeys = Object.keys(TEXT.en.chrome).sort();
  assert.deepEqual(deKeys, enKeys);
  for (const k of deKeys) {
    assert.ok(TEXT.de.chrome[k], `de.chrome.${k} empty`);
    assert.ok(TEXT.en.chrome[k], `en.chrome.${k} empty`);
  }
});

test('help lists all core commands in both languages', () => {
  for (const lang of ['de', 'en']) {
    const out = plain(replWith(lang).execute('help').lines).join('\n');
    for (const c of ['whoami', 'neofetch', 'ls', 'cat', 'mail', 'github', 'coffee', 'theme', 'lang', 'clear', 'exit']) {
      assert.ok(out.includes(c), `${lang}: help missing "${c}"`);
    }
  }
});

test('mail command yields a mailto link with the real address', () => {
  const res = replWith('de').execute('mail');
  const link = res.lines.find((l) => l.href);
  assert.ok(link);
  assert.equal(link.href, `mailto:${EMAIL}`);
  assert.equal(link.s, EMAIL);
});

test('github command yields the profile link', () => {
  const res = replWith('en').execute('github');
  const link = res.lines.find((l) => l.href);
  assert.equal(link.href, GITHUB);
});

test('impressum and datenschutz navigate to legal pages', () => {
  for (const lang of ['de', 'en']) {
    assert.equal(replWith(lang).execute('impressum').lines.find((l) => l.href).href, '/impressum');
    assert.equal(replWith(lang).execute('datenschutz').lines.find((l) => l.href).href, '/datenschutz');
  }
});

test('cat reads the bundled files', () => {
  assert.ok(cat('katze.txt', 'de').join('\n').includes('miau'));
  assert.ok(cat('README.md', 'en').join('\n').includes('business card'));
  assert.equal(plain(replWith('de').execute('cat geheim.txt').lines).length, 2);
});

test('cat with unknown file errors politely', () => {
  const res = replWith('de').execute('cat gibtsgarnicht.txt');
  assert.equal(res.lines[0].t, 'err');
  assert.ok(plain(res.lines)[0].includes('gibtsgarnicht.txt'));
});

test('cat without operand errors', () => {
  assert.equal(replWith('en').execute('cat').lines[0].t, 'err');
});

test('empty input is a no-op', () => {
  const res = replWith('de').execute('   ');
  assert.deepEqual(res.lines, []);
  assert.deepEqual(res.actions, {});
});

test('unknown commands produce an error plus a hint', () => {
  const res = replWith('de').execute('fluffy');
  assert.equal(res.lines[0].t, 'err');
  assert.ok(plain(res.lines)[0].includes('fluffy'));
  assert.equal(res.lines.length, 2);
});

test('sudo refuses and reports the incident', () => {
  for (const lang of ['de', 'en']) {
    const res = replWith(lang).execute('sudo make me a sandwich');
    assert.ok(res.lines.every((l) => l.t === 'err'));
    assert.ok(plain(res.lines)[0].toLowerCase().includes('sudoers'));
  }
});

test('sudo rm -rf gets the special refusal', () => {
  assert.ok(plain(replWith('en').execute('sudo rm -rf /').lines).join('\n').includes('nice try'));
});

test('plain rm is refused too', () => {
  assert.equal(replWith('de').execute('rm -rf /').lines[0].t, 'err');
});

test('vim escape hatch exists', () => {
  assert.ok(plain(replWith('en').execute('vim').lines).join('\n').includes(':q!'));
});

test('exit announces the goodbye and requests a window close', () => {
  for (const lang of ['de', 'en']) {
    const res = replWith(lang).execute('exit');
    assert.equal(res.lines.length, 1);
    assert.ok(res.lines[0].s.length > 0);
    assert.equal(res.actions.close, true, 'exit must set actions.close');
    // closing must not also clear the screen — the user should see the goodbye
    assert.equal(res.actions.clear, undefined);
  }
});

test('logout behaves like exit', () => {
  assert.equal(replWith('en').execute('logout').actions.close, true);
});

test('coffee brews in steps and ends with a cup', () => {
  const out = plain(replWith('de').execute('coffee').lines).join('\n');
  assert.ok(out.includes('25 %') && out.includes('50 %') && out.includes('80 %'));
  assert.ok(out.includes('☕'));
});

test('echo returns the argument text verbatim', () => {
  assert.equal(plain(replWith('de').execute('echo hallo welt').lines)[0], 'hallo welt');
});

test('echo with no args prints an empty line', () => {
  const res = replWith('de').execute('echo');
  assert.equal(res.lines.length, 1);
  assert.equal(res.lines[0].t, 'gap');
  assert.equal(plain(res.lines)[0], '');
});

test('history records commands and numbers them', () => {
  const r = replWith('de');
  r.execute('pwd');
  r.execute('whoami');
  const out = plain(r.execute('history').lines);
  assert.ok(out[1].includes('1') && out[1].includes('pwd'));
  assert.ok(out[2].includes('2') && out[2].includes('whoami'));
});

test('history is empty before any command', () => {
  const res = replWith('de').execute('history');
  assert.equal(res.lines.length, 1);
  assert.equal(res.lines[0].t, 'dim');
});

test('clear emits the clear action', () => {
  const res = replWith('de').execute('clear');
  assert.equal(res.actions.clear, true);
  assert.equal(res.lines.length, 0);
});

test('theme toggles dark -> light -> dark', () => {
  const r = replWith('de');
  assert.equal(r.execute('theme').actions.theme, 'light');
  assert.equal(r.execute('theme').actions.theme, 'dark');
  assert.equal(r.state.theme, 'dark');
});

test('theme accepts explicit values and rejects others', () => {
  const r = replWith('de');
  assert.equal(r.execute('theme dark').actions.theme, 'dark');
  assert.equal(r.execute('theme light').actions.theme, 'light');
  assert.equal(r.execute('theme disco').lines[0].t, 'err');
});

test('lang switches language and answers in it', () => {
  const r = replWith('de');
  assert.equal(r.execute('lang en').actions.lang, 'en');
  assert.equal(r.execute('lang').actions.lang, 'de');
  assert.equal(r.execute('lang fr').lines[0].t, 'err');
  assert.equal(r.state.lang, 'de');
});

test('uptime counts seconds since boot', () => {
  let t = 1000;
  const r = createRepl({ lang: 'de', now: () => t });
  t = 4250;
  assert.ok(plain(r.execute('uptime').lines)[0].includes('3'));
});

test('boot is a last-login welcome containing the card and hint', () => {
  for (const lang of ['de', 'en']) {
    const w = boot(lang);
    assert.ok(w.length >= 4, `${lang}: welcome too short`);
    assert.ok(w.some((l) => l.t === 'card'), `${lang}: welcome must show the card`);
    assert.ok(w.some((l) => l.t === 'dim' && /help/.test(l.s)), `${lang}: welcome must hint at help`);
  }
});

test('card carries name, mail link and github link in both languages', () => {
  for (const lang of ['de', 'en']) {
    const c = card(lang);
    assert.equal(c.name, 'Daniel Hettich');
    assert.equal(c.rows.find((r) => r.k === 'mail').href, `mailto:${EMAIL}`);
    assert.equal(c.rows.find((r) => r.k === 'github').href, GITHUB);
    assert.ok(c.art.length >= 5);
    assert.ok(c.swatches.length >= 4);
  }
});

test('commandNames covers everything the help promises', () => {
  const names = commandNames();
  for (const c of ['help', 'whoami', 'neofetch', 'ls', 'cat', 'mail', 'github', 'coffee', 'theme', 'lang', 'clear', 'exit', 'konami']) {
    assert.ok(names.includes(c), `missing ${c}`);
  }
});

test('neofetch reprints the card', () => {
  const res = replWith('de').execute('neofetch');
  assert.ok(res.lines.some((l) => l.t === 'card'));
});

test('ls lists the bundled files', () => {
  const out = plain(replWith('en').execute('ls').lines)[0];
  for (const f of ['README.md', 'katze.txt', 'kontakt.txt']) {
    assert.ok(out.includes(f), `ls missing ${f}`);
  }
});

/* ---------- windows-vm joke ---------- */

test('vm boot script boots in both languages and ends in the bsod', () => {
  for (const lang of ['de', 'en']) {
    const steps = vmBootScript(lang);
    assert.ok(steps.length >= 8, `${lang}: boot too short to be funny`);
    assert.ok(steps.every((s) => typeof s.delay === 'number' && s.delay >= 0));
    assert.equal(steps[steps.length - 1].t, 'bsod', 'boot must end with the bsod step');
    assert.ok(steps.filter((s) => s.t === 'line').length >= 6, 'boot needs several console lines');
    // the "almost there" gag must be in there at least twice
    const gags = steps.filter((s) => /almost there/.test(s.s));
    assert.ok(gags.length >= 2, `${lang}: "almost there" must repeat at least twice`);
  }
});

test('bsod content carries the classics in both languages', () => {
  for (const lang of ['de', 'en']) {
    const b = bsodContent(lang);
    assert.equal(b.emoji, ':(');
    assert.ok(b.text.length >= 40, 'bsod text should sound like the real thing');
    assert.match(b.code, /^COZY_VM_FAIL_0xC0FFEE$/);
    assert.ok(b.progress.includes('%'));
    assert.ok(b.stop.length > 0);
  }
});

test('bsod content differs between languages but keeps the error code', () => {
  const de = bsodContent('de');
  const en = bsodContent('en');
  assert.notEqual(de.text, en.text);
  assert.equal(de.code, en.code);
});

test('qr pattern is deterministic and looks like a QR code', () => {
  const a = qrPattern(42);
  const b = qrPattern(42);
  assert.deepEqual(a, b, 'same seed must produce the same QR (no rng drift between renders)');
  assert.equal(a.length, 21);
  assert.ok(a.every((row) => row.length === 21));
  // finder patterns: the three corners must have the classic 7x7 rings
  const corner = (ox, oy) => {
    const ring = Math.max(Math.abs(ox - 3), Math.abs(oy - 3));
    return ring === 1 ? 0 : 1;
  };
  for (const [ox, oy] of [[0, 0], [14, 0], [0, 14]]) {
    for (let dy = 0; dy < 7; dy++) {
      for (let dx = 0; dx < 7; dx++) {
        assert.equal(a[oy + dy][ox + dx], corner(dx, dy), `finder pixel mismatch at ${ox},${oy}`);
      }
    }
  }
  assert.notDeepEqual(a, qrPattern(7), 'different seed should produce a different pattern');
});

test('vm texts exist in both languages with toast copy', () => {
  for (const lang of ['de', 'en']) {
    const vm = TEXT[lang].vm;
    assert.ok(vm.toast_title);
    assert.ok(vm.toast_body.length > 10);
    assert.ok(vm.toast_aria);
    assert.ok(vm.boot.length >= 8);
    assert.ok(vm.bsod);
  }
});