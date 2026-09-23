import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Sparkles, 
  RefreshCw, 
  Train, 
  Clock, 
  Radio, 
  Bell, 
  MapPin, 
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function LiveStatusBoard({ onSimulationTriggered }) {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [simulatingId, setSimulatingId] = useState(null);
  const [manualStatus, setManualStatus] = useState({});

  const fetchTrains = async () => {
    setLoading(true);
    try {
      const data = await api.getTrains({ page: 1 });
      setTrains(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching trains:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrains();
  }, []);

  const handleSimulate = async (trainId) => {
    setSimulatingId(trainId);
    try {
      await api.simulateTrainStatus(trainId);
      await fetchTrains();
      if (onSimulationTriggered) onSimulationTriggered();
    } catch (err) {
      alert(err.message || 'Simulation failed');
    } finally {
      setSimulatingId(null);
    }
  };

  const handleUpdateStatus = async (trainId) => {
    const status = manualStatus[trainId];
    if (!status) return;

    try {
      await api.updateTrainStatus(trainId, status);
      await fetchTrains();
      if (onSimulationTriggered) onSimulationTriggered();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="live-status-container">
      {/* Header */}
      <div className="section-header-row">
        <div>
          <div className="live-badge-row">
            <span className="live-pulse-dot" />
            <span className="live-label">LIVE TELEMETRY STREAM</span>
          </div>
          <h2 className="section-title">Train Status Simulation & Operational Center</h2>
          <p className="section-subtitle">
            Simulate real-time track events, station departures, and delay warnings that auto-broadcast to all passenger devices.
          </p>
        </div>

        <button 
          className="btn btn-outline btn-sm" 
          onClick={fetchTrains}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
          <span>Refresh Fleet</span>
        </button>
      </div>

      {/* Fleet Live Table/Cards */}
      {trains.length === 0 ? (
        <div className="empty-state-card">
          <Train size={36} className="empty-icon" />
          <p>No active trains found in fleet. Please add trains from Search or Admin view.</p>
        </div>
      ) : (
        <div className="live-trains-grid">
          {trains.map((train) => {
            const isSimulating = simulatingId === train._id;
            const statusType = (train.status || 'Running').toLowerCase();

            return (
              <div key={train._id} className="live-train-card">
                <div className="live-card-top">
                  <div className="live-train-info">
                    <div className="live-train-icon">
                      <Radio size={18} className="live-radio-icon" />
                    </div>
                    <div>
                      <h4>{train.trainName}</h4>
                      <span className="train-id-sub">Train No: {train.trainNumber}</span>
                    </div>
                  </div>

                  <span className={`status-pill status-${statusType.replace(/\s+/g, '-')}`}>
                    <span className="status-dot" />
                    {train.status || 'Running'}
                  </span>
                </div>

                {/* Route */}
                <div className="live-route-box">
                  <div className="live-station-node">
                    <MapPin size={14} />
                    <span>{train.source || 'NDLS'}</span>
                  </div>
                  <div className="live-route-arrow">
                    <div className="arrow-track" />
                    <Train size={14} className="track-train-icon" />
                  </div>
                  <div className="live-station-node">
                    <MapPin size={14} />
                    <span>{train.destination || 'BCT'}</span>
                  </div>
                </div>

                {/* Status Controls */}
                <div className="live-controls-section">
                  <div className="controls-label">
                    <Sparkles size={13} /> Automated Event Simulation
                  </div>

                  <div className="simulation-actions">
                    <button
                      className="btn btn-primary btn-sm btn-simulate"
                      onClick={() => handleSimulate(train._id)}
                      disabled={isSimulating}
                    >
                      <Sparkles size={14} className={isSimulating ? 'spin-icon' : ''} />
                      <span>{isSimulating ? 'Broadcasting...' : 'Simulate Live Status'}</span>
                    </button>
                  </div>

                  {/* Manual Quick Override */}
                  <div className="manual-override-row">
                    <select
                      className="status-select-sm"
                      value={manualStatus[train._id] || ''}
                      onChange={(e) =>
                        setManualStatus({ ...manualStatus, [train._id]: e.target.value })
                      }
                    >
                      <option value="">Manual status update...</option>
                      <option value="On Time">On Time</option>
                      <option value="Delayed by 15 mins">Delayed by 15 mins</option>
                      <option value="Delayed by 45 mins">Delayed by 45 mins</option>
                      <option value="Departed from Origin">Departed from Origin</option>
                      <option value="Arrived at Destination">Arrived at Destination</option>
                    </select>

                    <button
                      className="btn btn-outline btn-sm"
                      disabled={!manualStatus[train._id]}
                      onClick={() => handleUpdateStatus(train._id)}
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
