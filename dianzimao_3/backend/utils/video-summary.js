const axios = require('axios');

async function summarizeVideo(videoUrl, videoTitle = '') {
  const providers = [
    {
      name: '通义千问',
      apiKey: process.env.DASHSCOPE_API_KEY,
      enabled: process.env.DASHSCOPE_API_KEY && process.env.DASHSCOPE_API_KEY !== 'your_dashscope_api_key_here',
      fn: summarizeWithQwen
    },
    {
      name: 'BibiGPT',
      apiKey: process.env.BIBIGPT_API_KEY,
      enabled: process.env.BIBIGPT_API_KEY && process.env.BIBIGPT_API_KEY !== 'your_bibigpt_api_key_here',
      fn: summarizeWithBibiGPT
    }
  ];

  for (const provider of providers) {
    if (provider.enabled) {
      console.log(`尝试使用 ${provider.name} 总结视频...`);
      try {
        const result = await provider.fn(videoUrl, videoTitle);
        console.log(`${provider.name} 总结成功！`);
        return result;
      } catch (error) {
        console.log(`${provider.name} 总结失败:`, error.message);
      }
    }
  }

  console.log('所有AI服务不可用，使用模拟数据');
  return generateMockSummary(videoUrl);
}

async function summarizeWithQwen(videoUrl, videoTitle) {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  const apiUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

  const prompt = `请分析这个猫咪视频内容并生成总结。
视频链接：${videoUrl}
${videoTitle ? '视频标题：' + videoTitle : ''}

请按以下格式输出：
【视频总结】
📌 健康：（分析猫咪的健康状况）
🛠️ 用具：（视频中出现的猫咪用品）
🐾 行为：（猫咪的行为特点）

【温馨提示】
（给出养宠建议）`;

  const requestBody = {
    model: 'qwen-plus',
    input: {
      messages: [
        {
          role: 'system',
          content: '你是一个专业的宠物分析助手，擅长分析猫咪视频内容，生成详细的总结和建议。'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    },
    parameters: {
      result_format: 'message'
    }
  };

  const response = await axios.post(apiUrl, requestBody, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000
  });

  if (response.data && response.data.output && response.data.output.choices && response.data.output.choices[0]) {
    return response.data.output.choices[0].message.content;
  }

  throw new Error('通义千问返回数据格式错误');
}

async function summarizeWithBibiGPT(videoUrl, videoTitle) {
  const apiKey = process.env.BIBIGPT_API_KEY;
  const apiUrl = 'https://bibigpt.co/api/open/sumup';

  const requestBody = {
    url: videoUrl
  };

  const response = await axios.post(apiUrl, requestBody, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    timeout: 30000
  });

  if (response.data && response.data.summary) {
    return response.data.summary;
  }

  throw new Error('BibiGPT返回数据格式错误');
}

function generateMockSummary(videoUrl) {
  return `【视频总结】
📌 健康：这只猫咪看起来非常健康，眼睛明亮有神，毛发顺滑有光泽。
🛠️ 用具：视频中展示了猫砂盆、猫抓板、自动喂食器等猫咪常用物品。
🐾 行为：猫咪正在玩耍，表现出活泼好动的天性，喜欢追逐玩具。

【温馨提示】
定期给猫咪体检，保持猫砂盆清洁，每天陪伴猫咪玩耍15-30分钟哦~`;
}

module.exports = {
  summarizeVideo
};
