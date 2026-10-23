import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { openDB } from 'idb';
import { useBreedStore } from '../stores/breedStore.jsx';
import { loadImage, createMeme, saveImage, fileToDataURL } from '../utils/imageProcessor';

function CatDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useBreedStore();
  const [showMemeText, setShowMemeText] = useState('');
  const [customMemeText, setCustomMemeText] = useState('');
  const [useCustomText, setUseCustomText] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [memeCanvas, setMemeCanvas] = useState(null);
  const fileInputRef = useRef(null);

  const breed = state.breeds.find(b => b.id === parseInt(id));

  useEffect(() => {
    if (breed && breed.memeTexts && breed.memeTexts.length > 0) {
      setShowMemeText(breed.memeTexts[0]);
    }
  }, [breed]);

  const getMemeText = () => {
    return useCustomText ? customMemeText : showMemeText;
  };

  const handleSetMainCat = async () => {
    if (!breed?.isUnlocked) {
      alert('请先通过拍照识别解锁该品种！');
      return;
    }

    try {
      const db = await openDB('cat-pedia-db', 1);
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const settings = await store.get('appSettings');
      
      if (settings) {
        settings.selectedCatId = breed.id;
        await store.put(settings);
      }

      dispatch({ type: 'SET_SELECTED_CAT', payload: breed.id });
      alert(`已将${breed.name}设为主界面小猫！`);
    } catch (error) {
      console.error('设置失败:', error);
    }
  };

  const handleSaveMeme = async (memeIndex) => {
    try {
      alert('正在生成meme，请稍候...');
      const img = await loadImage(breed?.imageUrl);
      const canvas = createMeme(img, breed?.memeTexts?.[memeIndex] || '喵~');
      await saveImage(canvas, `${breed?.name || 'cat'}-meme-${memeIndex + 1}.jpg`);
      alert('meme保存成功！');
    } catch (error) {
      console.error('保存失败:', error);
      alert(`保存失败: ${error.message || '请重试'}`);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const dataUrl = await fileToDataURL(file);
      setUploadedImage(dataUrl);
    }
  };

  const handleGenerateMeme = async () => {
    if (!uploadedImage || !getMemeText()) {
      alert('请先上传图片并输入/选择文字！');
      return;
    }

    try {
      const img = await loadImage(uploadedImage);
      const canvas = createMeme(img, getMemeText());
      setMemeCanvas(canvas);
    } catch (error) {
      console.error('生成失败:', error);
    }
  };

  const handleSaveCustomMeme = async () => {
    if (!memeCanvas) return;
    try {
      await saveImage(memeCanvas, 'custom-cat-meme.jpg');
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  if (!breed) {
    return (
      <div className="page-container flex items-center justify-center">
        <p>品种不存在</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="header">
        <button
          className="btn btn-secondary" onClick={() => navigate(-1)}>
          &larr; 返回
        </button>
        <h1 className="header-title">{breed.name}</h1>
        <div style={{ width: '80px' }}></div>
      </div>

      <img
        src={breed.imageUrl}
        alt={breed.name}
        className="detail-image"
      />

      <div className="card">
        <h3 className="section-title" style={{ marginTop: 0 }}>简介</h3>
        <p className="detail-description">{breed.description}</p>
      </div>

      <div>
        <h3 className="section-title">猫meme汇总</h3>
        <div className="meme-gallery">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="meme-item"
              onClick={() => handleSaveMeme(index)}
              title={`点击保存meme-${index + 1}`}
            >
              <img
                src={breed.imageUrl}
                alt={`meme-${index}`}
              />
              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                whiteSpace: 'nowrap'
              }}>
                {breed.memeTexts?.[index] || '喵~'}
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
          点击图片保存带文字的meme
        </p>
      </div>

      <div>
        <h3 className="section-title">简易meme制作</h3>
        <div className="card">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          
          <div className="flex gap-2 mb-3">
            <button
              className="btn btn-secondary flex-1"
              onClick={() => fileInputRef.current?.click()}
            >
              📷 上传图片
            </button>
            <button
              className="btn btn-primary flex-1"
              onClick={handleGenerateMeme}
              disabled={!uploadedImage || !showMemeText}
            >
              ✨ 生成meme
            </button>
          </div>

          {uploadedImage && (
            <div className="meme-canvas-container mb-3">
              {memeCanvas ? (
                <img src={memeCanvas.toDataURL()} alt="meme" />
              ) : (
                <img src={uploadedImage} alt="上传的图片" style={{ maxWidth: '100%', maxHeight: '100%' }} />
              )}
            </div>
          )}

          <div className="mb-3">
            <div className="flex gap-2 mb-3">
              <button
                className={`btn flex-1 ${!useCustomText ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setUseCustomText(false)}
              >
                预设文字
              </button>
              <button
                className={`btn flex-1 ${useCustomText ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setUseCustomText(true)}
              >
                自定义文字
              </button>
            </div>

            {!useCustomText ? (
              <div>
                <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '500' }}>
                  选择文字：
                </label>
                <div className="flex gap-2 flex-wrap">
                  {breed.memeTexts?.map((text, index) => (
                  <button
                    key={index}
                    className={`setting-option ${showMemeText === text ? 'active' : ''}`}
                    onClick={() => {
                      setShowMemeText(text);
                    }}
                  >
                    {text}
                  </button>
                ))}
                </div>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', fontWeight: '500' }}>
                  输入文字：
                </label>
                <input
                  type="text"
                  className="input"
                  value={customMemeText}
                  onChange={(e) => setCustomMemeText(e.target.value)}
                  placeholder="输入你想要的文字，比如：喵的凝视"
                />
              </div>
            )}
          </div>

          {memeCanvas && (
            <button
              className="btn btn-success w-full"
              onClick={handleSaveCustomMeme}
            >
              💾 保存meme到手机
            </button>
          )}
        </div>
      </div>

      <button
        className={`btn w-full mt-4 ${breed.isUnlocked ? 'btn-primary' : 'btn-secondary'}`}
        onClick={handleSetMainCat}
        disabled={!breed.isUnlocked}
      >
        {breed.isUnlocked ? '设为主界面小猫' : '🔒 需先解锁'}
      </button>
    </div>
  );
}

export default CatDetailPage;
