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
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('trains'); // 'trains' or 'manifest'
  const [selectedTrainId, setSelectedTrainId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [simulatingId, setSimulatingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [trainsData, bookingsData] = await Promise.all([
        api.getTrains().catch(() => []),
        api.getAllBookings(1, { 
          trainId: selectedTrainId !== 'ALL' ? selectedTrainId : undefined,
          limit: 100 
        }).catch(() => [])
      ]);
      setTrains(Array.isArray(trainsData) ? trainsData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (err) {
      console.error('Error fetching staff data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTrainId]);

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
          <span>Passenger Boarding Manifest ({bookings.length})</span>
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

      {/* View 2: Passenger Manifest (Train-Specific Reservation Chart) */}
      {activeTab === 'manifest' && (
        <div className="staff-manifest-section">
          {/* Controls: Train Chart Selector + Passenger Search */}
          <div className="manifest-controls-box mb-4">
            <div className="manifest-select-wrap">
              <label className="manifest-control-label">
                <Train size={14} /> Train Reservation Chart:
              </label>
              <select
                className="manifest-dropdown"
                value={selectedTrainId}
                onChange={(e) => setSelectedTrainId(e.target.value)}
              >
                <option value="ALL">All Trains (Combined Network Manifest)</option>
                {trains.map((t) => (
                  <option key={t._id} value={t._id}>
                    #{t.trainNumber} - {t.trainName} ({t.source} ➜ {t.destination})
                  </option>
                ))}
              </select>
            </div>

            <div className="manifest-search-wrap">
              <label className="manifest-control-label">
                <Search size={14} /> Filter Passenger / PNR:
              </label>
              <div className="table-search-bar">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Filter by passenger name, phone, or PNR..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="table-card">
            <div className="card-header-between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <h3 className="card-title" style={{ fontSize: '16px' }}>
                  {selectedTrainId === 'ALL'
                    ? 'Combined Network Boarding Manifest'
                    : `Official Reservation Chart: ${trains.find(t => t._id === selectedTrainId)?.trainName || 'Train'} (#${trains.find(t => t._id === selectedTrainId)?.trainNumber || ''})`}
                </h3>
                <p className="card-subtitle">
                  {selectedTrainId === 'ALL'
                    ? 'Aggregated list of all ticket holders across the railway network'
                    : `Passengers verified for boarding on ${trains.find(t => t._id === selectedTrainId)?.source} ➜ ${trains.find(t => t._id === selectedTrainId)?.destination}`}
                </p>
              </div>
              <span className="table-count-badge">
                {bookings.filter((b) => {
                  if (!searchQuery) return true;
                  const q = searchQuery.toLowerCase();
                  const passName = b.passengerId?.name?.toLowerCase() || '';
                  const phone = b.passengerId?.phone?.toLowerCase() || '';
                  const pnr = b.pnr?.toLowerCase() || '';
                  return passName.includes(q) || phone.includes(q) || pnr.includes(q);
                }).length} Passengers
              </span>
            </div>

            <div className="table-responsive">
              <table className="preclinic-table">
                <thead>
                  <tr>
                    <th>Passenger Details</th>
                    <th>Booking PNR</th>
                    <th>Train & Route</th>
                    <th>Allocated Berth</th>
                    <th>Booking Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.filter((b) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    const passName = b.passengerId?.name?.toLowerCase() || '';
                    const phone = b.passengerId?.phone?.toLowerCase() || '';
                    const pnr = b.pnr?.toLowerCase() || '';
                    return passName.includes(q) || phone.includes(q) || pnr.includes(q);
                  }).length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-muted">
                        No passengers found on this train chart. Reserve a seat to populate this train's manifest.
                      </td>
                    </tr>
                  ) : (
                    bookings
                      .filter((b) => {
                        if (!searchQuery) return true;
                        const q = searchQuery.toLowerCase();
                        const passName = b.passengerId?.name?.toLowerCase() || '';
                        const phone = b.passengerId?.phone?.toLowerCase() || '';
                        const pnr = b.pnr?.toLowerCase() || '';
                        return passName.includes(q) || phone.includes(q) || pnr.includes(q);
                      })
                      .map((b) => {
                        const pass = b.passengerId || {};
                        const tr = b.trainId || {};
                        const isCancelled = b.status === 'Cancelled';

                        return (
                          <tr key={b._id}>
                            <td>
                              <div className="table-user-cell">
                                <div className="table-user-avatar">
                                  {pass.name ? pass.name.charAt(0) : 'P'}
                                </div>
                                <div>
                                  <strong className="user-primary-name">{pass.name || 'Primary Passenger'}</strong>
                                  <span className="user-sub-info">
                                    {pass.age || '25'} yrs, {pass.gender || 'Male'} • <span className="font-mono">{pass.phone || 'N/A'}</span>
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="pnr-code-badge font-mono font-bold">{b.pnr}</span>
                            </td>
                            <td>
                              <div>
                                <strong style={{ fontSize: '13px', display: 'block' }}>{tr.trainName || 'Express'} (#{tr.trainNumber || 'Fleet'})</strong>
                                <span className="route-cell-tag" style={{ fontSize: '11px', marginTop: '2px', display: 'inline-block' }}>
                                  {b.source || tr.source} ➜ {b.destination || tr.destination}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="seat-cell-badge font-bold">{b.seatNumber || 'B1-01 (LB)'}</span>
                            </td>
                            <td>
                              <span className={`status-pill status-${(b.status || 'Confirmed').toLowerCase()}`}>
                                <span className="status-dot" />
                                {b.status || 'Confirmed'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
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
