const ready = function (callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

function initNavigation() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-site-nav]");
  if (!toggle || !nav) {
    return;
  }
  toggle.addEventListener("click", function () {
    nav.classList.toggle("open");
  });
}

function initHero() {
  const slider = document.querySelector("[data-hero-slider]");
  if (!slider) {
    return;
  }
  const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
  const prev = slider.querySelector("[data-hero-prev]");
  const next = slider.querySelector("[data-hero-next]");
  if (!slides.length) {
    return;
  }
  let index = 0;
  let timer = null;
  const show = function (target) {
    index = (target + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === index);
    });
  };
  const start = function () {
    stop();
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  };
  const stop = function () {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };
  if (prev) {
    prev.addEventListener("click", function () {
      show(index - 1);
      start();
    });
  }
  if (next) {
    next.addEventListener("click", function () {
      show(index + 1);
      start();
    });
  }
  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      show(Number(dot.getAttribute("data-hero-dot") || 0));
      start();
    });
  });
  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);
  show(0);
  start();
}

function initSearchForms() {
  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      const input = form.querySelector("input[name='q']");
      if (!input || !input.value.trim()) {
        event.preventDefault();
        input && input.focus();
      }
    });
  });
}

function applyFilter(input) {
  const section = input.closest("section") || document;
  const list = section.querySelector("[data-filter-list]");
  const empty = section.querySelector("[data-empty-state]");
  if (!list) {
    return;
  }
  const cards = Array.from(list.querySelectorAll("[data-card]"));
  const terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let visible = 0;
  cards.forEach(function (card) {
    const text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
    const matched = terms.every(function (term) {
      return text.indexOf(term) !== -1;
    });
    card.style.display = matched ? "" : "none";
    if (matched) {
      visible += 1;
    }
  });
  if (empty) {
    empty.classList.toggle("visible", visible === 0);
  }
}

function initFilters() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || "";
  document.querySelectorAll("[data-card-filter]").forEach(function (input) {
    if (input.hasAttribute("data-query-input") && query) {
      input.value = query;
    }
    input.addEventListener("input", function () {
      applyFilter(input);
    });
    applyFilter(input);
  });
}

function attachNative(video, source) {
  video.src = source;
  video.load();
}

function initPlayers() {
  const players = Array.from(document.querySelectorAll("[data-player]"));
  if (!players.length) {
    return;
  }
  const Hls = window.Hls || null;
  players.forEach(function (shell) {
    const video = shell.querySelector("video");
    const button = shell.querySelector(".player-start");
    const source = shell.getAttribute("data-video-url");
    let attached = false;
    let hls = null;
    if (!video || !source) {
      return;
    }
    const attach = function () {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        attachNative(video, source);
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal || !hls) {
            return;
          }
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        attachNative(video, source);
      }
    };
    const play = function () {
      attach();
      shell.classList.add("is-playing");
      video.play().catch(function () {});
    };
    if (button) {
      button.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        shell.classList.remove("is-playing");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

ready(function () {
  initNavigation();
  initHero();
  initSearchForms();
  initFilters();
  initPlayers();
});
