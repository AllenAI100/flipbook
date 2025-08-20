# FlipBook Demo (Next.js + react-pageflip)

## 开发
pnpm i # 或 npm i / yarn
echo "放置图片到 public/books/book-01/001.jpg …" 
pnpm dev  # http://localhost:3000

## 构建 & 运行
pnpm build
pnpm start  # 生产模式启动

## 测试
pnpm test

## 部署（Vercel）
- 选择本仓库，一键导入；Framework 自动识别 Next.js
- Build Command: `next build`
- Output: `.next`
- 环境变量：无需
- 部署完成后访问 `/books/demo`

## 常见问题
- 若报 `Identifier 'FlipBook' has already been declared`：
  - 确认只在 `components/FlipBook.tsx` 中声明一次 `export default function FlipBook`；
  - 页面文件只 **import** 该组件，不要重复声明同名函数。


## Node 版本要求
- 需要 Node >= 18.17（推荐 Node 20 LTS）。
- 使用 nvm：
```
nvm install 20
nvm use 20
node -v
```
- 清理并重新安装依赖：
```
rm -rf node_modules pnpm-lock.yaml package-lock.json yarn.lock
pnpm i   # 或 npm i
```


## 部署（Docker）
### 本地构建与运行
```bash
docker build -t flipbook:latest .
docker run --rm -p 3000:3000 flipbook:latest
```

### docker-compose
```bash
docker compose up --build
```

### 云端（任意支持 Docker 的平台）
- 推送镜像到你的镜像仓库（如 GHCR / Docker Hub），再在云端以 `PORT=3000` 运行即可。
