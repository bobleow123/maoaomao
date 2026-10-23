import { createContext, useContext, useReducer } from 'react';

const SettingsContext = createContext();

const settingsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TEXT_SIZE':
      return { ...state, textSize: action.payload };
    case 'SET_THEME_COLOR':
      return { ...state, themeColor: action.payload };
    case 'SET_BUTTON_ROUNDED':
      return { ...state, buttonRounded: action.payload };
    case 'SET_ALL_SETTINGS':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export const SettingsProvider = ({ children, initialState }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  return (
    <SettingsContext.Provider value={{ state, dispatch }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsStore = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsStore must be used within SettingsProvider');
  }
  return context;
};

export const applySettings = (settings) => {
  const root = document.documentElement;
  
  const textSizes = {
    small: '14px',
    medium: '16px',
    large: '18px'
  };
  root.style.fontSize = textSizes[settings.textSize] || '16px';
  
  const themeColors = {
    orange: {
      primary: '#FFB347',
      secondary: '#FF8C00',
      light: '#FFF3E0',
      dark: '#E65100'
    },
    blue: {
      primary: '#87CEEB',
      secondary: '#4682B4',
      light: '#E3F2FD',
      dark: '#1565C0'
    },
    pink: {
      primary: '#FFB6C1',
      secondary: '#FF69B4',
      light: '#FCE4EC',
      dark: '#C2185B'
    }
  };
  
  const colors = themeColors[settings.themeColor] || themeColors.orange;
  root.style.setProperty('--theme-primary', colors.primary);
  root.style.setProperty('--theme-secondary', colors.secondary);
  root.style.setProperty('--theme-light', colors.light);
  root.style.setProperty('--theme-dark', colors.dark);
  
  if (settings.buttonRounded) {
    document.body.classList.add('button-rounded');
  } else {
    document.body.classList.remove('button-rounded');
  }
};
