import React, { useState, useEffect, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Compass, 
  MapPin, 
  Search, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Navigation, 
  Clock, 
  TrendingUp,
  Map as MapIcon,
  Layers,
  HelpCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export default function IndoorMap({
  nodes = [],
  routeResult = null,
  startNodeId = '',
  endNodeId = '',
  onNodeSelect,
  accessibilityMode = false,
  currentStepIndex = 0,
  lightMode = false
}) {
  const [zoom, setZoom] = useState(1);
  const [is3D, setIs3D] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clickedNodeId, setClickedNodeId] = useState(null);
  const [isBottomPanelCollapsed, setIsBottomPanelCollapsed] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    { id: 'platform_1', name: 'Platform 1' },
    { id: 'waiting_lounge', name: 'Waiting Lounge' },
    { id: 'atm_center', name: 'ATM Center' }
  ]);

  const searchRef = useRef(null);

  // Close suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Map limits and coordinate dimensions
  const mapWidth = 800;
  const mapHeight = 500;

  // Helper to scale percentage coordinates
  const scaleX = (x) => (x / 100) * mapWidth;
  const scaleY = (y) => (y / 100) * mapHeight;

  // Adjust zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(2.5, prev + 0.25));
  const handleZoomOut = () => setZoom(prev => Math.max(0.75, prev - 0.25));
  const toggle3D = () => setIs3D(!is3D);
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const getActiveNode = (id) => nodes.find(n => n.id === id);

  const startNode = getActiveNode(startNodeId);
  const endNode = getActiveNode(endNodeId);

  // Get SVG polyline point string for the route path
  const getRoutePoints = () => {
    if (!routeResult || !routeResult.path) return '';
    return routeResult.path.map(node => `${scaleX(node.x)},${scaleY(node.y)}`).join(' ');
  };

  // Find a specific node in path to render helper dots
  const isNodeInPath = (nodeId) => {
    if (!routeResult) return false;
    return routeResult.path.some(n => n.id === nodeId);
  };

  // Autocomplete Suggestions Filter
  const suggestions = searchQuery.trim() === ''
    ? []
    : nodes.filter(node => 
        node.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);

  const handleSelectSuggestion = (node) => {
    setClickedNodeId(node.id);
    setSearchQuery('');
    setShowSuggestions(false);
    
    // Add to recent searches if not already there
    if (!recentSearches.some(item => item.id === node.id)) {
      setRecentSearches(prev => [node, ...prev.slice(0, 2)]);
    }
  };

  // Get active navigation step details
  const activeStep = routeResult && routeResult.steps && routeResult.steps[currentStepIndex]
    ? routeResult.steps[currentStepIndex]
    : null;

  return (
    <div 
      className={`relative border rounded-3xl overflow-hidden transition-all duration-300 flex flex-col ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-[0_24px_70px_rgba(15,23,42,0.35)] border-blue-500/10' : 'h-[580px] shadow-sm'
      } ${
        lightMode
          ? 'bg-slate-50 border-slate-200'
          : 'bg-[#080d19] border-[#1e2d52]/50'
      }`}
      id="indoor-map-card"
    >
      {/* MAP HEADER / STATUS BAR */}
      <div className={`flex items-center justify-between px-6 py-4 border-b z-10 transition-all ${
        lightMode
          ? 'bg-white border-slate-200/80 text-slate-800'
          : 'bg-[#0b1224]/90 border-[#1e2d52]/40 text-white backdrop-blur-md'
      }`} id="map-header">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest">Station Indoor Map</h3>
            <p className={`text-[10px] font-semibold ${lightMode ? 'text-slate-400' : 'text-slate-500'}`}>
              CENTRAL TERMINAL • LEVEL 1
            </p>
          </div>
        </div>
        
        {/* View toggles & Fullscreen */}
        <div className="flex items-center space-x-2.5" id="map-view-toggles">
          <div className={`p-1 rounded-xl flex items-center border ${
            lightMode ? 'bg-slate-100/80 border-slate-200/50' : 'bg-[#121f40]/50 border-[#1a2c54]/50'
          }`}>
            <button
              onClick={() => setIs3D(false)}
              className={`px-3 py-1.5 text-[10px] rounded-lg font-extrabold transition-all duration-200 uppercase tracking-wider cursor-pointer ${
                !is3D 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : lightMode 
                    ? 'text-slate-500 hover:text-slate-800'
                    : 'text-slate-400 hover:text-white'
              }`}
              id="map-view-2d"
            >
              2D Map
            </button>
            <button
              onClick={() => setIs3D(true)}
              className={`px-3 py-1.5 text-[10px] rounded-lg font-extrabold transition-all duration-200 uppercase tracking-wider cursor-pointer ${
                is3D 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : lightMode 
                    ? 'text-slate-500 hover:text-slate-800'
                    : 'text-slate-400 hover:text-white'
              }`}
              id="map-view-3d"
            >
              3D Perspective
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer active:scale-95 ${
              lightMode 
                ? 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800' 
                : 'bg-[#111e3f]/60 border-[#1e2d52]/60 text-slate-300 hover:bg-[#121f40] hover:text-white'
            }`}
            title="Toggle Fullscreen"
            id="map-fullscreen-toggle"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* SEARCH OVERLAY (Google Maps style floating search card) */}
      <div 
        ref={searchRef}
        className="absolute top-20 left-6 z-20 w-[300px] sm:w-[340px] flex flex-col"
        id="floating-search-container"
      >
        <div className={`flex items-center px-4 py-3 rounded-2xl border shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 ${
          lightMode
            ? 'bg-white/95 border-slate-200/80 text-slate-800'
            : 'bg-[#0a0f1d]/95 border-[#1e2d52]/60 text-white backdrop-blur-md'
        }`}>
          <Search size={16} className="text-slate-400 mr-2.5 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search facility, platform, gates..."
            className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Suggestion Dropdown Panel */}
        {showSuggestions && (
          <div className={`mt-2 rounded-2xl border shadow-[0_12px_40px_rgba(15,23,42,0.12)] max-h-[280px] overflow-y-auto animate-scale-up transition-all ${
            lightMode
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-[#0a0f1d]/98 border-[#1e2d52]/70 text-white'
          }`}>
            {suggestions.length > 0 ? (
              <div className="py-2">
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 px-4 py-1.5">
                  Search Results
                </p>
                {suggestions.map(node => (
                  <button
                    key={node.id}
                    onClick={() => handleSelectSuggestion(node)}
                    className={`w-full text-left px-4 py-3 text-xs font-bold flex items-center space-x-3 cursor-pointer transition-colors ${
                      lightMode ? 'hover:bg-slate-50' : 'hover:bg-[#111e3f]/60'
                    }`}
                  >
                    <MapPin size={13} className="text-blue-500 shrink-0" />
                    <span className="truncate">{node.name}</span>
                  </button>
                ))}
              </div>
            ) : searchQuery.trim() !== '' ? (
              <div className="p-4 text-center text-slate-400 text-xs font-medium">
                No matching places found.
              </div>
            ) : (
              // Default suggestion block
              <div className="py-2.5">
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 px-4 py-1.5">
                  Recent Locations
                </p>
                {recentSearches.map(node => {
                  const nodeObj = nodes.find(n => n.id === node.id);
                  return (
                    <button
                      key={node.id}
                      onClick={() => handleSelectSuggestion(nodeObj || node)}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center space-x-3 cursor-pointer transition-colors ${
                        lightMode ? 'hover:bg-slate-50' : 'hover:bg-[#111e3f]/60'
                      }`}
                    >
                      <Clock size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{node.name}</span>
                    </button>
                  );
                })}
                
                <div className="border-t my-1.5 border-slate-200/50 dark:border-[#1e2d52]/30"></div>
                
                {/* Popular suggestions pills */}
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 px-4 py-1.5">
                  Popular Categories
                </p>
                <div className="flex flex-wrap gap-1.5 px-4 py-2">
                  {['Platform 1', 'ATM Center', 'Food Court', 'Waiting Lounge'].map(cat => {
                    const matched = nodes.find(n => n.name.toLowerCase().includes(cat.toLowerCase()));
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          if (matched) handleSelectSuggestion(matched);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold transition-colors border cursor-pointer ${
                          lightMode 
                            ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800' 
                            : 'bg-[#111e3f]/40 border-[#1a2c54]/50 text-slate-300 hover:bg-[#111e3f]/80 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TOP NAVIGATION METRICS HUD (Active route information card) */}
      {routeResult && (
        <div 
          className="absolute top-20 right-6 z-20 w-[260px] sm:w-[300px] animate-fade-in"
          id="floating-nav-hud"
        >
          <div className={`p-4 rounded-2xl border shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all ${
            lightMode
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-[#0a0f1d]/95 border-[#1e2d52]/60 text-white backdrop-blur-md'
          }`}>
            <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-200/50 dark:border-[#1e2d52]/30">
              <span className="text-[9px] font-extrabold text-blue-500 uppercase tracking-widest flex items-center space-x-1">
                <Navigation size={10} className="animate-pulse" />
                <span>Active Wayfinding Route</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                LIVE
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="space-y-1">
                <p className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center justify-center space-x-1">
                  <TrendingUp size={9} />
                  <span>Distance</span>
                </p>
                <p className="text-sm font-extrabold tracking-tight">{routeResult.totalDistance} m</p>
              </div>
              <div className="space-y-1 border-x border-slate-200/50 dark:border-[#1e2d52]/30">
                <p className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center justify-center space-x-1">
                  <Clock size={9} />
                  <span>Time</span>
                </p>
                <p className="text-sm font-extrabold tracking-tight text-emerald-500">{routeResult.estimatedTimeMins} min</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center justify-center space-x-1">
                  <Compass size={9} />
                  <span>Steps</span>
                </p>
                <p className="text-sm font-extrabold tracking-tight text-indigo-500">{routeResult.stepsCount || routeResult.steps?.length}</p>
              </div>
            </div>

            {/* Dynamic ETA */}
            <div className={`mt-3 pt-2 text-[10px] flex items-center justify-between font-semibold border-t ${
              lightMode ? 'border-slate-100 text-slate-500' : 'border-[#1e2d52]/20 text-slate-400'
            }`}>
              <span>Start: {startNode?.name || 'Selected point'}</span>
              <ChevronRight size={10} />
              <span className="text-rose-500">End: {endNode?.name || 'Target'}</span>
            </div>
          </div>
        </div>
      )}

      {/* DRAWING STAGE (Canvas wrapper with pan/zoom/3D perspective) */}
      <div 
        className={`flex-1 relative overflow-auto flex items-center justify-center p-4 select-none ${
          lightMode ? 'bg-[#f4f7f9]/50' : 'bg-[#080d1a]'
        }`} 
        id="map-viewport"
      >
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
          backgroundImage: lightMode 
            ? 'radial-gradient(#94a3b8 1px, transparent 1px)' 
            : 'radial-gradient(#334155 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }} />

        <div
          className="transition-all duration-500 ease-out origin-center"
          style={{
            transform: `
              scale(${zoom}) 
              ${is3D ? 'rotateX(52deg) rotateZ(-14deg) skewX(1deg) translateY(-25px)' : 'rotateX(0deg) rotateZ(0deg)'}
            `,
            transformStyle: 'preserve-3d',
            perspective: is3D ? '1200px' : 'none',
            width: `${mapWidth}px`,
            height: `${mapHeight}px`
          }}
          id="map-stage-container"
        >
          {/* SVG Vector Drawing */}
          <svg
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            className="w-full h-full drop-shadow-[0_10px_25px_rgba(0,0,0,0.04)]"
            id="station-svg-drawing"
          >
            {/* GLOWS AND ARROW GRADIENTS DEFINITION */}
            <defs>
              <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              
              <filter id="glow-heavy" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              <filter id="glow-soft" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Slide path keyframes */}
              <style>{`
                @keyframes slidePath {
                  to {
                    stroke-dashoffset: -32;
                  }
                }
                .nav-path-dash {
                  stroke-dasharray: 8, 8;
                  animation: slidePath 1.2s linear infinite;
                }
                
                @keyframes locatorPulse {
                  0% {
                    r: 8px;
                    opacity: 0.8;
                  }
                  100% {
                    r: 24px;
                    opacity: 0;
                  }
                }
                .live-pulse-ring {
                  animation: locatorPulse 1.8s cubic-bezier(0.24, 0, 0.38, 1) infinite;
                }

                @keyframes floatPin {
                  0%, 100% {
                    transform: translateY(0);
                  }
                  50% {
                    transform: translateY(-5px);
                  }
                }
                .floating-pin {
                  animation: floatPin 2s ease-in-out infinite;
                }
              `}</style>
            </defs>

            {/* STATION OUTER WALL BOUNDARY */}
            <rect 
              x="20" 
              y="80" 
              width="760" 
              height="400" 
              rx="24" 
              fill={lightMode ? '#ffffff' : '#0a0f1d'} 
              stroke={lightMode ? '#cbd5e1' : '#1e2d52'} 
              strokeWidth="2.5" 
              className="transition-all duration-300"
            />
            
            {/* PLATFORMS & TRAIN TRACKS SECTOR */}
            <g id="tracks-platforms-blueprint">
              {/* Rails Track Bed Area */}
              <rect 
                x="24" 
                y="84" 
                width="752" 
                height="46" 
                fill={lightMode ? '#f1f5f9' : '#050a14'} 
                rx="6"
              />
              
              {/* Rail sleepers ties (vertical lines) */}
              {Array.from({ length: 38 }).map((_, i) => (
                <line 
                  key={i} 
                  x1={30 + i * 20} 
                  y1="86" 
                  x2={30 + i * 20} 
                  y2="126" 
                  stroke={lightMode ? '#cbd5e1' : '#1a2233'} 
                  strokeWidth="2.5" 
                />
              ))}

              {/* Rails Steel Lines */}
              <line x1="24" y1="96" x2="776" y2="96" stroke={lightMode ? '#64748b' : '#334155'} strokeWidth="2.5" />
              <line x1="24" y1="114" x2="776" y2="114" stroke={lightMode ? '#64748b' : '#334155'} strokeWidth="2.5" />
              
              {/* Platform concrete floor bar */}
              <rect 
                x="24" 
                y="130" 
                width="752" 
                height="32" 
                fill={lightMode ? '#e2e8f0' : '#0f172a'} 
                stroke={lightMode ? '#cbd5e1' : '#1e2d52'} 
                strokeWidth="1.5" 
              />
              
              {/* Safety tactile warning yellow strip (pulsing amber glow) */}
              <rect x="24" y="130" width="752" height="4" fill="#f59e0b" />
              <line 
                x1="24" 
                y1="132" 
                x2="776" 
                y2="132" 
                stroke="#d97706" 
                strokeWidth="2" 
                strokeDasharray="4, 4" 
              />

              {/* Platform division gates */}
              <line x1="210" y1="130" x2="210" y2="162" stroke={lightMode ? '#94a3b8' : '#1e2d52'} strokeWidth="2" />
              <line x1="400" y1="130" x2="400" y2="162" stroke={lightMode ? '#94a3b8' : '#1e2d52'} strokeWidth="2" />
              <line x1="590" y1="130" x2="590" y2="162" stroke={lightMode ? '#94a3b8' : '#1e2d52'} strokeWidth="2" />
              
              {/* Platform labels */}
              <text x="117" y="150" fill={lightMode ? '#334155' : '#8fa2c4'} fontSize="11" fontWeight="800" textAnchor="middle" letterSpacing="0.5">PLATFORM 1</text>
              <text x="305" y="150" fill={lightMode ? '#334155' : '#8fa2c4'} fontSize="11" fontWeight="800" textAnchor="middle" letterSpacing="0.5">PLATFORM 2</text>
              <text x="495" y="150" fill={lightMode ? '#334155' : '#8fa2c4'} fontSize="11" fontWeight="800" textAnchor="middle" letterSpacing="0.5">PLATFORM 3</text>
              <text x="683" y="150" fill={lightMode ? '#334155' : '#8fa2c4'} fontSize="11" fontWeight="800" textAnchor="middle" letterSpacing="0.5">PLATFORM 4</text>
            </g>

            {/* CONCOURSE ROOMS & INDOOR ZONE BLOCKS */}
            <g id="concourse-rooms-blueprint">
              {/* Restroom Room (Right Concourse) */}
              <g>
                <rect x="670" y="250" width="90" height="70" rx="14" fill={lightMode ? '#fff1f2' : '#1a0e1b'} stroke={lightMode ? '#fda4af' : '#4c1d24'} strokeWidth="1.5" />
                <text x="715" y="290" fill={lightMode ? '#e11d48' : '#fda4af'} fontSize="10" textAnchor="middle" fontWeight="800">Restroom</text>
              </g>

              {/* Food Court Rooms (Right Concourse) */}
              <g>
                <rect x="670" y="180" width="90" height="60" rx="14" fill={lightMode ? '#fef3c7' : '#22160d'} stroke={lightMode ? '#fcd34d' : '#451a03'} strokeWidth="1.5" />
                <text x="715" y="215" fill={lightMode ? '#d97706' : '#fcd34d'} fontSize="10" textAnchor="middle" fontWeight="800">Food Court</text>
              </g>

              {/* Coffee Shop */}
              <g>
                <rect x="670" y="140" width="90" height="32" rx="10" fill={lightMode ? '#faf7f2' : '#1f1610'} stroke={lightMode ? '#cbd5e1' : '#3c2415'} strokeWidth="1.5" />
                <text x="715" y="160" fill={lightMode ? '#78350f' : '#b45309'} fontSize="8" textAnchor="middle" fontWeight="800">Coffee Store</text>
              </g>

              {/* Waiting Lounge (Center) */}
              <g>
                <rect x="420" y="210" width="160" height="90" rx="18" fill={lightMode ? '#f0f9ff' : '#0b162a'} stroke={lightMode ? '#93c5fd' : '#1e3a8a'} strokeWidth="2" />
                <rect x="424" y="214" width="152" height="82" rx="14" fill="none" stroke={lightMode ? '#e0f2fe' : '#172554'} strokeWidth="1" strokeDasharray="3, 3" />
                <text x="500" y="260" fill={lightMode ? '#0284c7' : '#60a5fa'} fontSize="11" textAnchor="middle" fontWeight="800" letterSpacing="0.5">Waiting Lounge</text>
              </g>

              {/* ATM Center */}
              <g>
                <rect x="330" y="310" width="110" height="52" rx="14" fill={lightMode ? '#ecfdf5' : '#061c15'} stroke={lightMode ? '#6ee7b7' : '#064e3b'} strokeWidth="1.5" />
                <text x="385" y="341" fill={lightMode ? '#059669' : '#34d399'} fontSize="10" textAnchor="middle" fontWeight="800">ATM Center</text>
              </g>

              {/* Main Entrance */}
              <g>
                <rect x="610" y="400" width="130" height="60" rx="16" fill={lightMode ? '#eff6ff' : '#0c1a30'} stroke={lightMode ? '#93c5fd' : '#2563eb'} strokeWidth="2" />
                <text x="675" y="435" fill={lightMode ? '#2563eb' : '#60a5fa'} fontSize="11" textAnchor="middle" fontWeight="800" letterSpacing="0.5">Main Entrance</text>
              </g>
            </g>

            {/* MAP CONNECTING WALKWAY PATHS (Polished vector style corridor lanes) */}
            <g id="walkway-guides" stroke={lightMode ? '#e2e8f0' : '#131e35'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8">
              <path d="M 680,430 L 610,345" />
              <path d="M 610,345 L 610,215" />
              <path d="M 610,215 L 680,215" />
              <path d="M 610,285 L 680,285" />
              <path d="M 610,345 L 390,345" />
              <path d="M 390,345 L 390,250" />
              <path d="M 390,250 L 420,250" />
              <path d="M 580,250 L 610,215" />
              <path d="M 610,150 L 680,150" />
              <path d="M 610,150 L 580,150 L 580,210" />
              <path d="M 580,150 L 450,150" />
            </g>

            {/* Subtle inner walker guide overlays */}
            <g id="walkway-inner-guides" stroke={lightMode ? '#f1f5f9' : '#1e293b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5">
              <path d="M 680,430 L 610,345" />
              <path d="M 610,345 L 610,215" />
              <path d="M 610,345 L 390,345" />
              <path d="M 390,345 L 390,250" />
            </g>

            {/* ACTIVE ROUTE PATH (Google Maps double-layered animated chevrons) */}
            {routeResult && routeResult.path && (
              <g id="navigation-active-route">
                {/* Thick bright blue glowing shadow path */}
                <polyline
                  points={getRoutePoints()}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.25"
                  filter="url(#glow-heavy)"
                />
                
                {/* Mid layer vibrant route stroke */}
                <polyline
                  points={getRoutePoints()}
                  fill="none"
                  stroke="url(#routeGrad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Top sliding dashed guide */}
                <polyline
                  points={getRoutePoints()}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="nav-path-dash"
                  opacity="0.85"
                />
              </g>
            )}

            {/* DRAW ALL INTERACTIVE NODES */}
            <g id="map-waypoint-nodes">
              {nodes.map(node => {
                const isStart = node.id === startNodeId;
                const isEnd = node.id === endNodeId;
                const inPath = isNodeInPath(node.id);
                const isSelected = node.id === clickedNodeId;

                return (
                  <g 
                    key={node.id} 
                    className="cursor-pointer group"
                    onClick={() => setClickedNodeId(node.id)}
                  >
                    {/* Hover hotspot radius */}
                    <circle
                      cx={scaleX(node.x)}
                      cy={scaleY(node.y)}
                      r="18"
                      fill="transparent"
                    />

                    {/* Node outline ring when hovered / selected */}
                    <circle
                      cx={scaleX(node.x)}
                      cy={scaleY(node.y)}
                      r="10"
                      fill="none"
                      stroke={isSelected ? '#3b82f6' : '#3b82f6'}
                      strokeWidth="2"
                      className={`transition-all duration-300 ${
                        isSelected 
                          ? 'scale-110 opacity-100' 
                          : 'scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-40'
                      }`}
                    />
                    
                    {/* Node Core Dot */}
                    <circle
                      cx={scaleX(node.x)}
                      cy={scaleY(node.y)}
                      r={isStart || isEnd ? "8" : "5"}
                      fill={
                        isStart 
                          ? '#2563eb' 
                          : isEnd 
                          ? '#ef4444' 
                          : inPath 
                          ? '#3b82f6' 
                          : lightMode
                          ? '#94a3b8'
                          : '#334155'
                      }
                      stroke={
                        isStart || isEnd || inPath
                          ? '#ffffff' 
                          : lightMode
                          ? '#cbd5e1'
                          : '#1e2d52'
                      }
                      strokeWidth={isStart || isEnd || inPath ? "2.5" : "1.5"}
                      className="transition-all duration-300 group-hover:scale-125"
                    />

                    {/* Node Title Labels */}
                    <text
                      x={scaleX(node.x)}
                      y={scaleY(node.y) - 12}
                      fill={
                        isStart 
                          ? '#2563eb' 
                          : isEnd 
                          ? '#ef4444' 
                          : inPath 
                          ? '#2563eb' 
                          : lightMode 
                          ? '#475569' 
                          : '#94a3b8'
                      }
                      fontSize="9.5"
                      fontWeight={inPath || isSelected ? '800' : '600'}
                      textAnchor="middle"
                      className={`transition-all pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)] ${
                        inPath || isSelected ? 'opacity-100' : 'opacity-65 group-hover:opacity-100'
                      }`}
                    >
                      {node.name}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* CURRENT LOCATION BLUE DOT (White center with pulsating halo glow) */}
            {startNode && (
              <g id="start-node-marker">
                {/* Pulsating outer halo ring */}
                <circle
                  cx={scaleX(startNode.x)}
                  cy={scaleY(startNode.y)}
                  r="16"
                  fill="#3b82f6"
                  className="live-pulse-ring pointer-events-none"
                />
                
                {/* Glass shadow background */}
                <circle
                  cx={scaleX(startNode.x)}
                  cy={scaleY(startNode.y)}
                  r="9"
                  fill="#ffffff"
                  stroke="#2563eb"
                  strokeWidth="3.5"
                  filter="url(#glow-soft)"
                />
                {/* Solid blue inner core */}
                <circle
                  cx={scaleX(startNode.x)}
                  cy={scaleY(startNode.y)}
                  r="3.5"
                  fill="#2563eb"
                />
              </g>
            )}

            {/* END DESTINATION PIN (Modern vector drop pin shape with bounce animation) */}
            {endNode && (
              <g 
                id="end-node-marker" 
                transform={`translate(${scaleX(endNode.x)}, ${scaleY(endNode.y)})`}
                className="floating-pin"
              >
                {/* Real-time shrinking shadow as pin bounces */}
                <ellipse cx="0" cy="1" rx="4.5" ry="1.5" fill="#000" opacity="0.35" />
                
                {/* Red Pin core vector structure */}
                <g transform="translate(-10, -25)">
                  <path
                    d="M10 0C4.48 0 0 4.48 0 10C0 17.5 10 24 10 24C10 24 20 17.5 20 10C20 4.48 15.52 0 10 0ZM10 13.5C8.07 13.5 6.5 11.93 6.5 10C6.5 8.07 8.07 6.5 10 6.5C11.93 6.5 13.5 8.07 13.5 10C13.5 11.93 11.93 13.5 10 13.5Z"
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    filter="url(#glow-soft)"
                  />
                  {/* Dynamic pulse inside the pin */}
                  <circle cx="10" cy="10" r="3" fill="#ffffff" />
                </g>
              </g>
            )}

            {/* ANIMATED PASSENGER LOCATOR ALONG THE ACTIVE NAVIGATION PATH */}
            {routeResult && routeResult.path && routeResult.path.length > 1 && (() => {
              const activeNodeIndex = Math.min(Math.max(0, currentStepIndex), routeResult.path.length - 1);
              const activeNode = routeResult.path[activeNodeIndex];
              return (
                <g id="animated-pedestrian-dot">
                  {/* Glowing blue footprint pointer */}
                  <circle
                    cx={scaleX(activeNode.x)}
                    cy={scaleY(activeNode.y)}
                    r="11"
                    fill="#2563eb"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className="animate-bounce drop-shadow-md"
                  />
                  {/* Tiny footprint arrow pointing forward */}
                  <path 
                    d="M10 5.5c.7 0 1.25-.55 1.25-1.25s-.55-1.25-1.25-1.25S8.75 3.55 8.75 4.25s.55 1.25 1.25 1.25zm-.25 4.25H9L7.5 14h1.1l1-2.9 1.1 1.4V14H11.8v-2.5l-1.3-1.6 1-1.4c.5.6 1 .9 1.8.9v-.9c-.6 0-1.1-.3-1.4-.7L10.5 7.5c-.2-.3-.5-.4-.9-.4-.2 0-.4.1-.6.2L7.3 8.3v1.5h1.2v-1l1.1-.5L9.75 9.75z"
                    fill="#ffffff"
                    transform={`translate(${scaleX(activeNode.x) - 10}, ${scaleY(activeNode.y) - 10})`}
                  />
                </g>
              );
            })()}
          </svg>

          {/* NODE DETAILS POPUP CARD (Rendered beautifully when you tap on nodes) */}
          {clickedNodeId && (() => {
            const node = nodes.find(n => n.id === clickedNodeId);
            if (!node) return null;
            const x = scaleX(node.x);
            const y = scaleY(node.y);
            return (
              <div 
                className={`absolute rounded-2xl p-4.5 shadow-[0_12px_40px_rgba(15,23,42,0.15)] flex flex-col space-y-3 z-30 w-64 border transition-all duration-300 animate-scale-up ${
                  lightMode
                    ? 'bg-white/95 border-slate-200 text-slate-800'
                    : 'bg-[#0f172a]/95 border-[#1e2d52]/80 text-white backdrop-blur-md'
                }`}
                style={{
                  left: `${x}px`,
                  top: `${y - 12}px`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      <MapPin size={12} />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold tracking-tight truncate max-w-[140px]">
                        {node.name}
                      </h4>
                      <p className={`text-[9px] font-semibold ${lightMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        GRID LOCATION ({Math.round(node.x)}, {Math.round(node.y)})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setClickedNodeId(null);
                    }}
                    className={`p-1 rounded-lg transition-colors ${
                      lightMode ? 'text-slate-400 hover:bg-slate-50' : 'text-slate-500 hover:bg-[#111e3f]'
                    }`}
                  >
                    <X size={12} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNodeSelect(node.id, 'from');
                      setClickedNodeId(null);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] py-2 px-3 rounded-lg transition-all cursor-pointer text-center active:scale-95 shadow-sm"
                  >
                    Directions From
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNodeSelect(node.id, 'to');
                      setClickedNodeId(null);
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] py-2 px-3 rounded-lg transition-all cursor-pointer text-center active:scale-95 shadow-sm"
                  >
                    Directions To
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* FLOATING CONTROLS PANEL (Zoom, Recentering, Compass buttons) */}
      <div className="absolute bottom-6 right-6 flex flex-col space-y-2.5 z-20" id="map-stage-controls">
        <button
          onClick={handleZoomIn}
          className={`w-11 h-11 rounded-full border shadow-[0_6px_20px_rgba(0,0,0,0.08)] flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105 cursor-pointer ${
            lightMode
              ? 'bg-white/95 border-slate-200 text-slate-600 hover:text-slate-800'
              : 'bg-[#0a0f1d]/95 border-[#1e2d52]/80 text-slate-300 hover:text-white backdrop-blur-md'
          }`}
          title="Zoom In"
          id="map-zoom-in"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={handleZoomOut}
          className={`w-11 h-11 rounded-full border shadow-[0_6px_20px_rgba(0,0,0,0.08)] flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105 cursor-pointer ${
            lightMode
              ? 'bg-white/95 border-slate-200 text-slate-600 hover:text-slate-800'
              : 'bg-[#0a0f1d]/95 border-[#1e2d52]/80 text-slate-300 hover:text-white backdrop-blur-md'
          }`}
          title="Zoom Out"
          id="map-zoom-out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setIs3D(false);
          }}
          className={`w-11 h-11 rounded-full border shadow-[0_6px_20px_rgba(0,0,0,0.08)] flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105 cursor-pointer ${
            lightMode
              ? 'bg-white/95 border-slate-200 text-slate-600 hover:text-slate-800'
              : 'bg-[#0a0f1d]/95 border-[#1e2d52]/80 text-slate-300 hover:text-white backdrop-blur-md'
          }`}
          title="Recenter Map Orientation"
          id="map-recenter"
        >
          <Compass size={16} />
        </button>
      </div>

      {/* FLOATING LEGEND DRAWER (Modern minimalistic card) */}
      <div className={`absolute bottom-6 left-6 border rounded-2xl p-4 text-[10px] space-y-2 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all z-20 ${
        lightMode
          ? 'bg-white/95 border-slate-200 text-slate-700'
          : 'bg-[#0a0f1d]/95 border-[#1e2d52]/80 text-slate-300 backdrop-blur-md'
      }`} id="map-legend">
        <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
          Map Legend
        </p>
        <div className="flex items-center space-x-2.5">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 bg-white inline-block shadow-sm"></span>
          <span className="font-extrabold text-[10.5px]">Starting Origin</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <MapPin size={13} className="text-rose-500 shrink-0" />
          <span className="font-extrabold text-[10.5px]">Destination Target</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <div className="w-4 h-1 rounded bg-blue-600 flex items-center justify-center">
            <span className="w-1.5 h-[1.5px] bg-white"></span>
          </div>
          <span className="font-extrabold text-[10.5px]">Navigation Path</span>
        </div>
        <div className={`pt-2 border-t text-[9px] leading-relaxed font-semibold ${
          lightMode ? 'border-slate-100 text-slate-400' : 'border-[#1e2d52]/50 text-slate-500'
        }`}>
          Click blueprint nodes directly<br />to plan custom pathways
        </div>
      </div>

      {/* GOOGLE MAPS STYLE BOTTOM WALKING DIRECTION WIDGET */}
      {routeResult && activeStep && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-[420px] animate-slide-up" id="gmaps-bottom-panel">
          <div className={`rounded-2xl border p-4 shadow-[0_12px_40px_rgba(15,23,42,0.15)] flex flex-col space-y-3 transition-all duration-300 ${
            lightMode
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-[#0b1224]/95 border-[#1e2d52]/80 text-white backdrop-blur-md'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-extrabold text-blue-500 uppercase tracking-widest">
                Active Step {currentStepIndex + 1} of {routeResult.steps.length}
              </span>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
                  <span className={`text-[9px] font-extrabold uppercase ${lightMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Walk guidance
                  </span>
                </div>
                <button
                  onClick={() => setIsBottomPanelCollapsed(!isBottomPanelCollapsed)}
                  className={`p-1 rounded-lg transition-colors cursor-pointer hover:bg-slate-100/50 ${
                    lightMode ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'
                  }`}
                  id="bottom-panel-toggle"
                  title={isBottomPanelCollapsed ? "Expand Directions" : "Minimize Directions"}
                >
                  {isBottomPanelCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            </div>

            {!isBottomPanelCollapsed ? (
              <>
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0 mt-0.5">
                    <Navigation size={15} className="rotate-45" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-extrabold leading-snug">
                      {activeStep.instruction}
                    </p>
                    {activeStep.distance > 0 && (
                      <p className="text-slate-400 font-mono text-[10px] font-extrabold mt-1">
                        FOR NEXT {activeStep.distance} METERS
                      </p>
                    )}
                  </div>
                </div>

                {/* Stepper controls */}
                {routeResult.steps.length > 1 && (
                  <div className={`flex items-center justify-between pt-2 border-t ${
                    lightMode ? 'border-slate-100' : 'border-[#1e2d52]/40'
                  }`}>
                    <div className={`text-[10px] font-bold ${lightMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Walk path guide
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-mono font-extrabold mr-1.5">
                        {Math.round((currentStepIndex / (routeResult.steps.length - 1)) * 100) || 0}% Done
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span className="truncate max-w-[280px] text-[11px] font-bold text-slate-500 dark:text-slate-300">{activeStep.instruction}</span>
                <span className="text-[10px] font-mono text-emerald-500 shrink-0 ml-2">
                  {Math.round((currentStepIndex / (routeResult.steps.length - 1)) * 100) || 0}% Done
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
