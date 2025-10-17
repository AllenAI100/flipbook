"use client";
import ResponsiveContainer from "../../../components/ResponsiveContainer";
import ResponsiveFlipBook from "../../../components/ResponsiveFlipBook";

function range(n: number) { return Array.from({ length: n }, (_, i) => i); }

export default function DemoPage() {
  const pages = range(6).map((i) => {
    const num = String(i + 1).padStart(3, "0");
    return { src: `/books/future/${num}.png`, alt: `第 ${i + 1} 页` };
  });

  return (
    <ResponsiveContainer>
      <ResponsiveFlipBook 
        images={pages}
        onPage={(index) => { /* console.log('Page changed to:', index) */ }}
      />
    </ResponsiveContainer>
  );
}
