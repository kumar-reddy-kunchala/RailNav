import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, SkipForward, RotateCcw, AlertCircle } from 'lucide-react';

export default function VoiceNavigator({
  steps,
  currentStepIndex,
  setCurrentStepIndex,
  voiceMuted,
  setVoiceMuted,
  isActive,
  onDeviate,
  isSimulatingNavigation = false,
  setIsSimulatingNavigation,
  lightMode = false
}) {
  const [speechSupported, setSpeechSupported] = useState(true);

  // Initialize Speech Synthesis check
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.speechSynthesis) {
      setSpeechSupported(false);
    }
  }, []);

  // Speak a specific instruction
  const speakText = (text) => {
    if (voiceMuted || !speechSupported || !isActive) return;
    
    try {
      window.speechSynthesis.cancel(); // Stop current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0; // standard speaking rate
      utterance.pitch = 1.05; // slightly cheerful
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('SpeechSynthesis error:', e);
    }
  };

  // Speak automatically whenever current step changes
  useEffect(() => {
    if (isActive && steps && steps[currentStepIndex]) {
      const step = steps[currentStepIndex];
      let ttsMsg = step.instruction;
      if (step.distance > 0) {
        ttsMsg += `, for ${step.distance} meters.`;
      }
      speakText(ttsMsg);
    }
  }, [currentStepIndex, isActive, voiceMuted]);

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleRepeat = () => {
    if (steps && steps[currentStepIndex]) {
      const step = steps[currentStepIndex];
      speakText(`Repeating: ${step.instruction}`);
    }
  };

  if (!isActive) return null;

  return (
    <div className={`border rounded-2xl p-4.5 space-y-4 shadow-xl transition-all ${
      lightMode
        ? 'bg-white border-slate-200/80 shadow-slate-100/40'
        : 'bg-[#080f21] border-[#1e2d52]/60 shadow-black/20'
    }`} id="voice-navigator-card">
      <div className="flex items-center justify-between" id="voice-header">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className={`text-[10px] font-extrabold uppercase tracking-widest ${lightMode ? 'text-blue-600' : 'text-blue-400'}`}>Voice Assisted Guidance</span>
        </div>
        
        <button
          onClick={() => setVoiceMuted(!voiceMuted)}
          className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
            voiceMuted 
              ? 'border-rose-200 text-rose-500 bg-rose-50/50' 
              : lightMode
                ? 'border-blue-100 text-blue-600 bg-blue-50/50'
                : 'border-[#1e2d52] text-blue-400 bg-[#111e3f]/50'
          }`}
          id="voice-mute-toggle"
        >
          {voiceMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
          <span>{voiceMuted ? 'Muted' : 'Speaking'}</span>
        </button>
      </div>

      {/* Simulator bar */}
      {setIsSimulatingNavigation && (
        <div className={`border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs ${
          lightMode
            ? 'bg-slate-50 border-slate-200'
            : 'bg-[#050a17] border-[#1e2d52]/40'
        }`}>
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isSimulatingNavigation ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className={`font-semibold ${lightMode ? 'text-slate-600' : 'text-slate-300'}`}>
              GPS Simulator: <span className={isSimulatingNavigation ? 'text-emerald-500 font-extrabold' : 'text-slate-500 font-bold'}>{isSimulatingNavigation ? 'ACTIVE' : 'IDLE'}</span>
            </span>
          </div>
          <button
            onClick={() => {
              // If starting, let's reset to first node to trace from beginning
              if (!isSimulatingNavigation) {
                setCurrentStepIndex(0);
              }
              setIsSimulatingNavigation(!isSimulatingNavigation);
            }}
            className={`px-3.5 py-1.5 rounded-xl font-extrabold text-[11px] tracking-wider uppercase transition-all cursor-pointer active:scale-95 ${
              isSimulatingNavigation
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-500/10'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/10'
            }`}
          >
            {isSimulatingNavigation ? 'Stop Auto-Walk' : 'Start Auto-Walk'}
          </button>
        </div>
      )}

      {steps && steps[currentStepIndex] ? (
        <div className={`border rounded-xl p-4 space-y-2.5 relative ${
          lightMode
            ? 'bg-slate-50/50 border-slate-200'
            : 'bg-[#111e3f]/50 border-[#1e2d52]/50'
        }`} id="voice-instruction-bubble">
          <p className="text-[9px] font-extrabold tracking-widest text-blue-500 uppercase">Step {currentStepIndex + 1} of {steps.length}</p>
          <p className={`text-sm font-extrabold leading-relaxed ${lightMode ? 'text-slate-800' : 'text-white'}`}>
            {steps[currentStepIndex].instruction}
          </p>
          {steps[currentStepIndex].distance > 0 && (
            <p className={`text-xs font-mono font-medium ${lightMode ? 'text-slate-500' : 'text-slate-400'}`}>Distance Remaining: <span className="text-blue-500 font-bold">{steps[currentStepIndex].distance} meters</span></p>
          )}

          {/* Nav buttons inside voice bubble */}
          <div className={`flex items-center justify-between pt-3.5 border-t mt-3 text-xs ${
            lightMode ? 'border-slate-200/50' : 'border-[#1e2d52]/40'
          }`} id="voice-controls">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className={`px-3 py-2 disabled:opacity-40 rounded-xl transition-all text-xs font-extrabold cursor-pointer active:scale-95 ${
                lightMode
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-[#1a2c54] hover:bg-[#203666] text-slate-200'
              }`}
              id="voice-prev"
            >
              Previous
            </button>
            
            <button
              onClick={handleRepeat}
              className={`p-2 rounded-xl transition-all cursor-pointer active:scale-95 ${
                lightMode
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-[#1a2c54] hover:bg-[#203666] text-slate-200'
              }`}
              title="Repeat aloud"
              id="voice-repeat"
            >
              <RotateCcw size={13} />
            </button>

            <button
              onClick={handleNextStep}
              disabled={currentStepIndex === steps.length - 1}
              className="px-3.5 py-2 bg-blue-600 text-white disabled:opacity-40 rounded-xl transition-all text-xs font-extrabold hover:bg-blue-700 flex items-center space-x-1 cursor-pointer active:scale-95"
              id="voice-next"
            >
              <span>Next</span>
              <SkipForward size={11} />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-slate-400 text-xs py-3 text-center">
          No steps loaded. Please plan a route first.
        </div>
      )}

      {isActive && onDeviate && (
        <button
          onClick={onDeviate}
          className={`w-full border text-xs py-2.5 rounded-xl font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer mt-1 active:scale-98 ${
            lightMode
              ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600'
              : 'bg-rose-950/20 hover:bg-rose-950/40 border-rose-900/30 text-rose-400'
          }`}
          id="simulate-deviation-button"
        >
          <AlertCircle size={14} />
          <span>Simulate Deviated Route (Trigger Recalculate)</span>
        </button>
      )}

      {!speechSupported && (
        <div className={`text-[10px] flex items-start space-x-1.5 border p-3 rounded-xl ${
          lightMode
            ? 'border-orange-200 bg-orange-50 text-orange-700'
            : 'border-orange-950/40 bg-orange-950/10 text-orange-400'
        }`} id="voice-not-supported-alert">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          <span>Speech Synthesis is not fully supported in your browser context. Text-based helper guidance is still fully available.</span>
        </div>
      )}
    </div>
  );
}
