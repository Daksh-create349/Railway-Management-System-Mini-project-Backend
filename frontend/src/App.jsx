import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TrainSearch from './components/TrainSearch';
import LiveStatusBoard from './components/LiveStatusBoard';
import PnrLookup from './components/PnrLookup';
import AdminDashboard from './components/AdminDashboard';
import StationManager from './components/StationManager';
import PassengerDashboard from './components/PassengerDashboard';
import StaffDashboard from './components/StaffDashboard';
import NotificationDrawer from './components/NotificationDrawer';
import AuthModal from './components/AuthModal';
import { api, getStoredToken, getStoredUser, setStoredToken, setStoredUser } from './services/api';
import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser() || {
    name: 'Admin User',
    email: 'admin@railway.com',
    role: 'admin'
  });

  const getInitialTabForRole = (role) => {
    if (role === 'admin') return 'admin';
    if (role === 'staff') return 'staff-ops';
    return 'search';
  };

  const [activeTab, setActiveTab] = useState(() => getInitialTabForRole(currentUser?.role));
  const [notifications, setNotifications] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Initialize Auth demo credentials if no token
  useEffect(() => {
    const initAuth = async () => {
      const existingToken = getStoredToken();
      if (!existingToken) {
        try {
          const res = await api.login({
            email: 'admin@railway.com',
            password: 'password123'
          });
          setStoredToken(res.token);
          const adminUser = { name: 'Admin User', email: 'admin@railway.com', role: 'admin' };
          setStoredUser(adminUser);
          setCurrentUser(adminUser);
          setActiveTab('admin');
        } catch {
          // ignore error
        }
      }
      fetchNotifications();
    };

    initAuth();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch {
      // ignore
    }
  };

  // Poll notifications periodically for real-time live simulation telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      fetchNotifications();
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickSimulate = async () => {
    setSimulating(true);
    try {
      const trains = await api.getTrains();
      if (Array.isArray(trains) && trains.length > 0) {
        const randomTrain = trains[Math.floor(Math.random() * trains.length)];
        await api.simulateTrainStatus(randomTrain._id);
        await fetchNotifications();
        setRefreshKey((k) => k + 1);
        setDrawerOpen(true);
      } else {
        alert('Please create or load demo trains first from Search or Admin view.');
      }
    } catch (err) {
      alert(err.message || 'Simulation error');
    } finally {
      setSimulating(false);
    }
  };

  const handleLogout = () => {
    setStoredToken('');
    setStoredUser(null);
    const guestUser = { name: 'Passenger User', email: 'passenger@railway.com', role: 'passenger' };
    setCurrentUser(guestUser);
    setActiveTab('search');
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setActiveTab(getInitialTabForRole(user?.role));
    fetchNotifications();
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="app-wrapper">
      {/* Top Navbar tailored for current role */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        notifications={notifications}
        onOpenNotifications={() => setDrawerOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onQuickSimulate={handleQuickSimulate}
        simulating={simulating}
      />

      {/* Main Active Page Content */}
      <main className="main-content">
        {/* Passenger Views */}
        {activeTab === 'search' && (
          <TrainSearch
            key={`search-${refreshKey}`}
            currentUser={currentUser}
            onBookingSuccess={() => {
              fetchNotifications();
              setRefreshKey((k) => k + 1);
            }}
          />
        )}

        {activeTab === 'my-journeys' && (
          <PassengerDashboard
            key={`journeys-${refreshKey}`}
            currentUser={currentUser}
            onNavigateSearch={() => setActiveTab('search')}
            onRefreshTrigger={() => {
              fetchNotifications();
              setRefreshKey((k) => k + 1);
            }}
          />
        )}

        {activeTab === 'pnr' && (
          <PnrLookup
            key={`pnr-${refreshKey}`}
            onCancelSuccess={() => {
              fetchNotifications();
              setRefreshKey((k) => k + 1);
            }}
          />
        )}

        {/* Staff Views */}
        {activeTab === 'staff-ops' && (
          <StaffDashboard
            key={`staff-${refreshKey}`}
            onSimulationTriggered={() => {
              fetchNotifications();
              setRefreshKey((k) => k + 1);
            }}
          />
        )}

        {/* Shared / Admin Views */}
        {activeTab === 'tracking' && (
          <LiveStatusBoard
            key={`track-${refreshKey}`}
            onSimulationTriggered={() => {
              fetchNotifications();
              setRefreshKey((k) => k + 1);
            }}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            key={`admin-${refreshKey}`}
            onRefreshTrigger={() => {
              fetchNotifications();
              setRefreshKey((k) => k + 1);
            }}
          />
        )}

        {activeTab === 'stations' && (
          <StationManager key={`stations-${refreshKey}`} />
        )}
      </main>

      {/* Live Alerts Notification Drawer */}
      <NotificationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        notifications={notifications}
      />

      {/* Auth / 1-Click Role Switcher Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
