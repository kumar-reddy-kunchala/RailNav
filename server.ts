import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { spawn, execSync } from 'child_process';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Ensure Python Flask dependencies are installed
const pythonPath = '/tmp/pip-packages';
const envWithPythonPath = {
  ...process.env,
  PYTHONPATH: process.env.PYTHONPATH ? `${pythonPath}:${process.env.PYTHONPATH}` : pythonPath,
  PORT: '5000'
};

try {
  console.log('Checking Python Flask dependencies...');
  execSync('python3 -c "import flask, flask_sqlalchemy, sqlalchemy, pydantic, google.generativeai"', {
    env: envWithPythonPath,
    stdio: 'ignore'
  });
  console.log('Python dependencies are already installed.');
} catch (error) {
  console.log('Some Python dependencies are missing. Ensuring pip3 is installed...');
  try {
    try {
      execSync('which pip3', { stdio: 'ignore' });
    } catch (e) {
      console.log('pip3 is not found. Installing python3-pip via apt...');
      try {
        execSync('DEBIAN_FRONTEND=noninteractive apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" python3-pip', { stdio: 'inherit' });
      } catch (aptError: any) {
        console.error('Failed to install python3-pip via apt:', aptError.message);
      }
    }

    console.log('Installing Python requirements...');
    try {
      execSync('pip3 install --break-system-packages -r python_app/requirements.txt', { stdio: 'inherit' });
    } catch (pipError) {
      try {
        execSync('pip install --break-system-packages -r python_app/requirements.txt', { stdio: 'inherit' });
      } catch (pipError2) {
        try {
          execSync(`pip3 install --target=${pythonPath} -r python_app/requirements.txt`, { stdio: 'inherit' });
        } catch (pipError3) {
          execSync(`pip install --target=${pythonPath} -r python_app/requirements.txt`, { stdio: 'inherit' });
        }
      }
    }
    console.log('Python dependencies installed successfully.');
  } catch (installError: any) {
    console.error('Failed to install Python dependencies:', installError.message);
  }
}

// Start Python Flask app in background on port 5000
console.log('Starting Python Flask Backend...');
const pythonProcess = spawn('python3', [path.join(process.cwd(), 'python_app/app.py')], {
  env: envWithPythonPath,
  stdio: 'inherit'
});

pythonProcess.on('close', (code) => {
  console.log(`Python process exited with code ${code}`);
});

// Custom simple zero-dependency Proxy Middleware to forward /api requests to Flask on port 5000
app.use('/api', (req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api${req.url}`,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  req.pipe(proxyReq, { end: true });

  proxyReq.on('error', (err) => {
    console.error('Proxy error to Python backend:', err.message);
    res.status(502).json({ error: 'Python backend is still booting or unreachable.' });
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Node Server + Proxy running on http://localhost:${PORT}`);
  });
}

startServer();
