(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', mobilePanel.classList.contains('is-open'));
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('is-missing');
        });

        if (image.complete && image.naturalWidth === 0) {
            image.classList.add('is-missing');
        }
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function schedule() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                schedule();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                schedule();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                schedule();
            });
        }

        schedule();
    }

    var searchGrid = document.querySelector('[data-search-grid]');
    var searchInput = document.querySelector('[data-search-input]');
    var searchStatus = document.querySelector('[data-search-status]');

    if (searchGrid && searchInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var cards = Array.prototype.slice.call(searchGrid.querySelectorAll('.movie-card'));

        searchInput.value = query;

        function normalize(text) {
            return String(text || '').toLowerCase().trim();
        }

        function applySearch(value) {
            var words = normalize(value).split(/\s+/).filter(Boolean);
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.textContent
                ].join(' '));

                var matched = !words.length || words.every(function (word) {
                    return text.indexOf(word) !== -1;
                });

                card.classList.toggle('search-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (searchStatus) {
                searchStatus.textContent = words.length ? '找到 ' + visible + ' 部匹配内容' : '输入关键词后显示匹配内容';
            }
        }

        searchInput.addEventListener('input', function () {
            applySearch(searchInput.value);
        });

        applySearch(query);
    }
})();
