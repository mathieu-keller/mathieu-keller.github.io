(function () {
    const sidebar = document.querySelector('.sidebar');
    const sidebarInner = sidebar ? sidebar.querySelector('.sidebar-inner') : null;

    if (!sidebar || !sidebarInner) {
        return;
    }

    const desktopViewport = window.matchMedia('(min-width: 48.0625rem)');
    let ticking = false;

    function syncSidebarMode() {
        if (!desktopViewport.matches) {
            sidebar.classList.add('sidebar--static');
            sidebar.style.removeProperty('--sidebar-scroll-offset');
            return;
        }

        const overflow = Math.max(0, sidebar.scrollHeight - sidebar.clientHeight);
        const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const progress = overflow === 0 ? 0 : Math.min(1, window.scrollY / scrollRange);
        const offset = overflow === 0 ? 0 : -overflow * progress;

        sidebar.classList.toggle('sidebar--static', overflow === 0);
        sidebar.style.setProperty('--sidebar-scroll-offset', `${offset}px`);
    }

    function requestSync() {
        if (ticking) {
            return;
        }

        ticking = true;
        window.requestAnimationFrame(() => {
            syncSidebarMode();
            ticking = false;
        });
    }

    window.addEventListener('load', syncSidebarMode);
    window.addEventListener('resize', requestSync);
    window.addEventListener('scroll', requestSync, { passive: true });
    desktopViewport.addEventListener('change', syncSidebarMode);

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(syncSidebarMode);
    }

    if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(requestSync);
        observer.observe(sidebar);
        observer.observe(sidebarInner);
    }

    syncSidebarMode();
})();
