(function () {
  function selectAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-menu]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupSearchForms() {
    selectAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        if (value) {
          event.preventDefault();
          window.location.href = './search.html?q=' + encodeURIComponent(value);
        }
      });
    });
  }

  function setupLiveSearch() {
    var input = document.querySelector('[data-live-search]');
    var cards = selectAll('[data-movie-card]');
    var empty = document.querySelector('[data-empty-state]');
    if (!input || !cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (query) {
      input.value = query;
    }
    function applyFilter() {
      var value = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = !value || haystack.indexOf(value) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }
    input.addEventListener('input', applyFilter);
    applyFilter();
  }

  function setupHero() {
    var slides = selectAll('[data-hero-slide]');
    var dots = selectAll('[data-hero-dot]');
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  window.initPlayer = function (streamUrl) {
    var video = document.querySelector('[data-player-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    var playButton = document.querySelector('[data-player-play]');
    var started = false;
    if (!video || !streamUrl) {
      return;
    }
    function attachSource() {
      if (started) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }
    function begin() {
      attachSource();
      if (overlay) {
        overlay.classList.add('hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener('click', begin);
    }
    if (playButton) {
      playButton.addEventListener('click', function (event) {
        event.stopPropagation();
        begin();
      });
    }
    video.addEventListener('click', function () {
      if (!started) {
        begin();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupSearchForms();
    setupLiveSearch();
    setupHero();
  });
})();
