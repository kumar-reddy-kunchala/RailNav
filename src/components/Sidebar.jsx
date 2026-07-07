import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Compass,
  History,
  AlertTriangle,
  Accessibility as AccessIcon,
  MessageSquare,
  Settings,
  LogOut,
  Train,
  BarChart3,
  ShieldAlert,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  accessibilityMode,
  isOpen = false,
  onClose,
  isCollapsed = false,
  setIsCollapsed
}) {
  const lightMode = true; // Forced Light Mode Only

  const basePassengerItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stations', label: 'Stations', icon: Train },
    { id: 'facilities', label: 'Facilities', icon: MapPin },
    { id: 'navigation', label: 'Navigation', icon: Compass },
    { id: 'my-trips', label: 'My Trips', icon: History },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'accessibility', label: 'Accessibility', icon: AccessIcon },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const menuItems = user?.role === 'admin'
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'stations', label: 'Manage Stations', icon: Train },
        { id: 'facilities', label: 'Manage Facilities', icon: MapPin },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'feedback', label: 'Feedback Logs', icon: MessageSquare },
        { id: 'settings', label: 'System Settings', icon: Settings },
      ]
    : basePassengerItems.filter(item => {
        if (item.id === 'stations' && user?.role === 'passenger') {
          return false;
        }
        return true;
      });

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (onClose) {
      onClose();
    }
  };

  const baseBgClass = accessibilityMode
    ? 'bg-black border border-yellow-400 text-yellow-300'
    : 'bg-white border border-slate-200/80 text-slate-800 shadow-lg shadow-slate-100/40';

  const itemInactiveClass = accessibilityMode
    ? "text-yellow-600 hover:text-yellow-300 hover:bg-yellow-950/20"
    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/80";

  const itemActiveClass = accessibilityMode
    ? "bg-yellow-400 text-black font-extrabold border border-yellow-400 shadow-md"
    : "bg-gradient-to-r from-blue-50 to-indigo-50/80 text-blue-600 border border-blue-100 shadow-xs";

  return (
    <>
      {/* Mobile Sidebar backdrop overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity duration-300 top-16 backdrop-blur-xs"
          id="mobile-sidebar-backdrop"
        />
      )}

      <div className="relative z-35" id="sidebar-outer-wrapper">
        <motion.aside
          animate={{ 
            width: isCollapsed ? 76 : 256,
            x: isOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768 ? -300 : 0)
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className={`
            ${baseBgClass}
            flex flex-col justify-between
            h-[calc(100vh-6rem)]
            my-4 ml-4 mr-0
            rounded-2xl
            overflow-y-auto
            overflow-x-visible
            fixed md:sticky
            top-20
            z-35 md:z-auto
          `}
          id="app-sidebar"
          style={{ scrollbarWidth: 'none' }}
        >
          {/* Top section with Navigation Items */}
          <div className="flex flex-col pt-5" id="sidebar-top-container">
            {/* Navigation List */}
            <div className="px-3 pb-3 space-y-1.5" id="sidebar-nav-container">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isAdmin = user?.role === 'admin';
                const showItemIcon = !isAdmin || isCollapsed;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center relative rounded-xl text-xs transition-all duration-200 cursor-pointer overflow-hidden ${
                      isCollapsed 
                        ? 'px-2 py-3 justify-center' 
                        : (isAdmin ? 'px-4 py-3 justify-start' : 'px-3 py-2.5 space-x-3')
                    } ${isActive ? itemActiveClass : itemInactiveClass}`}
                    id={`sidebar-item-${item.id}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {/* Active left bar indicator */}
                    {isActive && !accessibilityMode && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-md bg-blue-500"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                    
                    {showItemIcon && (
                      <div className={`p-1.5 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-blue-100/50 text-blue-600'
                          : 'text-inherit opacity-80'
                      }`}>
                        <Icon size={15} className="shrink-0" />
                      </div>
                    )}

                    {!isCollapsed && (
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`truncate font-sans tracking-wide ${isActive ? 'font-black' : 'font-semibold'}`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </button>
                );
              })}

              {/* Logout Button */}
              {user && (
                <button
                  onClick={() => {
                    onLogout();
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all duration-200 cursor-pointer ${
                    isCollapsed 
                      ? 'px-2 py-3 justify-center' 
                      : (user?.role === 'admin' ? 'px-4 py-3 justify-start' : 'px-3 py-2.5 space-x-3')
                  }`}
                  id="sidebar-item-logout"
                  title={isCollapsed ? "Logout" : undefined}
                >
                  {(user?.role !== 'admin' || isCollapsed) && (
                    <div className="p-1.5 rounded-lg text-red-500">
                      <LogOut size={15} className="shrink-0" />
                    </div>
                  )}
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className="font-sans tracking-wide"
                    >
                      Logout
                    </motion.span>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.aside>

        {/* Floating Collapse Toggle Button on the RIGHT EDGE of the sidebar */}
        <button
          onClick={() => {
            if (setIsCollapsed) setIsCollapsed(!isCollapsed);
          }}
          className="absolute top-6 -right-3 z-50 hidden md:flex items-center justify-center w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-blue-600 shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-110 active:scale-95"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          id="sidebar-collapse-edge-toggle"
        >
          {isCollapsed ? <ChevronsRight size={13} /> : <ChevronsLeft size={13} />}
        </button>
      </div>
    </>
  );
}
