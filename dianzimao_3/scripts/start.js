const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动摸凹猫...\n');

// 启动后端
console.log('📡 启动后端服务 (端口 3001)...');
const backend = spawn('npm', ['start'], {
  cwd: path.join(__dirname, '..', 'backend'),
  shell: true
});

backend.stdout.on('data', (data) => {
  console.log(`[后端] ${data}`.trim());
});

backend.stderr.on('data', (data) => {
  console.error(`[后端错误] ${data}`.trim());
});

// 等待后端启动后再启动前端
setTimeout(() => {
  console.log('🎨 启动前端服务 (端口 5173)...');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, '..', 'frontend'),
    shell: true
  });

  frontend.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[前端] ${output}`.trim());
    
    // 当看到 Vite 启动完成的提示时，自动打开浏览器
    if (output.includes('ready in')) {
      console.log('\n🌐 自动打开浏览器...');
      const open = require('open');
      open('http://localhost:5173').catch(console.error);
    }
  });

  frontend.stderr.on('data', (data) => {
    console.error(`[前端错误] ${data}`.trim());
  });

  // 处理进程退出
  frontend.on('close', (code) => {
    console.log(`前端进程退出，代码 ${code}`);
    backend.kill();
  });
}, 2000);

// 处理主进程退出
process.on('SIGINT', () => {
  console.log('\n👋 正在关闭所有服务...');
  backend.kill();
  process.exit();
});
