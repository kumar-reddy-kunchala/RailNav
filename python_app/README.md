# StationAI - Python Tech Stack (Flask + Dijkstra + Gemini AI)

This directory contains the **complete, production-ready Python version** of the StationAI Smart Railway Assist & Navigation platform.

We have ported the entire application from TypeScript/React/Node.js to **100% pure Python** (Flask backend serving responsive, modern HTML + Tailwind CSS templates).

---

## 🛠️ Technology Stack Used

- **Web Server & Routing**: [Flask](https://flask.palletsprojects.com/) (Lightweight, robust Python web framework)
- **Navigation Pathfinder**: Standard Custom **Dijkstra Algorithm** implemented in pure Python (`dijkstra.py`), with turn-by-turn instruction parsing based on 2D vectors (cross & dot product formulas).
- **Persistent Data Store**: Standard File-based Database (`db.json`) reading and writing station configurations, platform structures, and user logs.
- **AI Chatbot**: [Google Generative AI Python SDK](https://github.com/google-gemini/generative-ai-python) with dynamic rule-based fallbacks for offline or unconfigured environments.
- **Frontend Layer**: Fully responsive single-page web application using **HTML5**, **Tailwind CSS**, and **Lucide Vector Icons**.
- **QR Code Recognition**: Integrated live camera poster-scanning using the high-performance [HTML5-QRCode](https://github.com/mebjas/html5-qrcode) package.

---

## 📁 Directory Structure

```text
python_app/
├── app.py                # Main Flask application file (API routers & Auth)
├── dijkstra.py           # Pure Python Dijkstra shortest path module
├── db.json               # Local database loaded and mirrored from the station DB
├── requirements.txt      # Python libraries & package dependencies list
├── templates/
│   └── index.html        # Interactive map canvas, chat UI, scanner & settings template
└── README.md             # This comprehensive installation guide
```

---

## 🚀 How to Run Locally

### Prerequisites
Make sure you have **Python 3.8+** installed on your system.

### 1. Install Dependencies
Navigate into the `python_app` folder and install the required packages using pip:
```bash
pip install -r requirements.txt
```

### 2. Configure Gemini API (Optional)
If you wish to enable full live AI conversation, expose your Gemini API key in your terminal session:
- **Windows (Command Prompt)**:
  ```cmd
  set GEMINI_API_KEY=your_actual_api_key_here
  ```
- **macOS / Linux / Git Bash**:
  ```bash
  export GEMINI_API_KEY="your_actual_api_key_here"
  ```
*If not specified, the system will automatically utilize our highly specialized, rule-based intelligent fallback parsing engine!*

### 3. Launch Server
Start the Flask web development server:
```bash
python app.py
```

### 4. Explore App
Open your web browser and navigate to:
```text
http://127.0.0.1:5000/
```

---

## 🧭 Application Modules Ported

1. **Pathfinding Network Engine**: Fully functional node-and-path graph search that tracks coordinates on the station map and calculates turn-by-turn guidance.
2. **Access-Centered Preferences**: Features specialized accessibility and elevator constraints.
3. **Dual QR Poster Scanner**: Supports live webcam decoding as well as standard, click-to-simulate terminal selections to instantly identify user starting locations.
4. **Intelligent Chat Companion**: Serves customized queries, crowd flow indicators, and station schedules.
