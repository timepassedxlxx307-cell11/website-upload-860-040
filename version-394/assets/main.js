(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');

  function refreshHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  refreshHeader();
  window.addEventListener('scroll', refreshHeader, { passive: true });

  if (toggle && header) {
    toggle.addEventListener('click', function () {
      var opened = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero-carousel]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        play();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        play();
      });
    });

    show(0);
    play();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters(scope) {
    var input = scope.querySelector('[data-filter-input]');
    var typeSelect = scope.querySelector('[data-filter-type]');
    var yearSelect = scope.querySelector('[data-filter-year]');
    var container = document.querySelector('[data-card-container]');
    var empty = document.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.search-card'));

    function update() {
      var query = normalize(input && input.value);
      var selectedType = normalize(typeSelect && typeSelect.value);
      var selectedYear = normalize(yearSelect && yearSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.textContent
        ].join(' '));
        var type = normalize(card.getAttribute('data-type'));
        var year = normalize(card.getAttribute('data-year'));
        var matched = (!query || text.indexOf(query) !== -1) && (!selectedType || type === selectedType) && (!selectedYear || year === selectedYear);
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }

      if (container) {
        container.setAttribute('data-visible-count', String(visible));
      }
    }

    if (input) {
      input.addEventListener('input', update);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', update);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', update);
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && input) {
      input.value = q;
    }
    update();
  }

  var filterScope = document.querySelector('[data-filter-scope]');
  if (filterScope) {
    applyFilters(filterScope);
  }
})();
