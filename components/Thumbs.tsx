"use client";
import React from "react";

export default function Thumbs({ images, current, onJump }: { images: { src: string; alt?: string }[]; current: number; onJump: (i: number) => void; }) {
  return (
    <div className="mt-3 flex gap-2 overflow-x-auto py-2">
      {images.map((p, i) => (
        <button
          key={i}
          onClick={() => onJump(i)}
          className={`shrink-0 rounded-md border p-0.5 ${i === current ? "ring-2 ring-blue-500" : "hover:border-gray-400"}`}
          aria-label={`跳到第 ${i + 1} 页`}
          title={`第 ${i + 1} 页`}
        >
          <img
            src={p.src}
            alt={p.alt || `第 ${i + 1} 页`}
            loading="lazy"
            className="h-20 w-auto object-contain"
          />
        </button>
      ))}
    </div>
  );
}
