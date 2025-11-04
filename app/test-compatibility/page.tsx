"use client";
import React, { useState } from "react";
import DesktopFlipBook from "../../components/DesktopFlipBook";
import SimpleMobileFlipBook from "../../components/SimpleMobileFlipBook";
import MobileTurnFlipBook from "../../components/MobileTurnFlipBook";

function range(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}

export default function CompatibilityTestPage() {
  const [currentTest, setCurrentTest] = useState<string>("desktop-react");
  const [deviceType, setDeviceType] = useState<string>("unknown");

  const images = range(6).map((i) => {
    const num = String(i + 1).padStart(3, "0");
    return { src: `/books/finder/${num}.png`, alt: `第 ${i + 1} 页` };
  });

  // 检测设备类型
  React.useEffect(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 0;
    const height = typeof window !== 'undefined' ? window.innerHeight : 0;
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    
    const isIPad = /iPad/.test(userAgent) || 
                   (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isMobile = width < 768 && !isIPad;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;
    
    if (isMobile) {
      setDeviceType("Mobile Phone (< 768px)");
    } else if (isTablet || isIPad) {
      setDeviceType("Tablet/iPad");
    } else if (isDesktop) {
      setDeviceType("Desktop (>= 1024px)");
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">🔬 翻书库兼容性测试</h1>
        
        {/* 设备信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">📱 当前设备信息</h2>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>设备类型：</strong>{deviceType}</p>
            <p><strong>屏幕尺寸：</strong>{typeof window !== 'undefined' ? `${window.innerWidth} × ${window.innerHeight}` : 'N/A'}</p>
            <p><strong>User Agent：</strong>{typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 80) + '...' : 'N/A'}</p>
          </div>
        </div>

        {/* 测试选项 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold mb-3">💻 桌面端测试</h3>
            <button
              onClick={() => setCurrentTest("desktop-react")}
              className={`w-full mb-2 px-4 py-3 rounded-lg transition-colors ${
                currentTest === "desktop-react"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              react-pageflip (DesktopFlipBook)
            </button>
            <ul className="text-sm text-gray-600 space-y-1 pl-2">
              <li>✅ 单页显示</li>
              <li>✅ 阴影效果</li>
              <li>✅ 鼠标拖拽</li>
              <li>✅ 键盘快捷键</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold mb-3">📱 移动端测试</h3>
            <button
              onClick={() => setCurrentTest("mobile-react")}
              className={`w-full mb-2 px-4 py-3 rounded-lg transition-colors ${
                currentTest === "mobile-react"
                  ? "bg-green-600 text-white"
                  : "bg-green-50 text-green-700 hover:bg-green-100"
              }`}
            >
              react-pageflip (SimpleMobile)
            </button>
            <button
              onClick={() => setCurrentTest("mobile-turn")}
              className={`w-full mb-2 px-4 py-3 rounded-lg transition-colors ${
                currentTest === "mobile-turn"
                  ? "bg-purple-600 text-white"
                  : "bg-purple-50 text-purple-700 hover:bg-purple-100"
              }`}
            >
              TurnJS (MobileTurnFlipBook)
            </button>
            <ul className="text-sm text-gray-600 space-y-1 pl-2">
              <li>✅ 触摸滑动</li>
              <li>✅ 单页显示</li>
              <li>✅ 手势支持</li>
              <li>⚠️ 需测试兼容性</li>
            </ul>
          </div>
        </div>

        {/* 测试结果显示 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-center">
            {currentTest === "desktop-react" && "💻 DesktopFlipBook (react-pageflip)"}
            {currentTest === "mobile-react" && "📱 SimpleMobileFlipBook (react-pageflip)"}
            {currentTest === "mobile-turn" && "📱 MobileTurnFlipBook (TurnJS)"}
          </h2>
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden" style={{ minHeight: "60vh" }}>
            {currentTest === "desktop-react" && (
              <DesktopFlipBook images={images} onPage={(idx) => console.log('Desktop page:', idx)} />
            )}
            {currentTest === "mobile-react" && (
              <SimpleMobileFlipBook images={images} onPage={(idx) => console.log('Mobile React page:', idx)} />
            )}
            {currentTest === "mobile-turn" && (
              <MobileTurnFlipBook images={images} onPage={(idx) => console.log('Mobile TurnJS page:', idx)} />
            )}
          </div>
        </div>

        {/* 测试清单 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">📋 测试清单</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-yellow-700">基础功能测试：</h3>
              <ul className="list-disc pl-6 space-y-1 text-sm text-yellow-700">
                <li>翻页按钮是否正常工作？</li>
                <li>页面是否清晰可见？</li>
                <li>翻页动画是否流畅？</li>
                <li>单页显示是否正确？</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-700">桌面端额外测试：</h3>
              <ul className="list-disc pl-6 space-y-1 text-sm text-yellow-700">
                <li>鼠标拖拽翻页是否可用？</li>
                <li>键盘左右箭头是否可用？</li>
                <li>页面角落点击是否翻页？</li>
                <li>阴影效果是否正常？</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-700">移动端额外测试：</h3>
              <ul className="list-disc pl-6 space-y-1 text-sm text-yellow-700">
                <li>触摸滑动翻页是否可用？</li>
                <li>屏幕旋转后是否正常？</li>
                <li>是否有性能问题？</li>
                <li>是否有视觉问题（黑框、遮挡等）？</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

