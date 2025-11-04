# 腾讯云 CentOS 7.4 服务器部署指南

本指南将帮助你在腾讯云 CentOS 7.4 服务器上部署 FlipBook 应用。

---

## 📋 前置要求

- 腾讯云 CentOS 7.4 服务器（已获得 root 权限）
- 已配置域名（可选，用于 HTTPS）
- SSH 访问服务器

---

## 一、服务器环境准备

### 1. 更新系统

```bash
# 登录服务器
ssh root@your-server-ip

# 更新系统包
yum update -y
```

### 2. 安装 Docker

CentOS 7.4 安装 Docker 的步骤：

```bash
# 安装必要的工具
yum install -y yum-utils device-mapper-persistent-data lvm2

# 添加 Docker 仓库（使用阿里云镜像加速）
yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# 安装 Docker CE
yum install -y docker-ce docker-ce-cli containerd.io

# 启动 Docker 服务
systemctl start docker
systemctl enable docker

# 验证安装
docker --version
```

### 3. 安装 Docker Compose

```bash
# 下载 Docker Compose（使用国内镜像）
curl -L "https://get.daocloud.io/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 添加执行权限
chmod +x /usr/local/bin/docker-compose

# 创建软链接（如果不存在）
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# 验证安装
docker-compose --version
```

**注意：** 如果上面的链接失效，可以尝试：
```bash
# 方案2：使用 GitHub 官方源（可能需要代理）
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 4. 配置 Docker 镜像加速（可选但推荐）

```bash
# 创建或编辑 daemon.json
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
EOF

# 重启 Docker
systemctl daemon-reload
systemctl restart docker
```

---

## 二、上传项目代码到服务器

### 方法1：使用 Git（推荐）

```bash
# 在服务器上安装 Git
yum install -y git

# 克隆项目（替换为你的仓库地址）
cd /opt
git clone https://github.com/your-username/your-repo.git flipbook
cd flipbook
```

### 方法2：使用 SCP 上传

```bash
# 在本地电脑执行
cd /Users/allenlai/Downloads/my-flipbook-site
scp -r . root@your-server-ip:/opt/flipbook
```

### 方法3：使用 SFTP 工具

使用 FileZilla、WinSCP 等工具将项目文件夹上传到服务器的 `/opt/flipbook` 目录。

---

## 三、配置项目

### 1. 进入项目目录

```bash
cd /opt/flipbook
```

### 2. 配置 Nginx（如果有域名）

编辑 `nginx/nginx.conf`，修改域名：

```bash
vi nginx/nginx.conf
```

找到以下行并修改为你的域名：
```nginx
server_name your-domain.com;  # 第47行和第57行
```

### 3. 配置 SSL 证书（可选）

如果有域名和证书文件：

```bash
# 创建证书目录
mkdir -p nginx/certs

# 上传证书文件
# fullchain.pem 和 privkey.pem
```

如果没有证书，可以：
- **临时测试**：注释掉 nginx.conf 中的 HTTPS 重定向（第50行）
- **生产环境**：使用 Let's Encrypt 免费证书（见下方）

---

## 四、部署应用

### 方案A：使用 docker-compose（生产环境，带 Nginx）

```bash
# 构建并启动服务
docker-compose -f docker-compose.prod.yml up -d --build

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

### 方案B：简单部署（仅应用，无 Nginx）

```bash
# 使用简单的 docker-compose.yml
docker-compose up -d --build

# 查看状态
docker-compose ps
```

---

## 五、配置防火墙

### 1. 开放端口

```bash
# 如果使用 firewalld
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --reload

# 如果使用 iptables
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
service iptables save
```

### 2. 腾讯云安全组配置

在腾讯云控制台：
1. 进入 **云服务器** → **安全组**
2. 选择你的服务器所在安全组
3. 添加规则：
   - **端口**：80，**协议**：TCP，**来源**：0.0.0.0/0
   - **端口**：443，**协议**：TCP，**来源**：0.0.0.0/0

---

## 六、使用 Let's Encrypt 免费 SSL 证书（可选）

### 1. 安装 Certbot

```bash
# 安装 EPEL 仓库
yum install -y epel-release

# 安装 certbot
yum install -y certbot python2-certbot-nginx
```

### 2. 获取证书

```bash
# 停止 Nginx 容器（如果正在运行）
docker-compose -f docker-compose.prod.yml stop nginx

# 使用 standalone 模式获取证书
certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# 证书位置：/etc/letsencrypt/live/your-domain.com/
```

### 3. 复制证书到项目目录

```bash
# 复制证书文件
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /opt/flipbook/nginx/certs/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem /opt/flipbook/nginx/certs/

# 设置权限
chmod 644 /opt/flipbook/nginx/certs/fullchain.pem
chmod 600 /opt/flipbook/nginx/certs/privkey.pem
```

### 4. 设置自动续期

```bash
# 测试续期
certbot renew --dry-run

# 添加到 crontab（每月自动续期）
crontab -e
# 添加以下行（每月1号凌晨3点续期）
0 3 1 * * certbot renew --quiet && docker-compose -f /opt/flipbook/docker-compose.prod.yml restart nginx
```

---

## 七、常用运维命令

### 查看服务状态

```bash
# 查看容器状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f nginx

# 查看最近100行日志
docker-compose -f docker-compose.prod.yml logs --tail=100
```

### 重启服务

```bash
# 重启所有服务
docker-compose -f docker-compose.prod.yml restart

# 重启单个服务
docker-compose -f docker-compose.prod.yml restart app
docker-compose -f docker-compose.prod.yml restart nginx
```

### 更新代码并重新部署

```bash
cd /opt/flipbook

# 如果使用 Git
git pull

# 重新构建并启动
docker-compose -f docker-compose.prod.yml up -d --build

# 清理旧镜像（可选）
docker image prune -f
```

### 停止服务

```bash
docker-compose -f docker-compose.prod.yml down
```

### 查看资源使用

```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
df -h
docker system df
```

---

## 八、故障排查

### 1. 容器无法启动

```bash
# 查看详细错误日志
docker-compose -f docker-compose.prod.yml logs

# 检查端口占用
netstat -tulpn | grep -E ':(80|443|3000)'

# 检查 Docker 服务状态
systemctl status docker
```

### 2. Nginx 无法启动（SSL 证书问题）

```bash
# 临时禁用 HTTPS，注释 nginx.conf 中的 HTTPS server 段
# 或者创建自签名证书用于测试

# 创建自签名证书（仅用于测试）
mkdir -p nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/certs/privkey.pem \
  -out nginx/certs/fullchain.pem \
  -subj "/CN=your-domain.com"
```

### 3. 构建失败

```bash
# 清理构建缓存
docker system prune -a

# 重新构建（不使用缓存）
docker-compose -f docker-compose.prod.yml build --no-cache
```

### 4. 无法访问应用

```bash
# 检查防火墙
firewall-cmd --list-all
# 或
iptables -L -n

# 检查容器是否运行
docker ps

# 检查端口映射
docker port <container-id>

# 测试应用内部连接
docker-compose -f docker-compose.prod.yml exec app curl http://localhost:3000
```

---

## 九、验证部署

### 1. 检查服务状态

```bash
docker-compose -f docker-compose.prod.yml ps
```

应该看到 `app` 和 `nginx` 两个容器都在运行。

### 2. 访问应用

- **HTTP**: `http://your-server-ip` 或 `http://your-domain.com`
- **HTTPS**: `https://your-domain.com`（如果配置了证书）

### 3. 测试健康检查

```bash
# 测试应用健康
curl http://localhost:3000

# 测试 Nginx 代理
curl http://localhost
```

---

## 十、性能优化建议

### 1. 限制容器资源

编辑 `docker-compose.prod.yml`，添加资源限制：

```yaml
services:
  app:
    # ... 其他配置
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### 2. 启用日志轮转

创建 `/etc/docker/daemon.json`：

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### 3. 定期清理

```bash
# 添加定时任务清理旧镜像
crontab -e
# 每周日凌晨3点清理
0 3 * * 0 docker system prune -af --volumes
```

---

## 📝 快速部署命令汇总

```bash
# 1. 安装 Docker 和 Docker Compose
yum install -y docker-ce docker-ce-cli containerd.io
systemctl start docker && systemctl enable docker
curl -L "https://get.daocloud.io/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 2. 上传代码到 /opt/flipbook

# 3. 配置域名（编辑 nginx/nginx.conf）

# 4. 部署
cd /opt/flipbook
docker-compose -f docker-compose.prod.yml up -d --build

# 5. 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 🎉 完成！

现在你的应用应该已经在腾讯云服务器上运行了。如果遇到问题，请参考"故障排查"部分或查看日志。

---

## 📚 相关文档

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Nginx 配置文档](https://nginx.org/en/docs/)
- [Let's Encrypt 文档](https://letsencrypt.org/docs/)

