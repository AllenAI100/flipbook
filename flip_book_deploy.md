# FlipBook 项目部署说明（GitHub + Vercel + Docker）

> 适用对象：已拿到本项目代码（Next.js 14 + React 18 + Tailwind + react-pageflip），希望托管到 GitHub 并免费部署到 Vercel，或使用 Docker 自行部署。

---

## 一、环境与准备
- **Node 版本**：≥ **18.17**（推荐 **20 LTS**）。
- **包管理器**：任选 `pnpm` / `npm` / `yarn`（本文示例以 `npm` 为主）。
- **GitHub 账号**：已注册并可创建仓库。
- **Vercel 账号**：建议使用 GitHub 账号一键登录。

### 建议的 `.nvmrc`
```bash
20
```

### 建议的 `.gitignore`（Next.js 通用）
```gitignore
node_modules
.next
out
.env*
.DS_Store
# logs
npm-debug.log*
yarn-error.log*
```

---

## 二、本地开发与测试
```bash
# 安装依赖
npm install

# 启动开发（热更新）
npm run dev
# 打开 http://localhost:3000/books/demo

# 生产构建 + 本地启动
npm run build
npm start
```

> 若报 “Cannot find module 'node:path' / Unsupported engine for next@14.x”：请先升级 Node 至 18.17+（建议 20）。

---

## 三、推送到 GitHub（首次）
> 下面将你的本地项目上传到 GitHub 新仓库。

```bash
# 进入项目根目录
git init

# 添加远程仓库（替换为你的仓库地址）
# 例如：https://github.com/<你的用户名>/flipbook-demo.git
git remote add origin https://github.com/<你的用户名>/flipbook-demo.git

# 首次提交并推送
git add .
git commit -m "chore: initial commit"
git branch -M main
git push -u origin main
```

> 之后日常更新：
```bash
git add .
git commit -m "feat: 更新说明"
git push
```

---

## 四、Vercel 免费部署（最推荐）

### 方案 A：Vercel 控制台一键部署
1. 打开 [Vercel 控制台](https://vercel.com/) → **New Project**。
2. 选择 **Import Git Repository**，选择刚才的 GitHub 仓库。
3. Framework 自动识别 **Next.js**；默认构建命令 `next build`，输出目录 `.next`（保持默认）。
4. 无需设置环境变量，直接 **Deploy**。
5. 部署完成后获得一个 *.vercel.app 域名，访问 `/books/demo` 验证。

### 方案 B：Vercel CLI（可在本地一键部署）
```bash
# 全局安装（可选）
npm i -g vercel

# 首次登录（会弹出浏览器授权）
vercel login

# 在项目根目录执行；首次会有交互问题（是否关联、是否创建项目等）
vercel

# 生产发布（生成稳定 production 域名）
vercel --prod
```

> 升级部署：只要你向 GitHub 推送代码，Vercel 会自动触发重新构建与上线。

---

## 五、Docker 部署（可用于自有服务器/国内云）
> 本项目已提供 `Dockerfile`（多阶段构建，Next `standalone` 输出）与 `docker-compose.yml` 示例。

### 直接 Docker 构建运行
```bash
docker build -t flipbook:latest .
docker run --rm -p 3000:3000 flipbook:latest
# 访问 http://localhost:3000/books/demo
```

### docker-compose（可选）
```bash
docker compose up --build
```

> 开发态想要热更新：
> ```bash
> docker run --rm -it -p 3000:3000 -v $(pwd):/app -w /app node:20 \
>   sh -c "npm install && npm run dev"
> ```

---

## 六、常见问题（Troubleshooting）

### 1) Node / 依赖相关
- **Unsupported engine for next@14.x**：Node 太旧 → 升级到 18.17+（建议 20）。
- **Cannot find module 'node:path'**：Node < 16 → 升级到 18/20。
- **react-pageflip 版本不存在**：锁定 `react-pageflip@2.0.6`（已在 package.json 处理）。

### 2) 构建时报路径别名找不到 `@/components/...`
- 快速解法：改为相对路径：`../../../components/FlipBook`。
- 更稳的解法：在 `next.config.mjs` 的 `webpack` 回调里显式：
  ```js
  import path from 'path';
  import { fileURLToPath } from 'url';
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  export default {
    webpack: (config) => {
      config.resolve.alias['@'] = __dirname; return config;
    },
  };
  ```
  并在 `tsconfig.json` 中添加：
  ```json
  { "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./*"] } } }
  ```

### 3) TypeScript 提示 `<HTMLFlipBook />` 缺少必填属性
为满足类型定义，显式传入默认值（示例）：
```tsx
<style jsx>{``}</style>
```
（实际项目中已在组件内传入：`style`, `startPage`, `drawShadow`, `flippingTime` 等默认值。）

### 4) 开发 vs 生产的刷新
- **开发模式**：`npm run dev` → 改代码自动热更新。
- **生产容器**：`docker run flipbook:latest` → 修改代码需重新 `docker build`。

---

## 七、目录速览（标准版）
```
my-flipbook-site/
├─ app/
│  ├─ layout.tsx
│  ├─ globals.css
│  ├─ page.tsx
│  └─ books/demo/page.tsx
├─ components/
│  ├─ FlipBook.tsx
│  └─ Thumbs.tsx
├─ public/
│  ├─ manifest.json
│  ├─ sw.js
│  └─ books/book-01/001.jpg …
├─ tests/flipbook.test.ts
├─ next.config.mjs
├─ package.json
├─ tsconfig.json
├─ docker-compose.yml
├─ Dockerfile
├─ .gitignore
└─ .nvmrc
```

---

## 八、升级与加值建议
- **多书本动态路由**：`/books/[slug]` + `pages.json` 清单。
- **PWA 预缓存**：在 `sw.js` 中把关键图片/目录页加入预缓存列表。
- **SEO 入口页**：新增 HTML 目录与关键页长文，辅助搜索收录。
- **CI/CD**：用 GitHub Actions 自动化构建与部署（Vercel / Docker Registry）。

---

### 附：Git 常用命令清单
```bash
# 初始化 + 首次推送
git init
git remote add origin <repo-url>
git add .
git commit -m "init"
git branch -M main
git push -u origin main

# 日常更新
git add .
git commit -m "feat: ..."
git push

# 同步远程更新
git pull

# 创建/切换分支
git checkout -b feature/xxx
git checkout main

# 合并分支
git merge feature/xxx
```

---

若你愿意，我可以把这份部署说明直接落到你仓库的 `README.md`，并附上 GitHub Actions 的 Vercel 部署工作流（YAML），一键自动发版。

