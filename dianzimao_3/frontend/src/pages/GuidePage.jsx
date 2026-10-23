import { useNavigate } from 'react-router-dom';
import { useBreedStore } from '../stores/breedStore.jsx';

function GuidePage() {
  const navigate = useNavigate();
  const { state } = useBreedStore();

  return (
    <div className="page-container">
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="header-title">📚 猫猫图鉴</h1>
        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '50%',
            transition: 'transform 0.2s'
          }}
          onClick={() => window.location.href = '/memecard.html'}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <img src="/zhanbu.png" alt="meme" style={{ width: '2.5rem', height: '2.5rem' }} />
        </button>
      </div>

      <div className="grid-2">
        {state.breeds.map((breed) => (
          <div
            key={breed.id}
            className={`card breed-card ${!breed.isUnlocked ? 'locked' : ''}`}
            onClick={() => navigate(`/guide/${breed.id}`)}
          >
            <img
              src={breed.imageUrl}
              alt={breed.name}
              className="breed-image"
            />
            <div className="text-center">
              <h3 style={{ fontWeight: '700' }}>{breed.name}</h3>
              {!breed.isUnlocked && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
                  🔒 未解锁
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GuidePage;
