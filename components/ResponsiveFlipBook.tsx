"use client";
import React, { useRef, useEffect, useState } from "react";
import DesktopFlipBook from "./DesktopFlipBook";
import SimpleMobileFlipBook from "./SimpleMobileFlipBook";
import MobileTurnFlipBook from "./MobileTurnFlipBook";

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
 * 简化的响应式FlipBook组件
 * 桌面端使用完整翻书，移动端使用简化版本
 */
const ResponsiveFlipBook = React.forwardRef<ResponsiveFlipBookHandle, ResponsiveFlipBookProps>(
  function ResponsiveFlipBook({ images, onPage, rtl = false, className = "" }, ref) {
    const [isMobile, setIsMobile] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    
    const mobileRef = useRef<any>(null);
    const desktopRef = useRef<any>(null);

    // 精确的设备检测 - 区分手机、iPad和桌面端
    useEffect(() => {
      const checkDevice = () => {
        if (typeof window === 'undefined') return;
        
        const width = window.innerWidth;
        const height = window.innerHeight;
        const userAgent = navigator.userAgent;
        
        // 检测iPad
        const isIPad = /iPad/.test(userAgent) || 
                     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
                     (width >= 768 && width <= 1366 && 'ontouchstart' in window);
        
        // 检测手机（排除iPad）
        const isMobilePhone = !isIPad && (
          width < 768 || 
          /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
        );
        

        
        // 只有真正的手机才使用移动端组件
        setIsMobile(isMobilePhone);
        setIsLoaded(true);
      };

      checkDevice();
      window.addEventListener('resize', checkDevice);
      
      return () => {
        window.removeEventListener('resize', checkDevice);
      };
    }, []);

    // 统一的方法接口
    useEffect(() => {
      if (!ref) return;

      const currentRef = isMobile ? mobileRef : desktopRef;
      if (currentRef.current) {
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
        <div className="w-full h-screen flex items-center justify-center">
          <div className="text-gray-600">加载中...</div>
        </div>
      );
    }

    // 根据设备类型渲染对应组件
    return (
      <div className={`w-full h-full ${className}`}>
        {isMobile ? (
          // 手机端使用TurnJS
          <MobileTurnFlipBook
            ref={mobileRef}
            images={images}
            onPage={onPage}
            rtl={rtl}
          />
        ) : (
          // iPad和桌面端使用现有组件
          <DesktopFlipBook
            ref={desktopRef}
            images={images}
            onPage={onPage}
            rtl={rtl}
          />
        )}
      </div>
    );
  }
);

export default ResponsiveFlipBook;