"use client";
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { DeviceInfo } from "./DeviceDetector";

// 类型定义
interface ImageItem {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface EnhancedMobileTurnFlipBookProps {
  images: ImageItem[];
  onPage?: (index: number) => void;
  rtl?: boolean;
  deviceInfo: DeviceInfo;
  config: any;
}

interface EnhancedMobileTurnFlipBookHandle {
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
}

/**
 * 增强版手机端TurnJS翻书组件
 * 支持多种屏幕尺寸和横竖屏自适应
 */
const EnhancedMobileTurnFlipBook = forwardRef<EnhancedMobileTurnFlipBookHandle, EnhancedMobileTurnFlipBookProps>(
  function EnhancedMobileTurnFlipBook({ images, onPage, rtl = false, deviceInfo, config }, ref) {
    const flipbookRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [turnInstance, setTurnInstance] = useState<any>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // 动态计算最佳尺寸
    useEffect(() => {
      const calculateDimensions = () => {
        const { width: screenWidth, height: screenHeight, isPortrait } = deviceInfo;
        
        let bookWidth, bookHeight;
        
        if (isPortrait) {
          // 竖屏模式：优先适配宽度
          bookWidth = Math.min(screenWidth - 40, 380);
          bookHeight = Math.min(screenHeight - 160, bookWidth * 1.4);
        } else {
          // 横屏模式：优先适配高度
          bookHeight = Math.min(screenHeight - 120, 500);
          bookWidth = Math.min(screenWidth - 80, bookHeight * 0.7);
        }

        setDimensions({ width: bookWidth, height: bookHeight });
      };

      calculateDimensions();
    }, [deviceInfo]);

    // 动态加载turn.js和jQuery
    useEffect(() => {
      const loadTurnJS = async () => {
        try {
          const jQuery = await import('jquery');
          const $ = jQuery.default;
          
          (window as any).$ = $;
          (window as any).jQuery = $;
          
          await import('turn.js');
          setIsLoaded(true);
        } catch (error) {
          console.error('Failed to load TurnJS:', error);
        }
      };

      loadTurnJS();
    }, []);

    // 初始化TurnJS
    useEffect(() => {
      if (!isLoaded || !flipbookRef.current || images.length === 0 || dimensions.width === 0) return;

      const $ = (window as any).$;
      if (!$ || !$.fn.turn) return;

      const $flipbook = $(flipbookRef.current);
      
      try {
        // 销毁之前的实例
        if (turnInstance) {
          try {
            turnInstance.turn('destroy');
          } catch (e) {
            // 忽略销毁错误
          }
        }

        // 初始化新实例
        $flipbook.turn({
          width: dimensions.width,
          height: dimensions.height,
          autoCenter: true,
          acceleration: true,
          gradients: !deviceInfo.isPortrait, // 横屏时启用渐变效果
          elevation: deviceInfo.isPortrait ? 30 : 50,
          duration: deviceInfo.isPortrait ? 500 : 600,
          pages: images.length,
          display: 'single',
          when: {
            turned: function(event: any, page: number) {
              const pageIndex = page - 1;
              setCurrentPage(pageIndex);
              onPage?.(pageIndex);
            }
          }
        });

        setTurnInstance($flipbook);

      } catch (error) {
        console.error('Failed to initialize TurnJS:', error);
      }

      return () => {
        try {
          if ($flipbook.turn) {
            $flipbook.turn('destroy');
          }
        } catch (error) {
          // 忽略清理错误
        }
      };
    }, [isLoaded, images.length, onPage, dimensions, deviceInfo]);

    // 翻页控制函数
    const goToPage = (pageIndex: number) => {
      if (!turnInstance || pageIndex < 0 || pageIndex >= images.length) return;
      
      try {
        const turnPage = pageIndex + 1;
        turnInstance.turn('page', turnPage);
      } catch (error) {
        console.error('Error going to page:', error);
      }
    };

    const goNext = () => {
      if (!turnInstance) return;
      
      try {
        turnInstance.turn('next');
      } catch (error) {
        console.error('Error going to next page:', error);
      }
    };

    const goPrev = () => {
      if (!turnInstance) return;
      
      try {
        turnInstance.turn('previous');
      } catch (error) {
        console.error('Error going to previous page:', error);
      }
    };

    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
      goTo: goToPage,
      next: goNext,
      prev: goPrev,
    }));

    // 触摸手势支持
    useEffect(() => {
      let startX = 0;
      let startY = 0;
      let startTime = 0;

      const handleTouchStart = (e: TouchEvent) => {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        startTime = Date.now();
      };

      const handleTouchEnd = (e: TouchEvent) => {
        const touch = e.changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;
        const endTime = Date.now();

        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const deltaTime = endTime - startTime;

        // 检测滑动手势
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && deltaTime < 500) {
          if (deltaX > 0) {
            // 向右滑动
            rtl ? goNext() : goPrev();
          } else {
            // 向左滑动
            rtl ? goPrev() : goNext();
          }
        }
      };

      const element = flipbookRef.current;
      if (element) {
        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
          element.removeEventListener('touchstart', handleTouchStart);
          element.removeEventListener('touchend', handleTouchEnd);
        };
      }
    }, [turnInstance, rtl]);

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
    }, [turnInstance, rtl]);

    if (!isLoaded || dimensions.width === 0) {
      return (
        <div 
          style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>📚</div>
            <div style={{ fontSize: '16px', fontWeight: '500' }}>加载中...</div>
            <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
              {deviceInfo.width}×{deviceInfo.height} {deviceInfo.isPortrait ? '竖屏' : '横屏'}
            </div>
          </div>
        </div>
      );
    }

    const containerStyle: React.CSSProperties = {
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: deviceInfo.isPortrait 
        ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      overflow: 'hidden',
      position: 'relative'
    };

    const buttonStyle = (position: 'left' | 'right'): React.CSSProperties => ({
      position: 'fixed',
      top: '50%',
      [position]: `${config.buttonPosition[position]}px`,
      transform: 'translateY(-50%)',
      width: `${config.buttonSize}px`,
      height: `${config.buttonSize}px`,
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.95)',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${config.buttonSize * 0.35}px`,
      color: '#374151',
      cursor: 'pointer',
      zIndex: 1000,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease'
    });

    return (
      <div style={containerStyle}>
        {/* TurnJS容器 */}
        <div
          ref={flipbookRef}
          style={{
            position: 'relative',
            margin: '0 auto',
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2))'
          }}
        >
          {images.map((image, index) => (
            <div 
              key={index}
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'white',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: deviceInfo.isPortrait ? '12px' : '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}
            >
              <img
                src={image.src}
                alt={image.alt || `第 ${index + 1} 页`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  display: 'block'
                }}
                onLoad={() => {
                  // Image loaded successfully
                }}
                onError={(e) => {
                  console.error(`Image ${index + 1} failed to load`, e);
                }}
              />
            </div>
          ))}
        </div>

        {/* 导航按钮 */}
        {config.showNavButtons && (
          <>
            <button
              onClick={goPrev}
              disabled={currentPage === 0}
              style={{
                ...buttonStyle('left'),
                opacity: currentPage === 0 ? 0.3 : 1
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%) scale(0.95)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              ◀
            </button>

            <button
              onClick={goNext}
              disabled={currentPage === images.length - 1}
              style={{
                ...buttonStyle('right'),
                opacity: currentPage === images.length - 1 ? 0.3 : 1
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%) scale(0.95)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              ▶
            </button>
          </>
        )}

        {/* 页面指示器 */}
        <div
          style={{
            position: 'fixed',
            bottom: deviceInfo.isPortrait ? '30px' : '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: deviceInfo.isPortrait ? '10px 20px' : '8px 16px',
            borderRadius: '20px',
            fontSize: deviceInfo.isPortrait ? '16px' : '14px',
            fontWeight: '500',
            zIndex: 1000,
            backdropFilter: 'blur(10px)'
          }}
        >
          {currentPage + 1} / {images.length}
        </div>

        {/* 滑动提示 */}
        {currentPage === 0 && (
          <div
            style={{
              position: 'fixed',
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '16px',
              fontSize: '14px',
              zIndex: 1000,
              animation: 'fadeInOut 3s ease-in-out'
            }}
          >
            👆 滑动或点击按钮翻页
          </div>
        )}

        {/* 设备信息 */}
        <div
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            background: 'rgba(34, 197, 94, 0.9)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '500',
            zIndex: 1000
          }}
        >
          手机端 {deviceInfo.width}×{deviceInfo.height} {deviceInfo.isPortrait ? '竖屏' : '横屏'}
        </div>

        {/* 尺寸信息 */}
        <div
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'rgba(168, 85, 247, 0.9)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '500',
            zIndex: 1000
          }}
        >
          书本 {dimensions.width}×{dimensions.height}
        </div>
      </div>
    );
  }
);

export default EnhancedMobileTurnFlipBook;