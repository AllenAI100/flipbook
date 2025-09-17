"use client";
import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import dynamic from "next/dynamic";
import { DeviceInfo } from "./DeviceDetector";

// 动态导入HTMLFlipBook以避免SSR问题
const HTMLFlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

// 类型定义
interface ImageItem {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface EnhancedDesktopFlipBookProps {
  images: ImageItem[];
  onPage?: (index: number) => void;
  rtl?: boolean;
  deviceInfo: DeviceInfo;
  config: any;
}

interface EnhancedDesktopFlipBookHandle {
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  toggleFullscreen: () => void;
}

/**
 * 增强版桌面端翻书组件
 * 支持多种屏幕尺寸和窗口大小自适应
 */
const EnhancedDesktopFlipBook = forwardRef<EnhancedDesktopFlipBookHandle, EnhancedDesktopFlipBookProps>(
  function EnhancedDesktopFlipBook({ images, onPage, rtl = false, deviceInfo, config }, ref) {
    const flipBookRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [displayMode, setDisplayMode] = useState<'single' | 'double'>('double');

    // 动态计算最佳尺寸
    useEffect(() => {
      const calculateDimensions = () => {
        const { width: screenWidth, height: screenHeight, type: deviceType } = deviceInfo;
        
        let bookWidth, bookHeight;
        let mode: 'single' | 'double' = 'double';
        
        if (isFullscreen) {
          // 全屏模式
          bookWidth = Math.min(screenWidth - 100, 1400);
          bookHeight = Math.min(screenHeight - 100, 900);
          mode = screenWidth > 1200 ? 'double' : 'single';
        } else {
          // 窗口模式
          if (deviceType === 'desktop_large') {
            bookWidth = Math.min(screenWidth * 0.8, 1200);
            bookHeight = Math.min(screenHeight * 0.8, 800);
            mode = 'double';
          } else if (deviceType === 'desktop_small') {
            bookWidth = Math.min(screenWidth * 0.85, 1000);
            bookHeight = Math.min(screenHeight * 0.85, 700);
            mode = screenWidth > 1000 ? 'double' : 'single';
          } else if (deviceType === 'tablet_large') {
            bookWidth = Math.min(screenWidth * 0.9, 800);
            bookHeight = Math.min(screenHeight * 0.9, 600);
            mode = 'single';
          } else {
            // tablet_small
            bookWidth = Math.min(screenWidth * 0.95, 700);
            bookHeight = Math.min(screenHeight * 0.95, 500);
            mode = 'single';
          }
        }

        // 确保宽高比合理
        const aspectRatio = mode === 'double' ? 2 : 1.4;
        if (bookWidth / bookHeight > aspectRatio) {
          bookWidth = bookHeight * aspectRatio;
        } else {
          bookHeight = bookWidth / aspectRatio;
        }

        setDimensions({ width: bookWidth, height: bookHeight });
        setDisplayMode(mode);
      };

      calculateDimensions();
      
      // 监听窗口大小变化
      const handleResize = () => {
        setTimeout(calculateDimensions, 100);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [deviceInfo, isFullscreen]);

    // 翻页控制函数
    const goToPage = (pageIndex: number) => {
      if (!flipBookRef.current || pageIndex < 0 || pageIndex >= images.length) return;
      
      try {
        flipBookRef.current.pageFlip().flip(pageIndex);
      } catch (error) {
        console.error('Error going to page:', error);
      }
    };

    const goNext = () => {
      if (!flipBookRef.current) return;
      
      try {
        flipBookRef.current.pageFlip().flipNext();
      } catch (error) {
        console.error('Error going to next page:', error);
      }
    };

    const goPrev = () => {
      if (!flipBookRef.current) return;
      
      try {
        flipBookRef.current.pageFlip().flipPrev();
      } catch (error) {
        console.error('Error going to previous page:', error);
      }
    };

    // 全屏切换
    const toggleFullscreen = () => {
      if (!containerRef.current) return;

      if (!isFullscreen) {
        // 进入全屏
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).msRequestFullscreen) {
          (containerRef.current as any).msRequestFullscreen();
        }
      } else {
        // 退出全屏
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      }
    };

    // 监听全屏状态变化
    useEffect(() => {
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('msfullscreenchange', handleFullscreenChange);

      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      };
    }, []);

    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
      goTo: goToPage,
      next: goNext,
      prev: goPrev,
      toggleFullscreen,
    }));

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
        if (key === "f11" || (key === "f" && e.ctrlKey)) {
          e.preventDefault();
          toggleFullscreen();
        }
        if (key === "escape" && isFullscreen) {
          toggleFullscreen();
        }
      };
      
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [rtl, isFullscreen]);

    if (dimensions.width === 0) {
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
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>📚</div>
            <div style={{ fontSize: '20px', fontWeight: '600' }}>初始化中...</div>
            <div style={{ fontSize: '14px', marginTop: '12px', opacity: 0.8 }}>
              {deviceInfo.type} - {deviceInfo.width}×{deviceInfo.height}
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
      background: isFullscreen 
        ? 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)'
        : getBackgroundByDeviceType(deviceInfo.type),
      overflow: 'hidden',
      position: 'relative',
      transition: 'background 0.5s ease'
    };

    const pageWidth = displayMode === 'double' ? dimensions.width / 2 : dimensions.width;
    const pageHeight = dimensions.height;

    const buttonStyle = (position: 'left' | 'right'): React.CSSProperties => ({
      position: 'fixed',
      top: '50%',
      [position]: `${config.buttonPosition[position]}px`,
      transform: 'translateY(-50%)',
      width: `${config.buttonSize}px`,
      height: `${config.buttonSize}px`,
      borderRadius: '50%',
      background: isFullscreen 
        ? 'rgba(45, 55, 72, 0.95)' 
        : 'rgba(255, 255, 255, 0.95)',
      border: `2px solid ${isFullscreen ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${config.buttonSize * 0.35}px`,
      color: isFullscreen ? '#e2e8f0' : '#374151',
      cursor: 'pointer',
      zIndex: 1000,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease'
    });

    return (
      <div ref={containerRef} style={containerStyle}>
        {/* HTMLFlipBook容器 */}
        <div
          style={{
            position: 'relative',
            margin: '0 auto',
            filter: 'drop-shadow(0 15px 40px rgba(0, 0, 0, 0.2))'
          }}
        >
          <HTMLFlipBook
            ref={flipBookRef}
            width={pageWidth}
            height={pageHeight}
            size="fixed"
            minWidth={300}
            maxWidth={800}
            minHeight={400}
            maxHeight={1200}
            maxShadowOpacity={0.8}
            showCover={false}
            mobileScrollSupport={false}
            onFlip={(e) => {
              const pageIndex = e.data;
              setCurrentPage(pageIndex);
              onPage?.(pageIndex);
            }}
            onChangeOrientation={(e) => {
              // 处理方向变化
            }}
            onChangeState={(e) => {
              // 处理状态变化
            }}
            className="enhanced-desktop-flipbook"
            style={{
              margin: '0 auto',
              borderRadius: isFullscreen ? '8px' : '12px',
              overflow: 'hidden'
            }}
            usePortrait={displayMode === 'single'}
            startPage={0}
            drawShadow={true}
            flippingTime={600}
            useMouseEvents={true}
            swipeDistance={50}
            clickEventForward={true}
            disableFlipByClick={false}
            showPageCorners={true}
            autoSize={false}
            startZIndex={100}
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
                  overflow: 'hidden',
                  position: 'relative'
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
                
                {/* 页码水印 */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(0, 0, 0, 0.1)',
                    color: 'rgba(0, 0, 0, 0.6)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  {index + 1}
                </div>
              </div>
            ))}
          </HTMLFlipBook>
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
              onMouseEnter={(e) => {
                if (currentPage > 0) {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
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
              onMouseEnter={(e) => {
                if (currentPage < images.length - 1) {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
              }}
            >
              ▶
            </button>
          </>
        )}

        {/* 工具栏 */}
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            display: 'flex',
            gap: '10px',
            zIndex: 1000
          }}
        >
          {/* 全屏按钮 */}
          <button
            onClick={toggleFullscreen}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: isFullscreen 
                ? 'rgba(45, 55, 72, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${isFullscreen ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: isFullscreen ? '#e2e8f0' : '#374151',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={isFullscreen ? '退出全屏 (ESC)' : '全屏显示 (F11)'}
          >
            {isFullscreen ? '⤓' : '⤢'}
          </button>

          {/* 显示模式切换 */}
          <button
            onClick={() => setDisplayMode(displayMode === 'single' ? 'double' : 'single')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: isFullscreen 
                ? 'rgba(45, 55, 72, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${isFullscreen ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: isFullscreen ? '#e2e8f0' : '#374151',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={displayMode === 'single' ? '双页模式' : '单页模式'}
          >
            {displayMode === 'single' ? '📄' : '📖'}
          </button>
        </div>

        {/* 页面指示器 */}
        <div
          style={{
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: isFullscreen 
              ? 'rgba(45, 55, 72, 0.95)' 
              : 'rgba(0, 0, 0, 0.8)',
            color: isFullscreen ? '#e2e8f0' : 'white',
            padding: '12px 24px',
            borderRadius: '24px',
            fontSize: '16px',
            fontWeight: '600',
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <span>{currentPage + 1} / {images.length}</span>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255, 255, 255, 0.3)' }} />
          <span style={{ fontSize: '14px', opacity: 0.8 }}>
            {displayMode === 'single' ? '单页' : '双页'}
          </span>
        </div>

        {/* 键盘提示 */}
        {currentPage === 0 && !isFullscreen && (
          <div
            style={{
              position: 'fixed',
              top: '30%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '20px',
              fontSize: '14px',
              zIndex: 1000,
              animation: 'fadeInOut 4s ease-in-out',
              textAlign: 'center'
            }}
          >
            <div>⌨️ 使用方向键或 A/D 键翻页</div>
            <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
              F11 全屏 | 点击页面翻页
            </div>
          </div>
        )}

        {/* 设备信息 */}
        <div
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            background: getDeviceTypeColor(deviceInfo.type),
            color: 'white',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            zIndex: 1000,
            backdropFilter: 'blur(10px)'
          }}
        >
          {getDeviceTypeLabel(deviceInfo.type)} {deviceInfo.width}×{deviceInfo.height}
        </div>

        {/* 尺寸信息 */}
        <div
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            background: 'rgba(168, 85, 247, 0.9)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            zIndex: 1000,
            backdropFilter: 'blur(10px)'
          }}
        >
          书本 {Math.round(dimensions.width)}×{Math.round(dimensions.height)} {displayMode === 'single' ? '单页' : '双页'}
        </div>
      </div>
    );
  }
);

// 辅助函数
function getBackgroundByDeviceType(deviceType: string): string {
  switch (deviceType) {
    case 'desktop_large':
      return 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)';
    case 'desktop_small':
      return 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
    case 'tablet_large':
      return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
    case 'tablet_small':
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    default:
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
}

function getDeviceTypeColor(deviceType: string): string {
  switch (deviceType) {
    case 'desktop_large':
      return 'rgba(251, 146, 60, 0.9)';
    case 'desktop_small':
      return 'rgba(59, 130, 246, 0.9)';
    case 'tablet_large':
      return 'rgba(16, 185, 129, 0.9)';
    case 'tablet_small':
      return 'rgba(139, 92, 246, 0.9)';
    default:
      return 'rgba(107, 114, 128, 0.9)';
  }
}

function getDeviceTypeLabel(deviceType: string): string {
  switch (deviceType) {
    case 'desktop_large':
      return '大桌面';
    case 'desktop_small':
      return '小桌面';
    case 'tablet_large':
      return '大平板';
    case 'tablet_small':
      return '小平板';
    default:
      return '未知设备';
  }
}

export default EnhancedDesktopFlipBook;