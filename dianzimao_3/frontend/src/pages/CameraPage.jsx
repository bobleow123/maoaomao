import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { openDB } from 'idb';
import { startCamera, stopCamera, switchCamera, captureFrame } from '../utils/camera';
import { useBreedStore } from '../stores/breedStore.jsx';
import API_BASE_URL from '../utils/api.js';

function CameraPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [apiStatus, setApiStatus] = useState('准备就绪');
  const { state, dispatch } = useBreedStore();

  useEffect(() => {
    const init = async () => {
      try {
        await startCamera(videoRef.current, 'environment');
        setCameraActive(true);
      } catch (error) {
        console.error('无法启动相机:', error);
        alert('需要相机权限才能使用此功能');
        navigate('/');
      }
    };

    init();

    return () => {
      stopCamera();
    };
  }, [navigate]);

  const handleSwitchCamera = async () => {
    try {
      await switchCamera(videoRef.current);
    } catch (error) {
      console.error('切换相机失败:', error);
    }
  };

  const recognizeCat = async (imageData) => {
    try {
      setApiStatus('正在识别中...');
      
      const response = await fetch(`${API_BASE_URL}/api/recognize-cat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: imageData })
      });

      const data = await response.json();
      
      if (data.success) {
        setApiStatus(data.isMock ? '识别完成（模拟数据）' : '识别完成');
      } else {
        setApiStatus('识别失败');
      }
      return data;
    } catch (error) {
      console.error('API调用失败:', error);
      setApiStatus('API调用失败');
      return {
        success: false,
        error: '识别失败，请检查网络连接'
      };
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || loading) return;

    setLoading(true);
    setApiStatus('正在拍照...');

    try {
      const imageData = captureFrame(videoRef.current);
      setCapturedImage(imageData);
      const recognitionResult = await recognizeCat(imageData);

      if (recognitionResult) {
        if (recognitionResult.success) {
          let breed;
          
          if (recognitionResult.unknownBreed && recognitionResult.breedInfo) {
            if (recognitionResult.breedInfo.alreadyExists) {
              // 这个品种已经存在了，直接从 state 找
              breed = state.breeds.find(b => b.id === recognitionResult.breedInfo.id);
              setApiStatus('识别完成（品种已存在）');
            } else {
              breed = { 
                ...recognitionResult.breedInfo,
                imageUrl: imageData // 用拍摄的照片作为图片
              };
              
              const db = await openDB('cat-pedia-db', 1);
              const tx = db.transaction('breeds', 'readwrite');
              const store = tx.objectStore('breeds');
              
              await store.put(breed);
              dispatch({ type: 'ADD_TEMP_BREED', payload: breed });
              
              setApiStatus('识别完成（新发现品种）');
            }
          } else {
            const breedId = recognitionResult.breedId;
            breed = state.breeds.find(b => b.id === breedId);

            if (breed) {
              const db = await openDB('cat-pedia-db', 1);
              const tx = db.transaction('breeds', 'readwrite');
              const store = tx.objectStore('breeds');
              
              const updatedBreed = { ...breed, isUnlocked: true };
              await store.put(updatedBreed);

              dispatch({ type: 'UNLOCK_BREED', payload: breedId });
            }
          }

          if (breed) {
            setResult({
              breed: breed,
              healthStatus: recognitionResult.healthStatus,
              isMock: recognitionResult.isMock,
              isUnknown: recognitionResult.unknownBreed
            });
            setShowResult(true);
          } else {
            // 未知品种也可以用失败弹窗展示
            setResult({
              error: '未知品种，已添加至其他猫',
              capturedImage: imageData
            });
            setShowResult(true);
          }
        } else {
          // 识别失败 - 显示失败弹窗
          setResult({
            error: recognitionResult.error || '识别错误，请上传猫咪图片重试',
            capturedImage: imageData
          });
          setShowResult(true);
          setApiStatus('识别失败');
        }
      } else {
        setResult({
          error: '识别失败，请重试',
          capturedImage: imageData
        });
        setShowResult(true);
        setApiStatus('识别失败');
      }
    } catch (error) {
      console.error('识别失败:', error);
      setResult({
        error: '识别失败，请重试',
        capturedImage: imageData
      });
      setShowResult(true);
      setApiStatus('识别失败');
    } finally {
      setLoading(false);
      if (!showResult) {
        setTimeout(() => setApiStatus('准备就绪'), 1500);
      }
    }
  };

  const handleViewDetail = () => {
    if (result?.breed) {
      navigate(`/guide/${result.breed.id}`);
    }
  };

  const closeModal = () => {
    setShowResult(false);
    setResult(null);
    setApiStatus('准备就绪');
  };

  return (
    <div className="page-container">
      <div className="header">
        <h1 className="header-title">📷 拍照识别</h1>
      </div>

      <div className="camera-container">
        {cameraActive && (
          <video
            ref={videoRef}
            className="camera-video"
            playsInline
            muted
          />
        )}

        <div className="camera-controls">
          <button
            className="switch-camera-button"
            onClick={handleSwitchCamera}
          >
            🔄
          </button>

          <button
            className="shutter-button"
            onClick={handleCapture}
            disabled={loading}
          >
            {loading ? (
              <div className="loading-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }}></div>
            ) : null}
          </button>

          <div style={{ width: '56px' }}></div>
        </div>
      </div>

      <p className="text-center mt-3" style={{ color: 'var(--text-secondary)' }}>
        {apiStatus}
      </p>

      <p className="text-center" style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
        将猫咪对准镜头，点击快门拍照识别
      </p>

      {showResult && result && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              {result.breed ? (
                <>
                  <img
                    src={result.breed.imageUrl}
                    alt={result.breed.name}
                    style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem' }}
                  />

                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    🎉 识别成功！
                  </h2>

                  <h3 style={{ fontSize: '1.25rem', color: 'var(--theme-secondary)', marginBottom: '1rem' }}>
                    {result.breed.name}
                  </h3>

                  {result.isMock && (
                    <p style={{ color: 'var(--text-light)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                      (模拟数据，配置 API Key 后使用真实识别)
                    </p>
                  )}

                  <div className="card mb-3">
                    <p style={{ color: 'var(--text-secondary)' }}>
                      🩺 {result.healthStatus}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="btn btn-secondary flex-1"
                      onClick={closeModal}
                    >
                      继续拍照
                    </button>
                    <button
                      className="btn btn-primary flex-1"
                      onClick={handleViewDetail}
                    >
                      查看图鉴
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {result.capturedImage && (
                    <img
                      src={result.capturedImage}
                      alt="拍摄的照片"
                      style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem' }}
                    />
                  )}
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#e74c3c' }}>
                    ❌ 识别失败
                  </h2>
                  <div className="card mb-3">
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {result.error}
                    </p>
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    继续拍照
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CameraPage;
