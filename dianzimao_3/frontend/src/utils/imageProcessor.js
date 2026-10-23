export async function loadImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (error) => {
      console.error('图片加载失败:', imageUrl, error);
      reject(error);
    };
    img.src = imageUrl;
  });
}

export function createMeme(baseImage, text, options = {}) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = baseImage.width;
  canvas.height = baseImage.height;
  
  ctx.drawImage(baseImage, 0, 0);
  
  const fontSize = Math.max(24, canvas.width / 15);
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = Math.max(3, fontSize / 8);
  
  const lines = wrapText(ctx, text, canvas.width - 40);
  const lineHeight = fontSize * 1.2;
  const startY = canvas.height - (lines.length * lineHeight) - 20;
  
  lines.forEach((line, index) => {
    const y = startY + index * lineHeight;
    ctx.strokeText(line, canvas.width / 2, y);
    ctx.fillText(line, canvas.width / 2, y);
  });
  
  return canvas;
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split('');
  const lines = [];
  let currentLine = '';
  
  for (const char of words) {
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

export async function saveImage(canvas, filename = 'cat-meme.jpg') {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      try {
        if (navigator.share) {
          const file = new File([blob], filename, { type: 'image/jpeg' });
          await navigator.share({
            files: [file],
            title: filename
          });
          resolve();
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    }, 'image/jpeg', 0.9);
  });
}

export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
