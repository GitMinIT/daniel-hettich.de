/* Shared bits for legal pages (no terminal there). */
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    const saved = localStorage.getItem('pref-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    const setIcon = (t) => {
        themeToggle.textContent = t === 'dark' ? '☀' : '☾';
    };
    setIcon(saved);
    themeToggle.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('pref-theme', next);
        setIcon(next);
    });
}