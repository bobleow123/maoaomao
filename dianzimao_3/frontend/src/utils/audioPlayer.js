const audioCache = new Map();

export async function playAudio(audioUrl) {
  try {
    let audio = audioCache.get(audioUrl);
    
    if (!audio) {
      audio = new Audio(audioUrl);
      audioCache.set(audioUrl, audio);
    }
    
    audio.pause();
    audio.currentTime = 0;
    await audio.play();
    
    return audio;
  } catch (error) {
    console.error('播放音频失败:', error);
    throw error;
  }
}

export function stopAudio(audioUrl) {
  const audio = audioCache.get(audioUrl);
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

export function preloadAudio(audioUrls) {
  audioUrls.forEach(url => {
    const audio = new Audio(url);
    audio.preload = 'auto';
    audioCache.set(url, audio);
  });
}
