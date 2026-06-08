(function () {
    var menuButton = document.querySelector('.menu-button');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
            menuButton.textContent = open ? '×' : '☰';
        });
    }

    var hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
        var current = 0;

        var show = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    }

    var filterForm = document.querySelector('[data-filter-form]');
    var filterList = document.querySelector('[data-filter-list]');
    var filterState = document.querySelector('[data-filter-state]');

    if (filterForm && filterList) {
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
        var filter = function () {
            var formData = new FormData(filterForm);
            var keyword = String(formData.get('q') || '').trim().toLowerCase();
            var type = String(formData.get('type') || '');
            var year = String(formData.get('year') || '');
            var region = String(formData.get('region') || '');
            var shown = 0;

            cards.forEach(function (card) {
                var text = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre
                ].join(' ').toLowerCase();
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (type && card.dataset.type !== type) {
                    matched = false;
                }
                if (year && card.dataset.year !== year) {
                    matched = false;
                }
                if (region && card.dataset.region !== region) {
                    matched = false;
                }

                card.classList.toggle('is-hidden', !matched);

                if (matched) {
                    shown += 1;
                }
            });

            if (filterState) {
                filterState.textContent = shown > 0 ? '已筛选出匹配作品' : '没有匹配结果';
            }
        };

        filterForm.addEventListener('input', filter);
        filterForm.addEventListener('change', filter);
        filterForm.addEventListener('reset', function () {
            setTimeout(filter, 0);
        });
    }
})();

function setupMoviePlayer(streamUrl) {
    var video = document.getElementById('movie-player');
    var startButton = document.getElementById('player-start');
    var prepared = false;

    if (!video || !startButton || !streamUrl) {
        return;
    }

    var prepare = function () {
        if (prepared) {
            return;
        }

        prepared = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    };

    var play = function () {
        prepare();
        startButton.classList.add('is-hidden');
        var action = video.play();

        if (action && typeof action.catch === 'function') {
            action.catch(function () {
                startButton.classList.remove('is-hidden');
            });
        }
    };

    startButton.addEventListener('click', play);
    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener('play', function () {
        startButton.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
            startButton.classList.remove('is-hidden');
        }
    });
}
