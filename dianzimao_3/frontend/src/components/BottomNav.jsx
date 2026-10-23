import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/guide', icon: '📚', label: '图鉴' },
  { path: '/video', icon: '🎬', label: 'AI总结' },
  { path: '/', icon: '🏠', label: '主页', special: true },
  { path: '/talk', icon: '🐱', label: '猫语' },
  { path: '/profile', icon: '👤', label: '我的' }
];

const cameraItem = { path: '/camera', icon: '📷', label: '拍照' };

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/guide' && location.pathname.startsWith('/guide/')) {
      return true;
    }
    return location.pathname === path;
  };

  const isCameraActive = location.pathname === cameraItem.path;

  return (
    <>
      <div className="floating-camera-btn" onClick={() => navigate(cameraItem.path)}>
        <div className={`nav-icon ${isCameraActive ? 'active' : ''}`}>
          {cameraItem.icon}
        </div>
      </div>
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <div
            key={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''} ${item.special ? 'nav-item-special' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <div className="nav-icon">{item.icon}</div>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </nav>
    </>
  );
}

export default BottomNav;
