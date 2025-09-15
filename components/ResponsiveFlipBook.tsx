"use client";
import React, { useRef, useEffect, useState } from "react";
import MobileFlipBook from "./MobileFlipBook";
import DesktopFlipBook from "./DesktopFlipBook";

// 类型定义
interface ImageItem {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface ResponsiveFlipBookProps {
  images: ImageItem[];
  onPage?: (index: number) => void;
  rtl?: boolean;
  className?: string;
}

interface ResponsiveFlipBookHandle {
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  fullscreen?: () => void;
}

/**
 * 响应式FlipBook组件
 * 根据设备类型自动选择移动端或桌面端组件
 * 实现完全解耦的架构
 */
const ResponsiveFlipBook = React.forwardRef<ResponsiveFlipBookHandle, ResponsiveFlipBookProps>(
  function ResponsiveFlipBook({ images, onPage, rtl = false, className = "" }, ref) {
    const [isMobile, setIsMobile] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    
    // 移动端和桌面端组件的引用
    const mobileRef = useRef<any>(null);
    const desktopRef = useRef<any>(null);

    // 设备检测
    useEffect(() => {
      const checkDevice = () => {
        const width = window.innerWidth;
        const userAgent = navigator.userAgent;
        const isMobileDevice = width < 768 || 
                              /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        
        console.log('ResponsiveFlipBook device check:', {
          width,
          userAgent,
          isMobileDevice,
          isMobile
        });
        
        setIsMobile(isMobileDevice);
        setIsLoaded(true);
      };

      checkDevice();
      window.addEventListener('resize', checkDevice);
      return () => window.removeEventListener('resize', checkDevice);
    }, []);

    // 统一的方法接口
    useEffect(() => {
      if (!ref) return;

      const currentRef = isMobile ? mobileRef : desktopRef;
      if (currentRef.current) {
        // 将子组件的方法暴露给父组件
        (ref as any).current = {
          goTo: (index: number) => currentRef.current?.goTo(index),
          next: () => currentRef.current?.next(),
          prev: () => currentRef.current?.prev(),
          fullscreen: () => currentRef.current?.fullscreen?.(),
        };
      }
    }, [isMobile, ref]);

    // 等待设备检测完成
    if (!isLoaded) {
      return (
        <div className={`responsive-flipbook-loading ${className}`}>
          <div className="loading-spinner">加载中...</div>
        </div>
      );
    }

    // 根据设备类型渲染对应组件
    console.log('ResponsiveFlipBook rendering:', { isMobile, isLoaded });
    
    return (
      <div className={`responsive-flipbook-wrapper ${className}`}>
        {isMobile ? (
          <div>
            <div style={{color: 'red', fontSize: '12px', position: 'absolute', top: 0, left: 0, zIndex: 9999}}>
              MOBILE MODE
            </div>
            <MobileFlipBook
              ref={mobileRef}
              images={images}
              onPage={onPage}
              rtl={rtl}
            />
          </div>
        ) : (
          <div>
            <div style={{color: 'blue', fontSize: '12px', position: 'absolute', top: 0, left: 0, zIndex: 9999}}>
              DESKTOP MODE
            </div>
            <DesktopFlipBook
              ref={desktopRef}
              images={images}
              onPage={onPage}
              rtl={rtl}
            />
          </div>
        )}
      </div>
    );
  }
);

export default ResponsiveFlipBook;
