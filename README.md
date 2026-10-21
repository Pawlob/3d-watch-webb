# New 3D Project - 3D Scroll-Driven Website

Interactive 3D landing page generated with **3D Website Builder**.
Featuring real-time WebGL / Three.js animations, smooth scroll choreography, custom typography, and responsive layouts.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: version 18.0 or newer
- **npm** (comes with Node) or **pnpm** / **yarn** / **bun**

### 2. Install Dependencies
Run in your terminal inside this folder:
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view and edit your live 3D site!

### 4. Build for Production
To build optimized static assets for deployment:
```bash
npm run build
```
The build output will be placed in the `dist/` folder, ready to deploy to **Vercel**, **Netlify**, **Cloudflare Pages**, or **AWS S3**.

---

## ⚡ 1-Click Deploy to Vercel

This project includes pre-configured **`vercel.json`** and **`.npmrc`** for seamless deployment on [Vercel](https://vercel.com):

1. **Push to Git**: Push this project folder to a GitHub, GitLab, or Bitbucket repository.
2. **Import into Vercel**: Select your repository on Vercel.
3. **Framework Preset**: Vercel automatically detects **Vite**.
   - **Build Command**: `npm run build` (`vite build`)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. **Deploy**: Click **Deploy**! The 3D scroll website will build cleanly and deploy instantly without any manual configuration.

Alternatively, deploy directly using the Vercel CLI from your terminal:
```bash
npx vercel
```

---

## 📁 Project Structure

```
├── index.html                  # HTML entry point with title and meta tags
├── package.json                # Project dependencies and npm scripts
├── vite.config.ts              # Vite + Tailwind CSS configuration
├── tsconfig.json               # TypeScript compiler settings
├── src/
│   ├── main.tsx                # React application entry point
│   ├── index.css               # Global Tailwind CSS styles
│   ├── App.tsx                 # Full Studio Builder & Live Website runner
│   ├── website-config.json     # Current exported site configuration
│   ├── components/
│   │   ├── ScrollCanvas.tsx    # Three.js 3D canvas with scroll interpolation
│   │   ├── ScrollPage.tsx      # Smooth scroll sections and typography overlay
│   │   ├── DynamicModel.tsx    # 3D model loader (.glb, .gltf, .obj) & procedural presets
│   │   ├── Model.tsx           # Default aerospace phone 3D mesh
│   │   ├── SectionView.tsx     # Section typography, layout, & background renderer
│   │   ├── TimelineScrubber.tsx# Interactive keyframe timeline scrubber
│   │   ├── BuilderSidebar.tsx  # Studio inspector sidebar & asset manager
│   │   ├── HomePage.tsx        # Projects dashboard & blank canvas starter
│   │   └── ExportModal.tsx     # Export dialog
│   ├── types/
│   │   └── builder.ts          # Core TypeScript interfaces & types
│   ├── utils/
│   │   ├── interpolation.ts    # Cubic easing and 3D transform lerp math
│   │   └── fontManager.ts      # Webfont & Google Fonts loader
│   ├── data/
│   │   └── defaultTemplates.ts # Preset templates (iPhone, Cyberpunk, Crystal, Torus)
│   └── modelData.ts            # Base64 embedded 3D model geometry
```

---

## 🎨 Customizing Your Website

- **Edit Configuration**: Open `src/website-config.json` or adjust `App.tsx` to customize keyframes, texts, and model angles.
- **Upload 3D Models**: Drop `.glb`, `.gltf`, or `.obj` files directly in the Studio Editor or load them in `DynamicModel.tsx`.
- **Custom Fonts**: Supported formats include `.woff2`, `.woff`, `.ttf`, and `.otf`, or curated Google Fonts.

---
Built with ❤️ using React Three Fiber, Three.js, Tailwind CSS, and Vite.
