# 🐱 摸凹猫

一款可爱的移动端Web应用，帮助你认识各种猫咪品种！

## 📱 功能特色

- 🏠 **主页** - 展示你的专属电子猫猫
- 📚 **图鉴** - 收录15种猫咪品种，通过拍照解锁
- 🎬 **AI视频总结** - 一键总结抖音猫咪视频
- 📷 **拍照识别** - 拍照识别猫咪品种（支持真实API和模拟数据）
- 🐱 **猫猫语言** - 学习猫咪的各种叫声
- 👤 **我的** - 个性化设置

## 🛠️ 技术栈

### 前端
- React 18 + Vite
- React Router v6
- Context + useReducer 状态管理
- IndexedDB (idb) + localStorage
- Canvas API

### 后端
- Node.js + Express
- Axios
- CORS
- dotenv (环境变量管理)

## 🚀 快速开始

### 1. 安装依赖

#### 后端
```bash
cd backend
npm install
```

#### 前端
```bash
cd frontend
npm install
```

### 2. 配置环境变量（可选）

在 `backend` 目录下复制 `.env.example` 为 `.env`：

```bash
cd backend
cp .env.example .env
```

然后编辑 `.env` 文件，填入你的 API Key（详见下方「API配置」部分）。

### 3. 启动服务

#### 启动后端（端口3001）
```bash
cd backend
npm start
```

#### 启动前端（端口5173）
打开新的终端窗口：
```bash
cd frontend
npm run dev
```

### 4. 访问应用

- 电脑浏览器：http://localhost:5173
- 手机访问：查看电脑IP地址，在手机浏览器访问 `http://[电脑IP]:5173`

> ⚠️ 确保手机和电脑在同一WiFi网络下

## 🔑 API 配置

### 猫品种识别（Nyckel）

1. 访问 https://www.nyckel.com 注册账号
2. 创建一个猫品种识别的分类器（或使用预训练模型）
3. 获取你的 API Key 和 Function ID
4. 在 `backend/.env` 中配置：
   ```
   NYCKEL_API_KEY=你的nyckel_api_key
   NYCKEL_FUNCTION_ID=你的function_id
   ```
5. 重启后端服务

> 如果不配置，会自动使用模拟数据

### 视频总结（通义千问 - 推荐）

1. 访问 https://bailian.console.aliyun.com 注册阿里云账号
2. 开通「百炼大模型服务」（新人有90天免费额度）
3. 创建 API-KEY，获取你的 DashScope API Key
4. 在 `backend/.env` 中配置：
   ```
   DASHSCOPE_API_KEY=你的dashscope_api_key
   ```
5. 重启后端服务

> 如果不配置，会自动使用模拟数据

### 视频总结（BibiGPT - 备用）

1. 访问 https://bibigpt.co 申请API Key
2. 在 `backend/.env` 中配置：
   ```
   BIBIGPT_API_KEY=你的bibigpt_api_key
   ```
3. 重启后端服务

> 如果不配置，会使用模拟总结数据

### 通义千问（备选方案）

1. 访问 https://help.aliyun.com/zh/model-studio/ 注册并获取免费额度
2. 在 `backend/.env` 中配置：
   ```
   DASHSCOPE_API_KEY=你的dashscope_api_key
   ```

## 📱 测试步骤

### 1. 解锁猫咪品种
- 进入「拍照识别」页面
- 允许相机权限
- 点击快门拍照（会随机识别一个品种，或使用真实API识别）
- 识别成功后该品种会在图鉴中解锁

### 2. 设置主界面猫猫
- 进入「图鉴」
- 点击已解锁的品种
- 点击「设为主界面小猫」

### 3. 测试视频总结
- 进入「AI视频总结」
- 粘贴任意抖音视频链接或ID
- 点击「一键总结」

### 4. 制作meme
- 进入品种详情页
- 上传一张图片
- 选择预设文字
- 生成并保存meme

### 5. 个性化设置
- 进入「我的」
- 更换头像、编辑昵称
- 调整文本大小、主题颜色、按钮圆角

## 📂 项目结构

```
dianzimao_3/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── .env.example          # 环境变量模板
│   ├── routes/
│   │   ├── summarize.js      # 视频总结路由
│   │   └── recognize.js      # 猫品种识别路由（新增）
│   └── utils/
│       └── bibigpt.js
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   │   ├── manifest.json
│   │   └── sounds/ (需要添加音频文件)
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── pages/
│       │   ├── CameraPage.jsx    # 已更新，支持真实API
│       │   └── ...
│       ├── components/
│       ├── stores/
│       ├── utils/
│       │   └── camera.js      # 已更新
│       ├── data/
│       └── styles/
└── README.md
```

## 📝 注意事项

1. **音频文件**：需要在 `frontend/public/sounds/` 目录下添加音频文件（hungry.mp3, play.mp3等）
2. **HTTPS**：相机功能需要在HTTPS环境下使用（localhost除外）
3. **移动端**：建议使用手机测试以获得最佳体验
4. **API Key**：不配置API Key也能正常使用，系统会自动回退到模拟数据

## 🔧 故障排查

### 后端启动失败
- 确认端口3001未被占用
- 运行 `npm install` 安装依赖

### 拍照识别不工作
- 检查是否授予相机权限
- 确认后端服务正常运行
- 查看浏览器控制台错误信息

### API调用失败
- 确认 `.env` 文件配置正确
- 检查API Key是否有效
- 查看后端控制台日志

## 🐾 享受你的猫咪探索之旅！
