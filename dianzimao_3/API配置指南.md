# 🐱 摸凹猫 - API 配置指南

## 📋 目录
- [视频总结（通义千问 - 推荐）](#视频总结通义千问---推荐)
- [视频总结（BibiGPT - 备选）](#视频总结bibigpt---备选)
- [猫品种识别（Nyckel）](#猫品种识别nyckel)
- [快速开始](#快速开始)

---

## 🎬 视频总结（通义千问 - 推荐）

### ✨ 为什么推荐通义千问？
- **90天免费额度** - 新人注册即送，足够开发测试使用
- **国内访问快** - 阿里云服务，稳定可靠
- **中文理解好** - 对中文内容理解更准确

### 🔧 配置步骤

#### 1. 注册阿里云账号
访问：https://bailian.console.aliyun.com/

#### 2. 开通百炼大模型服务
- 登录后，点击"开通百炼"
- 按照提示完成开通（免费）

#### 3. 创建 API Key
- 在左侧菜单找到"API-KEY管理"
- 点击"创建新的API-KEY"
- 复制生成的 API Key（格式：sk-xxxxxx...）

#### 4. 配置到项目
在 `backend` 目录下：

```bash
# 复制配置模板
copy .env.example .env
```

编辑 `.env` 文件，找到这一行：
```env
DASHSCOPE_API_KEY=sk-你的真实APIKey
```

把 `sk-你的真实APIKey` 替换成你刚才复制的 API Key

#### 5. 重启后端服务
```bash
cd backend
npm start
```

完成！现在可以使用真实 AI 总结视频了！

---

## 🎬 视频总结（BibiGPT - 备选）

如果通义千问无法使用，可以尝试 BibiGPT

### 🔧 配置步骤

#### 1. 注册 BibiGPT
访问：https://bibigpt.co/

#### 2. 获取 API Key
- 注册登录后
- 在个人中心或设置页面找到 API Key

#### 3. 配置到项目
编辑 `backend/.env` 文件：
```env
BIBIGPT_API_KEY=你的BibiGPT_APIKey
```

---

## 🐱 猫品种识别（Nyckel）

### 🔧 配置步骤

#### 1. 注册 Nyckel
访问：https://www.nyckel.com/

#### 2. 使用预训练模型
Nyckel 有预训练好的猫品种分类器，可以直接使用

#### 3. 获取 API Key 和 Function ID
- 在账户设置中找到 API Key
- 找到猫品种分类器的 Function ID

#### 4. 配置到项目
编辑 `backend/.env` 文件：
```env
NYCKEL_API_KEY=你的Nyckel_APIKey
NYCKEL_FUNCTION_ID=cat_breed_classifier
```

---

## 🚀 快速开始

### 不想配置 API？
没关系！项目默认使用模拟数据，可以正常体验所有功能！

```bash
# 1. 启动后端
cd backend
npm install
npm start

# 2. 启动前端（新终端）
cd frontend
npm install
npm run dev
```

访问：http://localhost:5173

### 配置了 API 后
配置好 API Key 后，系统会优先使用真实 API，失败时自动回退到模拟数据

---

## 💡 提示

- **通义千问免费额度**：新人90天免费，之后按量付费
- **BiliNote**：是完整项目，如需本地部署需要Python+FFmpeg，比较复杂
- **模拟数据**：不配置API也能完整体验所有功能！

---

## ❓ 常见问题

**Q: API 调用失败怎么办？**
A: 系统会自动回退到模拟数据，不影响使用

**Q: 免费额度用完了怎么办？**
A: 可以继续使用模拟数据，或者付费继续使用

**Q: 可以同时配置多个 API 吗？**
A: 可以！系统会按优先级尝试：通义千问 → BibiGPT → 模拟数据
