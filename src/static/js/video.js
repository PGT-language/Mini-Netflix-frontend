function setupVideoPlayer(videoId, initialTime) {
    const video = document.getElementById('videoPlayer');
    
    // Set initial time
    video.currentTime = initialTime;
    
    // Save progress every 5 seconds
    setInterval(() => {
        if (!video.paused && !video.ended) {
            fetch('/save_progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    video_id: videoId,
                    progress: video.currentTime
                })
            })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error saving progress:', error));
        }
    }, 5000);

    // Save progress when video is paused
    video.addEventListener('pause', () => {
        fetch('/save_progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                video_id: videoId,
                progress: video.currentTime
            })
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error saving progress:', error));
    });
}