import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { openDB } from 'idb';
import { BreedProvider, initDB } from './stores/breedStore.jsx';
import { SettingsProvider, applySettings } from './stores/settingsStore.jsx';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import GuidePage from './pages/GuidePage';
import CatDetailPage from './pages/CatDetailPage';
import VideoSummaryPage from './pages/VideoSummaryPage';
import CameraPage from './pages/CameraPage';
import CatTalkPage from './pages/CatTalkPage';
import ProfilePage from './pages/ProfilePage';
import breeds from './data/breeds';

const defaultSettings = {
  selectedCatId: 1,
  textSize: 'medium',
  themeColor: 'orange',
  buttonRounded: false
};

function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [breedState, setBreedState] = useState({
    breeds: breeds,
    selectedCatId: 1
  });
  const [settingsState, setSettingsState] = useState(defaultSettings);

  useEffect(() => {
    const init = async () => {
      try {
        const db = await initDB();
        
        const breedTx = db.transaction('breeds', 'readonly');
        const breedStore = breedTx.objectStore('breeds');
        const savedBreeds = await breedStore.getAll();
        
        const settingsTx = db.transaction('settings', 'readonly');
        const settingsStore = settingsTx.objectStore('settings');
        const savedSettings = await settingsStore.get('appSettings');
        
        if (savedBreeds.length > 0) {
          setBreedState(prev => ({
            ...prev,
            breeds: savedBreeds,
            selectedCatId: savedSettings?.selectedCatId || 1
          }));
        }
        
        if (savedSettings) {
          setSettingsState(prev => ({
            ...prev,
            ...savedSettings
          }));
          applySettings(savedSettings);
        }
        
        setDbInitialized(true);
      } catch (error) {
        console.error('初始化数据库失败:', error);
        setDbInitialized(true);
      }
    };
    
    init();
  }, []);

  if (!dbInitialized) {
    return (
      <div className="app-container flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <BreedProvider initialState={breedState}>
      <SettingsProvider initialState={settingsState}>
        <Router>
          <div className="app-container">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/guide" element={<GuidePage />} />
              <Route path="/guide/:id" element={<CatDetailPage />} />
              <Route path="/video" element={<VideoSummaryPage />} />
              <Route path="/camera" element={<CameraPage />} />
              <Route path="/talk" element={<CatTalkPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <BottomNav />
          </div>
        </Router>
      </SettingsProvider>
    </BreedProvider>
  );
}

export default App;
