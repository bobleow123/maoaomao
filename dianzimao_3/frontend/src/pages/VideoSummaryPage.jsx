import { useState } from 'react';
import axios from 'axios';
import { extractDouyinVideoId, parseSummary } from '../utils/douyinParser';
import API_BASE_URL from '../utils/api.js';

function VideoSummaryPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    const videoId = extractDouyinVideoId(input);
    const videoUrl = input.trim().startsWith('http') ? input.trim() : null;
    const localPath = input.trim(); // 本地文件路径

    if (!videoId && !videoUrl && !localPath) {
      setError('请输入有效的抖音视频链接、视频ID或本地视频路径');
      return;
    }

    setLoading(true);
    setError('');
    setSummary(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/summarize-douyin`, { 
        videoId, 
        videoUrl,
        localPath,
        useNewPipeline: true 
      });

      if (response.data.success) {
        const parsed = parseSummary(response.data.summary);
        setSummary(parsed);
      } else {
        setError(response.data.error || '获取总结失败');
      }
    } catch (err) {
      console.error('请求失败:', err);
      setError(err.response?.data?.error || '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToGuide = () => {
    alert('Demo阶段暂不保存');
  };

  return (
    <div className="page-container">
      <div className="header">
        <h1 className="header-title">🎬 抖音视频总结助手</h1>
      </div>

      <div className="card mb-3">
        <input
          type="text"
          placeholder="粘贴抖音视频链接、视频ID或本地视频文件路径"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="mb-2"
        />

        <button
          className="btn btn-primary w-full"
          onClick={handleSummarize}
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <>
              <div className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
              总结中...
            </>
          ) : (
            '一键总结'
          )}
        </button>

        {error && (
          <p style={{ color: '#E53935', marginTop: '1rem', textAlign: 'center' }}>
            ❌ {error}
          </p>
        )}
      </div>

      {summary && (
        <>
          {/* 最新格式总结展示 */}
          {summary.isNewFormat ? (
            <>
              <div className="summary-card">
                <div className="summary-title">
                  🐱 猫的品种
                </div>
                <div className="summary-content">
                  <p>{summary.breed || '未知品种'}</p>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-title">
                  🎬 猫在做什么
                </div>
                <div className="summary-content">
                  <p>{summary.action || '暂无描述'}</p>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-title">
                  😺 猫的情绪状态
                </div>
                <div className="summary-content">
                  <p>{summary.mood || '未知情绪'}</p>
                </div>
              </div>

              {summary.catKnowledge && summary.catKnowledge !== '本视频未提及养猫知识' && (
                <div className="summary-card">
                  <div className="summary-title">
                    📚 养猫知识总结
                  </div>
                  <div className="summary-content">
                    {summary.catKnowledge.split('\n').map((line, index) => (
                      <p key={index} style={{ marginBottom: '0.5rem' }}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {summary.videoKnowledge && summary.videoKnowledge !== '无语音内容' && (
                <div className="summary-card">
                  <div className="summary-title">
                    🎤 视频中与猫有关的知识
                  </div>
                  <div className="summary-content">
                    {summary.videoKnowledge.split('\n').map((line, index) => (
                      <p key={index} style={{ marginBottom: '0.5rem' }}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="summary-card">
                <div className="summary-title">
                  📖 给图鉴的补充简介
                </div>
                <div className="summary-content">
                  <p>{summary.guideSupplement || '暂无补充简介'}</p>
                </div>
              </div>
            </>
          ) : summary.isOldFormat ? (
            /* 旧格式回退 */
            <>
              <div className="summary-card">
                <div className="summary-title">
                  📌 视频主题概括
                </div>
                <div className="summary-content">
                  <p>{summary.theme || '暂无主题'}</p>
                </div>
              </div>

              {summary.keyPoints.length > 0 && (
                <div className="summary-card">
                  <div className="summary-title">
                    🎯 核心情节要点
                  </div>
                  <div className="summary-content">
                    {summary.keyPoints.map((point, index) => (
                      <p key={index} style={{ marginBottom: '0.5rem' }}>
                        {index + 1}. {point}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="summary-card">
                <div className="summary-title">
                  💡 内容主旨提炼
                </div>
                <div className="summary-content">
                  <p>{summary.essence || '暂无主旨'}</p>
                </div>
              </div>
            </>
          ) : (
            /* 最旧格式回退 */
            <>
              <div className="summary-card">
                <div className="summary-title">
                  📋 完整总结
                </div>
                <div className="summary-content">
                  {summary.allLines.map((line, index) => (
                    <p key={index} style={{ marginBottom: '0.5rem' }}>{line}</p>
                  ))}
                </div>
              </div>

              {summary.categories?.health?.length > 0 && (
                <div className="summary-card">
                  <div className="summary-title">
                    🩺 健康
                  </div>
                  <div className="summary-content">
                    {summary.categories.health.map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {summary.categories?.tools?.length > 0 && (
                <div className="summary-card">
                  <div className="summary-title">
                    🛠️ 用具
                  </div>
                  <div className="summary-content">
                    {summary.categories.tools.map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {summary.categories?.behavior?.length > 0 && (
                <div className="summary-card">
                  <div className="summary-title">
                    🐾 行为
                  </div>
                  <div className="summary-content">
                    {summary.categories.behavior.map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <button
            className="btn btn-secondary w-full mt-3"
            onClick={handleAddToGuide}
          >
            📚 补充到图鉴
          </button>
        </>
      )}
    </div>
  );
}

export default VideoSummaryPage;
