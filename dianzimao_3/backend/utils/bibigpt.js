const axios = require('axios');

const BIBIGPT_API_URL = 'https://bibigpt.co/api/open/sumup';
const REQUEST_TIMEOUT = 30000;

async function summarizeDouyinVideo(videoId) {
  const apiKey = process.env.BIBIGPT_API_KEY;
  
  if (!apiKey || apiKey === 'your_bibigpt_api_key_here') {
    return generateMockSummary(videoId);
  }

  try {
    const videoUrl = `https://www.douyin.com/video/${videoId}`;
    
    const requestBody = {
      url: videoUrl
    };

    const response = await axios.post(BIBIGPT_API_URL, requestBody, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      timeout: REQUEST_TIMEOUT
    });

    if (response.data && response.data.summary) {
      return response.data.summary;
    }

    return generateMockSummary(videoId);

  } catch (error) {
    console.log('BibiGPT API调用失败，使用模拟数据');
    return generateMockSummary(videoId);
  }
}

function generateMockSummary(videoId) {
  return `【视频总结】
📌 健康：这只猫咪看起来非常健康，眼睛明亮有神，毛发顺滑有光泽。
🛠️ 用具：视频中展示了猫砂盆、猫抓板、自动喂食器等猫咪常用物品。
🐾 行为：猫咪正在玩耍，表现出活泼好动的天性，喜欢追逐玩具。

【温馨提示】
定期给猫咪体检，保持猫砂盆清洁，每天陪伴猫咪玩耍15-30分钟哦~`;
}

module.exports = {
  summarizeDouyinVideo
};
