const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const router = express.Router();

const NYCKEL_API_KEY = process.env.NYCKEL_API_KEY;
const NYCKEL_FUNCTION_ID = process.env.NYCKEL_FUNCTION_ID || 'cat_breed_classifier';

const BAIDU_API_KEY = process.env.BAIDU_API_KEY;
const BAIDU_SECRET_KEY = process.env.BAIDU_SECRET_KEY;
let BAIDU_ACCESS_TOKEN = null;
let TOKEN_EXPIRE_TIME = 0;

let tempBreedId = 16; // 未知品种ID从16开始
let knownUnknownBreeds = {}; // 记录已添加的未知品种，名称 -> ID映射

const breedMapping = {
  'Persian': 7,
  'American Shorthair': 3,
  'British Shorthair': 2,
  'Siamese': 4,
  'Ragdoll': 1,
  'Maine Coon': 5,
  'Scottish Fold': 6,
  'Exotic Shorthair': 8,
  'Sphynx': 10,
  'Bengal': 11,
  'Russian Blue': 9,
  'Norwegian Forest Cat': 12,
  'Devon Rex': 13,
  'Oriental Shorthair': 14,
  'Abyssinian': 15
};

const recognizeWithNyckel = async (imageBase64) => {
  try {
    if (!NYCKEL_API_KEY || NYCKEL_API_KEY === 'your_nyckel_api_key_here') {
      console.log('Nyckel API Key 未配置，使用模拟识别');
      return null;
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const form = new FormData();
    form.append('data', imageBuffer, {
      filename: 'cat.jpg',
      contentType: 'image/jpeg'
    });

    const response = await axios.post(
      `https://www.nyckel.com/v1/functions/${NYCKEL_FUNCTION_ID}/invoke`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${NYCKEL_API_KEY}`
        },
        timeout: 30000
      }
    );

    if (response.data && response.data.labelName) {
      const breedName = response.data.labelName;
      const confidence = response.data.confidence || 0;
      
      const breedId = breedMapping[breedName];
      if (breedId) {
        return {
          success: true,
          breedId: breedId,
          breedName: breedName,
          confidence: confidence,
          healthStatus: '眼睛明亮，毛发光滑'
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Nyckel API 调用失败:', error.message);
    return null;
  }
};

const getBaiduAccessToken = async () => {
  const now = Date.now();
  if (BAIDU_ACCESS_TOKEN && now < TOKEN_EXPIRE_TIME) {
    return BAIDU_ACCESS_TOKEN;
  }

  try {
    const response = await axios.get(
      'https://aip.baidubce.com/oauth/2.0/token',
      {
        params: {
          grant_type: 'client_credentials',
          client_id: BAIDU_API_KEY,
          client_secret: BAIDU_SECRET_KEY
        }
      }
    );

    if (response.data.access_token) {
      BAIDU_ACCESS_TOKEN = response.data.access_token;
      TOKEN_EXPIRE_TIME = now + (response.data.expires_in - 60) * 1000;
      console.log('百度access_token获取成功');
      return BAIDU_ACCESS_TOKEN;
    }
    return null;
  } catch (error) {
    console.error('获取百度access_token失败:', error.message);
    return null;
  }
};

const baiduBreedMapping = {
  '布偶猫': 1,
  '英短蓝白': 2,
  '英国短毛猫': 2,
  '美短': 3,
  '美国短毛猫': 3,
  '暹罗猫': 4,
  '缅因猫': 5,
  '豹猫': 6,
  '孟加拉豹猫': 6,
  '加菲猫': 7,
  '金渐层': 8,
  '矮脚猫': 9,
  '曼基康猫': 9,
  '无毛猫': 10,
  '斯芬克斯猫': 10,
  '德文猫': 11,
  '德文卷毛猫': 11,
  '三花猫': 12,
  '狸花猫': 13,
  '奶牛猫': 14,
  '曼切斯特': 15,
  '曼切斯特猫': 15
};

const recognizeWithBaidu = async (imageBase64) => {
  try {
    if (!BAIDU_API_KEY || !BAIDU_SECRET_KEY || 
        BAIDU_API_KEY === 'your_baidu_api_key_here' || 
        BAIDU_SECRET_KEY === 'your_baidu_secret_key_here') {
      console.log('百度API Key未配置，使用模拟识别');
      return null;
    }

    const accessToken = await getBaiduAccessToken();
    if (!accessToken) {
      return null;
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const response = await axios.post(
      'https://aip.baidubce.com/rest/2.0/image-classify/v1/animal',
      { image: base64Data },
      {
        params: { access_token: accessToken },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 30000
      }
    );

    console.log('百度API响应:', response.data);

    if (response.data && response.data.result && response.data.result.length > 0) {
      const firstResult = response.data.result[0];
      
      if (firstResult.name === '非动物') {
        console.log('百度API识别为非动物，直接返回失败');
        return {
          success: false,
          error: '识别失败：图片中不是动物，请上传猫咪图片'
        };
      }

      for (const animal of response.data.result) {
        let breedName = animal.name;
        const confidence = animal.score / 100;

        let breedId = baiduBreedMapping[breedName];
        
        if (!breedId) {
          for (const [cnName, id] of Object.entries(baiduBreedMapping)) {
            if (breedName.includes(cnName) || cnName.includes(breedName)) {
              breedId = id;
              breedName = cnName;
              break;
            }
          }
        }

        if (breedId) {
          return {
            success: true,
            breedId: breedId,
            breedName: breedName,
            confidence: confidence,
            healthStatus: '眼睛明亮，毛发光滑'
          };
        }

        if (breedName.includes('猫') || animal.name.includes('猫')) {
          console.log(`识别到未知猫品种: ${breedName}，正在生成介绍...`);
          const unknownBreedInfo = await generateUnknownBreedInfo(breedName);
          return {
            success: true,
            breedId: unknownBreedInfo.id,
            breedName: breedName,
            confidence: confidence,
            healthStatus: '眼睛明亮，毛发光滑',
            unknownBreed: true,
            breedInfo: unknownBreedInfo
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('百度API调用失败:', error.message);
    return null;
  }
};

async function generateUnknownBreedInfo(breedName) {
  // 先检查是否已经添加过
  if (knownUnknownBreeds[breedName]) {
    console.log(`品种${breedName}已经存在，ID: ${knownUnknownBreeds[breedName]}`);
    return {
      id: knownUnknownBreeds[breedName],
      name: breedName,
      description: `${breedName}是一种可爱的猫咪品种。`,
      imageUrl: '',
      isUnlocked: true,
      isTemporary: true,
      alreadyExists: true,
      memeTexts: ['喵的凝视', '还不给罐头', '本喵知道了']
    };
  }

  try {
    const apiKey = process.env.DASHSCOPE_API_KEY;
    
    if (!apiKey || apiKey === 'your_dashscope_api_key_here') {
      console.log('通义千问API未配置，使用默认描述');
      const newId = tempBreedId++;
      knownUnknownBreeds[breedName] = newId;
      return {
        id: newId,
        name: breedName,
        description: `这是一个新发现的品种：${breedName}。它们有着独特的外貌和温顺的性格，喜欢与人互动，是很好的家庭宠物。`,
        imageUrl: '',
        isUnlocked: true,
        isTemporary: true,
        memeTexts: ['喵的凝视', '还不给罐头', '本喵知道了']
      };
    }

    const apiUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

    const prompt = `请介绍一下猫咪品种"${breedName}"，包括：
1. 简短描述（约100-150字）
2. 性格特点

请用JSON格式输出，只返回JSON：
{
  "description": "品种介绍",
  "character": "性格特点"
}`;

    const requestBody = {
      model: 'qwen-turbo',
      input: {
        messages: [
          {
            role: 'system',
            content: '你是一个专业的宠物百科助手，熟悉各种猫咪品种。'
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
      const content = response.data.output.choices[0].message.content;
      
      let info;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          info = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.log('解析JSON失败，使用默认');
      }

      const description = info?.description || `这是一个新发现的品种：${breedName}。它们有着独特的外貌和温顺的性格，喜欢与人互动，是很好的家庭宠物。`;
      
      const newId = tempBreedId++;
      knownUnknownBreeds[breedName] = newId;
      return {
        id: newId,
        name: breedName,
        description: description,
        imageUrl: '',
        isUnlocked: true,
        isTemporary: true,
        memeTexts: ['喵的凝视', '还不给罐头', '本喵知道了']
      };
    }

  } catch (error) {
    console.log('生成未知品种信息失败:', error.message);
  }

  const newId = tempBreedId++;
  knownUnknownBreeds[breedName] = newId;
  return {
    id: newId,
    name: breedName,
    description: `这是一个新发现的品种：${breedName}。它们有着独特的外貌和温顺的性格，喜欢与人互动，是很好的家庭宠物。`,
    imageUrl: '',
    isUnlocked: true,
    isTemporary: true,
    memeTexts: ['喵的凝视', '还不给罐头', '本喵知道了']
  };
}

const fakeRecognize = () => {
  const breedIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const randomId = breedIds[Math.floor(Math.random() * breedIds.length)];
  
  const breedNames = {
    1: '布偶猫', 2: '英国短毛猫', 3: '美国短毛猫', 4: '暹罗猫', 5: '缅因猫',
    6: '苏格兰折耳猫', 7: '波斯猫', 8: '加菲猫', 9: '俄罗斯蓝猫', 10: '斯芬克斯猫',
    11: '孟加拉豹猫', 12: '挪威森林猫', 13: '德文卷毛猫', 14: '东方短毛猫', 15: '阿比西尼亚猫'
  };

  return {
    success: true,
    breedId: randomId,
    breedName: breedNames[randomId],
    confidence: Math.random() * 0.5 + 0.5,
    healthStatus: '眼睛明亮，毛发光滑',
    isMock: true
  };
};

router.post('/recognize-cat', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: '请提供图片数据'
      });
    }

    let result = await recognizeWithBaidu(image);

    if (result && result.success === false) {
      return res.json(result);
    }

    if (!result) {
      result = await recognizeWithNyckel(image);
    }

    if (!result) {
      return res.json({
        success: false,
        error: '识别错误，请上传猫咪图片重试'
      });
    }

    res.json(result);
  } catch (error) {
    console.error('识别失败:', error);
    res.status(500).json({
      success: false,
      error: '识别服务暂时不可用，请稍后重试'
    });
  }
});

module.exports = router;
