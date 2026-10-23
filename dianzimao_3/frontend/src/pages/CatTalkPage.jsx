import { useState, useEffect, useRef } from 'react';

const defaultCatPhrases = [
  { id: 1, text: '甜美叫声', audio: '/audio/sweet.mp3', type: 'cat' },
  { id: 2, text: '烦人', audio: '/audio/annoy.mp3', type: 'cat' },
  { id: 3, text: '不开心', audio: '/audio/unhappy.mp3', type: 'cat' },
  { id: 4, text: '沙哑', audio: '/audio/raspy.mp3', type: 'cat' },
  { id: 5, text: '需要关注', audio: '/audio/need attention.mp3', type: 'cat' },
  { id: 6, text: '难过', audio: '/audio/sad.mp3', type: 'cat' },
  { id: 7, text: '愤怒', audio: '/audio/angry.mp3', type: 'cat' }
];

const defaultHumanPhrases = [
  { id: 101, text: '真棒', audio: '/audio/真棒.mp3', type: 'human' },
  { id: 102, text: '纸巾', audio: '/audio/纸巾.mp3', type: 'human' },
  { id: 103, text: '萝卜', audio: '/audio/萝卜.mp3', type: 'human' }
];

function CatTalkPage() {
  const [mode, setMode] = useState('cat');
  const [customPhrases, setCustomPhrases] = useState([]);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPhraseName, setNewPhraseName] = useState('');
  const [tempRecording, setTempRecording] = useState(null);
  const nextIdRef = useRef(200);

  useEffect(() => {
    const saved = localStorage.getItem('catTalkCustomPhrases');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCustomPhrases(parsed);
      if (parsed.length > 0) {
        const maxId = Math.max(...parsed.map(p => p.id));
        nextIdRef.current = maxId + 1;
      }
    }
  }, []);

  const saveCustomPhrases = (phrases) => {
    setCustomPhrases(phrases);
    localStorage.setItem('catTalkCustomPhrases', JSON.stringify(phrases));
  };

  const handlePlay = async (phrase) => {
    try {
      const audio = new Audio(phrase.audio || phrase.customAudio);
      audio.volume = 0.8;
      await audio.play();
    } catch (error) {
      console.error('播放失败:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setTempRecording(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setRecording(true);
    } catch (error) {
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const saveCustomPhrase = () => {
    if (!newPhraseName.trim()) {
      alert('请输入名称');
      return;
    }
    if (!tempRecording) {
      alert('请先录音');
      return;
    }

    const newPhrase = {
      id: nextIdRef.current++,
      text: newPhraseName.trim(),
      customAudio: tempRecording,
      type: mode,
      isCustom: true
    };

    const updated = [...customPhrases, newPhrase];
    saveCustomPhrases(updated);
    setShowAddModal(false);
    setNewPhraseName('');
    setTempRecording(null);
  };

  const deletePhrase = (id) => {
    if (confirm('确定要删除这条吗？')) {
      const updated = customPhrases.filter(p => p.id !== id);
      saveCustomPhrases(updated);
    }
  };

  const getAllPhrases = () => {
    const defaults = mode === 'cat' ? defaultCatPhrases : defaultHumanPhrases;
    const customs = customPhrases.filter(p => p.type === mode);
    return [...defaults, ...customs];
  };

  return (
    <div className="page-container">
      <div className="header">
        <h1 className="header-title">🐱 猫猫语言</h1>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          className={`btn flex-1 ${mode === 'cat' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('cat')}
        >
          🐱 猫叫
        </button>
        <button
          className={`btn flex-1 ${mode === 'human' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('human')}
        >
          👤 人声
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {getAllPhrases().map((phrase) => (
          <div key={phrase.id} className="talk-item">
            <span className="talk-text">
              {phrase.isCustom && '⭐ '}
              {phrase.text}
            </span>
            <div className="flex gap-2 items-center">
              <button
                className="play-button"
                onClick={() => handlePlay(phrase)}
              >
                🔊
              </button>
              {phrase.isCustom && (
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.5rem', minWidth: '40px' }}
                  onClick={() => deletePhrase(phrase.id)}
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        className="btn btn-primary w-full mt-3"
        onClick={() => setShowAddModal(true)}
      >
        ➕ 添加自定义
      </button>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 m-4 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">
              添加{mode === 'cat' ? '猫叫' : '人声'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">名称</label>
              <input
                type="text"
                className="input"
                value={newPhraseName}
                onChange={(e) => setNewPhraseName(e.target.value)}
                placeholder="输入名称，比如：我想吃饭"
              />
            </div>

            {tempRecording && (
              <div className="mb-4">
                <audio src={tempRecording} controls className="w-full" />
              </div>
            )}

            <div className="flex gap-2 mb-4">
              {!recording ? (
                <button
                  className="btn btn-primary flex-1"
                  onClick={startRecording}
                >
                  🎤 开始录音
                </button>
              ) : (
                <button
                  className="btn btn-danger flex-1"
                  onClick={stopRecording}
                >
                  ⏹️ 停止录音
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                className="btn btn-secondary flex-1"
                onClick={() => {
                  setShowAddModal(false);
                  setNewPhraseName('');
                  setTempRecording(null);
                }}
              >
                取消
              </button>
              <button
                className="btn btn-primary flex-1"
                onClick={saveCustomPhrase}
                disabled={!newPhraseName.trim() || !tempRecording}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CatTalkPage;
