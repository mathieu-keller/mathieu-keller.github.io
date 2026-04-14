document.addEventListener('DOMContentLoaded', function() {
    const select = document.getElementById('language');
    if (!select) {
        return;
    }

    function navigateToSelectedLanguage() {
        const selectedOption = select.selectedOptions[0];
        if (!selectedOption || !selectedOption.dataset.url) {
            return;
        }

        const url = new URL(selectedOption.dataset.url, window.location.origin);
        url.search = window.location.search;
        url.hash = window.location.hash;
        window.location.href = url.toString();
    }

    select.addEventListener('change', function() {
        localStorage.setItem('lang', select.value);
        navigateToSelectedLanguage();
    });
});
