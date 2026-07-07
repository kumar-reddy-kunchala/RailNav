import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  User as UserIcon, 
  Eye, 
  Menu, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Check, 
  Trash2, 
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Header({
  user,
  activeStation,
  onLogout,
  onSearch,
  accessibilityMode,
  setAccessibilityMode,
  onToggleSidebar,
  sidebarOpen,
  isCollapsed,
  setIsCollapsed,
  setActiveTab
}) {
  const lightMode = true; // Forced Light Mode Only
  const [currentTime, setCurrentTime] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif_1',
      title: 'Elevator Outage',
      message: 'Elevator 2 near Platform 4 is closed for maintenance. Avoid steps/escalators route or use Lift 1.',
      type: 'warning',
      time: '10 mins ago',
      read: false
    },
    {
      id: 'notif_2',
      title: 'Platform crowd alert',
      message: 'High commuter density detected on Platform 2 (85% capacity). Ensure yellow line distance.',
      type: 'info',
      time: '25 mins ago',
      read: false
    },
    {
      id: 'notif_3',
      title: 'Ramp Way Completed',
      message: 'Platform 1 to 3 wheelchair ramp accessibility installation is now fully open.',
      type: 'success',
      time: '2 hours ago',
      read: false
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleRead = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const removeNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchChange = (e) => {
    setSearchVal(e.target.value);
    onSearch(e.target.value);
  };

  const handleToggleClick = () => {
    if (window.innerWidth < 768) {
      if (onToggleSidebar) onToggleSidebar();
    } else {
      if (setIsCollapsed) setIsCollapsed(!isCollapsed);
    }
  };

  // Theme-based classes
  const headerClass = accessibilityMode
    ? "bg-black border-b border-yellow-400 h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 text-yellow-300"
    : lightMode
      ? "bg-white/80 backdrop-blur-md border-b border-slate-200/80 h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 text-slate-800 shadow-xs"
      : "bg-[#070c1e]/90 backdrop-blur-md border-b border-[#111e3f] h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 text-slate-100 shadow-md shadow-black/5";

  const inputClass = accessibilityMode
    ? "w-full bg-black text-yellow-300 placeholder-yellow-600 pl-10 pr-4 py-2 rounded-full border border-yellow-400 focus:outline-none focus:border-yellow-300 text-xs font-bold"
    : lightMode
      ? "w-full bg-slate-100 hover:bg-slate-200/50 focus:bg-white text-slate-800 placeholder-slate-400 pl-10 pr-4 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-xs font-bold"
      : "w-full bg-[#111e3f]/50 hover:bg-[#111e3f]/80 focus:bg-[#111e3f] text-white placeholder-slate-400 pl-10 pr-4 py-2 rounded-full border border-[#1e2d52] focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all text-xs font-bold";

  const btnSecondaryClass = accessibilityMode
    ? "w-10 h-10 rounded-full border border-yellow-400 text-yellow-300 flex items-center justify-center"
    : lightMode
      ? "w-10 h-10 rounded-full transition-all border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center shadow-xs cursor-pointer"
      : "w-10 h-10 rounded-full transition-all border border-[#1e2d52] text-slate-400 hover:bg-[#111e3f] hover:text-white hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center shadow-md shadow-black/10 cursor-pointer";

  const menuTextClass = lightMode ? "text-slate-800 font-bold" : "text-white font-bold";
  const menuSubTextClass = lightMode ? "text-slate-500" : "text-slate-400";

  return (
    <header className={headerClass} id="app-header">
      
      {/* LEFT SECTION: Sidebar Toggle | Logo | Application Name | Current Station */}
      <div className="flex items-center space-x-3.5" id="header-left-hub">
        
        {/* Unified Sidebar Toggle Button */}
        <button
          onClick={handleToggleClick}
          className={`${btnSecondaryClass} md:hidden`}
          id="navbar-sidebar-toggle"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <Menu size={16} className="transition-transform duration-300 hover:rotate-12" />
        </button>

        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3" id="brand-container">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/10" id="brand-logo-bg">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" id="train-logo-svg">
              <path d="M12 2c-4 0-7 2.08-7 6v10c0 1.66 1.34 3 3 3l-1 1v1h10v-1l-1-1c1.66 0 3-1.34 3-3V8c0-3.92-3-6-7-6zm-3.5 16c-.83 0-1.5-.67-1.5-1.5S7.67 15 8.5 15s1.5.67 1.5 1.5S9.33 18 8.5 18zm3.5-5H7V8h10v5h-5zm3.5 5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </svg>
          </div>
          <div className="hidden sm:block" id="brand-text">
            <div className="flex items-center space-x-2">
              <h1 className={`${menuTextClass} text-sm font-black leading-tight tracking-tight whitespace-nowrap`}>
                RailNav System
              </h1>
              {activeStation && (
                <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded-md border bg-blue-50 border-blue-100 text-blue-600">
                  {activeStation.code}
                </span>
              )}
            </div>
            <p className={`${menuSubTextClass} text-[10px] font-semibold truncate max-w-[200px]`} title={user?.role === 'admin' ? 'Administrator Portal' : (activeStation ? `📍 ${activeStation.name}` : 'Smart Railway Navigation & Passenger Guidance')}>
              {user?.role === 'admin' ? 'Administrator Portal' : (activeStation ? `📍 ${activeStation.name}` : 'Smart Railway Navigation & Passenger Guidance')}
            </p>
          </div>
        </div>
      </div>

      {/* CENTER SECTION: Search Bar */}
      <div className="flex-1 max-w-sm md:max-w-md mx-4 relative hidden md:block" id="global-search-container">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
          <Search size={15} />
        </div>
        <input
          type="text"
          value={searchVal}
          onChange={handleSearchChange}
          placeholder="Search station or facility (e.g. Toilet, Food, ATM)..."
          className={inputClass}
          id="global-search-input"
        />
      </div>

      {/* RIGHT SECTION: QR Scanner Icon | Notifications | Profile */}
      <div className="flex items-center space-x-2.5" id="utility-panel">
        
        {/* QR Scanner Icon with Tooltip */}
        <button
          onClick={() => setActiveTab('qr-scanner')}
          className={btnSecondaryClass}
          title="QR Scanner"
          id="header-qr-scanner-trigger"
        >
          <QrCode size={16} />
        </button>

        {/* Notifications */}
        <div className="relative" id="notifications-menu">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`${btnSecondaryClass} relative cursor-pointer`}
            id="notifications-trigger"
            title="Station Alerts & Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white font-bold text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-45" onClick={() => setShowNotifications(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`absolute right-0 mt-2.5 w-80 rounded-2xl shadow-2xl py-3.5 z-50 border ${
                    lightMode 
                      ? "bg-white border-slate-200 text-slate-800" 
                      : "bg-[#0e172e] border-[#1e2d52] text-slate-100"
                  }`} 
                  id="notifications-dropdown"
                >
                  <div className="px-4 pb-3 border-b border-slate-100 dark:border-[#1e2d52]/50 flex items-center justify-between">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Live Station Alerts</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead} 
                        className="text-[10px] text-blue-500 hover:text-blue-600 font-bold transition-all cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-[#1e2d52]/30">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No active station alerts. Safe travels!
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-3.5 transition-all text-xs flex space-x-3 relative group ${
                            n.read 
                              ? 'opacity-60' 
                              : lightMode 
                                ? 'bg-blue-50/30' 
                                : 'bg-blue-950/10'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {n.type === 'warning' ? (
                              <AlertTriangle size={14} className="text-amber-500" />
                            ) : n.type === 'success' ? (
                              <CheckCircle size={14} className="text-emerald-500" />
                            ) : (
                              <Info size={14} className="text-blue-400" />
                            )}
                          </div>
                          <div className="flex-1 space-y-0.5 pr-8">
                            <div className="flex items-center justify-between">
                              <span className={`font-bold leading-tight ${lightMode ? 'text-slate-800' : 'text-slate-200'}`}>{n.title}</span>
                              <span className="text-[9px] text-slate-500 font-medium">{n.time}</span>
                            </div>
                            <p className={`text-[11px] leading-relaxed ${lightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                              {n.message}
                            </p>
                          </div>

                          {/* Action buttons on hover/select */}
                          <div className="absolute right-2 top-2.5 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => toggleRead(n.id, e)} 
                              title={n.read ? "Mark as unread" : "Mark as read"}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                            >
                              <Check size={11} />
                            </button>
                            <button 
                              onClick={(e) => removeNotification(n.id, e)} 
                              title="Dismiss Alert"
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-red-500 hover:text-red-400 transition-all cursor-pointer"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Account Menu */}
        <div className="relative" id="user-profile-menu">
          {user ? (
            <div
              className={`flex items-center space-x-2 border p-1 rounded-full cursor-pointer hover:border-blue-500 transition-all select-none ${
                lightMode 
                  ? "bg-slate-150 border-slate-200" 
                  : "bg-[#111e3f]/80 border-[#1e2d52]"
              }`}
              onClick={() => setShowUserMenu(!showUserMenu)}
              id="user-profile-trigger"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black uppercase shadow-sm">
                {user.name.charAt(0)}
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-white text-xs font-bold">
              ?
            </div>
          )}

          {/* User Dropdown List */}
          <AnimatePresence>
            {user && showUserMenu && (
              <>
                <div className="fixed inset-0 z-45" onClick={() => setShowUserMenu(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`absolute right-0 mt-2.5 w-48 rounded-2xl shadow-2xl py-2 z-50 text-xs border ${
                    lightMode 
                      ? "bg-white border-slate-200 text-slate-800" 
                      : "bg-[#0e172e] border-[#1e2d52] text-slate-100"
                  }`} 
                  id="user-dropdown"
                >
                  <div className={`px-4 py-2.5 border-b text-[10px] font-medium ${lightMode ? 'border-slate-100 text-slate-500' : 'border-[#1e2d52]/50 text-slate-400'}`}>
                    Logged in as <strong className={`${lightMode ? 'text-slate-800' : 'text-slate-200'} block truncate font-bold mt-0.5`}>{user.email}</strong>
                  </div>
                  <button
                    onClick={() => {
                      setAccessibilityMode(!accessibilityMode);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 flex items-center space-x-2 transition-all cursor-pointer font-medium ${
                      lightMode ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 hover:bg-[#111e3f]'
                    }`}
                  >
                    <Eye size={13} />
                    <span>Accessibility Mode: {accessibilityMode ? 'ON' : 'OFF'}</span>
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-red-500 hover:bg-red-500/5 flex items-center space-x-2 transition-all font-bold cursor-pointer border-t ${
                      lightMode ? 'border-slate-100' : 'border-[#1e2d52]/50'
                    }`}
                  >
                    <UserIcon size={13} />
                    <span>Logout</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
