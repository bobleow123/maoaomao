const axios = require('axios');

const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
const REQUEST_TIMEOUT = 30000;

async function summarizeVideoWithQwen(videoUrl, videoTitle = '') {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  
  if (!apiKey || apiKey === 'your_dashscope_api_key_here') {
    console.log('未配置通义千问API Key，使用模拟数据');
    return generateMockSummary(videoUrl);
  }

  try {
    const prompt = `请分析这个抖音视频内容并生成总结。
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

    const response = await axios.post(QWEN_API_URL, requestBody, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: REQUEST_TIMEOUT
    });

    if (response.data && response.data.output && response.data.output.choices && response.data.output.choices[0]) {
      return response.data.output.choices[0].message.content;
    }

    return generateMockSummary(videoUrl);

  } catch (error) {
    console.log('通义千问API调用失败:', error.message);
    if (error.response && error.response.data) {
      console.log('错误详情:', error.response.data);
    }
    return generateMockSummary(videoUrl);
  }
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
  summarizeVideoWithQwen
};
