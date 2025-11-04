import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 子域名到书籍路径的映射
const subdomainMap: Record<string, string> = {
  'future': '/future',
  'youthmba': '/youthmba',
};

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  // 跳过 Vercel 预览域名和本地开发
  if (hostname.includes('vercel.app') || hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return NextResponse.next();
  }

  // 提取子域名（例如：future.abc.com -> future）
  const subdomain = hostname.split('.')[0];

  // 如果是根路径且匹配到子域名映射，重定向到对应的书籍页面
  if (url.pathname === '/' && subdomainMap[subdomain]) {
    url.pathname = subdomainMap[subdomain];
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// 配置中间件匹配规则
export const config = {
  matcher: [
    /*
     * 匹配所有路径除了：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - 静态资源文件
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
};

