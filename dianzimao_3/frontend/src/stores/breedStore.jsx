import { createContext, useContext, useReducer } from 'react';
import { openDB } from 'idb';
import breeds from '../data/breeds';

const DB_NAME = 'cat-pedia-db';
const STORE_NAME = 'breeds';
const SETTINGS_STORE = 'settings';

const BreedContext = createContext();

const breedReducer = (state, action) => {
  switch (action.type) {
    case 'SET_BREEDS':
      return { ...state, breeds: action.payload };
    case 'UNLOCK_BREED':
      return {
        ...state,
        breeds: state.breeds.map(b =>
          b.id === action.payload ? { ...b, isUnlocked: true } : b
        )
      };
    case 'SET_SELECTED_CAT':
      return { ...state, selectedCatId: action.payload };
    case 'ADD_TEMP_BREED':
    case 'ADD_UNKNOWN_BREED':
      const existing = state.breeds.find(b => b.id === action.payload.id);
      if (!existing) {
        return {
          ...state,
          breeds: [...state.breeds, action.payload]
        };
      }
      return state;
    default:
      return state;
  }
};

export const initDB = async () => {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    }
  });

  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const count = await store.count();

  const firstBreed = await store.get(1);
  const needsRefresh = count > 0 && firstBreed && firstBreed.name === '布偶猫' && firstBreed.imageUrl.includes('trae-api');

  if (count === 0 || needsRefresh) {
    const writeTx = db.transaction(STORE_NAME, 'readwrite');
    const writeStore = writeTx.objectStore(STORE_NAME);
    
    // 清除旧数据
    await writeStore.clear();
    
    // 写入新数据
    for (const breed of breeds) {
      await writeStore.put(breed);
    }
  }

  const settingsTx = db.transaction(SETTINGS_STORE, 'readonly');
  const settingsStore = settingsTx.objectStore(SETTINGS_STORE);
  const appSettings = await settingsStore.get('appSettings');

  if (!appSettings) {
    const writeSettingsTx = db.transaction(SETTINGS_STORE, 'readwrite');
    const writeSettingsStore = writeSettingsTx.objectStore(SETTINGS_STORE);
    await writeSettingsStore.put({
      key: 'appSettings',
      selectedCatId: 1,
      textSize: 'medium',
      themeColor: 'orange',
      buttonRounded: false
    });
  }

  return db;
};

export const BreedProvider = ({ children, initialState }) => {
  const [state, dispatch] = useReducer(breedReducer, initialState);

  return (
    <BreedContext.Provider value={{ state, dispatch }}>
      {children}
    </BreedContext.Provider>
  );
};

export const useBreedStore = () => {
  const context = useContext(BreedContext);
  if (!context) {
    throw new Error('useBreedStore must be used within BreedProvider');
  }
  return context;
};
