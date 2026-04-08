document.addEventListener('DOMContentLoaded', function() {
    const select = document.getElementById('language');
    if (!select) {
        return;
    }

    const supported = ['en', 'de', 'ja'];

    function getLangFromPath() {
        const parts = location.pathname.split('/').filter(x => x);
        return supported.includes(parts[0]) ? parts[0] : 'en';
    }

    function navigateToLang(lang) {
        const parts = location.pathname.split('/').filter(x => x);
        if (supported.includes(parts[0])) {
            parts[0] = lang;
        } else {
            parts.unshift(lang);
        }
        location.href = '/' + parts.join('/') + location.search + location.hash;
    }

    const currentLang = getLangFromPath();
    select.value = currentLang;

    select.addEventListener('change', function() {
        const lang = select.value;
        localStorage.setItem('lang', lang);
        navigateToLang(lang);
    });
});
