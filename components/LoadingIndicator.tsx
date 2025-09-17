"use client";
import React from 'react';

interface LoadingIndicatorProps {
  loaded: number;
  total: number;
  isVisible: boolean;
}

/**
 * 加载指示器组件
 * 显示图片加载进度，解决移动端白屏问题
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  loaded, 
  total, 
  isVisible 
}) => {
  if (!isVisible || total === 0) return null;

  const progress = (loaded / total) * 100;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.95)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(4px)'
    }}>
      {/* 加载动画 */}
      <div style={{
        width: '60px',
        height: '60px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
      }} />
      
      {/* 加载文字 */}
      <div style={{
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '10px'
      }}>
        正在加载翻书内容...
      </div>
      
      {/* 进度条 */}
      <div style={{
        width: '280px',
        height: '8px',
        background: '#f0f0f0',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '10px'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #3498db, #2ecc71)',
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }} />
      </div>
      
      {/* 进度文字 */}
      <div style={{
        fontSize: '14px',
        color: '#666'
      }}>
        {loaded} / {total} 张图片已加载 ({Math.round(progress)}%)
      </div>
      
      {/* 提示文字 */}
      <div style={{
        fontSize: '12px',
        color: '#999',
        marginTop: '10px',
        textAlign: 'center',
        maxWidth: '300px'
      }}>
        首次加载可能需要一些时间，请耐心等待...
      </div>

      {/* CSS 动画 */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingIndicator;