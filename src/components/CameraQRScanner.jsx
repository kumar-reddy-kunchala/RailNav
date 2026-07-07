import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Upload, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function CameraQRScanner({ onScanSuccess, lightMode = false }) {
  const [scanMethod, setScanMethod] = useState('camera');
  const [cameraPermission, setCameraPermission] = useState('prompt');
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [html5QrcodeInstance, setHtml5QrcodeInstance] = useState(null);
  const scannerRef = useRef(null);

  const qrcodeRegionId = "html5-qr-video-region";

  // Start the HTML5 Live QR Camera Scanner
  useEffect(() => {
    if (scanMethod !== 'camera') {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          setHtml5QrcodeInstance(null);
          scannerRef.current = null;
        }).catch(err => console.error("Error stopping qr scanner:", err));
      }
      return;
    }

    const startScanner = async () => {
      try {
        const html5Qrcode = new Html5Qrcode(qrcodeRegionId);
        scannerRef.current = html5Qrcode;
        setHtml5QrcodeInstance(html5Qrcode);

        const qrCodeSuccessCallback = (decodedText) => {
          setScanResult(decodedText);
          onScanSuccess(decodedText);
          // Play success chime sound if browser allows
          try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.value = 880; // A5 note
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
          } catch (e) {
            // Ignore audio policy blocks
          }
        };

        const config = { 
          fps: 10, 
          qrbox: { width: 200, height: 200 },
          aspectRatio: 1.0
        };

        // Start scanning with user environment camera (back camera)
        await html5Qrcode.start(
          { facingMode: "environment" },
          config,
          qrCodeSuccessCallback,
          (errorMessage) => {
            // Silence frequent reading errors, as they are printed continuously when no QR code is in frame
          }
        );
        setCameraPermission('granted');
        setScanError(null);
      } catch (err) {
        console.error("Failed to start QR scanner:", err);
        if (err.name === 'NotAllowedError' || err.toString().includes('Permission denied')) {
          setCameraPermission('denied');
        } else {
          setCameraPermission('unsupported');
          setScanError(err.message || 'Unable to access camera. Please make sure no other app is using it.');
        }
      }
    };

    // Delay start slightly to let the div mount securely
    const timer = setTimeout(() => {
      startScanner();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop()
          .then(() => {
            scannerRef.current = null;
          })
          .catch(e => console.error("Unmount cleanup error:", e));
      }
    };
  }, [scanMethod]);

  // Handle uploaded file QR decoding
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError(null);
    setScanResult(null);

    try {
      const html5QrCode = new Html5Qrcode(qrcodeRegionId + "-file-dummy");
      const decodedText = await html5QrCode.scanFile(file, true);
      setScanResult(decodedText);
      onScanSuccess(decodedText);
    } catch (err) {
      console.error("File decode error:", err);
      setScanError("Could not detect any QR code in this image. Please ensure the QR code is clear and well-lit.");
    }
  };

  return (
    <div className={`border rounded-2xl p-4.5 space-y-4 shadow-sm transition-all ${
      lightMode 
        ? "bg-slate-50/50 border-slate-200" 
        : "bg-[#070d1e] border-[#1e2d52]/60 shadow-inner"
    }`} id="camera-qr-scanner-box">
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3.5 gap-2 ${
        lightMode ? 'border-slate-100' : 'border-[#1e2d52]/30'
      }`}>
        <span className={`text-[10px] font-extrabold uppercase tracking-wider ${lightMode ? 'text-slate-500' : 'text-slate-400'}`}>Check-in QR Decoder</span>
        <div className={`flex p-1 rounded-xl border ${
          lightMode 
            ? 'bg-slate-100 border-slate-200/60' 
            : 'bg-[#111e3f] border-[#1e2d52]/50'
        }`} id="scan-method-toggle">
          <button
            onClick={() => { setScanMethod('camera'); setScanResult(null); setScanError(null); }}
            className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg flex items-center space-x-1.5 cursor-pointer transition-all ${
              scanMethod === 'camera'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Camera size={11} />
            <span>Live Feed</span>
          </button>
          <button
            onClick={() => { setScanMethod('file'); setScanResult(null); setScanError(null); }}
            className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg flex items-center space-x-1.5 cursor-pointer transition-all ${
              scanMethod === 'file'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Upload size={11} />
            <span>Upload Image</span>
          </button>
        </div>
      </div>

      {scanMethod === 'camera' && (
        <div className="space-y-3">
          {cameraPermission === 'denied' && (
            <div className={`border p-3.5 rounded-xl text-xs flex items-start space-x-2.5 leading-relaxed ${
              lightMode 
                ? 'bg-rose-50 border-rose-200 text-rose-600' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-extrabold uppercase tracking-wide text-[10px]">Camera Access Denied</p>
                <p className="font-semibold text-[11px]">Please grant camera access in your browser preferences to decode physical poster tags, or choose "Upload Image" mode to scan a saved QR screenshot instead.</p>
              </div>
            </div>
          )}

          {cameraPermission === 'prompt' && (
            <div className={`text-center py-8 text-xs flex flex-col items-center space-y-2.5 animate-pulse font-semibold ${
              lightMode ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <RefreshCw size={18} className="animate-spin text-blue-500" />
              <span>Querying Webcam Device Permissions...</span>
            </div>
          )}

          <div 
            id={qrcodeRegionId} 
            className="w-full max-w-sm mx-auto aspect-square overflow-hidden rounded-2xl border-2 border-dashed border-blue-500/30 bg-black/40 flex items-center justify-center relative shadow-md"
          >
            {cameraPermission === 'denied' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-4 text-center text-xs text-slate-400 space-y-2">
                <Camera size={32} className="text-slate-600" />
                <span className="font-semibold">Webcam source currently deactivated</span>
              </div>
            )}
          </div>
          
          <p className="text-[9px] text-slate-400 text-center uppercase tracking-wider font-extrabold leading-relaxed">
            Position a station terminal QR tag cleanly inside the frame boundary box
          </p>
        </div>
      )}

      {scanMethod === 'file' && (
        <div className="space-y-4 py-2">
          <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-7 transition-all cursor-pointer relative group ${
            lightMode
              ? 'border-slate-200 bg-white hover:bg-slate-100/50 hover:border-blue-500'
              : 'border-[#1e2d52] bg-[#050a17]/40 hover:bg-[#0c162e]/40 hover:border-blue-500'
          }`}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload size={28} className="text-slate-400 group-hover:text-blue-500 transition-colors mb-2.5" />
            <p className={`text-xs font-bold ${lightMode ? 'text-slate-700' : 'text-slate-300'}`}>Choose QR Image File</p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Supports PNG, JPEG, WEBP or SVG formats</p>
          </div>

          {/* Dummy hidden div required for scanning uploads */}
          <div id={qrcodeRegionId + "-file-dummy"} className="hidden"></div>
        </div>
      )}

      {scanResult && (
        <div className={`border rounded-xl p-3.5 text-xs flex items-start space-x-2.5 animate-fade-in ${
          lightMode 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
            : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
        }`}>
          <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
          <div className="space-y-1">
            <p className="font-extrabold uppercase tracking-wider text-[10px]">Successfully Decoded!</p>
            <p className={`font-mono text-xs break-all px-2.5 py-1 rounded-lg border font-semibold mt-1.5 inline-block ${
              lightMode 
                ? 'bg-white border-emerald-200 text-slate-800' 
                : 'bg-slate-950/40 border-[#1e2d52]/40 text-slate-200'
            }`}>Value: {scanResult}</p>
          </div>
        </div>
      )}

      {scanError && (
        <div className={`border rounded-xl p-3.5 text-xs flex items-start space-x-2.5 animate-fade-in ${
          lightMode 
            ? 'bg-rose-50 border-rose-200 text-rose-600' 
            : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
        }`}>
          <AlertCircle size={14} className="mt-0.5 shrink-0 text-rose-500" />
          <div className="space-y-1">
            <p className="font-extrabold uppercase tracking-wider text-[10px]">Decoder Exception</p>
            <p className="font-semibold text-[11px] leading-relaxed">{scanError}</p>
          </div>
        </div>
      )}
    </div>
  );
}
