        // Theme Selector
        const themeSelect = document.getElementById('theme-select');
        themeSelect.addEventListener('change', (e) => {
            document.body.className = e.target.value;
        });

        // Download Video Button
        document.getElementById('download-video-button').addEventListener('click', async () => {
            const videoUrl = document.getElementById('video-url').value;
            console.log('Download Video Button Clicked. Video URL:', videoUrl); // Debug log

            if (!videoUrl) {
                alert('Please enter a valid video URL.');
                return;
            }

            try {
                console.log('Sending POST request to /download with URL:', videoUrl); // Debug log
                const response = await fetch('/download', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: videoUrl }),
                });

                console.log('Response received:', response); // Debug log

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Response JSON:', result); // Debug log

                if (result.success) {
                    alert('Video download started!');
                    // Reload the video list after a short delay to allow the server to save the video
                    setTimeout(() => {
                        loadVideos();
                    }, 2000); // 2-second delay
                } else {
                    alert('Failed to download video: ' + result.message);
                }
            } catch (error) {
                console.error('Error downloading video:', error);
                alert('Failed to download video. Please try again.');
            }
        });

        // Load videos on page load
        let allVideos = [];
        let currentPage = 1;
        let videosPerPage = 10; // Default number of videos per page

        // Function to update the number of videos per page
        function updateVideosPerPage() {
            const videosPerPageSelect = document.getElementById('videos-per-page');
            videosPerPage = parseInt(videosPerPageSelect.value);
            currentPage = 1; // Reset to the first page
            displayVideos(allVideos);
            updatePagination();
        }

        // Add event listener for the videos per page dropdown
        document.getElementById('videos-per-page').addEventListener('change', updateVideosPerPage);

        async function loadVideos() {
            const videoList = document.getElementById('video-list');
            const loadingSpinner = document.getElementById('loading-spinner');
            const errorMessage = document.getElementById('error-message');

            loadingSpinner.classList.add('visible');
            errorMessage.textContent = '';

            try {
                console.log('Loading videos...'); // Debug log
                const response = await fetch('/videos');
                console.log('Videos response:', response); // Debug log

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const videos = await response.json();
                console.log("Videos fetched:", videos); // Debug log

                allVideos = videos;
                displayVideos(allVideos);
                updatePagination();

            } catch (error) {
                console.error('Error loading videos:', error);
                errorMessage.textContent = 'Failed to load videos. Please try again later.';
            } finally {
                loadingSpinner.classList.remove('visible');
            }
        }

        function displayVideos(videos) {
            const videoList = document.getElementById('video-list');
            videoList.innerHTML = '';

            const startIndex = (currentPage - 1) * videosPerPage;
            const endIndex = startIndex + videosPerPage;
            const videosToShow = videos.slice(startIndex, endIndex);

            videosToShow.forEach(video => {
                const videoItem = document.createElement('div');
                videoItem.className = 'video-item';

                const videoElement = document.createElement('video');
                videoElement.controls = true;
                videoElement.src = video.url;

                // Create the spectrogram canvas
                const spectrogramCanvas = document.createElement('canvas');
                spectrogramCanvas.className = 'spectrogram';
                videoItem.appendChild(spectrogramCanvas);

                // Create the volume indicator
                const volumeIndicator = document.createElement('div');
                volumeIndicator.className = 'volume-indicator';
                const volumeLevel = document.createElement('div');
                volumeLevel.className = 'volume-level';
                volumeIndicator.appendChild(volumeLevel);
                videoItem.appendChild(volumeIndicator);

                // Update the volume indicator when the volume changes
                videoElement.addEventListener('volumechange', () => {
                    const volume = videoElement.volume;
                    volumeLevel.style.width = `${volume * 100}%`;
                });

                // Analyze audio and draw spectrogram
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const analyser = audioContext.createAnalyser();
                const source = audioContext.createMediaElementSource(videoElement);
                source.connect(analyser);
                analyser.connect(audioContext.destination);
                analyser.fftSize = 256;

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                const canvasCtx = spectrogramCanvas.getContext('2d');
                const width = spectrogramCanvas.width;
                const height = spectrogramCanvas.height;

                function drawSpectrogram() {
                    requestAnimationFrame(drawSpectrogram);

                    analyser.getByteFrequencyData(dataArray);

                    canvasCtx.fillStyle = 'rgb(0, 0, 0)';
                    canvasCtx.fillRect(0, 0, width, height);

                    const barWidth = (width / bufferLength) * 2.5;
                    let barHeight;
                    let x = 0;

                    for (let i = 0; i < bufferLength; i++) {
                        barHeight = dataArray[i] / 2;

                        // Calculate a rainbow color based on the frequency index
                        const hue = (i / bufferLength) * 360; // Map index to hue (0-360)
                        canvasCtx.fillStyle = `hsl(${hue}, 100%, 50%)`; // Use HSL for rainbow colors

                        canvasCtx.fillRect(x, height - barHeight, barWidth, barHeight);

                        x += barWidth + 1;
                    }
                }

                drawSpectrogram();

                const videoName = document.createElement('p');
                videoName.textContent = video.name;

                videoItem.appendChild(videoElement);
                videoItem.appendChild(videoName);
                videoList.appendChild(videoItem);
            });
        }

        function updatePagination() {
            const prevButton = document.getElementById('prev-page');
            const nextButton = document.getElementById('next-page');

            prevButton.disabled = currentPage === 1;
            nextButton.disabled = currentPage * videosPerPage >= allVideos.length;
        }

        // Pagination event listeners
        document.getElementById('prev-page').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayVideos(allVideos);
                updatePagination();
            }
        });

        document.getElementById('next-page').addEventListener('click', () => {
            if (currentPage * videosPerPage < allVideos.length) {
                currentPage++;
                displayVideos(allVideos);
                updatePagination();
            }
        });

        window.onload = loadVideos;
