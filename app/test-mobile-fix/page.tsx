"use client";
import { useState, useEffect } from "react";
import ResponsiveContainer from "../../components/ResponsiveContainer";
import ResponsiveFlipBook from "../../components/ResponsiveFlipBook";

function range(n: number) { return Array.from({ length: n }, (_, i) => i); }

export default function TestMobileFixPage() {
  const [clientInfo, setClientInfo] = useState({
    screenWidth: 'N/A',
    deviceType: 'N/A'
  });

  // 客户端渲染后获取设备信息
  useEffect(() => {
    setClientInfo({
      screenWidth: window.innerWidth.toString(),
      deviceType: navigator.userAgent.includes('Mobile') ? '移动设备' : '桌面设备'
    });
  }, []);

  const pages = range(6).map((i) => {
    const num = String(i + 1).padStart(3, "0");
    return { src: `/books/future/${num}.png`, alt: `第 ${i + 1} 页` };
  });

  return (
    <ResponsiveContainer>
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 10000
      }}>
        移动端阴影修复测试页面
        <br />
        屏幕宽度: {clientInfo.screenWidth}px
        <br />
        用户代理: {clientInfo.deviceType}
      </div>
      
      <ResponsiveFlipBook 
        images={pages}
        onPage={(index) => console.log('Page changed to:', index)}
      />
      
      {/* 移动端专用调试按钮 */}
      <button
        onClick={() => {
          console.log('=== 手动触发阴影清理 ===');
          
          // 手动清理阴影元素
          const shadowElements = document.querySelectorAll('[class*="stf__"], [class*="shadow"], [class*="Shadow"]');
          console.log('找到阴影元素:', shadowElements.length);
          
          shadowElements.forEach((el, index) => {
            console.log(`移除阴影元素 ${index}:`, el.className, el.tagName);
            if (el.parentNode) {
              el.parentNode.removeChild(el);
            }
          });
          
          // 检查所有元素的背景色
          const allElements = document.querySelectorAll('*');
          let grayElements = 0;
          allElements.forEach(el => {
            const styles = window.getComputedStyle(el);
            if (styles.backgroundColor && (
              styles.backgroundColor.includes('128') ||
              styles.backgroundColor.includes('gray') ||
              styles.backgroundColor.includes('grey')
            )) {
              console.log('发现灰色元素:', el.className, el.tagName, styles.backgroundColor);
              (el as HTMLElement).style.backgroundColor = 'transparent';
              grayElements++;
            }
          });
          
          console.log(`清理了 ${grayElements} 个灰色背景元素`);
          
          // 强制显示翻书内容
          const pages = document.querySelectorAll('.mobile-page, .mobile-page-image');
          pages.forEach(page => {
            (page as HTMLElement).style.display = 'block';
            (page as HTMLElement).style.visibility = 'visible';
            (page as HTMLElement).style.opacity = '1';
            (page as HTMLElement).style.zIndex = '10';
          });
          
          console.log('=== 手动清理完成 ===');
        }}
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'red',
          color: 'white',
          padding: '8px',
          border: 'none',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 10000,
          cursor: 'pointer'
        }}
      >
        手动清理阴影
      </button>
    </ResponsiveContainer>
  );
}