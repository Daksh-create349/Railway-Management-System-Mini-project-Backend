import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Users, 
  Train, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  MapPin, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Check
} from 'lucide-react';
import { api } from '../services/api';

export default function StaffDashboard({ onSimulationTriggered }) {
  const [trains, setTrains] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('trains'); // 'trains' or 'manifest'
  const [passengerSearch, setPassengerSearch] = useState('');
  const [simulatingId, setSimulatingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [trainsData, passData] = await Promise.all([
        api.getTrains().catch(() => []),
        api.getPassengers({ search: passengerSearch }).catch(() => [])
      ]);
      setTrains(Array.isArray(trainsData) ? trainsData : []);
      setPassengers(Array.isArray(passData) ? passData : []);
    } catch (err) {
      console.error('Error fetching staff data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [passengerSearch]);

  const handleUpdateStatus = async (trainId, newStatus) => {
    setUpdatingId(trainId);
    try {
      await api.updateTrainStatus(trainId, newStatus);
      await fetchData();
      if (onSimulationTriggered) onSimulationTriggered();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSimulate = async (trainId) => {
    setSimulatingId(trainId);
    try {
      await api.simulateTrainStatus(trainId);
      await fetchData();
      if (onSimulationTriggered) onSimulationTriggered();
    } catch (err) {
      alert(err.message || 'Simulation error');
    } finally {
      setSimulatingId(null);
    }
  };

  return (
    <div className="staff-portal-container">
      {/* Top Banner */}
      <div className="staff-hero-banner">
        <div>
          <div className="staff-tag-badge">
            <Radio size={14} className="text-teal" />
            <span>STATION STAFF & TTE DISPATCH DESK</span>
          </div>
          <h2>Fleet Dispatch & Passenger Manifest</h2>
          <p>Update real-time train running telemetry, announce delays, and inspect passenger boarding manifests.</p>
        </div>

        <button className="btn btn-outline btn-sm" onClick={fetchData} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
          <span>Sync Operations</span>
        </button>
      </div>

      {/* Staff Tab Switcher */}
      <div className="staff-subnav">
        <button 
          className={`staff-nav-btn ${activeTab === 'trains' ? 'active' : ''}`}
          onClick={() => setActiveTab('trains')}
        >
          <Train size={16} />
          <span>Fleet Operations & Delay Control ({trains.length})</span>
        </button>

        <button 
          className={`staff-nav-btn ${activeTab === 'manifest' ? 'active' : ''}`}
          onClick={() => setActiveTab('manifest')}
        >
          <Users size={16} />
          <span>Passenger Boarding Manifest ({passengers.length})</span>
        </button>
      </div>

      {/* View 1: Fleet Operations & Delay Control */}
      {activeTab === 'trains' && (
        <div className="staff-fleet-section">
          {trains.length === 0 ? (
            <div className="empty-state-card">
              <Train size={36} className="empty-icon" />
              <p>No active fleet trains found on the network.</p>
            </div>
          ) : (
            <div className="staff-trains-grid">
              {trains.map((train) => {
                const isSimulating = simulatingId === train._id;
                const isUpdating = updatingId === train._id;
                const currentStatus = train.status || 'Running';

                return (
                  <div key={train._id} className="staff-train-card">
                    <div className="st-card-top">
                      <div>
                        <h4 className="st-train-name">{train.trainName}</h4>
                        <span className="st-train-no">#{train.trainNumber} • {train.source} ➜ {train.destination}</span>
                      </div>
                      <span className={`status-pill status-${currentStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                        <span className="status-dot" />
                        {currentStatus}
                      </span>
                    </div>

                    <div className="st-quick-actions">
                      <span className="quick-action-label">Quick Dispatch Actions:</span>
                      <div className="quick-buttons-row">
                        <button
                          className={`btn-pill-sm ${currentStatus === 'On Time' ? 'active-pill' : ''}`}
                          onClick={() => handleUpdateStatus(train._id, 'On Time')}
                          disabled={isUpdating}
                        >
                          On Time
                        </button>
                        <button
                          className={`btn-pill-sm ${currentStatus.includes('15 mins') ? 'active-pill' : ''}`}
                          onClick={() => handleUpdateStatus(train._id, 'Delayed by 15 mins')}
                          disabled={isUpdating}
                        >
                          +15m Delay
                        </button>
                        <button
                          className={`btn-pill-sm ${currentStatus.includes('45 mins') ? 'active-pill' : ''}`}
                          onClick={() => handleUpdateStatus(train._id, 'Delayed by 45 mins')}
                          disabled={isUpdating}
                        >
                          +45m Delay
                        </button>
                        <button
                          className={`btn-pill-sm ${currentStatus.includes('Departed') ? 'active-pill' : ''}`}
                          onClick={() => handleUpdateStatus(train._id, 'Departed from Station')}
                          disabled={isUpdating}
                        >
                          Departed
                        </button>
                        <button
                          className={`btn-pill-sm ${currentStatus.includes('Arrived') ? 'active-pill' : ''}`}
                          onClick={() => handleUpdateStatus(train._id, 'Arrived at Destination')}
                          disabled={isUpdating}
                        >
                          Arrived
                        </button>
                      </div>

                      <button
                        className="btn btn-primary btn-sm btn-block mt-3"
                        onClick={() => handleSimulate(train._id)}
                        disabled={isSimulating}
                      >
                        <Sparkles size={14} className={isSimulating ? 'spin-icon' : ''} />
                        <span>{isSimulating ? 'Simulating & Broadcasting...' : 'Randomize Simulation Event'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* View 2: Passenger Manifest */}
      {activeTab === 'manifest' && (
        <div className="staff-manifest-section">
          <div className="table-search-bar mb-4">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search passenger by name, email, or phone number..."
              value={passengerSearch}
              onChange={(e) => setPassengerSearch(e.target.value)}
            />
          </div>

          <div className="table-card">
            <div className="table-responsive">
              <table className="preclinic-table">
                <thead>
                  <tr>
                    <th>Passenger Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Age & Gender</th>
                    <th>Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {passengers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-muted">
                        No registered passengers matching search.
                      </td>
                    </tr>
                  ) : (
                    passengers.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <div className="table-user-cell">
                            <div className="table-user-avatar">
                              {p.name ? p.name.charAt(0) : 'P'}
                            </div>
                            <strong className="user-primary-name">{p.name || 'Passenger'}</strong>
                          </div>
                        </td>
                        <td>{p.email || 'N/A'}</td>
                        <td>
                          <span className="font-mono">{p.phone || '9876543210'}</span>
                        </td>
                        <td>
                          <span>{p.age || '25'} yrs, {p.gender || 'Male'}</span>
                        </td>
                        <td>
                          <span className="status-pill status-confirmed">
                            <Check size={11} /> Verified
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
