export const EMAIL = 'kontakt@daniel-hettich.de';
export const GITHUB = 'https://github.com/GitMinIT';
export const GITHUB_LABEL = 'github.com/GitMinIT';

const HOUSE = [
  '     ~ )',
  '     ( ~',
  '     ____',
  '    /    \\',
  '   /______\\',
  '   |  __  |',
  '   | |  | |',
  '   | |__| |',
  '   |  __  |',
  '   |__|  |_|'
];

const SWATCHES = ['#e8a860', '#f0c090', '#d97a6a', '#c9a3c4', '#a8c07a', '#7a9e6b', '#a08a70', '#5a4a3a'];

const FILES = {
  'readme.md': {
    de: ['daniel-hettich.de — digitale visitekarte.', 'vanilla html/css/js. kein framework, keine cookies.', 'quellcode: github.com/GitMinIT'],
    en: ['daniel-hettich.de — digital business card.', 'vanilla html/css/js. no framework, no cookies.', 'source code: github.com/GitMinIT']
  },
  'ideen.md': {
    de: ['- homelab aufräumen (irgendwann, ehrlich)', '- garten-journal weiter tüfteln', '- diese besucher-shell um easter-eggs erweitern', '- noch einen kaffee holen'],
    en: ['- tidy up the homelab (eventually, honestly)', '- keep tinkering on the garden journal', '- add more easter eggs to this visitor shell', '- get another coffee']
  },
  'katze.txt': {
    de: ['    /\\_/\\', '   ( o.o )', '    > ^ <', '', 'miau. :3'],
    en: ['    /\\_/\\', '   ( o.o )', '    > ^ <', '', 'meow. :3']
  },
  'kontakt.txt': {
    de: ['mail: kontakt@daniel-hettich.de', 'antwort kommt meist schnell — versprochen.', 'github: github.com/GitMinIT'],
    en: ['mail: kontakt@daniel-hettich.de', 'replies are usually quick — promise.', 'github: github.com/GitMinIT']
  },
  'geheim.txt': {
    de: ['hier steht nichts geheimes.', 'aber schön, dass du nachgeschaut hast. ☕'],
    en: ['nothing secret in here.', 'but nice of you to check. ☕']
  }
};

export const TEXT = {
  de: {
    chrome: {
      window_title: 'besucher@daniel-home: ~',
      input_aria: 'Terminal-Eingabe',
      output_aria: 'Terminal-Ausgabe',
      theme_to_dark: 'auf gemütlich-dunkel umschalten',
      theme_to_light: 'auf papier-hell umschalten',
      theme_btn: 'lichtschalter',
      title: 'Daniel Hettich — digitale visitekarte',
      taskbar_os: 'gemütlich-os',
      taskbar_clock_fmt: 'de-DE',
      hint: 'tippe "help" für alle befehle.',
      made: 'handgemacht — kein framework, keine cookies, kein tracking',
      ai_note: '✳ mit ki gebaut',
      impressum: 'impressum',
      datenschutz: 'datenschutz',
      icon_gh_label: 'github',
      icon_mail_label: 'kontakt',
      icon_imp_label: 'impressum',
      icon_dat_label: 'datenschutz',
      icon_term_label: 'terminal',
      win_min: 'minimieren',
      win_max: 'maximieren',
      win_close: 'schließen',
      win_imp_title: 'Impressum',
      win_dat_title: 'Datenschutzerklärung',
      vm_open: 'Windows-VM öffnen'
    },
    prompt: { user: 'besucher', host: 'daniel-home' },
    welcome: [
      { t: 'dim', s: 'letzte anmeldung: gerade, von deinem browser' },
      { t: 'dim', s: 'willkommen! alles ist ein bisschen gemütlicher als in einem richtigen terminal.' },
      { t: 'gap' },
      { t: 'card' },
      { t: 'gap' },
      { t: 'dim', s: 'tippe "help" für alle befehle.' }
    ],
    help: [
      'befehle:',
      '  help                diese liste',
      '  whoami              wer hier wohnt',
      '  neofetch            visitekarte nochmal zeigen',
      '  ls · cat <datei>    in den dateien stöbern',
      '  mail · github       kontakt aufnehmen',
      '  impressum · datenschutz   das kleingedruckte',
      '  coffee              ☕ kaffee kochen',
      '  theme · lang [de|en]  licht & sprache umschalten',
      '  echo · date · uptime · ping · pwd · history   kleinkram',
      '  clear               aufräumen',
      '  exit                fenster schließen'
    ],
    whoami: 'daniel. tüftelt an linux, docker und allem mit steckdose — am liebsten im eigenen homelab. diese seite: handgemacht, ohne framework, mit herz. post ist immer willkommen.',
    ls_line: 'README.md  ideen.md  katze.txt  kontakt.txt  geheim.txt',
    ls_la_extra: '… und auch mit -la: keine versteckten dateien. ehrlich.',
    cat_missing: 'cat: fehlender operand (versuch: cat katze.txt)',
    cat_not_found: (f) => `cat: ${f}: datei nicht gefunden`,
    sudo: ['besucher ist nicht in der sudoers-datei. dieser vorfall wird gemeldet.', '(entspann — ich hab es nur dem kaffee erzählt.)'],
    sudo_rm: ['nice try.', 'sudo: verweigert. rm: auch. der kaffee bleibt, du bleibst.'],
    rm: ['rm: verweigert. so gemütlich ist diese shell dann auch wieder nicht.'],
    vim: ['vim geöffnet …', 'keine panik: :q! wurde für dich ausgeführt. diesmal.'],
    nano: ['nano? mutig. hier gibt es nichts zu bearbeiten — aber der mut zählt.'],
    emacs: ['emacs ist kein editor, das ist ein betriebssystem.', 'hier gibt es nur kaffee.'],
    exit: 'tschüss! bis bald — das fenster schließt sich gleich.',
    q: [':q — vim-reflexe: gut. hier ist aber nichts offen.'],
    coffee: ['kaffee wird gebrüht …', '  ░░░░░░░░░░░  25 %', '  ▓▓▓▓▓▓░░░░░  50 %', '  ▓▓▓▓▓▓▓▓▓░░  80 %', '☕ fertig — viel spaß beim stöbern.'],
    ping: 'pong  (0.42 ms — gemütlichkeit hat niedrige latenz)',
    uptime: (s) => `up ${s} s — system läuft auf kaffee.`,
    date_fmt: 'de-DE',
    pwd: '/home/besucher',
    history_head: 'verlauf:',
    history_empty: 'verlauf ist leer — fang einfach an.',
    theme_now: { dark: 'lichtschalter: gemütlich-dunkel.', light: 'lichtschalter: papier-hell.' },
    lang_set: 'sprache: deutsch.',
    lang_bad: "lang: nur 'de' oder 'en'.",
    theme_bad: "theme: nur 'dark' oder 'light'.",
    unknown: (c) => [`befehl nicht gefunden: ${c}`, "'help' zeigt dir, was es alles gibt."],
    konami: ['↑↑↓↓←→←→ba — klassiker!', 'belohnung: der kaffee war gratis. ☕'],
    git: ['diese seite lebt im git:', 'github.com/GitMinIT'],
    man: 'man: keine man-pages hier. "help" hilft weiter.',
    su: 'su: willkommen, gast. root wirst du hier trotzdem nicht.',
    mail: ['schreib mir:', 'kontakt@daniel-hettich.de'],
    mail_hint: 'antwort kommt meistens schnell.',
    github_cmd: ['mein code:', 'github.com/GitMinIT'],
    github_hint: 'sternchen sind willkommen.',
    impressum_cmd: '→ impressum',
    datenschutz_cmd: '→ datenschutz',
    echo_empty: '',
    vm: {
      toast_title: 'gemütlich-os · hypervisor',
      toast_body: 'Die Windows-VM ist hochgefahren und bereit. Viel Spaß damit.',
      toast_aria: 'Hinweis: Windows-VM ist bereit.',
      boot: [
        'cozy-hypervisor v1.3 — qemu 8.2 (gemütlich fork)',
        'vm "windows11_gast" startet …',
        ' allocating 4 GB ram … ok',
        ' attaching disk0 (virtio) … ok',
        ' attaching network (user-mode, throtted to gemütlich) … ok',
        ' seabios: booting from hard disk …',
        ' windows boot manager …',
        ' loading kernel …',
        ' starting services …',
        ' almost there …',
        ' almost there …',
        ' almost there …'
      ],
      bsod: {
        emoji: ':(',
        text: 'Dein PC ist auf ein Problem gestoßen und muss neu gestartet werden. Wir sammeln nur einige Fehlerinfos und starten dann für dich neu.',
        progress: '% fertiggestellt',
        code: 'COZY_VM_FAIL_0xC0FFEE',
        hint: 'Falls du einen Support-Mitarbeiter anrufst, gib ihm diese Info:',
        stop: 'Vorgang beendet: GEMÜTLICH_BOOT'
      }
    },
    card: {
      name: 'Daniel Hettich',
      tagline: 'tüftler · homelab · linux',
      rows: [
        { k: 'mail' },
        { k: 'github' },
        { k: 'shell', v: '/bin/gemütlich' },
        { k: 'uptime', v: 'läuft auf kaffee' },
        { k: 'pakete', v: 'linux, docker, diy, selfhosting' }
      ]
    }
  },
  en: {
    chrome: {
      window_title: 'visitor@daniel-home: ~',
      input_aria: 'terminal input',
      output_aria: 'terminal output',
      theme_to_dark: 'switch to cozy-dark',
      theme_to_light: 'switch to paper-light',
      theme_btn: 'light switch',
      title: 'Daniel Hettich — digital business card',
      taskbar_os: 'cozy-os',
      taskbar_clock_fmt: 'en-GB',
      hint: 'type "help" for all commands.',
      made: 'handmade — no framework, no cookies, no tracking',
      ai_note: '✳ built with a little ai help',
      impressum: 'imprint',
      datenschutz: 'privacy',
      icon_gh_label: 'github',
      icon_mail_label: 'mail',
      icon_imp_label: 'imprint',
      icon_dat_label: 'privacy',
      icon_term_label: 'terminal',
      win_min: 'minimize',
      win_max: 'maximize',
      win_close: 'close',
      win_imp_title: 'Imprint',
      win_dat_title: 'Privacy',
      vm_open: 'Open the Windows VM'
    },
    prompt: { user: 'visitor', host: 'daniel-home' },
    welcome: [
      { t: 'dim', s: 'last login: just now, from your browser' },
      { t: 'dim', s: 'welcome! everything is a bit cozier here than in a real terminal.' },
      { t: 'gap' },
      { t: 'card' },
      { t: 'gap' },
      { t: 'dim', s: 'type "help" for all commands.' }
    ],
    help: [
      'commands:',
      '  help                this list',
      '  whoami              who lives here',
      '  neofetch            show the card again',
      '  ls · cat <file>     browse the files',
      '  mail · github       get in touch',
      '  impressum · datenschutz    the fine print',
      '  coffee              ☕ brew coffee',
      '  theme · lang [de|en]  toggle light & language',
      '  echo · date · uptime · ping · pwd · history   small stuff',
      '  clear               tidy up',
      '  exit                close window'
    ],
    whoami: 'daniel. tinkers with linux, docker and anything with a power socket — preferably in his own homelab. this page: handmade, no framework, with heart. mail is always welcome.',
    ls_line: 'README.md  ideen.md  katze.txt  kontakt.txt  geheim.txt',
    ls_la_extra: '… and even with -la: no hidden files. honest.',
    cat_missing: 'cat: missing operand (try: cat katze.txt)',
    cat_not_found: (f) => `cat: ${f}: no such file`,
    sudo: ['visitor is not in the sudoers file. this incident will be reported.', '(relax — I only told the coffee about it.)'],
    sudo_rm: ['nice try.', 'sudo: refused. rm: too. the coffee stays, you stay.'],
    rm: ['rm: refused. this shell is cozy, not that cozy.'],
    vim: ['vim opened …', 'don\'t panic: :q! was executed for you. this time.'],
    nano: ['nano? bold. nothing to edit here — but points for courage.'],
    emacs: ['emacs is not an editor, it\'s an operating system.', 'here we only have coffee.'],
    exit: 'bye! see you soon — the window will close in a moment.',
    q: [':q — vim reflexes: nice. nothing is open here, though.'],
    coffee: ['brewing coffee …', '  ░░░░░░░░░░░  25 %', '  ▓▓▓▓▓▓░░░░░  50 %', '  ▓▓▓▓▓▓▓▓▓░░  80 %', '☕ done — enjoy your stay.'],
    ping: 'pong  (0.42 ms — coziness has low latency)',
    uptime: (s) => `up ${s} s — system runs on coffee.`,
    date_fmt: 'en-GB',
    pwd: '/home/visitor',
    history_head: 'history:',
    history_empty: 'history is empty — just start typing.',
    theme_now: { dark: 'light switch: cozy-dark.', light: 'light switch: paper-light.' },
    lang_set: 'language: english.',
    lang_bad: "lang: only 'de' or 'en'.",
    theme_bad: "theme: only 'dark' or 'light'.",
    unknown: (c) => [`command not found: ${c}`, "'help' shows you what's available."],
    konami: ['↑↑↓↓←→←→ba — a classic!', 'reward: the coffee was free. ☕'],
    git: ['this page lives in git:', 'github.com/GitMinIT'],
    man: 'man: no man pages here. "help" helps.',
    su: 'su: welcome, guest. root you shall not become.',
    mail: ['write me:', 'kontakt@daniel-hettich.de'],
    mail_hint: 'replies are usually quick.',
    github_cmd: ['my code:', 'github.com/GitMinIT'],
    github_hint: 'stars are welcome.',
    impressum_cmd: '→ imprint',
    datenschutz_cmd: '→ privacy policy',
    echo_empty: '',
    vm: {
      toast_title: 'cozy-os · hypervisor',
      toast_body: 'The Windows VM has booted and is ready. Enjoy responsibly.',
      toast_aria: 'Notice: Windows VM is ready.',
      boot: [
        'cozy-hypervisor v1.3 — qemu 8.2 (gemütlich fork)',
        'booting vm "windows11_guest" …',
        ' allocating 4 GB ram … ok',
        ' attaching disk0 (virtio) … ok',
        ' attaching network (user-mode, throttled to cozy) … ok',
        'seabios: booting from hard disk …',
        'windows boot manager …',
        ' loading kernel …',
        ' starting services …',
        ' almost there …',
        ' almost there …',
        ' almost there …'
      ],
      bsod: {
        emoji: ':(',
        text: 'Your PC ran into a problem and needs to restart. We are just collecting some error info, and then we will restart for you.',
        progress: '% complete',
        code: 'COZY_VM_FAIL_0xC0FFEE',
        hint: 'If you call a support person, give them this info:',
        stop: 'Failure: COZY_BOOT'
      }
    },
    card: {
      name: 'Daniel Hettich',
      tagline: 'tinkerer · homelab · linux',
      rows: [
        { k: 'mail' },
        { k: 'github' },
        { k: 'shell', v: '/bin/friendly' },
        { k: 'uptime', v: 'running on coffee' },
        { k: 'packages', v: 'linux, docker, diy, selfhosting' }
      ]
    }
  }
};

const CMD_LIST = ['help', 'whoami', 'neofetch', 'ls', 'cat', 'mail', 'github', 'impressum', 'datenschutz', 'coffee', 'theme', 'lang', 'echo', 'date', 'uptime', 'ping', 'pwd', 'history', 'clear', 'exit', 'konami'];

export function boot(lang) {
  return TEXT[lang].welcome;
}

export function card(lang) {
  const t = TEXT[lang].card;
  return {
    name: t.name,
    tagline: t.tagline,
    art: HOUSE,
    swatches: SWATCHES,
    rows: t.rows.map((r) => {
      if (r.k === 'mail') return { k: r.k, v: EMAIL, href: `mailto:${EMAIL}` };
      if (r.k === 'github') return { k: r.k, v: GITHUB_LABEL, href: GITHUB };
      return { ...r };
    })
  };
}

export function cat(file, lang) {
  const entry = FILES[String(file).toLowerCase()];
  return entry ? entry[lang] || null : null;
}

export function commandNames() {
  return [...CMD_LIST];
}

/* ================= windows-vm joke (pure) ================= */

/** deterministic fake-QR pattern (21x21 + quiet zone), same on every boot */
export function qrPattern(seed = 42, size = 21) {
  const rnd = mulberry32(seed);
  const grid = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      const finder =
        (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
      if (finder) {
        const fx = x < 7 ? x : x - (size - 7);
        const fy = y < 7 ? y : y - (size - 7);
        const ring = Math.max(Math.abs(fx - 3), Math.abs(fy - 3));
        row.push(ring === 1 ? 0 : 1);
        continue;
      }
      row.push(rnd() < 0.45 ? 1 : 0);
    }
    grid.push(row);
  }
  return grid;
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** vm boot steps for the console renderer: fixed boot lines, then the bsod */
export function vmBootScript(lang, seed = 42) {
  const t = TEXT[lang].vm;
  const steps = [];
  t.boot.forEach((s, i) => {
    steps.push({ t: 'line', s, delay: i === 0 ? 150 : 260 + (s.includes('almost there') ? 420 : 0) });
  });
  steps.push({ t: 'line', s: '', delay: 300 });
  steps.push({ t: 'bsod', delay: 150 });
  return steps;
}

export function bsodContent(lang) {
  return TEXT[lang].vm.bsod;
}

export function createRepl({ lang = 'en', theme = 'dark', now = () => Date.now() } = {}) {
  const state = { lang, theme, started: now(), history: [] };
  const T = () => TEXT[state.lang];

  const txt = (s, href) => (href ? { t: 'text', s, href } : { t: 'text', s });
  const dim = (s) => ({ t: 'dim', s });
  const err = (s) => ({ t: 'err', s });
  const gap = () => ({ t: 'gap' });

  function run(raw) {
    const input = String(raw).trim();
    if (!input) return { lines: [], actions: {} };
    const parts = input.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    if (cmd !== 'history') {
      state.history.push(input);
      if (state.history.length > 100) state.history.shift();
    }
    const args = parts.slice(1);
    const argStr = args.join(' ');
    return handle(cmd, args, argStr, input);
  }

  function handle(cmd, args, argStr, input) {
    const t = T();
    switch (cmd) {
      case 'help': {
        const lines = t.help.map((s) => txt(s));
        lines.push(gap(), txt(t.hint));
        return { lines, actions: {} };
      }
      case 'whoami':
        return { lines: [txt(t.whoami)], actions: {} };
      case 'neofetch':
        return { lines: [{ t: 'card' }, gap()], actions: {} };
      case 'ls': {
        const lines = [txt(t.ls_line)];
        if (args.some((a) => /^-/.test(a))) lines.push(dim(t.ls_la_extra));
        return { lines, actions: {} };
      }
      case 'cat': {
        if (!args.length) return { lines: [err(t.cat_missing)], actions: {} };
        const f = args[0];
        const content = cat(f, state.lang);
        if (!content) return { lines: [err(t.cat_not_found(f))], actions: {} };
        return { lines: content.map((s) => txt(s)), actions: {} };
      }
      case 'mail': {
        return { lines: [dim(t.mail[0]), txt(EMAIL, `mailto:${EMAIL}`), dim(t.mail_hint)], actions: {} };
      }
      case 'github': {
        return { lines: [dim(t.github_cmd[0]), txt(GITHUB_LABEL, GITHUB), dim(t.github_hint)], actions: {} };
      }
      case 'git': {
        return { lines: [dim(t.git[0]), txt(GITHUB_LABEL, GITHUB)], actions: {} };
      }
      case 'impressum':
        return { lines: [txt(t.impressum_cmd, '/impressum')], actions: {} };
      case 'datenschutz':
        return { lines: [txt(t.datenschutz_cmd, '/datenschutz')], actions: {} };
      case 'coffee':
        return { lines: t.coffee.map((s, i) => (i === 0 ? dim(s) : txt(s))), actions: {} };
      case 'sudo': {
        const isRm = input.toLowerCase().includes('rm -rf');
        return { lines: (isRm ? t.sudo_rm : t.sudo).map((s) => err(s)), actions: {} };
      }
      case 'rm': {
        const isRf = input.toLowerCase().includes('rm -rf');
        return { lines: (isRf ? t.sudo_rm.slice(1) : t.rm).map((s) => err(s)), actions: {} };
      }
      case 'vim':
        return { lines: t.vim.map((s) => txt(s)), actions: {} };
      case 'nano':
        return { lines: [txt(t.nano)], actions: {} };
      case 'emacs':
        return { lines: t.emacs.map((s) => txt(s)), actions: {} };
      case ':q':
        return { lines: t.q.map((s) => txt(s)), actions: {} };
      case 'exit':
      case 'logout':
        return { lines: [txt(t.exit)], actions: { close: true } };
      case 'clear':
        return { lines: [], actions: { clear: true } };
      case 'echo': {
        return { lines: argStr ? [txt(argStr)] : [gap()] };
      }
      case 'date': {
        const d = new Date(now());
        return { lines: [txt(d.toLocaleString(t.date_fmt))], actions: {} };
      }
      case 'uptime': {
        const secs = Math.max(0, Math.round((now() - state.started) / 1000));
        return { lines: [txt(t.uptime(secs))], actions: {} };
      }
      case 'ping':
        return { lines: [txt(t.ping)], actions: {} };
      case 'pwd':
        return { lines: [txt(t.pwd)], actions: {} };
      case 'su':
        return { lines: [txt(t.su)], actions: {} };
      case 'man':
        return { lines: [dim(t.man)], actions: {} };
      case 'history': {
        if (!state.history.length) return { lines: [dim(t.history_empty)], actions: {} };
        const lines = [dim(t.history_head)];
        state.history.forEach((h, i) => lines.push(txt(`  ${i + 1}  ${h}`)));
        return { lines, actions: {} };
      }
      case 'theme': {
        let next;
        if (!args.length) next = state.theme === 'dark' ? 'light' : 'dark';
        else if (args[0] === 'dark' || args[0] === 'light') next = args[0];
        else return { lines: [err(t.theme_bad)], actions: {} };
        state.theme = next;
        return { lines: [dim(t.theme_now[next])], actions: { theme: next } };
      }
      case 'lang': {
        let next;
        if (!args.length) next = state.lang === 'de' ? 'en' : 'de';
        else if (args[0] === 'de' || args[0] === 'en') next = args[0];
        else return { lines: [err(t.lang_bad)], actions: {} };
        state.lang = next;
        return { lines: [dim(TEXT[next].lang_set)], actions: { lang: next } };
      }
      case 'konami':
        return { lines: t.konami.map((s) => txt(s)), actions: {} };
      default:
        return { lines: t.unknown(cmd).map((s, i) => (i === 0 ? err(s) : dim(s))), actions: {} };
    }
  }

  return { state, execute: run };
}