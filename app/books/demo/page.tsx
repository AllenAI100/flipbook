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
      <FlipBook ref={ref} images={pages} onPage={setCurrent} rtl={rtl} />
    </main>
  );
}
