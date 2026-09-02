async function initLang() {
    const response = await fetch('/lang/translations.json');
    const translations = await response.json();
    
    let currentLang = localStorage.getItem('pref-lang') || 'en';
    
    function setLanguage(lang) {
        document.title = translations[lang].title;
        document.getElementById('welcome').textContent = translations[lang].welcome;
        document.getElementById('description').textContent = translations[lang].description;
        
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        localStorage.setItem('pref-lang', lang);
    }

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });

    setLanguage(currentLang);
}

function initTheme() {
    const savedTheme = localStorage.getItem('pref-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    document.getElementById('theme-toggle').addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('pref-theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

window.addEventListener('DOMContentLoaded', () => {
    initLang();
    initTheme();
});
