"use client";
import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";

// 类型定义
interface ImageItem {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface SimpleMobileFlipBookProps {
  images: ImageItem[];
  onPage?: (index: number) => void;
  rtl?: boolean;
}

interface SimpleMobileFlipBookHandle {
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
}

/**
 * 极简移动端翻书组件
 * 专为小屏手机优化，无复杂CSS冲突
 */
const SimpleMobileFlipBook = forwardRef<SimpleMobileFlipBookHandle, SimpleMobileFlipBookProps>(
  function SimpleMobileFlipBook({ images, onPage, rtl = false }, ref) {
    const [currentPage, setCurrentPage] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const total = images.length;

    // 翻页函数
    const goToPage = (pageIndex: number) => {
      if (isAnimating) return;
      if (pageIndex < 0 || pageIndex >= total) return;
      
      setIsAnimating(true);
      setCurrentPage(pageIndex);
      onPage?.(pageIndex);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    };

    const goNext = () => {
      const nextPage = rtl ? currentPage - 1 : currentPage + 1;
      goToPage(nextPage);
    };

    const goPrev = () => {
      const prevPage = rtl ? currentPage + 1 : currentPage - 1;
      goToPage(prevPage);
    };

    // 键盘支持
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        if (key === "arrowleft" || key === "a") {
          rtl ? goNext() : goPrev();
        }
        if (key === "arrowright" || key === "d") {
          rtl ? goPrev() : goNext();
        }
      };
      
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentPage, rtl]);

    // 触摸滑动支持
    useEffect(() => {
      let startX = 0;
      let startY = 0;
      
      const handleTouchStart = (e: TouchEvent) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      };
      
      const handleTouchEnd = (e: TouchEvent) => {
        if (!startX || !startY) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // 只有水平滑动距离大于垂直滑动距离时才翻页
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
          if (diffX > 0) {
            // 向左滑动
            rtl ? goPrev() : goNext();
          } else {
            // 向右滑动
            rtl ? goNext() : goPrev();
          }
        }
        
        startX = 0;
        startY = 0;
      };
      
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }, [currentPage, rtl]);

    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
      goTo: goToPage,
      next: goNext,
      prev: goPrev,
    }));

    return (
      <div 
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
          overflow: 'hidden'
        }}
      >
        {/* 当前页面 */}
        <div
          style={{
            position: 'relative',
            width: 'min(95vw, calc(95vh * 0.707))',
            height: 'min(95vh, calc(95vw / 0.707))',
            background: 'white',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {images[currentPage] && (
            <img
              src={images[currentPage].src}
              alt={images[currentPage].alt || `第 ${currentPage + 1} 页`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                objectPosition: 'center',
                transition: isAnimating ? 'opacity 0.3s ease-in-out' : 'none',
                opacity: isAnimating ? 0.7 : 1
              }}
              onLoad={() => {
                // console.log(`页面 ${currentPage + 1} 图片加载完成`);
              }}
              onError={(e) => {
                console.error(`页面 ${currentPage + 1} 图片加载失败`, e);
              }}
            />
          )}
        </div>
        
        {/* 导航按钮 */}
        <button
          onClick={goPrev}
          disabled={rtl ? currentPage === total - 1 : currentPage === 0}
          style={{
            position: 'fixed',
            top: '50%',
            left: '10px',
            transform: 'translateY(-50%)',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '2px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: '#374151',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            opacity: (rtl ? currentPage === total - 1 : currentPage === 0) ? 0.3 : 1
          }}
        >
          ◀
        </button>

        <button
          onClick={goNext}
          disabled={rtl ? currentPage === 0 : currentPage === total - 1}
          style={{
            position: 'fixed',
            top: '50%',
            right: '10px',
            transform: 'translateY(-50%)',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '2px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: '#374151',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            opacity: (rtl ? currentPage === 0 : currentPage === total - 1) ? 0.3 : 1
          }}
        >
          ▶
        </button>

        {/* 页面指示器 */}
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '16px',
            fontSize: '14px',
            zIndex: 1000
          }}
        >
          {currentPage + 1} / {total}
        </div>
      </div>
    );
  }
);

export default SimpleMobileFlipBook;