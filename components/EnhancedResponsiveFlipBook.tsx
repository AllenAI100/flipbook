"use client";
import React, { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";

// 动态导入组件以避免SSR问题
const DesktopFlipBook = dynamic(() => import("./DesktopFlipBook"), {
  ssr: false,
  loading: () => <div>Loading Desktop FlipBook...</div>
});

const MobileTurnFlipBook = dynamic(() => import("./MobileTurnFlipBook"), {
  ssr: false,
  loading: () => <div>Loading Mobile FlipBook...</div>
});

const TabletFlipBook = dynamic(() => import("./TabletFlipBook"), {
  ssr: false,
  loading: () => <div>Loading Tablet FlipBook...</div>
});

const EnhancedDesktopFlipBook = dynamic(() => import("./EnhancedDesktopFlipBook"), {
  ssr: false,
  loading: () => <div>Loading Enhanced Desktop FlipBook...</div>
});

import { useDeviceDetection, DeviceType, getFlipBookConfig } from "./DeviceDetector";

// 动态导入HTMLFlipBook以避免SSR问题
const HTMLFlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
  loading: () => <div>Loading FlipBook...</div>
});

// 类型定义
interface ImageItem {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface EnhancedResponsiveFlipBookProps {
  images: ImageItem[];
  onPage?: (index: number) => void;
  rtl?: boolean;
  className?: string;
}

interface EnhancedResponsiveFlipBookHandle {
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  fullscreen?: () => void;
}

/**
 * 增强版响应式FlipBook组件
 * 支持精确的设备检测和自适应优化
 */
const EnhancedResponsiveFlipBook = React.forwardRef<EnhancedResponsiveFlipBookHandle, EnhancedResponsiveFlipBookProps>(
  function EnhancedResponsiveFlipBook({ images, onPage, rtl = false, className = "" }, ref) {
    const deviceInfo = useDeviceDetection();
    const [config, setConfig] = useState<any>(null);
    
    const mobileRef = useRef<any>(null);
    const tabletRef = useRef<any>(null);
    const desktopRef = useRef<any>(null);

    // 根据设备信息更新配置
    useEffect(() => {
      if (deviceInfo) {
        const newConfig = getFlipBookConfig(deviceInfo);
        setConfig(newConfig);
      }
    }, [deviceInfo]);

    // 统一的方法接口
    useEffect(() => {
      if (!ref || !deviceInfo || !config) return;

      let currentRef;
      switch (deviceInfo.type) {
        case DeviceType.MOBILE_PHONE:
          currentRef = mobileRef;
          break;
        case DeviceType.TABLET_SMALL:
        case DeviceType.TABLET_LARGE:
          currentRef = tabletRef;
          break;
        default:
          currentRef = desktopRef;
          break;
      }

      if (currentRef.current) {
        (ref as any).current = {
          goTo: (index: number) => currentRef.current?.goTo(index),
          next: () => currentRef.current?.next(),
          prev: () => currentRef.current?.prev(),
          fullscreen: () => currentRef.current?.fullscreen?.(),
        };
      }
    }, [deviceInfo, config, ref]);

    // 等待设备检测完成
    if (!deviceInfo || !config) {
      return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-2xl mb-2">📱</div>
            <div className="text-gray-600">检测设备中...</div>
          </div>
        </div>
      );
    }

    // 根据设备类型渲染对应组件
    const renderFlipBook = () => {
      switch (deviceInfo.type) {
        case DeviceType.MOBILE_PHONE:
          return (
            <MobileTurnFlipBook
              ref={mobileRef}
              images={images}
              onPage={onPage}
              rtl={rtl}
            />
          );

        case DeviceType.TABLET_SMALL:
        case DeviceType.TABLET_LARGE:
          return (
            <TabletFlipBook
              ref={tabletRef}
              images={images}
              onPage={onPage}
              rtl={rtl}
              deviceInfo={deviceInfo}
              config={config}
            />
          );

        case DeviceType.DESKTOP_SMALL:
        case DeviceType.DESKTOP_LARGE:
        default:
          return (
            <EnhancedDesktopFlipBook
              ref={desktopRef}
              images={images}
              onPage={onPage}
              rtl={rtl}
              deviceInfo={deviceInfo}
              config={config}
            />
          );
      }
    };

    return (
      <div className={`w-full h-full ${className}`}>
        {renderFlipBook()}
      </div>
    );
  }
);



export default EnhancedResponsiveFlipBook;