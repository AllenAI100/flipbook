"use client";
import React, { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * 简化的响应式容器组件
 */
const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full h-screen flex items-center justify-center">
        <div className={`w-full h-full ${className}`}>
          {children}
        </div>
      </div>
    </main>
  );
};

export default ResponsiveContainer;