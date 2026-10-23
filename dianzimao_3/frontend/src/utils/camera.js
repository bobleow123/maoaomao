let mediaStream = null;
let currentFacingMode = 'environment';

export async function startCamera(videoElement, facingMode = 'environment') {
  try {
    if (mediaStream) {
      stopCamera();
    }

    currentFacingMode = facingMode;
    
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });

    if (videoElement) {
      videoElement.srcObject = mediaStream;
      await videoElement.play();
    }

    return mediaStream;
  } catch (error) {
    console.error('启动相机失败:', error);
    throw error;
  }
}

export function stopCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
}

export async function switchCamera(videoElement) {
  const newFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
  return await startCamera(videoElement, newFacingMode);
}

export function captureFrame(videoElement) {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0);
  
  return canvas.toDataURL('image/jpeg', 0.8);
}
