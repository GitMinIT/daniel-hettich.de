async function initLang() {
    const fallbackLang = 'en';
    let currentLang = localStorage.getItem('pref-lang') || 'de';
    
    async function loadTranslation(lang) {
        try {
            const response = await fetch(`/lang/${lang}.json`);
            if (!response.ok) throw new Error('Language file not found');
            return await response.json();
        } catch (e) {
            console.warn(`Could not load ${lang}, falling back to ${fallbackLang}`);
            const response = await fetch(`/lang/${fallbackLang}.json`);
            return await response.json();
        }
    }

    async function setLanguage(lang) {
        const translations = await loadTranslation(lang);
        document.title = translations.title;
        document.getElementById('welcome').textContent = translations.welcome;
        document.getElementById('description').textContent = translations.description;
        
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
