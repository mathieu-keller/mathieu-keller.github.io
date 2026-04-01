document.addEventListener('DOMContentLoaded', function() {
    const themeSelect = document.getElementById('theme');
    const schemeSelect = document.getElementById('scheme');

    function applyTheme(theme, scheme) {
        const name = scheme === 'default' ? theme : theme === 'dark' ? `${scheme}-dark` : scheme;
        document.documentElement.dataset.theme = name;
    }

    function syncSelects(saved) {
        if (saved.endsWith('-dark')) {
            schemeSelect.value = saved.replace('-dark', '');
            themeSelect.value = 'dark';
        } else if (saved === 'light' || saved === 'dark') {
            themeSelect.value = saved;
            schemeSelect.value = 'default';
        } else {
            schemeSelect.value = saved;
            themeSelect.value = 'light';
        }
    }

    function getOsTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    const saved = localStorage.getItem('theme');
    if (saved) {
        syncSelects(saved);
        applyTheme(themeSelect.value, schemeSelect.value);
    } else {
        const osTheme = getOsTheme();
        themeSelect.value = osTheme;
        schemeSelect.value = 'default';
        applyTheme(osTheme, 'default');
    }

    // Follow OS preference changes when user has not set an explicit preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) {
            const osTheme = e.matches ? 'dark' : 'light';
            themeSelect.value = osTheme;
            schemeSelect.value = 'default';
            applyTheme(osTheme, 'default');
        }
    });

    themeSelect.addEventListener('change', function() {
        applyTheme(themeSelect.value, schemeSelect.value);
        localStorage.setItem('theme', document.documentElement.dataset.theme);
    });

    schemeSelect.addEventListener('change', function() {
        applyTheme(themeSelect.value, schemeSelect.value);
        localStorage.setItem('theme', document.documentElement.dataset.theme);
    });
});
