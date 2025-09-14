import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: { 
    extend: {
      screens: {
        // iPhone 15 系列特定断点
        'iphone-15': '393px',      // iPhone 15/Pro
        'iphone-15-plus': '430px', // iPhone 15 Plus/Pro Max
        'iphone-15-max': '430px',  // iPhone 15 Pro Max
      }
    }
  },
  plugins: []
};
export default config;
