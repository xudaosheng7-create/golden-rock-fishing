# GitHub Pages 部署指南

## 一、本地操作

### 1. 填入你的域名
编辑 `public/CNAME`，把 `你的域名.com` 换成你的真实域名，例如：
```
fish.example.com
```

### 2. 初始化 Git + 推送到 GitHub

先在 GitHub.com 创建仓库（例如 `golden-rock-fishing`），然后：

```bash
cd C:/Users/Lenovo/ocean-fishing
git init
git add .
git commit -m "金岩石海钓 v1.0"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

## 二、GitHub 设置

1. 仓库 → Settings → Pages
2. Source: **GitHub Actions** 或 **Deploy from a branch → main → / (root)**
3. Custom domain: 填入你的域名 → Save
4. 勾选 **Enforce HTTPS**

## 三、域名设置（阿里云/腾讯云）

去你的域名管理后台，添加一条 DNS 记录：

| 类型 | 主机记录 | 记录值 |
|------|----------|--------|
| CNAME | fish（或 www） | `你的用户名.github.io` |

等几分钟 DNS 生效，打开 `https://你的域名.com` 就能玩了。

## 四、自动构建

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

之后每次 `git push`，GitHub 自动构建部署。
