import { useNavigate } from 'react-router-dom';
import { useBreedStore } from '../stores/breedStore.jsx';
import { useState, useEffect } from 'react';

const catSounds = [
  '/audio/sweet.mp3',
  '/audio/annoy.mp3',
  '/audio/unhappy.mp3',
  '/audio/raspy.mp3',
  '/audio/need attention.mp3',
  '/audio/sad.mp3',
  '/audio/angry.mp3'
];

function HomePage() {
  const navigate = useNavigate();
  const { state } = useBreedStore();
  const [userAvatar, setUserAvatar] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  const [water, setWater] = useState(() => {
    const saved = localStorage.getItem('catWater');
    return saved ? parseInt(saved, 10) : 100;
  });
  const [food, setFood] = useState(() => {
    const saved = localStorage.getItem('catFood');
    return saved ? parseInt(saved, 10) : 100;
  });
  
  const selectedCat = state.breeds.find(b => b.id === state.selectedCatId) || state.breeds[0];

  useEffect(() => {
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
      setUserAvatar(savedAvatar);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('catWater', water.toString());
    localStorage.setItem('catFood', food.toString());
  }, [water, food]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWater(w => Math.max(0, w - 1));
      setFood(f => Math.max(0, f - 1));
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const playRandomSound = () => {
    try {
      const randomIndex = Math.floor(Math.random() * catSounds.length);
      const audio = new Audio(catSounds[randomIndex]);
      audio.volume = 0.8;
      audio.play().catch(err => console.log('播放音效失败:', err));
    } catch (err) {
      console.log('音效播放异常:', err);
    }
  };

  const handlePet = () => {
    setIsShaking(true);
    playRandomSound();
    setTimeout(() => {
      setIsShaking(false);
    }, 300);
  };

  const handleWater = () => {
    setWater(w => Math.min(100, w + 20));
  };

  const handleFood = () => {
    setFood(f => Math.min(100, f + 20));
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleCatTest = () => {
    window.location.href = '/cat-personality-test.html';
  };

  const handleCatRun = () => {
    window.location.href = '/maorun.html';
  };

  return (
    <div className="page-container flex flex-col home-page">
      <div className="header">
        <img
          src={userAvatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text-to-image?prompt=cute%20cartoon%20cat%20avatar&image_size=square'}
          alt="头像"
          className="avatar"
          onClick={handleProfile}
        />
        <h1 className="header-title">🐱 摸凹猫</h1>
        <div style={{ width: '60px' }}></div>
      </div>

      <div className="flex-1 flex flex-col items-center gap-4 pt-12 pb-24">
        <div className="w-full px-4">
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: 'white', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>💧 饮水</span>
            <div style={{ flex: 1, height: '20px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${water}%`, 
                height: '100%', 
                backgroundColor: '#4FC3F7',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
            <span style={{ color: 'white', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)', minWidth: '40px', textAlign: 'right' }}>{water}%</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span style={{ color: 'white', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>🍖 饱食</span>
            <div style={{ flex: 1, height: '20px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${food}%`, 
                height: '100%', 
                backgroundColor: '#FFB74D',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
            <span style={{ color: 'white', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)', minWidth: '40px', textAlign: 'right' }}>{food}%</span>
          </div>
        </div>

        <div className="flex gap-4 mt-2">
          <button 
            className="btn btn-primary" 
            onClick={handleWater}
            style={{ fontSize: '1.5rem' }}
          >
            💧 饮水
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleFood}
            style={{ fontSize: '1.5rem' }}
          >
            🍖 喂食
          </button>
        </div>
        
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          {selectedCat?.name || '我的猫猫'}
        </h2>
        
        <div className="flex items-end mb-4">
          <img
            src={selectedCat?.imageUrl}
            alt={selectedCat?.name}
            className={`cat-display ${isShaking ? 'shake' : ''}`}
            style={{ maxWidth: '240px', maxHeight: '240px' }}
          />
        </div>

        <button className="pet-button" onClick={handlePet} style={{ marginTop: '20px' }}>
          摸摸
        </button>
      </div>

      <img
        src="/cati.png"
        alt="猫咪人格测试"
        onClick={handleCatTest}
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '20px',
          width: '60px',
          height: '60px',
          cursor: 'pointer',
          zIndex: 10
        }}
      />

      <img
        src="/running.png"
        alt="猫咪快跑"
        onClick={handleCatRun}
        style={{
          position: 'absolute',
          bottom: '80px',
          right: '20px',
          width: '60px',
          height: '60px',
          cursor: 'pointer',
          zIndex: 10
        }}
      />
    </div>
  );
}

export default HomePage;
