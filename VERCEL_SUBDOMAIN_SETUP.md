# Vercel 二级域名配置指南

本指南将帮助你配置 Vercel 部署，使不同的二级域名（如 `future.abc.com` 和 `youthmba.abc.com`）访问不同的书籍页面。

---

## 📋 前提条件

1. 已部署项目到 Vercel
2. 拥有主域名（如 `abc.com`）
3. 域名 DNS 管理权限

---

## 一、DNS 配置

### 1.1 添加 CNAME 记录

在你的域名 DNS 提供商（如 Cloudflare、阿里云、腾讯云等）添加以下 CNAME 记录：

#### 选项 A：使用通配符（推荐）

```
类型: CNAME
名称: *
值: cname.vercel-dns.com
TTL: 3600 (或自动)
```

这样配置后，所有子域名（`*.abc.com`）都会指向 Vercel。

#### 选项 B：单独配置每个子域名

```
类型: CNAME
名称: future
值: cname.vercel-dns.com
TTL: 3600

类型: CNAME
名称: youthmba
值: cname.vercel-dns.com
TTL: 3600
```

**注意：** Vercel 的 CNAME 值可能是 `cname.vercel-dns.com` 或你的项目专属值，请查看 Vercel 控制台中的具体指示。

---

## 二、Vercel 域名配置

### 2.1 添加主域名

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **Domains**
4. 添加主域名：`abc.com`
5. 按照提示配置 DNS 记录（通常是添加 A 记录或 CNAME 记录）

### 2.2 添加子域名

在同一个 **Domains** 页面，添加以下子域名：

1. **future.abc.com**
   - 点击 **Add Domain**
   - 输入 `future.abc.com`
   - 选择 **Add**

2. **youthmba.abc.com**
   - 点击 **Add Domain**
   - 输入 `youthmba.abc.com`
   - 选择 **Add**

### 2.3 验证域名

Vercel 会自动验证域名配置。等待 DNS 传播（通常 5-30 分钟），状态会变为 **Valid**。

---

## 三、项目配置说明

### 3.1 中间件工作原理

项目已包含 `middleware.ts`，它会：

1. 检测请求的 `Host` 头（子域名）
2. 如果是根路径（`/`）且匹配到子域名映射，自动重定向到对应的书籍页面
3. 子域名映射：
   - `future.abc.com` → `/future`
   - `youthmba.abc.com` → `/youthmba`

### 3.2 当前路由结构

```
app/
├── future/
│   └── page.tsx      # future 书籍页面
├── youthmba/
│   └── page.tsx      # youthmba 书籍页面
└── page.tsx          # 主页面（显示所有书籍链接）
```

### 3.3 添加新书籍

如果需要添加新的书籍和子域名：

1. **创建书籍页面：**
   ```bash
   # 例如添加 newbook 书籍
   mkdir -p app/newbook
   # 复制 app/future/page.tsx 并修改图片路径
   ```

2. **更新中间件：**
   编辑 `middleware.ts`，添加映射：
   ```typescript
   const subdomainMap: Record<string, string> = {
     'future': '/future',
     'youthmba': '/youthmba',
     'newbook': '/newbook',  // 新增
   };
   ```

3. **在 Vercel 添加域名：** `newbook.abc.com`

4. **配置 DNS：** 添加 CNAME 记录（或使用通配符）

---

## 四、测试配置

### 4.1 本地测试

由于本地开发无法直接测试子域名，可以使用以下方法：

**方法 1：修改 hosts 文件**

```bash
# macOS/Linux
sudo nano /etc/hosts

# 添加以下行
127.0.0.1 future.localhost
127.0.0.1 youthmba.localhost
```

然后访问：
- `http://future.localhost:3000`
- `http://youthmba.localhost:3000`

**方法 2：使用环境变量模拟**

修改 `middleware.ts`，在开发环境中允许测试：

```typescript
// 开发环境：可以通过查询参数测试
if (process.env.NODE_ENV === 'development' && url.searchParams.get('subdomain')) {
  const testSubdomain = url.searchParams.get('subdomain');
  if (subdomainMap[testSubdomain]) {
    url.pathname = subdomainMap[testSubdomain];
    url.searchParams.delete('subdomain');
    return NextResponse.redirect(url);
  }
}
```

然后访问：`http://localhost:3000/?subdomain=future`

### 4.2 生产环境测试

部署到 Vercel 后，访问：

- `https://future.abc.com` → 应该显示 future 书籍
- `https://youthmba.abc.com` → 应该显示 youthmba 书籍
- `https://abc.com` → 显示主页面（所有书籍链接）

---

## 五、常见问题

### Q1: DNS 配置后多久生效？

**A:** 通常 5-30 分钟，最长可能需要 48 小时。可以使用 [DNS Checker](https://dnschecker.org/) 检查全球 DNS 传播状态。

### Q2: 子域名显示 404 错误？

**A:** 检查：
1. DNS 记录是否正确配置
2. Vercel 中是否已添加该子域名
3. 中间件映射是否正确
4. 页面文件是否存在

### Q3: 如何强制 HTTPS？

**A:** Vercel 默认自动为所有域名启用 HTTPS。确保 DNS 正确配置后，Vercel 会自动申请并配置 SSL 证书。

### Q4: 可以使用 www 子域名吗？

**A:** 可以。在 Vercel 中添加 `www.abc.com`，然后在中间件中处理：
```typescript
const subdomain = hostname.split('.')[0];
if (subdomain === 'www') {
  // 处理 www 子域名，可以重定向到主域名或显示主页面
  return NextResponse.next();
}
```

### Q5: 如何禁用某些子域名？

**A:** 在中间件中添加检查：
```typescript
const blockedSubdomains = ['admin', 'api'];
if (blockedSubdomains.includes(subdomain)) {
  return NextResponse.rewrite(new URL('/404', request.url));
}
```

---

## 六、高级配置

### 6.1 自定义错误页面

为不同子域名创建自定义 404 页面：

```typescript
// middleware.ts
if (!subdomainMap[subdomain] && subdomain !== 'www' && !hostname.includes('vercel.app')) {
  url.pathname = '/404';
  return NextResponse.rewrite(url);
}
```

### 6.2 添加子域名特定的元数据

在页面组件中根据子域名设置不同的 SEO 元数据：

```typescript
// app/future/page.tsx
export const metadata = {
  title: 'Future Book - 未来之书',
  description: '探索未来的精彩内容',
};
```

### 6.3 分析统计

为不同子域名配置不同的分析工具：

```typescript
// 使用环境变量或配置
const analyticsMap = {
  'future': 'GA_TRACKING_ID_FUTURE',
  'youthmba': 'GA_TRACKING_ID_YOUTHMBA',
};
```

---

## 七、部署检查清单

- [ ] DNS CNAME 记录已配置（或使用通配符）
- [ ] Vercel 中已添加主域名 `abc.com`
- [ ] Vercel 中已添加所有子域名（`future.abc.com`, `youthmba.abc.com`）
- [ ] DNS 记录验证通过（Vercel 显示 Valid）
- [ ] 中间件映射已配置
- [ ] 所有书籍页面已创建
- [ ] 代码已推送到 GitHub
- [ ] Vercel 自动部署成功
- [ ] 测试所有子域名访问正常
- [ ] HTTPS 证书已自动配置

---

## 八、快速参考

### DNS 配置示例（Cloudflare）

```
类型: CNAME
名称: *
内容: cname.vercel-dns.com
代理状态: 已代理（橙色云）
TTL: 自动
```

### DNS 配置示例（阿里云/腾讯云）

```
记录类型: CNAME
主机记录: *
记录值: cname.vercel-dns.com
TTL: 600
```

### Vercel CLI 添加域名（可选）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 添加域名
vercel domains add future.abc.com
vercel domains add youthmba.abc.com
```

---

## 🎉 完成！

配置完成后，你的用户可以通过以下方式访问：

- **Future 书籍**: `https://future.abc.com`
- **YouthMBA 书籍**: `https://youthmba.abc.com`
- **主页（所有书籍）**: `https://abc.com`

所有子域名都会自动启用 HTTPS，并享受 Vercel 的全球 CDN 加速。

