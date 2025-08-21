

````markdown
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

