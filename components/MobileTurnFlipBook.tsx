"use client";
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

// 类型定义
interface ImageItem {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface MobileTurnFlipBookProps {
  images: ImageItem[];
  onPage?: (index: number) => void;
  rtl?: boolean;
}

interface MobileTurnFlipBookHandle {
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
}

/**
 * 手机端专用TurnJS翻书组件
 * 完全独立，不影响iPad和桌面端功能
 */
const MobileTurnFlipBook = forwardRef<MobileTurnFlipBookHandle, MobileTurnFlipBookProps>(
  function MobileTurnFlipBook({ images, onPage, rtl = false }, ref) {
    const flipbookRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [turnInstance, setTurnInstance] = useState<any>(null);

    // 动态加载turn.js和jQuery（仅在手机端）
    useEffect(() => {
      const loadTurnJS = async () => {
        try {
          // 动态导入jQuery和turn.js
          const jQuery = await import('jquery');
          const $ = jQuery.default;
          
          // 确保jQuery全局可用
          (window as any).$ = $;
          (window as any).jQuery = $;
          
          // 动态导入turn.js
          await import('turn.js');
          
          setIsLoaded(true);
        } catch (error) {
          console.error('Failed to load TurnJS:', error);
        }
      };

      loadTurnJS();
    }, []);

    // 初始化TurnJS（仅在手机端）
    useEffect(() => {
      if (!isLoaded || !flipbookRef.current || images.length === 0) return;

      const $ = (window as any).$;
      if (!$ || !$.fn.turn) {
        return;
      }

      const $flipbook = $(flipbookRef.current);
      
      try {
        // 计算单页显示的尺寸
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const padding = 20;
        
        // 单页模式：宽度适配屏幕，高度按比例计算
        const pageWidth = Math.min(screenWidth - padding, 350);
        const pageHeight = Math.min(screenHeight - 120, 500);
        
        // 初始化turn.js - 手机端单页模式
        $flipbook.turn({
          width: pageWidth,
          height: pageHeight,
          autoCenter: true,
          acceleration: true,
          gradients: true,
          elevation: 50,
          duration: 600,
          pages: images.length,
          display: 'single', // 强制单页显示
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

      // 清理函数
      return () => {
        try {
          if ($flipbook.turn) {
            $flipbook.turn('destroy');
          }
        } catch (error) {
          console.warn('Error destroying TurnJS:', error);
        }
      };
    }, [isLoaded, images.length, onPage]);

    // 翻页控制函数
    const goToPage = (pageIndex: number) => {
      if (!turnInstance || pageIndex < 0 || pageIndex >= images.length) return;
      
      try {
        const turnPage = pageIndex + 1; // TurnJS页码从1开始
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

    if (!isLoaded) {
      return (
        <div 
          style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f5'
          }}
        >
          <div style={{ textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>📚</div>
            <div>加载TurnJS中...</div>
          </div>
        </div>
      );
    }

    return (
      <div 
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* TurnJS容器 - 单页模式优化 */}
        <div
          ref={flipbookRef}
          style={{
            position: 'relative',
            margin: '0 auto',
            maxWidth: '350px',
            maxHeight: '500px'
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
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
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
        <button
          onClick={goPrev}
          disabled={currentPage === 0}
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
            opacity: currentPage === 0 ? 0.3 : 1
          }}
        >
          ◀
        </button>

        <button
          onClick={goNext}
          disabled={currentPage === images.length - 1}
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
            opacity: currentPage === images.length - 1 ? 0.3 : 1
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
          {currentPage + 1} / {images.length}
        </div>


      </div>
    );
  }
);

export default MobileTurnFlipBook;