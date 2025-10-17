"use client";
import { useState, useEffect } from 'react';

interface ImageItem {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface ImagePreloaderProps {
  images: ImageItem[];
  onAllLoaded: () => void;
  onProgress: (loaded: number, total: number) => void;
}

/**
 * 图片预加载组件
 * 解决移动端图片加载慢导致白屏的问题
 */
const ImagePreloader: React.FC<ImagePreloaderProps> = ({ 
  images, 
  onAllLoaded, 
  onProgress 
}) => {
  const [loadedCount, setLoadedCount] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    // console.log('🖼️ 开始预加载图片，总数:', images.length);
    
    if (images.length === 0) {
      onAllLoaded();
      return;
    }

    let loaded = 0;
    const total = images.length;
    const status: { [key: string]: boolean } = {};
    const imageRefs: HTMLImageElement[] = [];

    const checkAllLoaded = () => {
      if (loaded === total) {
        // console.log('✅ 所有图片预加载完成');
        onAllLoaded();
      }
    };

    images.forEach((img, index) => {
      const image = new Image();
      imageRefs.push(image);
      
      image.onload = () => {
        loaded++;
        status[img.src] = true;
        setLoadedCount(loaded);
        setLoadingStatus(prev => ({ ...prev, [img.src]: true }));
        onProgress(loaded, total);
        
        // console.log(`✅ 图片 ${index + 1}/${total} 加载完成:`, img.src);
        checkAllLoaded();
      };

      image.onerror = (e) => {
        loaded++;
        status[img.src] = false;
        setLoadedCount(loaded);
        setLoadingStatus(prev => ({ ...prev, [img.src]: false }));
        onProgress(loaded, total);
        
        console.error(`❌ 图片 ${index + 1}/${total} 加载失败:`, img.src, e);
        checkAllLoaded();
      };

      // 开始加载图片
      image.src = img.src;
    });

    return () => {
      // 清理函数 - 取消所有图片加载
      // console.log('🧹 清理图片预加载器');
      imageRefs.forEach(img => {
        img.onload = null;
        img.onerror = null;
        img.src = '';
      });
    };
  }, []); // 移除依赖，只在组件挂载时执行一次

  return null; // 这是一个无UI的功能组件
};

export default ImagePreloader;