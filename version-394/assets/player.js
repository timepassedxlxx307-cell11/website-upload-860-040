(function () {
  window.initMoviePlayer = function (elementId, streamUrl) {
    var shell = document.getElementById(elementId);
    if (!shell) {
      return;
    }

    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-cover');
    var attached = false;

    function attach() {
      if (!video || attached) {
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      attach();
      shell.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          shell.classList.remove('is-playing');
        }
      });
      video.addEventListener('click', function () {
        if (!attached) {
          start();
        }
      });
    }
  };
})();
