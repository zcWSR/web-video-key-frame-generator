const videoInput = document.getElementById('video-input');
const keyFrameContainerEle = document.getElementById('key-frames');
const trackEle = document.getElementById('track');
const videoContainer = document.getElementById('video-container');

const getVideoBlob = () =>
  new Promise((resolve) => {
    videoInput.onchange = (e) => {
      resolve(URL.createObjectURL(e.target.files[0]));
    };
  });

const waitMetaData = (videoEle) => {
  return new Promise((resolve) => {
    videoEle.onloadedmetadata = (e) => resolve(videoEle);
  });
};

const loadVideoFromFile = async () => {
  const blob = await getVideoBlob();
  const videoEle = document.createElement('video');
  videoEle.src = blob;
  videoEle.volume = 0;
  // videoInput.after(videoEle);
  return waitMetaData(videoEle);
};

const loadVideoFromUrl = (url) => {
  const videoEle = document.createElement('video');
  videoEle.controls = true;
  videoEle.src = url;
  return waitMetaData(videoEle);
};

/**
 *
 * @param {HTMLVideoElement} videoEle
 * @param {number} frameDuration
 */
const getKeyFrames = async (videoEle, frameCallback) => {
  const canvasEle = document.createElement('canvas');

  const canvasContext = canvasEle.getContext('2d');

  const duration = videoEle.duration;
  /**
   *
   * @param {HTMLVideoElement} ele
   */
  return new Promise(async (resolve) => {
    const frameWidth = trackEle.clientWidth / 8;
    const scale = 2;
    const heightWidthRate = videoEle.videoHeight / videoEle.videoWidth;
    const renderWidth = (scale * frameWidth) / Math.min(heightWidthRate, 1);
    const renderHeight = scale * frameWidth * Math.max(heightWidthRate, 1);
    videoEle.width = renderWidth;
    videoEle.height = renderHeight;
    canvasEle.width = renderWidth;
    canvasEle.height = renderHeight;
    videoContainer.appendChild(videoEle);
    let step = 0;
    const range = duration / 8;
    const time = Date.now();
    const handleTimeUpdate = () => {
      canvasContext.drawImage(videoEle, 0, 0, renderWidth, renderHeight);
      const base64Url = canvasEle.toDataURL('image/jpeg');
      console.log(videoEle.currentTime);
      frameCallback(base64Url, step);
      if (step === 7) {
        videoEle.removeEventListener('timeupdate', handleTimeUpdate);
        resolve();
        console.log('end');
        console.log(`${Date.now() - time}ms`);
        videoEle.remove();
        return;
      }
      step++;
      videoEle.currentTime = step * range;
    };
    videoEle.addEventListener('timeupdate', handleTimeUpdate);
    videoEle.currentTime = step * range;
  });
};

setKeyframeEle = (url, index) => {
  const ele = document.getElementById(`frame-${index + 1}`);
  ele.style.backgroundImage = `url(${url})`;
};

const startFromFile = async () => {
  while (true) {
    const videoEle = await loadVideoFromFile();
    await getKeyFrames(videoEle, setKeyframeEle);
  }
};

const startFromUrl = async () => {
  const videoEle = await loadVideoFromUrl('./3分39秒版.mp4');
  await getKeyFrames(videoEle, setKeyframeEle);
};

startFromFile();
// startFromUrl();
