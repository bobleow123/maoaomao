import { useState, useEffect, useRef } from 'react';
import { openDB } from 'idb';
import { useSettingsStore, applySettings } from '../stores/settingsStore.jsx';
import { fileToDataURL } from '../utils/imageProcessor';

function ProfilePage() {
  const { state, dispatch } = useSettingsStore();
  const [avatar, setAvatar] = useState(null);
  const [nickname, setNickname] = useState('');
  const [userId, setUserId] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedAvatar = localStorage.getItem('userAvatar');
    const savedNickname = localStorage.getItem('userNickname');
    let savedUserId = localStorage.getItem('userId');

    if (!savedUserId) {
      savedUserId = 'CAT' + Date.now().toString(36).toUpperCase();
      localStorage.setItem('userId', savedUserId);
    }

    if (savedAvatar) setAvatar(savedAvatar);
    if (savedNickname) setNickname(savedNickname);
    setUserId(savedUserId);
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const dataUrl = await fileToDataURL(file);
      setAvatar(dataUrl);
      localStorage.setItem('userAvatar', dataUrl);
    }
  };

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
  };

  const handleNicknameBlur = () => {
    localStorage.setItem('userNickname', nickname);
  };

  const updateTextSize = async (size) => {
    dispatch({ type: 'SET_TEXT_SIZE', payload: size });
    
    const newSettings = { ...state, textSize: size };
    applySettings(newSettings);

    try {
      const db = await openDB('cat-pedia-db', 1);
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const settings = await store.get('appSettings');
      
      if (settings) {
        settings.textSize = size;
        await store.put(settings);
      }
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  };

  const updateThemeColor = async (color) => {
    dispatch({ type: 'SET_THEME_COLOR', payload: color });
    
    const newSettings = { ...state, themeColor: color };
    applySettings(newSettings);

    try {
      const db = await openDB('cat-pedia-db', 1);
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const settings = await store.get('appSettings');
      
      if (settings) {
        settings.themeColor = color;
        await store.put(settings);
      }
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  };

  const updateButtonRounded = async (rounded) => {
    dispatch({ type: 'SET_BUTTON_ROUNDED', payload: rounded });
    
    const newSettings = { ...state, buttonRounded: rounded };
    applySettings(newSettings);

    try {
      const db = await openDB('cat-pedia-db', 1);
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const settings = await store.get('appSettings');
      
      if (settings) {
        settings.buttonRounded = rounded;
        await store.put(settings);
      }
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  };

  const textSizes = [
    { key: 'small', label: '小' },
    { key: 'medium', label: '中' },
    { key: 'large', label: '大' }
  ];

  const themeColors = [
    { key: 'orange', label: '暖橙' },
    { key: 'blue', label: '淡蓝' },
    { key: 'pink', label: '浅粉' }
  ];

  return (
    <div className="page-container">
      <div className="header">
        <h1 className="header-title">👤 我的</h1>
      </div>

      <div className="card text-center mb-3">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleAvatarChange}
          style={{ display: 'none' }}
        />

        <img
          src={avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20cat%20avatar&image_size=square'}
          alt="头像"
          className="avatar avatar-lg"
          onClick={handleAvatarClick}
          style={{ cursor: 'pointer' }}
        />

        <div className="mt-2">
          <input
            type="text"
            value={nickname}
            onChange={handleNicknameChange}
            onBlur={handleNicknameBlur}
            placeholder="输入昵称"
            className="text-center"
            style={{ fontSize: '1.25rem', fontWeight: '700', border: 'none', padding: '0.5rem', background: 'transparent' }}
          />
        </div>

        <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
          ID: {userId}
        </p>
      </div>

      <div className="setting-item">
        <span className="setting-label">📝 文本大小</span>
        <div className="setting-options">
          {textSizes.map((size) => (
            <button
              key={size.key}
              className={`setting-option ${state.textSize === size.key ? 'active' : ''}`}
              onClick={() => updateTextSize(size.key)}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      <div className="setting-item">
        <span className="setting-label">🎨 主题颜色</span>
        <div className="setting-options">
          {themeColors.map((theme) => (
            <button
              key={theme.key}
              className={`setting-option ${state.themeColor === theme.key ? 'active' : ''}`}
              onClick={() => updateThemeColor(theme.key)}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      <div className="setting-item">
        <span className="setting-label">🔘 按钮圆角</span>
        <div
          className={`switch ${state.buttonRounded ? 'active' : ''}`}
          onClick={() => updateButtonRounded(!state.buttonRounded)}
        >
          <div className="switch-thumb"></div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
