import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-screen-lg p-8">
      <div className="text-center mb-8">
        <h1 className="mb-4 text-4xl font-bold text-gray-800">📚 响应式翻书网站</h1>
        <p className="text-lg text-gray-600">基于 Next.js + react-pageflip 的完整解决方案</p>
        <p className="text-sm text-gray-500 mt-2">支持桌面端和移动端，自动适配不同设备</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* 主要功能 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">🎯 主要功能</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✅ 响应式设计，自动适配桌面端和移动端</li>
            <li>✅ 移动端阴影修复，解决内容不可见问题</li>
            <li>✅ iPad 专门优化，强制单页显示</li>
            <li>✅ 触摸滑动翻页，键盘快捷键支持</li>
            <li>✅ 图片预加载，流畅的翻页动画</li>
          </ul>
        </div>

        {/* 技术特性 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-600">⚡ 技术特性</h2>
          <ul className="space-y-2 text-gray-700">
            <li>🔧 Next.js 14 + TypeScript</li>
            <li>🎨 Tailwind CSS 样式系统</li>
            <li>📱 完全解耦的移动端/桌面端组件</li>
            <li>🧹 智能阴影清理机制</li>
            <li>🔍 设备检测和自动适配</li>
          </ul>
        </div>
      </div>

      {/* 示例和测试页面 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 text-center">🚀 示例和测试页面</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Finder 书籍 */}
          <Link href={"/finder" as any} className="block bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg p-4 transition-colors">
            <h3 className="font-semibold mb-2">📘 Finder</h3>
            <p className="text-sm opacity-90">发现者之书</p>
            <p className="text-xs mt-2 opacity-75">/finder</p>
            <p className="text-xs mt-1 opacity-60">finder.abc.com</p>
          </Link>

          {/* YouthMBA 书籍 */}
          <Link href={"/youthmba" as any} className="block bg-teal-500 hover:bg-teal-600 text-white rounded-lg p-4 transition-colors">
            <h3 className="font-semibold mb-2">📗 YouthMBA</h3>
            <p className="text-sm opacity-90">青年MBA</p>
            <p className="text-xs mt-2 opacity-75">/youthmba</p>
            <p className="text-xs mt-1 opacity-60">youthmba.abc.com</p>
          </Link>

          {/* 主要示例 */}
          <Link href="/books/demo" className="block bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-4 transition-colors">
            <h3 className="font-semibold mb-2">📖 主要示例</h3>
            <p className="text-sm opacity-90">完整的翻书功能演示</p>
            <p className="text-xs mt-2 opacity-75">/books/demo</p>
          </Link>

          {/* 移动端修复测试 */}
          <Link href="/test-mobile-fix" className="block bg-red-500 hover:bg-red-600 text-white rounded-lg p-4 transition-colors">
            <h3 className="font-semibold mb-2">🔧 移动端修复</h3>
            <p className="text-sm opacity-90">阴影清理和强制显示测试</p>
            <p className="text-xs mt-2 opacity-75">/test-mobile-fix</p>
          </Link>

          {/* 小屏幕适配测试 */}
          <Link href="/test-mobile-small" className="block bg-green-500 hover:bg-green-600 text-white rounded-lg p-4 transition-colors">
            <h3 className="font-semibold mb-2">📱 小屏适配</h3>
            <p className="text-sm opacity-90">不同屏幕尺寸的显示测试</p>
            <p className="text-xs mt-2 opacity-75">/test-mobile-small</p>
          </Link>

          {/* 设备检测测试 */}
          <Link href="/test-device" className="block bg-purple-500 hover:bg-purple-600 text-white rounded-lg p-4 transition-colors">
            <h3 className="font-semibold mb-2">🔍 设备检测</h3>
            <p className="text-sm opacity-90">iPad和移动设备检测测试</p>
            <p className="text-xs mt-2 opacity-75">/test-device</p>
          </Link>

          {/* 增强版自适应测试 */}
          <Link href="/test-enhanced" className="block bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white rounded-lg p-4 transition-all shadow-lg">
            <h3 className="font-semibold mb-2">✨ 增强版自适应 <span className="text-xs bg-white/20 px-2 py-1 rounded-full ml-1">NEW!</span></h3>
            <p className="text-sm opacity-90">精确设备检测和多级自适应优化</p>
            <p className="text-xs mt-2 opacity-75">/test-enhanced</p>
          </Link>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">📝 使用说明</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 将图片文件放到 <code className="bg-yellow-200 px-1 rounded">public/books/your-book-name/</code> 目录</li>
          <li>• 图片命名格式：<code className="bg-yellow-200 px-1 rounded">001.jpg, 002.jpg, 003.jpg...</code></li>
          <li>• 桌面端支持键盘翻页（左右箭头键或 A/D 键）</li>
          <li>• 移动端支持触摸滑动翻页</li>
          <li>• 按 F 键进入全屏模式（桌面端）</li>
        </ul>
      </div>
    </main>
  );
}
