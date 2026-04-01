document.addEventListener('DOMContentLoaded', function() {
    const select = document.getElementById('language');
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

    function detectOsLang() {
        const langs = navigator.languages || [navigator.language || 'en'];
        for (const l of langs) {
            const code = l.split('-')[0].toLowerCase();
            if (supported.includes(code)) return code;
        }
        return 'en';
    }

    const currentLang = getLangFromPath();
    select.value = currentLang;

    // On first visit (no saved preference) redirect to OS language
    if (!localStorage.getItem('lang')) {
        const osLang = detectOsLang();
        localStorage.setItem('lang', osLang);
        if (osLang !== currentLang) {
            navigateToLang(osLang);
            return;
        }
    }

    select.addEventListener('change', function() {
        const lang = select.value;
        localStorage.setItem('lang', lang);
        navigateToLang(lang);
    });
});
