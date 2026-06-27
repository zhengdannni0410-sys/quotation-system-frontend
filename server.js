const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('url');

const PORT = 5173;
const BASE_DIR = __dirname;
const API_PROXY = 'http://localhost:3000';

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const { pathname } = parse(req.url);
  
  if (pathname.startsWith('/api')) {
    const proxyUrl = `${API_PROXY}${pathname}`;
    const proxyReq = http.request(proxyUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(proxyUrl).hostname
      }
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (e) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '代理请求失败', message: e.message }));
    });
    
    req.pipe(proxyReq);
    return;
  }
  
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(BASE_DIR, filePath);
  
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - 文件未找到</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('服务器错误: ' + error.code, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`前端开发服务器运行在 http://0.0.0.0:${PORT}`);
});
