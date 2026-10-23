import os
import sys
import json
import time
import base64
import hashlib
import asyncio
import aiohttp
import requests
from dotenv import load_dotenv
import cv2
import numpy as np
from PIL import Image
from io import BytesIO

# 日志输出到 stderr，避免干扰 JSON
def log(message):
    print(message, file=sys.stderr)

# 设置FFmpeg路径（Windows）
ffmpeg_bin = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "ffmpeg",
    "ffmpeg-master-latest-win64-gpl-shared",
    "bin"
)
if os.path.exists(ffmpeg_bin):
    os.environ["PATH"] = ffmpeg_bin + os.pathsep + os.environ.get("PATH", "")
    os.environ["FFMPEG_BINARY"] = os.path.join(ffmpeg_bin, "ffmpeg.exe")
    os.environ["FFPROBE_BINARY"] = os.path.join(ffmpeg_bin, "ffprobe.exe")
    log(f"已设置FFmpeg路径: {ffmpeg_bin}")

# 加载环境变量
load_dotenv()

# 百度API配置
BAIDU_API_KEY = os.getenv("BAIDU_API_KEY")
BAIDU_SECRET_KEY = os.getenv("BAIDU_SECRET_KEY")
BAIDU_ACCESS_TOKEN = None
TOKEN_EXPIRE_TIME = 0

# 临时目录
TEMP_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "temp")
os.makedirs(TEMP_DIR, exist_ok=True)


def get_file_hash(file_path):
    """生成文件哈希用于去重"""
    if not os.path.exists(file_path):
        return ""
    with open(file_path, "rb") as f:
        return hashlib.md5(f.read()).hexdigest()


async def get_baidu_access_token():
    """获取百度access_token"""
    global BAIDU_ACCESS_TOKEN, TOKEN_EXPIRE_TIME
    now = time.time()

    if BAIDU_ACCESS_TOKEN and now < TOKEN_EXPIRE_TIME:
        return BAIDU_ACCESS_TOKEN

    url = "https://aip.baidubce.com/oauth/2.0/token"
    params = {
        "grant_type": "client_credentials",
        "client_id": BAIDU_API_KEY,
        "client_secret": BAIDU_SECRET_KEY
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, timeout=30) as response:
                data = await response.json()
                if "access_token" in data:
                    BAIDU_ACCESS_TOKEN = data["access_token"]
                    TOKEN_EXPIRE_TIME = now + (data.get("expires_in", 2592000) - 60)
                    return BAIDU_ACCESS_TOKEN
    except Exception as e:
        log(f"获取百度token失败: {e}")
    return None


async def baidu_image_recognition(image_path):
    """百度通用物体图像识别"""
    access_token = await get_baidu_access_token()
    if not access_token:
        log("图像识别失败: 无法获取百度 access token")
        return []

    url = f"https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general"
    url += f"?access_token={access_token}"

    try:
        if not os.path.exists(image_path):
            log(f"图像识别失败: 文件不存在 {image_path}")
            return []

        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode("utf-8")

        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        data = {"image": image_data}

        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, data=data, timeout=30) as response:
                log(f"图像识别响应状态: {response.status}")
                result_text = await response.text()
                log(f"图像识别响应内容: {result_text}")
                
                try:
                    result = await response.json()
                except Exception:
                    result = {}
                
                if "result" in result:
                    keywords = [item["keyword"] for item in result["result"][:5]]
                    log(f"图像识别成功: {keywords}")
                    return keywords
                elif "error_msg" in result:
                    log(f"图像识别API错误: {result['error_msg']}")
    except asyncio.TimeoutError:
        log(f"图像识别超时 {image_path}")
    except aiohttp.ClientError as e:
        log(f"图像识别网络错误 {image_path}: {type(e).__name__}: {e}")
    except Exception as e:
        log(f"图像识别失败 {image_path}: {type(e).__name__}: {e}")
        import traceback
        log(f"堆栈跟踪: {traceback.format_exc()}")
    return []


async def baidu_asr(audio_path):
    """百度语音识别"""
    access_token = await get_baidu_access_token()
    if not access_token:
        return ""

    url = f"https://vop.baidu.com/server_api"
    url += f"?access_token={access_token}"

    try:
        with open(audio_path, "rb") as f:
            audio_data = base64.b64encode(f.read()).decode("utf-8")

        headers = {"Content-Type": "application/json"}
        data = {
            "format": "wav",
            "rate": 16000,
            "channel": 1,
            "cuid": "cat-pedia-app",
            "token": access_token,
            "speech": audio_data,
            "len": os.path.getsize(audio_path)
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=data, timeout=60) as response:
                result = await response.json()
                if result.get("err_no") == 0 and "result" in result:
                    return "".join(result["result"])
    except Exception as e:
        log(f"语音识别失败: {e}")
    return ""


async def baidu_ernie_summarize(video_info):
    """调用文心ERNIE生成总结"""
    access_token = await get_baidu_access_token()
    if not access_token:
        return generate_default_summary(video_info)

    url = f"https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions"
    url += f"?access_token={access_token}"

    frames_desc = "、".join(video_info.get("frames_desc", []))
    audio_text = video_info.get("audio_text", "")

    prompt = f"""请根据以下视频内容生成详细的猫咪视频总结：

【画面内容】：{frames_desc}

【语音内容】：{audio_text}

请严格按以下格式输出总结（不要输出其他额外内容）：

【猫的品种】
（根据画面内容判断猫的品种，如果无法确定则写"未知品种"）

【猫在做什么】
（描述视频中猫的具体行为动作）

【猫的情绪状态】
（根据画面描述猫的情绪，如开心、慵懒、紧张、好奇等）

【养猫知识总结】
（如果视频中有提到养猫相关的知识、技巧、注意事项，请详细列出，比如猫砂盆选取、喂养建议、护理方法等；如果没有则写"本视频未提及养猫知识"）

【视频中与猫有关的知识】
（从语音内容或字幕中总结与猫有关的知识；如果没有语音内容则写"无语音内容"）

【给图鉴的补充简介】
（根据视频内容，为该品种猫写一段补充简介，用于添加到图鉴中）"""

    try:
        headers = {"Content-Type": "application/json"}
        data = {
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7,
            "top_p": 0.8
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=data, timeout=60) as response:
                result = await response.json()
                if "result" in result:
                    return result["result"]
    except Exception as e:
        log(f"文心生成总结失败: {e}")
    return generate_default_summary(video_info)


def generate_default_summary(video_info):
    """生成默认总结"""
    frames = video_info.get("frames_desc", [])
    audio = video_info.get("audio_text", "")
    return f"""【猫的品种】
未知品种

【猫在做什么】
视频中展示了猫咪的相关画面，{frames[0] if frames else "包含各种有趣的画面内容"}

【猫的情绪状态】
看起来很放松、可爱

【养猫知识总结】
本视频未提及养猫知识

【视频中与猫有关的知识】
{f"从语音中识别到：{audio}" if audio else "无语音内容"}

【给图鉴的补充简介】
这是一只可爱的猫咪，性格温顺，喜欢与人互动，适合作为家庭宠物。"""


def extract_frames(video_path, output_dir, interval=1, max_frames=12):
    """从视频中抽取关键帧"""
    if not os.path.exists(video_path):
        return []

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return []

    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    frame_interval = int(fps * interval)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    frames = []
    frame_indices = []

    # 抽取关键帧
    for i in range(0, frame_count, frame_interval):
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ret, frame = cap.read()
        if ret:
            frame_indices.append((i, frame))
        if len(frame_indices) >= max_frames * 2:
            break

    cap.release()

    # 使用感知哈希去重
    unique_frames = []
    seen_hashes = set()

    for idx, frame in frame_indices:
        # 计算感知哈希
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        resized = cv2.resize(gray, (32, 32))
        mean_val = resized.mean()
        hash_val = "".join(["1" if pixel > mean_val else "0" for pixel in resized.flatten()])

        if hash_val not in seen_hashes:
            seen_hashes.add(hash_val)
            unique_frames.append((idx, frame))
            if len(unique_frames) >= max_frames:
                break

    # 保存去重后的帧
    saved_frames = []
    for i, (idx, frame) in enumerate(unique_frames[:max_frames]):
        frame_path = os.path.join(output_dir, f"frame_{i:02d}.jpg")
        cv2.imwrite(frame_path, frame)
        saved_frames.append(frame_path)

    return saved_frames


def extract_audio(video_path, output_audio_path):
    """从视频中提取音频（使用ffmpeg命令行）"""
    try:
        import subprocess

        ffmpeg_path = os.environ.get("FFMPEG_BINARY")
        if not ffmpeg_path or not os.path.exists(ffmpeg_path):
            ffmpeg_path = "ffmpeg"

        cmd = [
            ffmpeg_path,
            "-i", video_path,
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",
            "-y",
            output_audio_path
        ]

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300
        )

        if result.returncode == 0 and os.path.exists(output_audio_path):
            log(f"音频提取成功: {output_audio_path}")
            return True
        else:
            log(f"音频提取失败: {result.stderr}")
            return False

    except Exception as e:
        log(f"音频提取失败: {e}")
        return False


def download_douyin_video(url, output_path):
    """下载抖音视频"""
    try:
        # 首先检查是否是本地文件路径
        if os.path.exists(url):
            import shutil
            shutil.copy(url, output_path)
            log(f"使用本地文件: {url}")
            return True

        # 尝试直接下载（对于简单的视频链接）
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=60, stream=True)

        if response.status_code == 200:
            with open(output_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            log(f"视频下载成功: {output_path}")
            return True
        else:
            log(f"下载失败，状态码: {response.status_code}")
    except Exception as e:
        log(f"下载视频失败: {e}")
    return False


async def process_video_pipeline(video_url_or_path):
    """完整视频处理流水线"""
    session_id = hashlib.md5(str(time.time()).encode()).hexdigest()[:12]
    session_dir = os.path.join(TEMP_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)

    video_path = None
    result = {
        "success": False,
        "error": "",
        "summary": ""
    }

    try:
        # Step 1: 下载/获取视频
        log(f"[Step 1] 处理视频源...")
        if video_url_or_path.startswith("http"):
            video_path = os.path.join(session_dir, "video.mp4")
            if not download_douyin_video(video_url_or_path, video_path):
                result["error"] = "视频下载失败，请检查链接"
                return result
        else:
            video_path = video_url_or_path

        # Step 2: 抽取关键帧
        log(f"[Step 2] 抽取关键帧...")
        frame_paths = extract_frames(video_path, session_dir, interval=1, max_frames=12)
        if not frame_paths:
            result["error"] = "视频拆帧失败"
            return result
        log(f"抽取了 {len(frame_paths)} 张关键帧")

        # Step 3: 提取音频
        log(f"[Step 3] 提取音频...")
        audio_path = os.path.join(session_dir, "audio.wav")
        audio_text = ""
        if extract_audio(video_path, audio_path):
            log(f"[Step 4] 语音识别...")
            audio_text = await baidu_asr(audio_path)
            log(f"语音识别完成: {len(audio_text)} 字")

        # Step 5: 图像识别
        log(f"[Step 5] 图像识别...")
        frames_desc = []
        for frame_path in frame_paths:
            desc = await baidu_image_recognition(frame_path)
            frames_desc.extend(desc)
        # 去重
        frames_desc = list(set(frames_desc))[:10]
        log(f"图像识别完成: {len(frames_desc)} 个关键词")

        # Step 6: 生成总结
        log(f"[Step 6] 生成总结...")
        video_info = {
            "frames_desc": frames_desc,
            "audio_text": audio_text
        }
        summary = await baidu_ernie_summarize(video_info)

        result["success"] = True
        result["summary"] = summary
        result["frames_count"] = len(frame_paths)
        result["audio_length"] = len(audio_text)

        log(f"处理完成！")
        return result

    except Exception as e:
        log(f"处理失败: {e}")
        result["error"] = str(e)
        return result
    finally:
        # 清理临时文件（可选，保留用于调试）
        pass


if __name__ == "__main__":
    # 清除所有缓冲区，避免额外输出
    sys.stdout.reconfigure(encoding='utf-8')
    
    if len(sys.argv) < 2:
        json_output = json.dumps({"success": False, "error": "缺少视频路径"}, ensure_ascii=False)
        print(json_output)
        sys.exit(1)

    video_input = sys.argv[1]
    result = asyncio.run(process_video_pipeline(video_input))
    # 直接输出一行 JSON
    json_output = json.dumps(result, ensure_ascii=False)
    print(json_output)
