function closestCard(element) {
  return element.closest('[data-card]');
}

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function initMenu() {
  var button = document.querySelector('[data-menu-toggle]');
  var menu = document.getElementById('site-menu');
  if (!button || !menu) {
    return;
  }
  button.addEventListener('click', function () {
    menu.classList.toggle('is-open');
  });
}

function initHero() {
  var root = document.querySelector('[data-hero]');
  if (!root) {
    return;
  }
  var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
  var prev = root.querySelector('[data-hero-prev]');
  var next = root.querySelector('[data-hero-next]');
  if (!slides.length) {
    return;
  }
  var index = 0;
  var timer = null;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle('is-active', itemIndex === index);
    });
    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle('is-active', itemIndex === index);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (prev) {
    prev.addEventListener('click', function () {
      show(index - 1);
      start();
    });
  }
  if (next) {
    next.addEventListener('click', function () {
      show(index + 1);
      start();
    });
  }
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      show(Number(dot.getAttribute('data-hero-dot')) || 0);
      start();
    });
  });
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  show(0);
  start();
}

function initFilters() {
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
  panels.forEach(function (panel) {
    var keywordInput = panel.querySelector('[data-filter-keyword]');
    var typeInput = panel.querySelector('[data-filter-type]');
    var yearInput = panel.querySelector('[data-filter-year]');
    var resetButton = panel.querySelector('[data-filter-reset]');
    var scope = panel.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

    function applyFilter() {
      var keyword = normalizeText(keywordInput && keywordInput.value);
      var type = normalizeText(typeInput && typeInput.value);
      var year = normalizeText(yearInput && yearInput.value);
      cards.forEach(function (card) {
        var text = normalizeText([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' '));
        var cardType = normalizeText(card.getAttribute('data-type'));
        var cardYear = normalizeText(card.getAttribute('data-year'));
        var matched = true;
        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (type && cardType.indexOf(type) === -1) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        card.hidden = !matched;
      });
    }

    [keywordInput, typeInput, yearInput].forEach(function (input) {
      if (input) {
        input.addEventListener('input', applyFilter);
        input.addEventListener('change', applyFilter);
      }
    });
    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (keywordInput) {
          keywordInput.value = '';
        }
        if (typeInput) {
          typeInput.value = '';
        }
        if (yearInput) {
          yearInput.value = '';
        }
        applyFilter();
      });
    }
  });
}

function buildResultCard(movie) {
  var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
    return '<span>' + escapeHtml(tag) + '</span>';
  }).join('');
  return [
    '<article class="movie-card">',
    '  <a class="poster-link" href="./' + escapeHtml(movie.file) + '" aria-label="' + escapeHtml(movie.title) + '">',
    '    <img class="poster-img" src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
    '    <span class="score-badge">' + escapeHtml(movie.rating) + '</span>',
    '  </a>',
    '  <div class="movie-card-body">',
    '    <div class="meta-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
    '    <h3><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>',
    '    <p>' + escapeHtml(movie.oneLine) + '</p>',
    '    <div class="tag-row">' + tags + '</div>',
    '  </div>',
    '</article>'
  ].join('');
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"]/g, function (char) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[char];
  });
}

function initSearchPage() {
  var resultBox = document.querySelector('[data-search-results]');
  var input = document.querySelector('[data-search-page-input]');
  if (!resultBox || !input || !window.SEARCH_MOVIES) {
    return;
  }
  var params = new URLSearchParams(window.location.search);
  var q = params.get('q') || '';
  input.value = q;

  function render() {
    var keyword = normalizeText(input.value);
    var list = window.SEARCH_MOVIES.filter(function (movie) {
      var text = normalizeText([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' '));
      return !keyword || text.indexOf(keyword) !== -1;
    }).slice(0, 120);
    resultBox.innerHTML = list.map(buildResultCard).join('');
  }

  input.addEventListener('input', render);
  render();
}

function initMoviePlayer(videoId, overlayId, source) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var prepared = false;
  var hls = null;
  if (!video || !overlay || !source) {
    return;
  }

  function prepare() {
    if (prepared) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
    prepared = true;
  }

  function start() {
    prepare();
    overlay.classList.add('is-hidden');
    video.controls = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

window.initMoviePlayer = initMoviePlayer;

document.addEventListener('DOMContentLoaded', function () {
  initMenu();
  initHero();
  initFilters();
  initSearchPage();
});
