# Flipbook

一个基于 React 的电子翻书效果项目，支持 **单页模式** 和 **翻页动画**，可自适应屏幕（电脑 / 平板）。

## ✨ 功能特性
- 📖 翻书效果（支持单页显示）
- 📱 响应式布局，自适应不同设备
- 🎨 可自定义样式（页面边框、翻页箭头、背景等）
- 🚀 支持 Vercel 免费一键部署

## 📦 安装与运行
```bash
# 克隆仓库
git clone https://github.com/AllenAI100/flipbook.git
cd flipbook

# 安装依赖
npm install

# 本地运行
npm run dev
````

浏览器打开：[http://localhost:5173](http://localhost:5173)

## 🌍 部署

推荐使用 [Vercel](https://vercel.com/) 免费部署。

1. Fork 或 Clone 本仓库到自己的 GitHub 账号
2. 打开 [Vercel](https://vercel.com/)，导入该仓库
3. 部署完成后，即可获得一个线上访问地址

## 📂 项目结构

```
flipbook/
 ┣ public/books/         # 存放翻书的图片资源
 ┣ src/
 ┃ ┣ components/
 ┃ ┃ ┗ FlipBook.tsx     # 翻书组件
 ┃ ┗ App.tsx
 ┣ package.json
 ┗ README.md
```

## 📝 开发清单

* [x] 支持单页翻书
* [x] 自适应屏幕
* [x] 翻页箭头提示
* [ ] 更多翻页动效（待定）
* [ ] 移动端交互优化（手势滑动）

## 📄 License

MIT License

---

## 生产部署：Docker + Nginx (80/443)

项目已包含用于生产的编排与反向代理配置：
- Dockerfile：Next.js standalone 构建（node server.js）
- docker-compose.prod.yml：app + nginx（监听 80/443）
- nginx/nginx.conf：HTTPS、反代、缓存、gzip（含证书占位）
- 证书路径：nginx/certs/fullchain.pem 与 nginx/certs/privkey.pem

使用步骤（服务器上）：
1) 准备证书
- 将你的域名证书复制到：
  - nginx/certs/fullchain.pem
  - nginx/certs/privkey.pem
- 将 nginx/nginx.conf 中的 server_name 改为你的域名（如 yourdomain.com www.yourdomain.com）

2) 启动（自动构建并由 Nginx 反代到 80/443）
```bash
docker compose -f docker-compose.prod.yml up --build -d
```

3) 访问
- HTTP 将 301 跳转到 HTTPS：
  - http://你的域名 → https://你的域名

常用命令
```bash
# 查看服务与日志
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f nginx
docker compose -f docker-compose.prod.yml logs -f app

# 修改了 nginx.conf 后平滑重载
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

# 重建/重启
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml restart
```

注意事项
- 首次无证书可暂时注释 nginx.conf 中的 HTTPS server 段，仅开放 80 测试。
- 静态资源缓存策略：
  - /_next/static: Cache-Control 30 天 immutable
  - /books: Cache-Control 7 天（若频繁更新，建议缩短或改名避免缓存命中）
- 若宿主机启用 SELinux，挂载卷可能需要 :Z（本配置仅读挂载一般可用）。