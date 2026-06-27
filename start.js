const { exec, spawn } = require('child_process');
const path = require('path');

const frontendDir = __dirname;
const nodePath = 'C:\\Program Files\\Adobe\\Adobe Creative Cloud Experience\\libs\\node.exe';

console.log('正在安装前端依赖...');

const npmPath = path.join(process.env.APPDATA || '', 'npm', 'npm.cmd');
let installCmd = '';

if (require('fs').existsSync(npmPath)) {
  installCmd = npmPath;
} else {
  installCmd = nodePath;
}

const installProcess = spawn(installCmd, ['install'], { 
  cwd: frontendDir,
  stdio: 'inherit'
});

installProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('依赖安装失败');
    process.exit(code);
    return;
  }
  
  console.log('依赖安装成功，正在启动前端开发服务器...');
  
  const devProcess = spawn(nodePath, [path.join(frontendDir, 'node_modules', '.bin', 'vite')], { 
    cwd: frontendDir,
    stdio: 'inherit'
  });
  
  devProcess.on('close', (code) => {
    console.log('前端服务器已关闭，退出码:', code);
  });
  
  devProcess.on('error', (err) => {
    console.error('启动前端服务器失败:', err);
  });
});
