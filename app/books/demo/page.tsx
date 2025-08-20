"use client";
import { useRef, useState } from "react";
import FlipBook, { type FlipBookHandle } from "../../../components/FlipBook";
import Thumbs from "../../../components/Thumbs";


function range(n: number) { return Array.from({ length: n }, (_, i) => i); }

export default function DemoPage() {
  const [current, setCurrent] = useState(0);
  const [rtl, setRtl] = useState(false);
  const ref = useRef<FlipBookHandle>(null);

  const pages = range(6).map((i) => {
    const num = String(i + 1).padStart(3, "0");
    return { src: `/books/future/${num}.png`, alt: `第 ${i + 1} 页` };
  });

  /*
    const pages = range(12).map((i) => {
    const num = String(i + 1).padStart(3, "0");
    return { src: `/books/book-01/${num}.jpg`, alt: `第 ${i + 1} 页` };
  });
  */

  return (
    <main className="mx-auto max-w-none px-3 md:px-4">
      <header className="mt-2 mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">翻书 Demo</h1>
          <p className="text-sm text-gray-600">手机：左右滑动；桌面：按钮/方向键；F 全屏。</p>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={rtl} onChange={(e) => setRtl(e.target.checked)} /> RTL（右至左）</label>
      </header>

      <FlipBook ref={ref} images={pages} onPage={setCurrent} rtl={rtl} />
      <p className="mt-3 text-center text-xs text-gray-500">当前页：{current + 1} / {pages.length}</p>
      <Thumbs images={pages} current={current} onJump={(i) => ref.current?.goTo(i)} />
    </main>
  );
}
