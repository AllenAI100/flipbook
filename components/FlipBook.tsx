"use client";
import React, { useMemo, useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import SinglePageFlipBook from "./SinglePageFlipBook";

export type ImagePage = { src: string; alt?: string; width?: number; height?: number };
export type FlipBookHandle = { goTo: (i: number) => void; next: () => void; prev: () => void; fullscreen: () => void };

export type FlipBookProps = {
  images: ImagePage[];
  width?: number;
  height?: number;
  className?: string;
  showToolbar?: boolean;
  onPage?: (index: number) => void;
  rtl?: boolean;
  fillMode?: "cover" | "contain";
};

export function computeDims({ viewportWidth, designWidth, designHeight }: { viewportWidth: number; designWidth: number; designHeight: number }) {
  const ratio = designHeight / designWidth;
  const w = Math.max(480, Math.min(viewportWidth, 1000));
  const h = Math.round(w * ratio);
  return { w, h };
}

const FlipBook = forwardRef<FlipBookHandle, FlipBookProps>(function FlipBook({
  images,
  width = 1280,
  height = 960,
  className,
  showToolbar = true,
  onPage,
  rtl = false,
  fillMode = "contain",
}, ref) {
  const [page, setPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const total = images.length;

  // 使用成熟的设备检测方案
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent;
      
      // 1. 基础触摸设备检测
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // 2. 成熟的iPad检测方案
      const isIPad = (() => {
        if (/iPad/.test(userAgent)) return true;
        
        const isMacUA = /Macintosh/.test(userAgent);
        const hasTouch = hasTouchScreen;
        const aspectRatio = Math.max(width, height) / Math.min(width, height);
        const isTabletAspectRatio = aspectRatio >= 1.2 && aspectRatio <= 1.5;
        
        if (isMacUA && hasTouch && isTabletAspectRatio) return true;
        
        if (window.matchMedia && hasTouch) {
          const isTabletSize = window.matchMedia('(min-width: 768px) and (max-width: 1366px)').matches;
          const isHighDPI = window.matchMedia('(-webkit-min-device-pixel-ratio: 1.5)').matches;
          if (isTabletSize && isHighDPI) return true;
        }
        
        return false;
      })();
      
      // 3. 移动设备判断
      const isMobile = (() => {
        if (width <= 768) return true;
        if (isIPad) return true;
        if (hasTouchScreen && width <= 1024) return true;
        if (/Android/.test(userAgent) && hasTouchScreen && width >= 600) return true;
        return false;
      })();
      
      setIsMobile(isMobile);
      
      console.log('设备检测结果:', {
        width,
        height,
        userAgent: userAgent.substring(0, 50) + '...',
        hasTouchScreen,
        isIPad,
        isMobile,
        aspectRatio: Math.max(width, height) / Math.min(width, height)
      });
    };
    
    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  const renderImages = useMemo(() => (rtl ? [...images].reverse() : images), [images, rtl]);

  const toggleFullscreen = async () => {
    const el = document.documentElement;
    if (!document.fullscreenElement) await el.requestFullscreen?.();
    else await document.exitFullscreen?.();
  };

  useImperativeHandle(ref, () => ({
    goTo: (i: number) => {
      // 这里可以通过ref调用SinglePageFlipBook的方法
      console.log('跳转到页面:', i);
    },
    next: () => console.log('下一页'),
    prev: () => console.log('上一页'),
    fullscreen: toggleFullscreen,
  }));

  // 预加载相邻页面
  useEffect(() => {
    const neighbors = [page - 2, page - 1, page + 1, page + 2].filter((i) => i >= 0 && i < total);
    neighbors.forEach((i) => { 
      const img = new Image(); 
      img.src = renderImages[i].src; 
    });
  }, [page, renderImages, total]);

  // 所有设备都使用单页模式
  console.log('使用单页模式 (所有设备)');
  return (
    <div className={`flex flex-col items-center ${className || ""}`}>
      <div className="book-portrait">
        <SinglePageFlipBook
          images={renderImages}
          className=""
          onPage={(index) => {
            const logicalIndex = rtl ? total - 1 - index : index;
            setPage(logicalIndex);
            onPage?.(logicalIndex);
          }}
        />
      </div>
    </div>
  );
});

export default FlipBook;