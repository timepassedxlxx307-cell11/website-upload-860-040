(function() {
    var nav = document.querySelector('[data-main-nav]');
    var toggle = document.querySelector('[data-menu-toggle]');

    if (toggle && nav) {
        toggle.addEventListener('click', function() {
            nav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function() {
                showSlide(current + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener('click', function() {
                showSlide(dotIndex);
                startTimer();
            });
        });

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function filterCards(value) {
        var query = normalize(value);
        cards.forEach(function(card) {
            var title = normalize(card.getAttribute('data-title'));
            var meta = normalize(card.getAttribute('data-meta'));
            var text = normalize(card.textContent);
            var matched = !query || title.indexOf(query) !== -1 || meta.indexOf(query) !== -1 || text.indexOf(query) !== -1;
            card.classList.toggle('is-filtered', !matched);
        });
    }

    if (filterInput && cards.length) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (query) {
            filterInput.value = query;
            filterCards(query);
        }
        filterInput.addEventListener('input', function() {
            filterCards(filterInput.value);
        });
    }

    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
    forms.forEach(function(form) {
        form.addEventListener('submit', function(event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = 'search.html';
            }
        });
    });
}());
