"use client";
import React, { useState, useEffect } from "react";

export default function Thumbs({ images, current, onJump }: { images: { src: string; alt?: string }[]; current: number; onJump: (i: number) => void; }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={`mt-3 flex gap-2 overflow-x-auto py-2 ${isMobile ? 'mobile-thumbs px-2' : ''}`}>
      {images.map((p, i) => (
        <button
          key={i}
          onClick={() => onJump(i)}
          className={`shrink-0 rounded-md border p-0.5 transition-all duration-200 ${
            i === current 
              ? "ring-2 ring-blue-500 bg-blue-50 scale-105" 
              : "hover:border-gray-400 hover:scale-102"
          }`}
          aria-label={`跳到第 ${i + 1} 页`}
          title={`第 ${i + 1} 页`}
        >
          <img
            src={p.src}
            alt={p.alt || `第 ${i + 1} 页`}
            loading="lazy"
            className={`object-contain ${
              isMobile ? 'h-16 w-auto' : 'h-20 w-auto'
            }`}
          />
          {/* 移动端页码显示 */}
          {isMobile && (
            <div className="text-xs text-center mt-1 text-gray-600 font-medium">
              {i + 1}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
