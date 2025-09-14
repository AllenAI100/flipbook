"use client";
import FlipBook from "../../../components/FlipBook";

function range(n: number) { return Array.from({ length: n }, (_, i) => i); }

export default function DemoPage() {
  const pages = range(6).map((i) => {
    const num = String(i + 1).padStart(3, "0");
    return { src: `/books/future/${num}.png`, alt: `第 ${i + 1} 页` };
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 移动端优化的容器 */}
      <div className="w-full h-screen flex items-center justify-center p-2 sm:p-4 lg:p-8">
        {/* 翻书组件 - 桌面端居中优化 */}
        <FlipBook 
          images={pages} 
          className="desktop-optimized"
        />
      </div>
    </main>
  );
}
