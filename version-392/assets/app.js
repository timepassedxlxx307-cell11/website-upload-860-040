(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var button = document.querySelector('[data-mobile-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');

        if (button && nav) {
            button.addEventListener('click', function () {
                nav.classList.toggle('is-open');
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var next = hero.querySelector('[data-hero-next]');
            var prev = hero.querySelector('[data-hero-prev]');
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot')) || 0);
                    start();
                });
            });

            if (next) {
                next.addEventListener('click', function () {
                    show(current + 1);
                    start();
                });
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(current - 1);
                    start();
                });
            }

            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
            show(0);
            start();
        }

        var urlParams = new URLSearchParams(window.location.search);
        var query = urlParams.get('q') || '';
        var searchInput = document.querySelector('[data-search-input]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var categoryButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]'));
        var selectedCategory = 'all';

        if (searchInput && query) {
            searchInput.value = query;
        }

        function applyFilters() {
            var value = searchInput ? searchInput.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var haystack = card.getAttribute('data-search') || '';
                var cardCategory = card.getAttribute('data-category') || '';
                var matchesText = !value || haystack.indexOf(value) !== -1;
                var matchesCategory = selectedCategory === 'all' || cardCategory === selectedCategory;
                card.classList.toggle('is-hidden', !(matchesText && matchesCategory));
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
            applyFilters();
        }

        categoryButtons.forEach(function (filterButton) {
            filterButton.addEventListener('click', function () {
                selectedCategory = filterButton.getAttribute('data-filter-category') || 'all';
                categoryButtons.forEach(function (item) {
                    item.classList.toggle('is-active', item === filterButton);
                });
                applyFilters();
            });
        });
    });
})();
