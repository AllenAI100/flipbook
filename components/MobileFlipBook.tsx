"use client";
import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import HTMLFlipBook from "react-pageflip";

// 类型定义
interface ImageItem {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface MobileFlipBookProps {
  images: ImageItem[];
  onPage?: (index: number) => void;
  rtl?: boolean;
}

interface MobileFlipBookHandle {
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
}

/**
 * 移动端专用FlipBook组件
 * 专注于移动端的交互和显示优化
 * 与桌面端完全解耦
 */
const MobileFlipBook = forwardRef<MobileFlipBookHandle, MobileFlipBookProps>(
  function MobileFlipBook({ images, onPage, rtl = false }, ref) {
    console.log('MobileFlipBook component initialized with:', { images: images.length, rtl });
    
    const bookRef = useRef<any>(null);
    const [page, setPage] = useState(0);
    const total = images.length;

    // 移动端专用的事件监听和页面状态管理
    useEffect(() => {
      const timer = setTimeout(() => {
        const api = bookRef.current?.pageFlip?.();
        if (!api) return;
        
        const currentPage = api.getCurrentPageIndex();
        setPage(currentPage);
        
        const onFlip = (e: any) => {
          console.log('MobileFlipBook onFlip:', e.data || e, 'rtl:', rtl, 'total:', total);
          setPage(e.data || e);
          const logicalIndex = rtl ? total - 1 - (e.data || e) : (e.data || e);
          onPage?.(logicalIndex);
        };
        
        // 移动端专用事件监听 - 监听多个事件确保捕获所有翻页
        api.on("flip", onFlip);
        api.on("changePage", onFlip);
        api.on("pageChanged", onFlip);
        api.on("flipEnd", onFlip);
        
        // 移动端定期检查页面状态 - 使用ref避免依赖循环
        const checkPageInterval = setInterval(() => {
          const currentPage = api.getCurrentPageIndex();
          setPage(prevPage => {
            if (currentPage !== prevPage) {
              console.log('MobileFlipBook interval check: page changed from', prevPage, 'to', currentPage);
              return currentPage;
            }
            return prevPage;
          });
        }, 100);
        
        return () => {
          api.off("flip", onFlip);
          api.off("changePage", onFlip);
          api.off("pageChanged", onFlip);
          api.off("flipEnd", onFlip);
          clearInterval(checkPageInterval);
        };
      }, 100);
      
      return () => {
        clearTimeout(timer);
        const api = bookRef.current?.pageFlip?.();
        if (api) {
          api.off("flip");
          api.off("changePage");
          api.off("pageChanged");
          api.off("flipEnd");
        }
      };
    }, [onPage, rtl, total]); // 移除page依赖，避免无限循环

    // 移动端专用翻页函数
    const goPrev = () => {
      console.log('MobileFlipBook goPrev called, current page before:', page);
      const api = bookRef.current?.pageFlip?.();
      if (api) {
        api.flipPrev();
        setTimeout(() => {
          const newPage = api.getCurrentPageIndex();
          console.log('MobileFlipBook goPrev: page changed to:', newPage);
          setPage(newPage);
        }, 50);
      }
    };

    const goNext = () => {
      console.log('MobileFlipBook goNext called, current page before:', page);
      const api = bookRef.current?.pageFlip?.();
      if (api) {
        api.flipNext();
        setTimeout(() => {
          const newPage = api.getCurrentPageIndex();
          console.log('MobileFlipBook goNext: page changed to:', newPage);
          setPage(newPage);
        }, 50);
      }
    };

    // 移动端键盘支持
    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        const k = e.key.toLowerCase();
        if (k === "arrowleft" || k === "a") (rtl ? goNext() : goPrev());
        if (k === "arrowright" || k === "d") (rtl ? goPrev() : goNext());
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [rtl]);


    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
      goTo: (i: number) => {
        const renderIndex = rtl ? total - 1 - i : i;
        bookRef.current?.pageFlip?.().flip(renderIndex);
      },
      next: () => (rtl ? goPrev() : goNext()),
      prev: () => (rtl ? goNext() : goPrev()),
    }));

    return (
      <div className="mobile-flipbook-container">
        <div className="mobile-book-portrait">
          {/* 核心：保持单页显示的HTMLFlipBook配置 */}
          <HTMLFlipBook
            width={700}
            height={990}
            size="fixed"
            usePortrait={true}
            minWidth={280}
            maxWidth={1800}
            minHeight={300}
            maxHeight={2200}
            drawShadow={true}
            flippingTime={600}
            startZIndex={0}
            swipeDistance={30}
            clickEventForward={true}
            useMouseEvents={true}
            showPageCorners={true}
            disableFlipByClick={false}
            mobileScrollSupport={true}
            maxShadowOpacity={0.15}
            autoSize={true}
            ref={bookRef}
            className="mobile-flipbook"
            startPage={0}
            showCover={false}
            style={undefined}
          >
            {images.map((img, idx) => (
              <article key={idx} className="mobile-page">
                <img
                  src={img.src}
                  alt={img.alt || `第 ${idx + 1} 页`}
                  className="mobile-page-image"
                  width={img.width}
                  height={img.height}
                />
              </article>
            ))}
          </HTMLFlipBook>

          {/* 移动端专用UI元素 */}
          <button
            onClick={() => {
              console.log('MobileFlipBook goPrev clicked, current page:', page, 'rtl:', rtl, 'total:', total);
              goPrev();
            }}
            disabled={rtl ? page === total - 1 : page === 0}
            className="mobile-nav-button mobile-nav-button-left"
          >
            ◀
          </button>

          <button
            onClick={() => {
              console.log('MobileFlipBook goNext clicked, current page:', page, 'rtl:', rtl, 'total:', total);
              goNext();
            }}
            disabled={rtl ? page === 0 : page === total - 1}
            className="mobile-nav-button mobile-nav-button-right"
          >
            ▶
          </button>

          <div className="mobile-page-indicator">
            {page + 1} / {total} (debug: page={page}, rtl={rtl ? 'true' : 'false'})
          </div>

        </div>
      </div>
    );
  }
);

export default MobileFlipBook;
