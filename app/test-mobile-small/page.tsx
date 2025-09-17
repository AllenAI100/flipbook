"use client";
import React from "react";
import ResponsiveFlipBook from "../../components/ResponsiveFlipBook";

// 测试图片数据
const testImages = [
  { src: "/books/book-01/001.jpg", alt: "第1页" },
  { src: "/books/book-01/002.jpg", alt: "第2页" },
  { src: "/books/book-01/003.jpg", alt: "第3页" },
  { src: "/books/book-01/004.jpg", alt: "第4页" },
  { src: "/books/book-01/005.jpg", alt: "第5页" },
];

export default function TestMobileSmallPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-2">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-4 p-4 bg-white rounded-lg shadow">
          移动端小屏幕适配测试
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 text-sm text-gray-600 border-b">
            <p>测试不同屏幕尺寸下的显示效果：</p>
            <ul className="mt-2 space-y-1">
              <li>• 480px 以下：小屏手机</li>
              <li>• 430px 以下：iPhone 15系列</li>
              <li>• 375px 以下：超小屏幕</li>
              <li>• 360px 以下：iPhone SE等</li>
              <li>• 320px 以下：超极小屏幕</li>
            </ul>
          </div>
          
          <div className="mobile-optimized lg:desktop-optimized">
            <ResponsiveFlipBook
              images={testImages}
              onPage={(index) => console.log('Page changed to:', index + 1)}
            />
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">测试说明：</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>1. 调整浏览器窗口到不同尺寸测试</li>
            <li>2. 检查翻页按钮是否正确定位</li>
            <li>3. 验证图片是否完整显示</li>
            <li>4. 测试页码指示器位置</li>
            <li>5. 检查触摸操作是否流畅</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
