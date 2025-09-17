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

interface TabletFlipBookProps {
  images: ImageItem[];
  onPage?: (index: number) => void;
  rtl?: boolean;
  deviceInfo: DeviceInfo;
  config: any;
}

interface TabletFlipBookHandle {
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  fullscreen?: () => void;
}

/**
 * 平板端专用FlipBook组件
 * 针对iPad和Android平板优化
 * 支持横竖屏自适应和触摸操作
 */
const TabletFlipBook = forwardRef<TabletFlipBookHandle, TabletFlipBookProps>(
  function TabletFlipBook({ images, onPage, rtl = false, deviceInfo, config }, ref) {
    const bookRef = useRef<any>(null);
    const [page, setPage] = useState(0);
    const [showHints, setShowHints] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const total = images.length;

    // 平板端事件监听
    useEffect(() => {
      const timer = setTimeout(() => {
        const api = bookRef.current?.pageFlip?.();
        if (!api) return;
        
        const currentPage = api.getCurrentPageIndex();
        setPage(currentPage);
        
        const onFlip = (e: any) => {
          const newPage = e.data || e;
          setPage(newPage);
          const logicalIndex = rtl ? total - 1 - newPage : newPage;
          onPage?.(logicalIndex);
        };
        
        api.on("flip", onFlip);
        api.on("changePage", onFlip);
        
        return () => {
          api.off("flip", onFlip);
          api.off("changePage", onFlip);
        };
      }, 100);
      
      return () => clearTimeout(timer);
    }, [onPage, rtl, total]);

    // 平板端翻页函数
    const goPrev = () => {
      const api = bookRef.current?.pageFlip?.();
      if (api) {
        api.flipPrev();
      }
      setShowHints(false);
    };

    const goNext = () => {
      const api = bookRef.current?.pageFlip?.();
      if (api) {
        api.flipNext();
      }
      setShowHints(false);
    };

    // 平板端全屏功能
    const toggleFullscreen = async () => {
      const el = document.documentElement;
      if (!document.fullscreenElement) {
        await el.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    };

    // 平板端触摸和键盘支持
    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        const k = e.key.toLowerCase();
        if (k === "arrowleft" || k === "a") (rtl ? goNext() : goPrev());
        if (k === "arrowright" || k === "d") (rtl ? goPrev() : goNext());
        if (k === "f") toggleFullscreen();
      };
      
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [rtl]);

    // 自动隐藏提示
    useEffect(() => {
      const timer = setTimeout(() => setShowHints(false), 4000);
      return () => clearTimeout(timer);
    }, []);

    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
      goTo: (i: number) => {
        const renderIndex = rtl ? total - 1 - i : i;
        bookRef.current?.pageFlip?.().flip(renderIndex);
      },
      next: () => (rtl ? goPrev() : goNext()),
      prev: () => (rtl ? goNext() : goPrev()),
      fullscreen: toggleFullscreen,
    }));

    // 根据设备信息动态计算样式
    const containerStyle: React.CSSProperties = {
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
      position: 'relative',
      overflow: 'hidden'
    };

    const buttonStyle = (position: 'left' | 'right'): React.CSSProperties => ({
      position: 'fixed',
      top: '50%',
      [position]: `${config.buttonPosition[position]}px`,
      transform: 'translateY(-50%)',
      width: `${config.buttonSize}px`,
      height: `${config.buttonSize}px`,
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.9)',
      border: '2px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${config.buttonSize * 0.35}px`,
      color: '#374151',
      cursor: 'pointer',
      zIndex: 1000,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.2s ease'
    });

    return (
      <div style={containerStyle}>
        {/* 平板端FlipBook */}
        <HTMLFlipBook
          width={config.width}
          height={config.height}
          size="fixed"
          usePortrait={deviceInfo.isPortrait}
          minWidth={280}
          maxWidth={1200}
          minHeight={300}
          maxHeight={1600}
          drawShadow={true}
          flippingTime={500}
          startZIndex={0}
          swipeDistance={50}
          clickEventForward={true}
          useMouseEvents={true}
          showPageCorners={true}
          disableFlipByClick={false}
          mobileScrollSupport={true}
          maxShadowOpacity={0.25}
          autoSize={false}
          ref={bookRef}
          className="tablet-flipbook"
          startPage={0}
          showCover={false}
          style={undefined}
        >
          {images.map((img, idx) => (
            <article key={idx} className="tablet-page">
              <img
                src={img.src}
                alt={img.alt || `第 ${idx + 1} 页`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center'
                }}
                width={img.width}
                height={img.height}
              />
            </article>
          ))}
        </HTMLFlipBook>

        {/* 平板端导航按钮 */}
        {config.showNavButtons && (
          <>
            <button
              onClick={goPrev}
              disabled={rtl ? page === total - 1 : page === 0}
              style={{
                ...buttonStyle('left'),
                opacity: (rtl ? page === total - 1 : page === 0) ? 0.3 : 1
              }}
            >
              ◀
            </button>

            <button
              onClick={goNext}
              disabled={rtl ? page === 0 : page === total - 1}
              style={{
                ...buttonStyle('right'),
                opacity: (rtl ? page === 0 : page === total - 1) ? 0.3 : 1
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
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '16px',
            zIndex: 1000
          }}
        >
          {page + 1} / {total}
        </div>

        {/* 全屏按钮 */}
        <button
          onClick={toggleFullscreen}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '2px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: '#374151',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
        >
          {isFullscreen ? '⤓' : '⤢'}
        </button>

        {/* 操作提示 */}
        {showHints && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '16px',
              fontSize: '14px',
              zIndex: 1000,
              animation: 'fadeInOut 4s ease-in-out'
            }}
          >
            {deviceInfo.isTouch ? '滑动或点击按钮翻页' : '方向键或点击翻页'}
          </div>
        )}

        {/* 设备信息调试 */}
        <div
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            background: 'rgba(0, 100, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 1000
          }}
        >
          平板端 {deviceInfo.width}×{deviceInfo.height}
        </div>
      </div>
    );
  }
);

export default TabletFlipBook;