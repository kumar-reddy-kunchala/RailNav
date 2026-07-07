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
Add your configurations, including the Gemini API key for chatbot functionalities:
```env
# .env
PORT=3000
GEMINI_API_KEY=your_google_gemini_api_key_here
```

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
