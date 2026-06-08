(function () {
    function createPlayer(container) {
        var video = container.querySelector('video');
        var cover = container.querySelector('[data-player-cover]');
        var streamUrl = container.getAttribute('data-stream');
        var prepared = false;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function prepare() {
            if (prepared) {
                return;
            }

            prepared = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = streamUrl;
        }

        function play() {
            prepare();
            container.classList.add('is-playing');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    container.classList.remove('is-playing');
                });
            }
        }

        if (cover) {
            cover.addEventListener('click', play);
        }

        video.addEventListener('play', function () {
            container.classList.add('is-playing');
        });

        video.addEventListener('click', function () {
            if (!prepared) {
                play();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(createPlayer);
})();
