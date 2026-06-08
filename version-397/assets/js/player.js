(function() {
  window.initMoviePlayer = function(root, streamUrl) {
    var video = root.querySelector('video');
    var overlay = root.querySelector('.player-overlay');
    var started = false;
    var hls = null;

    function attach() {
      if (!video || started) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function() {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function() {
        if (!started) {
          play();
        }
      });
      video.addEventListener('play', function() {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('error', function() {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
          hls = null;
        }
      });
    }
  };
})();
