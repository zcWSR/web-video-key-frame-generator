const videoInput = document.getElementById('video-input');
const keyFrameContainerEle = document.getElementById('key-frames');

const VIDEO_WIDTH = 500 / 5;
const VIDEO_HEIGHT = 400 / 5;

const getVideoBlob = () =>
  new Promise((resolve) => {
    videoInput.addEventListener('change', (e) => {
      resolve(URL.createObjectURL(e.target.files[0]));
    });
  });

const loadVideoFromFile = async () => {
  const blob = await getVideoBlob();
  const videoEle = document.createElement('video');
  videoEle.width = VIDEO_WIDTH;
  videoEle.height = VIDEO_HEIGHT;
  videoEle.controls = true;
  videoEle.src = blob;
  videoEle.volume = 0;
  // videoInput.after(videoEle);
  return new Promise((resolve) => {
    videoEle.onloadedmetadata = () => resolve(videoEle);
  });
};

const loadVideoFromUrl = (url) => {
  const videoEle = document.createElement('video');
  videoEle.width = VIDEO_WIDTH;
  videoEle.height = VIDEO_HEIGHT;
  videoEle.controls = true;
  videoEle.src = url;
  return videoEle;
};

const waitMetaData = (videoEle) => {
  if (videoEle.HAVE_METADATA) {
    return;
  }
  return new Promise((resolve) => {
    videoEle.onloadedmetadata = (e) => resolve(videoEle);
  });
};

/**
 *
 * @param {HTMLVideoElement} videoEle
 * @param {number} frameDuration
 */
const getKeyFrames = async (videoEle, frameDuration, process, frameCallback) => {
  const canvasEle = document.createElement('canvas');
  canvasEle.width = VIDEO_WIDTH;
  canvasEle.height = VIDEO_HEIGHT;
  const canvasContext = canvasEle.getContext('2d');

  await waitMetaData(videoEle);
  const duration = videoEle.duration;
  let isLastFrameLoaded = false;
  /**
   *
   * @param {HTMLVideoElement} ele
   */
  const addHandler = (ele, offset) =>
    new Promise(async (resolve) => {
      // videoInput.after(ele);
      const handleTimeUpdate = () => {
        if (isLastFrameLoaded && ele.currentTime === duration) {
        }
        canvasContext.drawImage(ele, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
        const base64Url = canvasEle.toDataURL('image/jpeg', 0.5);
        console.log(ele.currentTime);
        frameCallback(base64Url, ele.currentTime);
        if (ele.currentTime < duration) {
          if (
            frameDuration * process + ele.currentTime >= duration &&
            isLastFrameLoaded
          ) {
            ele.removeEventListener('timeupdate', handleTimeUpdate);
            resolve();
          } else {
            ele.currentTime += frameDuration * process;
          }
          return;
        } else if (!isLastFrameLoaded && ele.currentTime === duration) {
          isLastFrameLoaded = true;
          ele.removeEventListener('timeupdate', handleTimeUpdate);
          resolve();
          return;
        }
        resolve();
      };
      ele.addEventListener('timeupdate', handleTimeUpdate);
      ele.currentTime = offset;
    });

  const tasks = [];
  for (let i = 0; i < process; i++) {
    let ele = i === 0 ? videoEle : videoEle.cloneNode();
    tasks.push(addHandler(ele, i * frameDuration));
  }
  return Promise.all(tasks);
};

const frameList = [];

setKeyframeEle = (url, time) => {
  const img = document.createElement('img');
  img.src = url;
  img.width = VIDEO_WIDTH / 2;
  img.height = VIDEO_HEIGHT / 2;
  frameList.push({ ele: img, time });
};

const start = async () => {
  const videoEle = await loadVideoFromFile();
  const time = Date.now();
  await getKeyFrames(videoEle, 5, 2, setKeyframeEle);
  console.log('end');
  console.log(`${Date.now() - time}ms`);
  frameList
    .sort((a, b) => a.time - b.time)
    .map(({ ele }) => {
      keyFrameContainerEle.appendChild(ele);
    });
  // const remoteVideoEle = await loadVideoFromUrl('./bad apple.mp4');
  // getKeyFrames(remoteVideoEle, 5, setKeyframeEle);
};

start();
