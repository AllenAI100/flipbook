"use client";
import ResponsiveContainer from "../../components/ResponsiveContainer";
import ResponsiveFlipBook from "../../components/ResponsiveFlipBook";

function range(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}

export default function YouthMBAPage() {
  const totalPages = 6;
  const pages = range(totalPages).map((i) => {
    const num = String(i + 1).padStart(3, "0");
    return { src: `/books/youthmba/${num}-srgb.jpg`, alt: `第 ${i + 1} 页` };
  });

  return (
    <ResponsiveContainer>
      <ResponsiveFlipBook
        images={pages}
      />
    </ResponsiveContainer>
  );
}