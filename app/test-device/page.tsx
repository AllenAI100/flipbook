"use client";
import { useEffect, useState } from "react";

export default function DeviceTestPage() {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent;
      
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      const isIPad = (() => {
        if (/iPad/.test(userAgent)) return true;
        
        const isMacUA = /Macintosh/.test(userAgent);
        const hasTouch = hasTouchScreen;
        const aspectRatio = Math.max(width, height) / Math.min(width, height);
        const isTabletAspectRatio = aspectRatio >= 1.2 && aspectRatio <= 1.5;
        
        if (isMacUA && hasTouch && isTabletAspectRatio) return true;
        
        if (window.matchMedia && hasTouch) {
          const isTabletSize = window.matchMedia('(min-width: 768px) and (max-width: 1366px)').matches;
          const isHighDPI = window.matchMedia('(-webkit-min-device-pixel-ratio: 1.5)').matches;
          if (isTabletSize && isHighDPI) return true;
        }
        
        return false;
      })();
      
      const isMobile = width <= 768 || isIPad || (hasTouchScreen && width <= 1024);

      setDeviceInfo({
        width, height, hasTouchScreen, isIPad, isMobile,
        deviceType: isIPad ? 'iPad' : (isMobile ? 'Mobile' : 'Desktop')
      });
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  if (!deviceInfo) return <div className="p-8">检测设备中...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">iPad强制单页处理测试</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">设备检测结果</h2>
          <div className="space-y-2 text-sm">
            <div><strong>屏幕尺寸:</strong> {deviceInfo.width} × {deviceInfo.height}</div>
            <div><strong>设备类型:</strong> {deviceInfo.deviceType}</div>
            <div><strong>触摸支持:</strong> {deviceInfo.hasTouchScreen ? '✅ 支持' : '❌ 不支持'}</div>
            <div><strong>iPad检测:</strong> {deviceInfo.isIPad ? '✅ 是iPad' : '❌ 非iPad'}</div>
            <div><strong>移动设备:</strong> {deviceInfo.isMobile ? '✅ 是' : '❌ 否'}</div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">预期行为</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• iPad设备应该被检测为移动设备</li>
            <li>• 翻书组件应该使用单页模式</li>
            <li>• 触摸翻页应该正常工作</li>
          </ul>
        </div>

        <div className="text-center space-x-4">
          <a href="/books/demo" className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
            测试翻书效果
          </a>
          <a href="/" className="inline-block bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors">
            返回首页
          </a>
        </div>
      </div>
    </main>
  );
}