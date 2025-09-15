"use client";
import React, { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * 响应式容器组件
 * 负责处理移动端和桌面端的不同布局逻辑
 * 保持代码解耦和隔离
 */
const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 移动端：全屏容器，桌面端：居中容器 */}
      <div className="w-full h-screen flex items-center justify-center p-0 sm:p-4 lg:p-8">
        <div className={`responsive-flipbook-container ${className}`}>
          {children}
        </div>
      </div>
    </main>
  );
};

export default ResponsiveContainer;
