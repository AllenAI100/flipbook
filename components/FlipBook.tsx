"use client";
import React, { useMemo, useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import HTMLFlipBook from "react-pageflip";

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
  const bookRef = useRef<any>(null);
  const [page, setPage] = useState(0);
  const [showHints, setShowHints] = useState(true);
  const total = images.length;

  const renderImages = useMemo(() => (rtl ? [...images].reverse() : images), [images, rtl]);

  useEffect(() => {
    const api = bookRef.current?.pageFlip?.();
    if (!api) return;
    const onFlip = (e: any) => {
      setPage(e.data);
      const logicalIndex = rtl ? total - 1 - e.data : e.data;
      onPage?.(logicalIndex);
    };
    api.on("flip", onFlip);
    return () => api.off("flip", onFlip);
  }, [onPage, rtl, total]);

  const dims = useMemo(() => {
    if (typeof window === "undefined") return { w: width, h: height };
    const vw = Math.min(window.innerWidth, 1000) - 32;
    return computeDims({ viewportWidth: vw, designWidth: width, designHeight: height });
  }, [width, height]);

  const goPrev = () => {
    bookRef.current?.pageFlip?.().flipPrev();
    setShowHints(false); // 隐藏提示
  };
  const goNext = () => {
    bookRef.current?.pageFlip?.().flipNext();
    setShowHints(false); // 隐藏提示
  };
  const goToRenderIndex = (i: number) => bookRef.current?.pageFlip?.().flip(i);
  const goToLogicalIndex = (i: number) => (rtl ? goToRenderIndex(total - 1 - i) : goToRenderIndex(i));

  const toggleFullscreen = async () => {
    const el = bookRef.current?.el || bookRef.current?.container || document.documentElement;
    if (!document.fullscreenElement) await el.requestFullscreen?.();
    else await document.exitFullscreen?.();
  };

  useImperativeHandle(ref, () => ({
    goTo: goToLogicalIndex,
    next: () => (rtl ? goPrev() : goNext()),
    prev: () => (rtl ? goNext() : goPrev()),
    fullscreen: toggleFullscreen,
  }));

  useEffect(() => {
    const neighbors = [page - 2, page - 1, page + 1, page + 2].filter((i) => i >= 0 && i < total);
    neighbors.forEach((i) => { const img = new Image(); img.src = renderImages[i].src; });
  }, [page, renderImages, total]);

  // 自动隐藏提示
  useEffect(() => {
    const timer = setTimeout(() => setShowHints(false), 5000);
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <div className={`w-full flex flex-col items-center ${className || ""}`}>
      <div className="book-portrait relative">
        <HTMLFlipBook
          // 单页模式配置
          width={700}
          height={990}
          size="fixed" // 固定尺寸模式，更利于锁定单页
          usePortrait={true} // 强制单页模式
          onChangeOrientation={(mode) => console.log('FlipBook orientation:', mode)}
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
          maxShadowOpacity={0.30}
          autoSize={true}
          ref={bookRef}
          className="rounded-2xl shadow-xl"
          startPage={0}
          showCover={false}
          style={undefined}
        >
          {renderImages.map((img, idx) => (
            <article key={idx} className="h-full w-full bg-white">
              <img
                src={img.src}
                alt={img.alt || `第 ${idx + 1} 页`}
                className="h-full w-full object-contain bg-white"
                width={img.width}
                height={img.height}
              />

              {/* ① 书脊阴影（靠内侧的深到浅渐变） */}
              <div
                className={`pointer-events-none absolute inset-y-0 ${rtl ? "right-0" : "left-0"} w-6 opacity-70 spine-breath`}
                style={{
                  background:
                    rtl
                      ? "linear-gradient(to left, rgba(0,0,0,0.22), rgba(0,0,0,0.08) 35%, rgba(0,0,0,0.02) 70%, transparent)"
                      : "linear-gradient(to right, rgba(0,0,0,0.22), rgba(0,0,0,0.08) 35%, rgba(0,0,0,0.02) 70%, transparent)",
                }}
              />

              {/* ② 纸张层叠竖纹（很淡的条纹，模拟多页纸的"层次"） */}
              <div
                className={`pointer-events-none absolute inset-y-0 ${rtl ? "right-0" : "left-0"} w-6 mix-blend-multiply opacity-15`}
                style={{
                  background:
                    "repeating-linear-gradient(90deg, rgba(0,0,0,0.10) 0px, rgba(0,0,0,0.10) 1px, transparent 1px, transparent 3px)",
                }}
              />

              {/* ③ 外沿高光/阴影（靠外侧，让边缘更有"铣边"质感） */}
              <div
                className={`pointer-events-none absolute inset-y-0 ${rtl ? "left-0" : "right-0"} w-3`}
                style={{
                  background: rtl
                    ? "linear-gradient(to right, rgba(0,0,0,0.06), transparent)"
                    : "linear-gradient(to left, rgba(0,0,0,0.06), transparent)",
                }}
              />

              {/* （可选）右下角微弱"卷角"内阴影，增强纸感 */}
              <div
                className={`pointer-events-none absolute bottom-0 ${rtl ? "left-0" : "right-0"} w-10 h-10 rounded-br-lg`}
                style={{
                  boxShadow: rtl ? "inset 6px -6px 12px rgba(0,0,0,0.12)" : "inset -6px -6px 12px rgba(0,0,0,0.12)",
                  borderBottomLeftRadius: rtl ? "0.5rem" : 0,
                  borderBottomRightRadius: rtl ? 0 : "0.5rem",
                  opacity: 0.5,
                }}
              />

              {/* 左侧书脊渐变 */}
              <div className="absolute left-0 top-0 h-full w-4 bg-gradient-to-r from-gray-400 via-gray-200 to-transparent shadow-inner"></div>

              {/* 折痕阴影（模拟翻页中间的立体感） */}
              <div className="absolute left-6 top-0 h-full w-2 bg-gradient-to-r from-black/10 via-transparent to-black/5"></div>
            </article>
          ))}
        </HTMLFlipBook>

        {/* 悬浮翻页按钮 */}
        <button
          onClick={goPrev}
          disabled={page === 0}
          className="absolute top-1/2 -translate-y-1/2 left-4 w-12 h-12 bg-black/20 hover:bg-black/40 active:bg-black/60 rounded-full flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all touch-manipulation"
        >
          ◀
        </button>

        <button
          onClick={goNext}
          disabled={page === total - 1}
          className="absolute top-1/2 -translate-y-1/2 right-4 w-12 h-12 bg-black/20 hover:bg-black/40 active:bg-black/60 rounded-full flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all touch-manipulation"
        >
          ▶
        </button>

        {/* 页码指示器 */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-4 px-3 py-1 text-sm bg-black/70 text-white rounded-full backdrop-blur-sm">
          {page + 1} / {total}
        </div>

        {/* 翻页引导提示 */}
        {showHints && (
          <div className="absolute left-1/2 -translate-x-1/2 top-4 px-4 py-2 text-sm bg-black/80 text-white rounded-full animate-bounce backdrop-blur-sm">
            左右箭头键或滑动翻页
          </div>
        )}
      </div>
    </div>
  );
});

export default FlipBook;