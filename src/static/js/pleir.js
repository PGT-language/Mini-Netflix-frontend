const videoPlayer = document.getElementById('videoPlayer');
const progressBar = document.getElementById('progressBar');
const volumeSlider = document.getElementById('volumeSlider');

function togglePlay() {
    if (videoPlayer.paused) {
        videoPlayer.play();
    } else {
        videoPlayer.pause();
    }
}

function rewind() {
    videoPlayer.currentTime -= 10;
}

function forward() {
    videoPlayer.currentTime += 10;
}

function goFullscreen() {
    if (videoPlayer.requestFullscreen) {
        videoPlayer.requestFullscreen();
    } else if (videoPlayer.webkitRequestFullscreen) {
        videoPlayer.webkitRequestFullscreen();
    } else if (videoPlayer.msRequestFullscreen) {
        videoPlayer.msRequestFullscreen();
    }
}

function updateProgressBar() {
    const percentage = (videoPlayer.currentTime / videoPlayer.duration) * 100;
    progressBar.style.width = percentage + '%';
}

function seek(event) {
    const rect = event.target.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const totalWidth = rect.width;
    const percentage = offsetX / totalWidth;
    videoPlayer.currentTime = percentage * videoPlayer.duration;
}

videoPlayer.addEventListener('timeupdate', updateProgressBar);
volumeSlider.addEventListener('input', () => {
    videoPlayer.volume = volumeSlider.value;
});

// Инициализация
volumeSlider.value = videoPlayer.volume;