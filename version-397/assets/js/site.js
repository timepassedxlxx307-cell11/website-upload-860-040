(function() {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function() {
      var open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-arrow.prev');
    var next = hero.querySelector('.hero-arrow.next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  var searchInput = document.getElementById('searchInput');
  var searchGrid = document.querySelector('[data-search-grid]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
  var empty = document.querySelector('[data-empty-state]');
  var searchTitle = document.getElementById('searchTitle');

  function applySearch(value) {
    var query = String(value || '').trim().toLowerCase();
    var visible = 0;
    cards.forEach(function(card) {
      var text = (card.getAttribute('data-search-text') || '').toLowerCase();
      var match = !query || text.indexOf(query) !== -1;
      card.hidden = !match;
      if (match) {
        visible += 1;
      }
    });
    if (empty) {
      empty.hidden = visible !== 0;
    }
    if (searchTitle) {
      searchTitle.textContent = query ? '与“' + value + '”相关的影视内容' : '影视内容';
    }
  }

  if (searchInput && searchGrid) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    searchInput.value = q;
    applySearch(q);
    searchInput.addEventListener('input', function() {
      applySearch(searchInput.value);
    });
    var pills = document.querySelector('[data-filter-pills]');
    if (pills) {
      pills.addEventListener('click', function(event) {
        var button = event.target.closest('[data-filter]');
        if (!button) {
          return;
        }
        searchInput.value = button.getAttribute('data-filter') || '';
        applySearch(searchInput.value);
      });
    }
  }
})();
