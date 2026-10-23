require('dotenv').config();
const express = require('express');
const cors = require('cors');
const os = require('os');
const summarizeRoutes = require('./routes/summarize');
const recognizeRoutes = require('./routes/recognize');

const app = express();
const PORT = process.env.PORT || 3001;

// 获取本机IP地址
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();

// 临时允许所有来源（测试用）
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api', summarizeRoutes);
app.use('/api', recognizeRoutes);

app.get('/', (req, res) => {
  res.json({ success: true, message: '摸凹猫后端服务正常运行' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务器运行中...`);
  console.log(`   本机访问: http://localhost:${PORT}`);
  console.log(`   局域网访问: http://${localIP}:${PORT}`);
});
