import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-screen-md p-8">
      <h1 className="mb-4 text-3xl font-semibold">FlipBook 示例站</h1>
      <p className="mb-6 text-gray-600">基于 Next.js + react-pageflip 的最小实现。</p>
      <ul className="list-disc space-y-2 pl-6">
        <li>
          访问示例：<Link className="text-blue-600 underline" href="/books/demo">/books/demo</Link>
        </li>
        <li>将你的图片放到 <code>public/books/book-01/001.jpg …</code></li>
      </ul>
    </main>
  );
}
