import { generateCertificate from '@vitejs/plugin-basic-ssl';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const certsDir = path.join(__dirname, '..', 'certs');

if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

console.log('证书目录已创建或存在');
console.log('证书将由 @vitejs/plugin-basic-ssl 插件自动生成');
console.log('请运行 npm install @vitejs/plugin-basic-ssl');
