<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1lYmN0MyUJYkRsvz34WN5x1uCRgGd-wKj


## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## 🛠️ 项目部署与使用指南 (中文)

本指南将帮助您在本地环境搭建项目，或将其部署到生产环境。

### 📋 环境准备 (Prerequisites)

在开始之前，请确保您的开发环境已满足以下要求：

*   **Node.js**: 推荐版本 v18 或更高版本。
*   **包管理器**: npm (随 Node.js 安装) 或 yarn/pnpm。
*   **Gemini API Key**: 您需要从 [Google AI Studio](https://ai.google.dev/) 获取 API 密钥。

### 🚀 本地开发 (Local Development)

1.  **安装依赖**

    在项目根目录下运行以下命令安装所需依赖：

    ```bash
    npm install
    ```

2.  **配置环境变量**

    复制 `.env.example` 文件（如果存在）或直接新建 `.env.local` 文件，并填入您的 API 密钥：

    ```bash
    # 在项目根目录创建 .env.local
    echo "GEMINI_API_KEY=your_api_key_here" > .env.local
    ```

    > ⚠️ **注意**: 请勿将 `.env.local` 提交到代码仓库，以免由于 API 密钥泄露导致安全问题。

3.  **启动开发服务器**

    运行以下命令启动本地开发预览：

    ```bash
    npm run dev
    ```

    终端将显示访问地址，通常为 `http://localhost:5173`。

### 📦 构建与生产 (Build & Production)

当您准备将项目部署到线上时，需要先进行构建。

1.  **构建项目**

    ```bash
    npm run build
    ```

    此命令会将代码编译并优化到 `dist` 目录中。

2.  **本地预览构建结果**

    在部署前，您可以通过以下命令在本地预览构建后的应用：

    ```bash
    npm run preview
    ```

### ☁️ 部署指南 (Deployment)

本项目基于 **Vite** 构建，生成的 `dist` 目录包含纯静态文件，因此可以部署到任何支持静态网站托管的服务上。

#### 选项 A: 部署到 Vercel (推荐)

最简单的部署方式是使用 Vercel。

1.  安装 Vercel CLI: `npm i -g vercel`
2.  在项目根目录运行: `vercel`
3.  按照提示操作，设置项目名称等。
4.  **关键步骤**: 在 Vercel 的项目设置 (Settings > Environment Variables) 中添加 `GEMINI_API_KEY`。

#### 选项 B: 部署到 Netlify

1.  在 Netlify 上创建新站点，关联您的 GitHub 仓库。
2.  构建命令 (Build command): `npm run build`
3.  发布目录 (Publish directory): `dist`
4.  在 Site settings > Build & deploy > Environment variables 中添加 `GEMINI_API_KEY`。

#### 选项 C: 传统服务器部署 (Nginx)

如果您有自己的服务器，可以使用 Nginx 托管 `dist` 目录。

1.  在本地执行 `npm run build`。
2.  将 `dist` 目录下的所有文件上传 to 服务器目录 (例如 `/var/www/geo-finder`).
3.  配置 Nginx (示例配置):

    ```nginx
    server {
        listen 80;
        server_name your-domain.com;
        root /var/www/geo-finder;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
    ```
