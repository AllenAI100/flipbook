"use client";
import React from "react";
import EnhancedResponsiveFlipBook from "../../components/EnhancedResponsiveFlipBook";

const images = [
  { src: "/books/book-01/001.jpg", alt: "第1页" },
  { src: "/books/book-01/002.jpg", alt: "第2页" },
  { src: "/books/book-01/003.jpg", alt: "第3页" },
  { src: "/books/book-01/004.jpg", alt: "第4页" },
  { src: "/books/book-01/005.jpg", alt: "第5页" },
  { src: "/books/book-01/006.jpg", alt: "第6页" },
  { src: "/books/book-01/007.jpg", alt: "第7页" },
  { src: "/books/book-01/008.jpg", alt: "第8页" },
  { src: "/books/book-01/009.jpg", alt: "第9页" },
  { src: "/books/book-01/010.jpg", alt: "第10页" },
];

/**
 * 增强版响应式翻书测试页面
 * 展示各种设备的自适应优化效果
 */
export default function TestEnhancedPage() {
  const handlePageChange = (index: number) => {
    // console.log(`当前页面: ${index + 1}`);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <EnhancedResponsiveFlipBook
        images={images}
        onPage={handlePageChange}
        rtl={false}
      />
    </div>
  );
}