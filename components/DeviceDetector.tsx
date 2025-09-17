"use client";
import { useState, useEffect } from 'react';

// 设备类型枚举
export enum DeviceType {
  MOBILE_PHONE = 'mobile_phone',
  TABLET_SMALL = 'tablet_small',  // 7-8寸平板
  TABLET_LARGE = 'tablet_large',  // 9-13寸平板
  DESKTOP_SMALL = 'desktop_small', // 小屏桌面
  DESKTOP_LARGE = 'desktop_large'  // 大屏桌面
}

// 设备信息接口
export interface DeviceInfo {
  type: DeviceType;
  width: number;
  height: number;
  isPortrait: boolean;
  isTouch: boolean;
  pixelRatio: number;
  userAgent: string;
}

// 设备检测Hook
export function useDeviceDetection(): DeviceInfo | null {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    const detectDevice = (): DeviceInfo => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;
      const pixelRatio = window.devicePixelRatio || 1;
      const userAgent = navigator.userAgent;
      
      // 检测触摸支持
      const isTouch = 'ontouchstart' in window || 
                     navigator.maxTouchPoints > 0 || 
                     (navigator as any).msMaxTouchPoints > 0;

      // 精确的设备类型检测
      let type: DeviceType;

      // 手机检测 (宽度 < 768px 或明确的手机UA)
      if (width < 768 || /iPhone|iPod|Android.*Mobile|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        type = DeviceType.MOBILE_PHONE;
      }
      // iPad检测
      else if (/iPad/i.test(userAgent) || 
               (navigator.platform === 'MacIntel' && isTouch)) {
        type = width >= 1024 ? DeviceType.TABLET_LARGE : DeviceType.TABLET_SMALL;
      }
      // Android平板检测
      else if (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent)) {
        type = width >= 900 ? DeviceType.TABLET_LARGE : DeviceType.TABLET_SMALL;
      }
      // 桌面端检测
      else {
        type = width >= 1200 ? DeviceType.DESKTOP_LARGE : DeviceType.DESKTOP_SMALL;
      }

      return {
        type,
        width,
        height,
        isPortrait,
        isTouch,
        pixelRatio,
        userAgent
      };
    };

    const updateDeviceInfo = () => {
      setDeviceInfo(detectDevice());
    };

    // 初始检测
    updateDeviceInfo();

    // 监听窗口大小变化和设备旋转
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', () => {
      // 延迟执行，等待旋转完成
      setTimeout(updateDeviceInfo, 100);
    });

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

// 根据设备类型获取推荐的翻书配置
export function getFlipBookConfig(deviceInfo: DeviceInfo) {
  const { type, width, height, isPortrait } = deviceInfo;

  switch (type) {
    case DeviceType.MOBILE_PHONE:
      return {
        component: 'MobileTurnFlipBook',
        width: Math.min(width - 20, 350),
        height: Math.min(height - 120, 500),
        showSinglePage: true,
        enableTouch: true,
        showNavButtons: true,
        buttonSize: 44,
        buttonPosition: { left: 10, right: 10 }
      };

    case DeviceType.TABLET_SMALL:
      return {
        component: 'TabletFlipBook',
        width: Math.min(width - 40, 600),
        height: Math.min(height - 100, 800),
        showSinglePage: !isPortrait, // 横屏时显示双页
        enableTouch: true,
        showNavButtons: true,
        buttonSize: 50,
        buttonPosition: { left: 20, right: 20 }
      };

    case DeviceType.TABLET_LARGE:
      return {
        component: 'TabletFlipBook',
        width: Math.min(width - 60, 800),
        height: Math.min(height - 120, 1000),
        showSinglePage: false, // 大平板支持双页
        enableTouch: true,
        showNavButtons: true,
        buttonSize: 52,
        buttonPosition: { left: 30, right: 30 }
      };

    case DeviceType.DESKTOP_SMALL:
      return {
        component: 'DesktopFlipBook',
        width: Math.min(width - 100, 700),
        height: Math.min(height - 100, 990),
        showSinglePage: false,
        enableTouch: false,
        showNavButtons: true,
        buttonSize: 48,
        buttonPosition: { left: 40, right: 40 }
      };

    case DeviceType.DESKTOP_LARGE:
      return {
        component: 'DesktopFlipBook',
        width: Math.min(width - 200, 900),
        height: Math.min(height - 150, 1200),
        showSinglePage: false,
        enableTouch: false,
        showNavButtons: true,
        buttonSize: 52,
        buttonPosition: { left: 50, right: 50 }
      };

    default:
      return {
        component: 'DesktopFlipBook',
        width: 700,
        height: 990,
        showSinglePage: false,
        enableTouch: false,
        showNavButtons: true,
        buttonSize: 48,
        buttonPosition: { left: 40, right: 40 }
      };
  }
}