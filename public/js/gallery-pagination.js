(function () {
    const views = document.querySelectorAll('[data-gallery-view]');

    if (views.length === 0) {
        return;
    }

    views.forEach((view) => {
        const grid = view.querySelector('[data-gallery-grid]');
        const pagination = view.querySelector('[data-gallery-pagination]');
        const previousButton = view.querySelector('[data-gallery-prev]');
        const nextButton = view.querySelector('[data-gallery-next]');
        const info = view.querySelector('[data-gallery-info]');
        const lightbox = view.querySelector('[data-gallery-lightbox]');
        const lightboxImage = view.querySelector('[data-gallery-lightbox-image]');
        const lightboxCounter = view.querySelector('[data-gallery-lightbox-counter]');
        const lightboxPreviousButton = view.querySelector('[data-gallery-lightbox-prev]');
        const lightboxNextButton = view.querySelector('[data-gallery-lightbox-next]');
        const lightboxCloseButton = view.querySelector('.gallery-lightbox-close');
        const closeButtons = Array.from(view.querySelectorAll('[data-gallery-close]'));

        if (!grid || !pagination || !previousButton || !nextButton || !info) {
            return;
        }

        const items = Array.from(grid.querySelectorAll('[data-gallery-item]'));
        const triggers = items
            .map((item) => item.querySelector('[data-gallery-trigger]'))
            .filter(Boolean);
        const pageSize = Number.parseInt(grid.dataset.galleryPageSize || '25', 10);
        const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
        const pageLabel = view.dataset.pageLabel || 'Page';
        let currentPage = 1;
        let currentImageIndex = -1;
        let lastActiveTrigger = null;

        function pageForIndex(index) {
            return Math.floor(index / pageSize) + 1;
        }

        function readPageFromURL() {
            const value = Number.parseInt(new URLSearchParams(window.location.search).get('page') || '1', 10);

            if (!Number.isFinite(value) || value < 1) {
                return 1;
            }

            return Math.min(value, totalPages);
        }

        function updateURL(page, historyMethod) {
            if (!historyMethod || typeof window.history[historyMethod] !== 'function') {
                return;
            }

            const url = new URL(window.location.href);

            if (page <= 1) {
                url.searchParams.delete('page');
            } else {
                url.searchParams.set('page', String(page));
            }

            window.history[historyMethod]({ galleryPage: page }, '', url);
        }

        function render(page, historyMethod) {
            currentPage = Math.min(Math.max(page, 1), totalPages);

            const start = (currentPage - 1) * pageSize;
            const end = start + pageSize;

            items.forEach((item, index) => {
                item.hidden = index < start || index >= end;
            });

            if (totalPages <= 1) {
                pagination.hidden = true;
                updateURL(1, historyMethod);
                return;
            }

            pagination.hidden = false;
            previousButton.disabled = currentPage === 1;
            nextButton.disabled = currentPage === totalPages;
            info.textContent = `${pageLabel} ${currentPage} / ${totalPages}`;
            updateURL(currentPage, historyMethod);
        }

        function renderLightbox(index) {
            if (!lightbox || !lightboxImage || !lightboxCounter || !lightboxPreviousButton || !lightboxNextButton) {
                return;
            }

            currentImageIndex = Math.min(Math.max(index, 0), triggers.length - 1);

            if (pageForIndex(currentImageIndex) !== currentPage) {
                render(pageForIndex(currentImageIndex), 'replaceState');
            }

            const trigger = triggers[currentImageIndex];
            const source = trigger.dataset.gallerySrc || trigger.getAttribute('href') || '';
            const alt = trigger.dataset.galleryAlt || '';

            lightboxImage.src = source;
            lightboxImage.alt = alt;
            lightboxCounter.textContent = `${currentImageIndex + 1} / ${triggers.length}`;
            lightboxPreviousButton.disabled = currentImageIndex === 0;
            lightboxNextButton.disabled = currentImageIndex === triggers.length - 1;
        }

        function openLightbox(index, trigger) {
            if (!lightbox || !lightboxImage || triggers.length === 0) {
                return;
            }

            lastActiveTrigger = trigger || document.activeElement;
            lightbox.hidden = false;
            document.body.classList.add('gallery-lightbox-open');
            renderLightbox(index);

            if (lightboxCloseButton) {
                lightboxCloseButton.focus();
            }
        }

        function closeLightbox() {
            if (!lightbox || lightbox.hidden) {
                return;
            }

            lightbox.hidden = true;
            lightboxImage.removeAttribute('src');
            lightboxImage.alt = '';
            document.body.classList.remove('gallery-lightbox-open');

            if (lastActiveTrigger && typeof lastActiveTrigger.focus === 'function') {
                lastActiveTrigger.focus();
            }
        }

        previousButton.addEventListener('click', () => {
            render(currentPage - 1, 'pushState');
        });

        nextButton.addEventListener('click', () => {
            render(currentPage + 1, 'pushState');
        });

        triggers.forEach((trigger, index) => {
            trigger.addEventListener('click', (event) => {
                event.preventDefault();
                openLightbox(index, trigger);
            });
        });

        if (lightbox && lightboxPreviousButton && lightboxNextButton) {
            lightboxPreviousButton.addEventListener('click', () => {
                if (currentImageIndex > 0) {
                    renderLightbox(currentImageIndex - 1);
                }
            });

            lightboxNextButton.addEventListener('click', () => {
                if (currentImageIndex < triggers.length - 1) {
                    renderLightbox(currentImageIndex + 1);
                }
            });
        }

        closeButtons.forEach((button) => {
            button.addEventListener('click', () => {
                closeLightbox();
            });
        });

        document.addEventListener('keydown', (event) => {
            if (!lightbox || lightbox.hidden) {
                return;
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                closeLightbox();
                return;
            }

            if (event.key === 'ArrowLeft' && currentImageIndex > 0) {
                event.preventDefault();
                renderLightbox(currentImageIndex - 1);
            }

            if (event.key === 'ArrowRight' && currentImageIndex < triggers.length - 1) {
                event.preventDefault();
                renderLightbox(currentImageIndex + 1);
            }
        });

        window.addEventListener('popstate', () => {
            render(readPageFromURL(), null);
        });

        render(readPageFromURL(), 'replaceState');
    });
})();
