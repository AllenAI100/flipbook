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
}, ref) {
  const bookRef = useRef<any>(null);
  const [page, setPage] = useState(0);
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

  const goPrev = () => bookRef.current?.pageFlip?.().flipPrev();
  const goNext = () => bookRef.current?.pageFlip?.().flipNext();
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
      {showToolbar && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border px-3 py-2 shadow-sm">
          <button onClick={rtl ? goNext : goPrev} className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50">上一页</button>
          <div className="text-sm tabular-nums">第 {page + 1} / {total}</div>
          <button onClick={rtl ? goPrev : goNext} className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50">下一页</button>
          <div className="mx-2 h-4 w-px bg-gray-200" />
          <button onClick={toggleFullscreen} className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50">全屏</button>
        </div>
      )}

      <div className="w-full max-w-[1100px]">
        <HTMLFlipBook
          width={dims.w}
          height={dims.h}
          size="stretch"
          minWidth={280}
          maxWidth={1200}
          minHeight={300}
          maxHeight={1800}

          /* === 这些是为满足 TS 类型而显式提供的默认值 === */
            style={{}}                 /* 有些类型把 style 当必填 */
            startPage={0}              /* 起始页：0-based */
            drawShadow={true}          /* 阴影 */
            flippingTime={600}         /* 翻页动画时长 ms */
            startZIndex={0}
            swipeDistance={30}
            clickEventForward={true}
            useMouseEvents={true}
            showPageCorners={true}
            disableFlipByClick={false}

          showCover={false}
          mobileScrollSupport={true}
          usePortrait={true}
          maxShadowOpacity={0.25}
          autoSize={true}
          ref={bookRef}
          className="rounded-2xl shadow-xl"
        >
          {renderImages.map((img, idx) => (
            <article key={idx} className="flex h-full w-full items-center justify-center bg-white">
              <img src={img.src} alt={img.alt || `Page ${idx + 1}`} loading="lazy" className="max-h-full max-w-full object-contain" width={img.width} height={img.height} />
            </article>
          ))}
        </HTMLFlipBook>
      </div>
    </div>
  );
});

export default FlipBook;
