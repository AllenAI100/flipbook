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
  fillMode?: "cover" | "contain"; // 👈 新增（可选）
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
  fillMode = "contain", // 👈 默认少留白且不裁切
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
      setShowHints(false); // 用户翻页后隐藏提示
      const logicalIndex = rtl ? total - 1 - e.data : e.data;
      onPage?.(logicalIndex);
    };
    api.on("flip", onFlip);
    return () => api.off("flip", onFlip);
  }, [onPage, rtl, total]);

  // 自动隐藏提示
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHints(false);
    }, 5000); // 5秒后自动隐藏
    return () => clearTimeout(timer);
  }, []);

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
  }, [rtl, goNext, goPrev, toggleFullscreen]);

  return (
  // 关键：视口高度自适应 —— 手机铺满，高分辨率设备预留一点空间
  <div className={`w-full flex flex-col items-center ${className || ""}`}>
    {/*showToolbar && (
      <div className="mb-3 flex items-center gap-2 rounded-xl border px-3 py-2 shadow-sm">
        <button onClick={rtl ? goNext : goPrev} className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50">上一页</button>
        <div className="text-sm tabular-nums">第 {page + 1} / {total}</div>
        <button onClick={rtl ? goPrev : goNext} className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50">下一页</button>
        <div className="mx-2 h-4 w-px bg-gray-200" />
        <button onClick={toggleFullscreen} className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50">全屏</button>
      </div>
    )*/}

    {/* 这里是自适应关键容器：
        - h-[100svh]：在移动端占满整屏（考虑移动端地址栏收缩，用 svh 更准确）
        - md:h-[85vh]：iPad/横屏平板留 15% 余量（工具栏、系统条）
        - xl:h-[90vh]：桌面大屏更沉浸
    */}
  <div
  style={{
    height: '92vh',
    width: 'min(calc(92vh * 0.707), 1100px)',
    marginInline: 'auto',
  }}
>
  <HTMLFlipBook
          // —— 基准单页尺寸（A4 竖版）
          width={700}
          height={990}

          // —— 固定尺寸模式，更利于锁定单页
          size="fixed"

          // —— 单页模式开关 + 调试输出
          usePortrait={true}
          onChangeOrientation={(mode) => console.log('FlipBook orientation:', mode)}

          // —— 其余必需/常用参数
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
        <div className="h-full w-full pl-8 pr-4 py-4 bg-white">
          <img
            src={img.src}
            alt={img.alt || `第 ${idx + 1} 页`}
            className="h-full w-full object-contain"
            width={img.width}
            height={img.height}
          />
        </div>
      
      {/* 左右翻页提示箭头 */}
      {showHints && (
        <div className="absolute inset-0 pointer-events-none">
          {/* 左侧箭头 - 上一页提示 */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-500">
            <div className="bg-blue-500/90 backdrop-blur-sm rounded-full p-3 shadow-2xl animate-pulse border-2 border-white/30">
              <div className="text-3xl text-white font-bold">
                ◀
              </div>
            </div>
            <div className="text-xs text-white bg-black/70 px-2 py-1 rounded-full mt-2 text-center font-medium backdrop-blur-sm">
              上一页
            </div>
          </div>
          
          {/* 右侧箭头 - 下一页提示 */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-500">
            <div className="bg-blue-500/90 backdrop-blur-sm rounded-full p-3 shadow-2xl animate-pulse border-2 border-white/30">
              <div className="text-3xl text-white font-bold">
                ▶
              </div>
            </div>
            <div className="text-xs text-white bg-black/70 px-2 py-1 rounded-full mt-2 text-center font-medium backdrop-blur-sm">
              下一页
            </div>
          </div>
        </div>
      )}

      {/* 键盘提示 - 首次访问显示 */}
      {showHints && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium animate-bounce backdrop-blur-sm">
            <span className="inline-flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white/20 rounded text-xs">←</kbd>
              <kbd className="px-2 py-1 bg-white/20 rounded text-xs">→</kbd>
              <span>翻页</span>
              <kbd className="px-2 py-1 bg-white/20 rounded text-xs">F</kbd>
              <span>全屏</span>
            </span>
          </div>
        </div>
      )}

    {/* ① 书脊阴影（靠内侧的深到浅渐变） */}
      <div
        className={`pointer-events-none absolute inset-y-0 ${rtl ? "right-0" : "left-0"} w-8 opacity-70 spine-breath`}
        style={{
          background:
            rtl
              ? "linear-gradient(to left, rgba(0,0,0,0.12), rgba(0,0,0,0.04) 35%, rgba(0,0,0,0.01) 70%, transparent)"
              : "linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0.04) 35%, rgba(0,0,0,0.01) 70%, transparent)",
        }}
      />

      {/* ② 纸张层叠竖纹（很淡的条纹，模拟多页纸的“层次”） */}
      <div
        className={`pointer-events-none absolute inset-y-0 ${rtl ? "right-0" : "left-0"} w-8 mix-blend-multiply opacity-15`}
        style={{
          background:
            "repeating-linear-gradient(90deg, rgba(0,0,0,0.10) 0px, rgba(0,0,0,0.10) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* ③ 外沿高光/阴影（靠外侧，让边缘更有“铣边”质感） */}
      <div
        className={`pointer-events-none absolute inset-y-0 ${rtl ? "left-0" : "right-0"} w-3`}
        style={{
          background: rtl
            ? "linear-gradient(to right, rgba(0,0,0,0.06), transparent)"
            : "linear-gradient(to left, rgba(0,0,0,0.06), transparent)",
        }}
      />

      {/* （可选）右下角微弱“卷角”内阴影，增强纸感 */}
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
     <div className="absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-gray-300 via-gray-100 to-transparent shadow-inner"></div>

     {/* 折痕阴影（模拟翻页中间的立体感） */}
     <div className="absolute left-6 top-0 h-full w-2 bg-gradient-to-r from-black/6 via-transparent to-black/2"></div>

      </article>
    ))}
  </HTMLFlipBook>
</div>


  </div>
);


});

export default FlipBook;
