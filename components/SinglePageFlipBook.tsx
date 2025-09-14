"use client";
import React, { useState, useRef, useEffect } from "react";

export type ImagePage = { src: string; alt?: string; width?: number; height?: number };

export type SinglePageFlipBookProps = {
  images: ImagePage[];
  className?: string;
  onPage?: (index: number) => void;
};

export default function SinglePageFlipBook({ images, className, onPage }: SinglePageFlipBookProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [showHints, setShowHints] = useState(true);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalPages = images.length;

  // 检测设备类型和计算最佳尺寸
  useEffect(() => {
    const updateSize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const isMobileDevice = screenWidth <= 768 || 'ontouchstart' in window;
      
      setScreenWidth(screenWidth);
      setIsMobile(isMobileDevice);
      
      if (isMobileDevice) {
        // 移动端：充分利用屏幕空间
        const safeAreaTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') || '0');
        const safeAreaBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0');
        
        // 计算可用高度（减去安全区域和一些UI元素空间）
        const availableHeight = screenHeight - safeAreaTop - safeAreaBottom - 80; // 80px留给页码指示器等UI
        const availableWidth = screenWidth - 32; // 左右各16px边距
        
        // 根据设备类型优化尺寸
        let optimalWidth: number;
        let optimalHeight: number;
        
        if (screenWidth >= 768) {
          // iPad等平板
          optimalWidth = Math.min(availableWidth * 0.9, 700);
          optimalHeight = Math.min(availableHeight * 0.9, 900);
        } else if (screenWidth >= 430) {
          // iPhone Plus/Pro Max等大屏手机
          optimalWidth = availableWidth * 0.95;
          optimalHeight = availableHeight * 0.85;
        } else {
          // 标准手机
          optimalWidth = availableWidth * 0.95;
          optimalHeight = availableHeight * 0.8;
        }
        
        setContainerSize({
          width: Math.round(optimalWidth),
          height: Math.round(optimalHeight)
        });
        
        console.log('移动端尺寸适配:', {
          screenSize: `${screenWidth}×${screenHeight}`,
          availableSize: `${availableWidth}×${availableHeight}`,
          optimalSize: `${Math.round(optimalWidth)}×${Math.round(optimalHeight)}`,
          deviceType: screenWidth >= 768 ? 'iPad' : screenWidth >= 430 ? 'iPhone Plus' : 'iPhone'
        });
      } else {
        // 桌面端：最大化利用屏幕空间
        const availableWidth = screenWidth - 16; // 左右各8px边距，最小边距
        const availableHeight = screenHeight - 16; // 上下各8px边距，最小边距
        
        // 根据屏幕大小动态调整尺寸，更激进地利用空间
        let optimalWidth: number;
        let optimalHeight: number;
        
        if (screenWidth >= 1920) {
          // 4K/大屏显示器：几乎占满整个屏幕
          optimalWidth = Math.min(availableWidth * 0.98, 1900);
          optimalHeight = Math.min(availableHeight * 0.98, 1800);
        } else if (screenWidth >= 1440) {
          // 1440p显示器：充分利用空间
          optimalWidth = Math.min(availableWidth * 0.95, 1400);
          optimalHeight = Math.min(availableHeight * 0.95, 1400);
        } else if (screenWidth >= 1200) {
          // 1080p显示器：大幅利用空间
          optimalWidth = Math.min(availableWidth * 0.9, 1200);
          optimalHeight = Math.min(availableHeight * 0.9, 1200);
        } else {
          // 小屏桌面：充分利用空间
          optimalWidth = Math.min(availableWidth * 0.85, 1000);
          optimalHeight = Math.min(availableHeight * 0.85, 1000);
        }
        
        setContainerSize({
          width: Math.round(optimalWidth),
          height: Math.round(optimalHeight)
        });
        
        console.log('桌面端尺寸适配:', {
          screenSize: `${screenWidth}×${screenHeight}`,
          availableSize: `${availableWidth}×${availableHeight}`,
          optimalSize: `${Math.round(optimalWidth)}×${Math.round(optimalHeight)}`,
          deviceType: screenWidth >= 1920 ? '4K/大屏' : 
                     screenWidth >= 1440 ? '1440p' : 
                     screenWidth >= 1200 ? '1080p' : '小屏桌面'
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);
    
    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  }, []);

  const goToPage = (index: number) => {
    if (index >= 0 && index < totalPages) {
      setCurrentPage(index);
      onPage?.(index);
      setShowHints(false);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  // 自动隐藏提示
  useEffect(() => {
    const timer = setTimeout(() => setShowHints(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') prevPage();
      if (e.key === 'ArrowRight' || e.key === 'd') nextPage();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage]);

  // 触摸手势支持
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;

      // 确保是水平滑动
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          prevPage(); // 向右滑动，上一页
        } else {
          nextPage(); // 向左滑动，下一页
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentPage]);

  return (
    <div 
      className={`single-page-flipbook ${className || ''}`} 
      ref={containerRef}
      style={{
        // 使用CSS变量来设置尺寸，确保覆盖CSS规则
        ['--js-calculated-width' as any]: containerSize.width ? `${containerSize.width}px` : '100%',
        ['--js-calculated-height' as any]: containerSize.height ? `${containerSize.height}px` : '100vh',
        width: containerSize.width || '100%',
        height: containerSize.height || '100vh',
        // 移除maxWidth和maxHeight限制，让JavaScript计算的尺寸完全生效
        maxWidth: containerSize.width ? `${containerSize.width}px` : '100vw',
        maxHeight: containerSize.height ? `${containerSize.height}px` : '100vh',
        margin: '0 auto' // 确保居中
      }}
    >
      <div className="relative w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* 当前页面 */}
        <div className={`w-full h-full ${isMobile ? 'p-2' : 'p-4'}`}>
          <img
            src={images[currentPage]?.src}
            alt={images[currentPage]?.alt || `第 ${currentPage + 1} 页`}
            className="w-full h-full object-contain"
            loading="lazy"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* 翻页按钮 - 小尺寸手机优化 */}
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className={`absolute top-1/2 -translate-y-1/2 ${
            // 根据屏幕尺寸调整按钮大小和位置
            screenWidth <= 375 ? 'w-8 h-8 text-xs left-1' : // iPhone SE等小屏
            screenWidth <= 393 ? 'w-9 h-9 text-sm left-1.5' : // iPhone 15/Pro
            screenWidth <= 430 ? 'w-10 h-10 text-sm left-2' : // iPhone 15 Plus/Pro Max
            'w-12 h-12 text-base left-4' // iPad和桌面
          } bg-black/20 hover:bg-black/40 active:bg-black/60 rounded-full flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all touch-manipulation`}
          style={{ 
            minHeight: screenWidth <= 375 ? '32px' : '44px', 
            minWidth: screenWidth <= 375 ? '32px' : '44px' 
          }}
        >
          ◀
        </button>

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
          className={`absolute top-1/2 -translate-y-1/2 ${
            // 根据屏幕尺寸调整按钮大小和位置
            screenWidth <= 375 ? 'w-8 h-8 text-xs right-1' : // iPhone SE等小屏
            screenWidth <= 393 ? 'w-9 h-9 text-sm right-1.5' : // iPhone 15/Pro
            screenWidth <= 430 ? 'w-10 h-10 text-sm right-2' : // iPhone 15 Plus/Pro Max
            'w-12 h-12 text-base right-4' // iPad和桌面
          } bg-black/20 hover:bg-black/40 active:bg-black/60 rounded-full flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all touch-manipulation`}
          style={{ 
            minHeight: screenWidth <= 375 ? '32px' : '44px', 
            minWidth: screenWidth <= 375 ? '32px' : '44px' 
          }}
        >
          ▶
        </button>

        {/* 页码指示器 - 小尺寸手机优化 */}
        <div className={`absolute left-1/2 -translate-x-1/2 bg-black/70 text-white rounded-full backdrop-blur-sm ${
          // 根据屏幕尺寸调整页码指示器
          screenWidth <= 375 ? 'bottom-1 px-2 py-0.5 text-xs' : // iPhone SE等小屏
          screenWidth <= 393 ? 'bottom-1.5 px-2.5 py-1 text-xs' : // iPhone 15/Pro
          screenWidth <= 430 ? 'bottom-2 px-3 py-1 text-sm' : // iPhone 15 Plus/Pro Max
          'bottom-4 px-3 py-1 text-sm' // iPad和桌面
        }`}>
          {currentPage + 1} / {totalPages}
        </div>

        {/* 操作提示 - 小尺寸手机优化 */}
        {showHints && (
          <div className={`absolute left-1/2 -translate-x-1/2 bg-black/80 text-white rounded-full animate-bounce backdrop-blur-sm ${
            // 根据屏幕尺寸调整操作提示
            screenWidth <= 375 ? 'top-1 px-2 py-1 text-xs' : // iPhone SE等小屏
            screenWidth <= 393 ? 'top-1.5 px-3 py-1.5 text-xs' : // iPhone 15/Pro
            screenWidth <= 430 ? 'top-2 px-3 py-1.5 text-sm' : // iPhone 15 Plus/Pro Max
            'top-4 px-4 py-2 text-sm' // iPad和桌面
          }`}>
            {isMobile ? '滑动或点击翻页' : '点击或滑动翻页'}
          </div>
        )}

        {/* 书脊效果 */}
        <div className="absolute left-0 top-0 h-full w-4 bg-gradient-to-r from-gray-300 via-gray-100 to-transparent shadow-inner"></div>
        <div className="absolute left-4 top-0 h-full w-1 bg-gradient-to-r from-black/6 via-transparent to-black/2"></div>
      </div>
    </div>
  );
}