(function () {
    const input = document.getElementById('sidebar-search-input');
    const resultsContainer = document.getElementById('sidebar-search-results');

    if (!input || !resultsContainer) {
        return;
    }

    const locale = document.documentElement.lang || 'en';
    const indexURL = locale === 'en' ? '/index.json' : `/${locale}/index.json`;
    const noResultsText = input.dataset.noResults || 'No results found for';
    let indexCache = null;
    let debounceTimer;

    function isValidUrl(url) {
        try {
            const parsedUrl = new URL(url, window.location.origin);
            return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
        } catch (error) {
            return false;
        }
    }

    function escapeHtml(value) {
        const node = document.createElement('span');
        node.textContent = value;
        return node.innerHTML;
    }

    function positionPopup() {
        const rect = input.getBoundingClientRect();
        const horizontalPadding = 12;
        const maxWidth = 520;
        const availableWidth = window.innerWidth - horizontalPadding * 2;
        const popupWidth = Math.min(Math.max(rect.width, 280), maxWidth, availableWidth);
        const left = Math.max(horizontalPadding, Math.min(rect.left, window.innerWidth - popupWidth - horizontalPadding));

        resultsContainer.style.width = `${popupWidth}px`;
        resultsContainer.style.top = `${rect.bottom + 8}px`;
        resultsContainer.style.left = `${left}px`;
    }

    async function loadIndex() {
        if (indexCache) {
            return indexCache;
        }

        const response = await fetch(indexURL, {
            headers: {
                Accept: 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Unable to load search index from ${indexURL}`);
        }

        indexCache = await response.json();
        return indexCache;
    }

    function openPopup() {
        positionPopup();
        resultsContainer.classList.add('is-open');
    }

    function closePopup() {
        resultsContainer.classList.remove('is-open');
    }

    function renderResults(results, query) {
        if (results.length === 0) {
            resultsContainer.innerHTML = `<div class="sidebar-search-empty">${escapeHtml(noResultsText)} "${escapeHtml(query)}"</div>`;
            openPopup();
            return;
        }

        resultsContainer.innerHTML = results.map((item) => {
            const title = escapeHtml(item.title || 'Untitled');
            const description = escapeHtml(item.description || '');
            const permalink = item.permalink;

            if (!isValidUrl(permalink)) {
                return '';
            }

            return `<article class="sidebar-search-result">
                <a href="${escapeHtml(permalink)}">
                    <span class="sidebar-search-result-title">${title}</span>
                    ${description ? `<span class="sidebar-search-result-description">${description}</span>` : ''}
                </a>
            </article>`;
        }).join('');

        openPopup();
    }

    async function performSearch(query) {
        if (!query) {
            closePopup();
            resultsContainer.innerHTML = '';
            return;
        }

        try {
            const entries = await loadIndex();
            const normalized = query.toLowerCase();
            const filtered = entries.filter((item) => {
                if (!item || typeof item !== 'object') {
                    return false;
                }

                const title = (item.title || '').toLowerCase();
                const description = (item.description || '').toLowerCase();
                const content = (item.content || '').toLowerCase();

                return title.includes(normalized) || description.includes(normalized) || content.includes(normalized);
            });

            renderResults(filtered, query);
        } catch (error) {
            console.error('Sidebar search error:', error);
        }
    }

    input.addEventListener('input', (event) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            performSearch(event.target.value.trim());
        }, 300);
    });

    input.addEventListener('focus', () => {
        if (resultsContainer.innerHTML.trim() !== '') {
            openPopup();
        }
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.sidebar-search') && !event.target.closest('#sidebar-search-results')) {
            closePopup();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closePopup();
        }
    });

    window.addEventListener('resize', () => {
        if (resultsContainer.classList.contains('is-open')) {
            positionPopup();
        }
    });

    window.addEventListener('scroll', () => {
        if (resultsContainer.classList.contains('is-open')) {
            positionPopup();
        }
    }, { passive: true });
})();
