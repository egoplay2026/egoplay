(function () {
    function eventStartTime(video) {
        var fps = parseFloat(video.dataset.fps) || 0;
        var before = parseInt(video.dataset.before, 10) || 0;
        if (fps <= 0) return 0;
        return before / fps;
    }

    function attachEventOverlay(video) {
        var fps = parseFloat(video.dataset.fps) || 0;
        var before = parseInt(video.dataset.before, 10) || 0;
        var eventFrames = parseInt(video.dataset.event, 10) || 0;
        var wrap = video.closest('.comparison-video-wrap');
        if (!wrap || fps <= 0 || eventFrames <= 0) return;
        var startT = before / fps;
        var endT = (before + eventFrames) / fps;
        function tick() {
            var t = video.currentTime;
            wrap.classList.toggle('event-active', t >= startT && t < endT);
        }
        video.addEventListener('timeupdate', tick);
        video.addEventListener('seeked', tick);
        video.addEventListener('play', tick);
    }

    var videos = Array.prototype.slice.call(document.querySelectorAll('video[data-fps]'));
    videos.forEach(attachEventOverlay);

    // "Go to event start" buttons seek the sibling video to its trigger frame.
    document.querySelectorAll('.seek-event').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var card = btn.closest('.fr-video-card');
            if (!card) return;
            var video = card.querySelector('video');
            if (!video) return;
            var t = eventStartTime(video);
            try { video.currentTime = t; } catch (err) {}
            var p = video.play();
            if (p && typeof p.catch === 'function') p.catch(function () {});
        });
    });

    // Only play videos that are near the viewport so that we don't melt the user's machine.
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var v = entry.target;
                if (entry.isIntersecting) {
                    if (v.preload !== 'auto') v.preload = 'auto';
                    var p = v.play();
                    if (p && typeof p.catch === 'function') p.catch(function () {});
                } else {
                    try { v.pause(); } catch (err) {}
                }
            });
        }, { rootMargin: '300px 0px' });
        document.querySelectorAll('video').forEach(function (v) {
            v.autoplay = false;
            observer.observe(v);
        });
    }
})();
