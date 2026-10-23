# 抖音视频总结流水线 - 安装与使用说明

## 前置要求

1. **Node.js** (已安装，项目已配置)
2. **Python 3.8+** (需要安装)
3. **FFmpeg** (视频处理需要)

## 安装步骤

### 1. 安装 Python

从 https://www.python.org/downloads/ 下载并安装 Python 3.8 或更高版本。

安装时确保勾选 "Add Python to PATH" 选项。

### 2. 安装 FFmpeg

#### Windows:
- 下载 FFmpeg: https://github.com/BtbN/FFmpeg-Builds/releases
- 解压到某个目录（例如 C:\ffmpeg）
- 将 bin 目录添加到系统环境变量 PATH 中

#### macOS:
```bash
brew install ffmpeg
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt-get install ffmpeg
```

### 3. 安装 Python 依赖

打开命令行，进入 `backend` 目录：

```bash
cd backend
pip install -r requirements.txt
```

或者单独安装：

```bash
pip install requests opencv-python moviepy Pillow python-dotenv aiohttp numpy
```

### 4. 确保百度API配置正确

检查 `backend/.env` 文件，确保包含：

```
BAIDU_API_KEY=你的百度API_KEY
BAIDU_SECRET_KEY=你的百度SECRET_KEY
```

## 使用说明

### 启动服务

1. 启动后端服务（在 backend 目录）：
```bash
npm start
```

2. 启动前端服务（在 frontend 目录，新终端）：
```bash
npm run dev
```

### 使用视频总结功能

1. 访问前端页面，进入"抖音视频总结"
2. 粘贴抖音视频链接
3. 点击"一键总结"
4. 等待处理完成，查看生成的总结

## 工作流程说明

系统会自动执行以下步骤：

1. **下载视频** - 从抖音链接下载视频
2. **拆帧** - 每秒抽取一帧，去重后保留 6-12 张关键帧
3. **提取音频** - 从视频中提取音频
4. **图像识别** - 调用百度通用物体识别分析画面内容
5. **语音识别** - 调用百度ASR将音频转文字
6. **生成总结** - 调用文心ERNIE整合画面和语音生成结构化总结

## 注意事项

1. **API额度** - 确保百度API有足够的免费额度
2. **网络问题** - 视频下载需要稳定的网络连接
3. **FFmpeg** - 必须安装FFmpeg才能正常工作
4. **Python环境** - 确保Python命令可以正常使用

## 故障排除

### Python命令找不到
- 确保Python已添加到系统PATH
- 尝试使用 `py` 命令（Windows）或 `python3`（Mac/Linux）

### FFmpeg错误
- 确认FFmpeg已正确安装并添加到PATH
- 在命令行运行 `ffmpeg -version` 检查是否正常

### 下载视频失败
- 抖音链接可能有访问限制
- 可以尝试先手动下载视频，然后修改代码支持本地文件

### API调用失败
- 检查 `.env` 文件中的API Key是否正确
- 确认百度账户有相应的API服务权限
- 检查API额度是否用完

## 降级方案

如果新流水线无法正常工作，系统会自动回退到旧的视频总结方式（使用通义千问或BibiGPT直接处理链接）。
