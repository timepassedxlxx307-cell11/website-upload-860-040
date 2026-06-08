(function () {
    window.initMoviePlayer = function (source) {
        var shell = document.querySelector('[data-player]');
        var video = document.getElementById('movie-video');
        var curtain = shell ? shell.querySelector('.player-curtain') : null;
        var hlsInstance = null;
        var loaded = false;

        if (!shell || !video || !curtain || !source) {
            return;
        }

        function loadVideo() {
            if (loaded) {
                return;
            }

            loaded = true;
            video.controls = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function playVideo() {
            loadVideo();
            shell.classList.add('is-playing');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        curtain.addEventListener('click', playVideo);
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
        shell.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                playVideo();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
