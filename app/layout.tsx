export const metadata = { 
  title: "FlipBook Demo", 
  description: "Next.js + react-pageflip" 
};

// 移动端 viewport 配置
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
};
import "./globals.css";
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="min-h-screen antialiased">
        {children}
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js').catch(console.error);
            });
          }
        `}</Script>
      </body>
    </html>
  );
}
