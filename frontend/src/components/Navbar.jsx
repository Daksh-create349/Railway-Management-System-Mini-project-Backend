import React from 'react';
import { 
  Train, 
  Search, 
  Activity, 
  Ticket, 
  LayoutDashboard, 
  MapPin, 
  Bell, 
  Sparkles, 
  LogIn, 
  LogOut,
  Radio,
  CheckCircle,
  Users
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  notifications, 
  onOpenNotifications, 
  onOpenAuth, 
  onLogout,
  onQuickSimulate,
  simulating
}) {
  const role = currentUser?.role || 'passenger';

  let navItems = [];
  if (role === 'passenger') {
    navItems = [
      { id: 'search', label: 'Search & Book', icon: Search },
      { id: 'my-journeys', label: 'My Journeys', icon: Ticket },
      { id: 'pnr', label: 'PNR Tracker', icon: CheckCircle },
      { id: 'tracking', label: 'Live Status', icon: Activity },
    ];
  } else if (role === 'staff') {
    navItems = [
      { id: 'staff-ops', label: 'Operations Desk', icon: Radio },
      { id: 'tracking', label: 'Fleet Telemetry', icon: Activity },
      { id: 'stations', label: 'Station Hubs', icon: MapPin },
    ];
  } else {
    // admin
    navItems = [
      { id: 'admin', label: 'Executive Analytics', icon: LayoutDashboard },
      { id: 'search', label: 'Fleet & Bookings', icon: Search },
      { id: 'tracking', label: 'Live Telemetry', icon: Activity },
      { id: 'stations', label: 'Stations Hub', icon: MapPin },
    ];
  }

  const defaultLanding = role === 'admin' ? 'admin' : role === 'staff' ? 'staff-ops' : 'search';

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand Logo */}
        <div className="navbar-brand" onClick={() => setActiveTab(defaultLanding)}>
          <div className="brand-icon">
            <Train size={22} className="brand-svg" />
          </div>
          <div className="brand-info">
            <div className="brand-title">
              <span>Smart</span>Rail
            </div>
            <span className="brand-tag">
              {role === 'admin' ? 'ADMIN CONSOLE' : role === 'staff' ? 'STAFF DISPATCH' : 'PASSENGER PORTAL'}
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="navbar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="navbar-actions">
          {/* Notifications Bell */}
          <button 
            className="action-btn icon-only-btn" 
            onClick={onOpenNotifications}
            title="View Live Broadcast Notifications"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="notif-badge">{notifications.length}</span>
            )}
          </button>

          {/* User Profile / Auth Pill */}
          {currentUser ? (
            <div className="user-profile-pill" onClick={onOpenAuth} style={{ cursor: 'pointer' }} title="Click to switch role or account">
              <div className="user-avatar">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-text">
                <span className="user-name">{currentUser.name || 'User'}</span>
                <span className={`user-role-badge role-${role}`}>
                  {role}
                </span>
              </div>
              <button 
                className="logout-mini-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  onLogout();
                }} 
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button className="action-btn login-btn" onClick={onOpenAuth}>
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
