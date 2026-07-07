# RailNav System 🚆

A state-of-the-art, smart railway navigation and passenger guidance system designed to streamline transit hubs. **RailNav System** provides interactive indoor pathfinding, real-time facility tracking, custom voice guides, accessibility planning, camera-based QR scanning, and a complete administrative dashboard for station administrators.

This application is built with a high-performance **full-stack architecture**, pairing a responsive React single-page frontend with an orchestrating Node.js middle tier and a robust Python Flask backend microservice.

---

## 🌟 Key Features

*   **🗺️ Interactive Indoor Map**: Real-time canvas-based layout indicating station platforms, entries, exits, stairs, and facilities with visual pathfinding lines between checkpoints.
*   **🤖 AI Operational Chatbot Guide**: An intelligent conversational agent utilizing Google's Gemini models to assist passengers with routing, facility locations, train schedules, and station rules.
*   **🔍 QR Code Ticket/Information Scanner**: Built-in camera-based scanning system to read tickets, access platform boarding information, and unlock specialized station maps.
*   **🎙️ Voice-Activated Navigator**: Screen-reader and voice guidance options offering hands-free accessibility-focused vocal instructions for visually impaired travelers.
*   **📊 Administrative Portal**: Secure backend administration tools to add stations, manage available facilities, modify operational alerts, and track active platform crowds.
*   **🎨 Premium Slate UI/UX**: Crafted using modern fluid layouts, motion-activated micro-interactions, dark aesthetic color tones, and clear typography.

---

## 🏗️ Architectural Overview

The application utilizes an elegant three-tier architecture designed for standard server environments, which also powers seamless cloud deployments (like Google Cloud Run):

```
       [ Client-Side Browser ]
                  │
                  ▼ (Port 3000)
    ┌───────────────────────────┐
    │     Node.js Express       │  <── Hosts built React/Vite assets & proxies APIs
    └─────────────┬─────────────┘
                  │
                  ▼ (Proxied to Port 5000)
    ┌───────────────────────────┐
    │   Python Flask Backend    │  <── Handles routing, stations, and admin operations
    └───────────────────────────┘
```

1.  **Frontend (Client Tier)**: React, styled with Tailwind CSS, leveraging Lucide icons for iconography, and Motion for elegant transition animations.
2.  **Middle-Tier (Orchestrator)**: Node.js Express server (`server.ts`). During development, it hosts the Vite server instance. In production, it serves precompiled static assets, proxies `/api/*` endpoints, and acts as a process manager to spin up and monitor the Python Flask process in the background.
3.  **Backend (Microservice Tier)**: Python Flask (`python_app/app.py`), using SQLite/local databases to perform route calculations, manage stations, facilities, and serve core API responses.

---

## ⚙️ Prerequisites & Environment

### Node.js Requirements
*   **Node.js**: v18.0.0 or higher
*   **npm**: v9.0.0 or higher

### Python Requirements
*   **Python**: v3.10 or higher
*   **pip3**: Installed and available on your system path

---

## 🚀 Quick Start (Running Locally)

To run the entire system on your local machine (Windows, Mac, or Linux), follow these steps:

### 1. Clone & Navigate
```bash
git clone <your-repository-url>
cd railnav-system
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory. You can copy the example template:
```bash
cp .env.example .env
```

Define the required variables inside your `.env` file:
```env
# GEMINI_API_KEY: Required for Gemini AI API calls.
# Local: Replace with your Google AI Studio API key.
# AI Studio Cloud: Automatically injected from your Secrets panel at runtime.
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# APP_URL: The URL where the application is hosted.
# Local: http://localhost:3000
# AI Studio Cloud: Automatically injected as the active deployment URL.
APP_URL="MY_APP_URL"
```

#### 🛡️ AI Studio vs. Local Environment Variable Behavior

*   **When Running on Google AI Studio / Cloud Run**: 
    The platform automatically manages and securely injects `GEMINI_API_KEY` (using values securely configured in the AI Studio **Secrets** panel) and `APP_URL` (which points to the active preview/development URL). No manual configuration of the `.env` file is required in AI Studio's cloud editor.
*   **When Running Locally**:
    You **must** create the `.env` file manually at the root of your project using the keys described above. Fill in your personal Google AI Studio API key for `GEMINI_API_KEY`, and set `APP_URL` to `http://localhost:3000` (or your custom local address).

### 3. Install Node.js Dependencies
Install the required packages for the orchestrating server and frontend:
```bash
npm install
```

### 4. Install Python Backend Dependencies
Install the requirements for the microservice. If your system requires `--break-system-packages`, run:
```bash
pip3 install --break-system-packages -r python_app/requirements.txt
```
Otherwise, a standard pip install will work:
```bash
pip install -r python_app/requirements.txt
```

### 5. Launch the Development Environment
Run the unified dev command. This boots up the Vite React server, mounts the Express middleware, and launches the Python Flask microservice on port 5000 in a single command:
```bash
npm run dev
```

The application will be accessible at:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📦 Production Build & Deployment

To bundle the application for production release or deploy it to servers (e.g., Google Cloud Run, AWS EC2, or Docker):

### 1. Build the Bundles
This command compiles the React assets into highly optimized static files in `dist/`, and bundles the Node.js TypeScript server into a self-contained CommonJS (`dist/server.cjs`) file using `esbuild`:
```bash
npm run build
```

### 2. Run the Production Build
Start the high-performance compiled server:
```bash
npm run start
```
The application will listen on port `3000`, routing both frontend requests and internal python microservice proxy connections.

---

## ⚡ Vercel Deployment & Environment Setup

If you want to deploy this application to **Vercel**, you must configure your environment variables in the Vercel Dashboard and understand how Vercel's serverless runtime interacts with a dual Node.js/Python architecture.

### 1. Configuring Environment Variables in Vercel

Do **NOT** commit your physical `.env` file to your Git repository (it is secured and ignored via `.gitignore`). Instead, configure these values directly in the **Vercel Web Dashboard**:

1. Navigate to your project inside the [Vercel Dashboard](https://vercel.com).
2. Go to **Settings** > **Environment Variables**.
3. Add the following key-value pairs:

| Variable Name | Value / Format | Purpose |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `AIzaSy...` (Your Gemini API Key) | Authorizes smart chatbot guides and AI passenger assistants. |
| `APP_URL` | `https://your-app-name.vercel.app` | Informs the app of its active deployment domain. |
| `PORT` | `3000` | Defines the ingress port. |

---

### 2. ⚠️ Important Architectural Note for Vercel

Vercel is built primarily for **Static Web Hosting** and ephemeral **Serverless Functions**. 

Because this application utilizes a dual-process architecture (where the Node.js Express server dynamically spawns and maintains a Python Flask subprocess via `child_process.spawn`), **Vercel's standard serverless environment cannot run this persistent Python background process natively.**

To deploy this system successfully, choose one of the following production setups:

#### Option A: Containerized Hosting (Highly Recommended)
Deploy the full-stack bundle as a unified **Docker Container** on platforms that support persistent processes (such as **Google Cloud Run**, **Render**, or **Heroku**). 
* *Note: Google AI Studio automatically configures and deploys this app directly to Google Cloud Run by default, ensuring that all API proxies and internal processes work seamlessly.*

#### Option B: Decoupled Deployments (Frontend on Vercel)
If you specifically want to utilize Vercel for hosting the frontend user interface:
1. **Host Frontend on Vercel**: Deploy only the frontend static SPA client. Set the Vercel build command to `npm run build` and point the output directory to `dist`.
2. **Host Backend on Container Platforms**: Host the Node.js Express + Python Flask microservice bundle as a persistent container on **Google Cloud Run** or **Render**.
3. **Connect via API URL**: Define a custom environment variable in Vercel (e.g. `VITE_API_BASE_URL`) pointing to your hosted container endpoint to route API calls securely.

---

## 📁 Key File Structure

```
├── python_app/
│   ├── app.py                  # Core Python Flask API & database logic
│   ├── requirements.txt        # Python backend libraries
│   └── templates/              # HTML fallbacks (if applicable)
├── src/
│   ├── App.jsx                 # Primary React application layout
│   ├── components/             # Sub-components (IndoorMap, Chatbot, VoiceNavigator, etc.)
│   ├── index.css               # Global Tailwind CSS imports and fonts
│   └── main.jsx                # React mount entrypoint
├── server.ts                   # Middle-tier Node Express server & Python process runner
├── package.json                # Project script mappings and packages
├── tsconfig.json               # TypeScript configuration
└── vite.config.js              # Vite configuration
```

---

## 🧪 System Maintenance & Diagnostics

*   **Linter**: Verify syntax correctness and framework standards:
    ```bash
    npm run lint
    ```
*   **Clean Artifacts**: Delete previous builds and cached logs:
    ```bash
    npm run clean
    ```

---

*This project was developed and refined inside **Google AI Studio** to deliver high-quality smart-transit experiences.*
