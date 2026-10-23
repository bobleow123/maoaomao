const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const router = express.Router();
const { summarizeVideo } = require('../utils/video-summary');

function runPythonScript(videoUrl) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../utils/video_processor.py');
    
    let pythonCmd = 'python';
    if (process.platform === 'win32') {
      pythonCmd = 'python' || 'py';
    }

    console.log('执行Python命令:', pythonCmd, scriptPath, videoUrl);

    const childProcess = spawn(pythonCmd, [scriptPath, videoUrl], {
      encoding: 'utf8',
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
        PYTHONLEGACYWINDOWSIOENCODING: 'utf-8'
      }
    });
    let output = '';
    let errorOutput = '';

    childProcess.stdout.setEncoding('utf8');
    childProcess.stderr.setEncoding('utf8');

    childProcess.stdout.on('data', (data) => {
      const str = data.toString();
      console.log('[Python stdout]:', str);
      output += str;
    });

    childProcess.stderr.on('data', (data) => {
      const str = data.toString();
      console.log('[Python stderr]:', str);
      errorOutput += str;
    });

    childProcess.on('close', (code) => {
      console.log('Python进程退出，代码:', code);
      if (code !== 0) {
        console.error('Python脚本错误:', errorOutput);
        reject(new Error('视频处理失败'));
        return;
      }
      try {
        // 只解析最后一行的 JSON
        const lines = output.trim().split('\n');
        const lastLine = lines[lines.length - 1].trim();
        console.log('尝试解析:', lastLine);
        const result = JSON.parse(lastLine);
        resolve(result);
      } catch (e) {
        console.error('解析结果错误:', e, '完整输出:', output);
        reject(new Error('结果解析失败'));
      }
    });

    childProcess.on('error', (err) => {
      console.error('启动Python失败:', err);
      reject(err);
    });
  });
}

router.post('/summarize-douyin', async (req, res) => {
  try {
    const { videoId, videoUrl, localPath, videoTitle, useNewPipeline } = req.body;

    if (!videoId && !videoUrl && !localPath) {
      return res.status(400).json({
        success: false,
        error: '缺少视频ID、链接或本地路径'
      });
    }

    const targetUrl = localPath || videoUrl || `https://www.douyin.com/video/${videoId}`;

    // 如果使用新流水线（默认开启）
    if (useNewPipeline !== false) {
      try {
        console.log('使用新视频总结流水线...');
        const result = await runPythonScript(targetUrl);
        if (result.success) {
          return res.json({
            success: true,
            summary: result.summary,
            pipeline: 'new'
          });
        } else {
          console.log('新流水线失败，回退到旧方式:', result.error);
        }
      } catch (err) {
        console.log('新流水线执行失败，回退到旧方式:', err.message);
      }
    }

    // 默认使用旧的方式
    console.log('使用旧视频总结方式...');
    const summary = await summarizeVideo(targetUrl, videoTitle);
    res.json({
      success: true,
      summary,
      pipeline: 'legacy'
    });

  } catch (error) {
    console.error('总结视频失败:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || '服务器错误，请稍后重试'
    });
  }
});

module.exports = router;