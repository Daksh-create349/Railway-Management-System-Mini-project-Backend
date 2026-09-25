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
          <h2 className="section-title">Train Fleet Live Status & Dispatch Board</h2>
          <p className="section-subtitle">
            Real-time track events, station departures, and delay warnings broadcast instantly to all passenger devices.
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
                  <div className="controls-label" style={{ fontWeight: 600, fontSize: '12px', marginBottom: '8px', color: 'var(--text-dim)' }}>
                    Manual Status Dispatch:
                  </div>

                  <div className="quick-buttons-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    <button
                      className={`btn-pill-sm ${train.status === 'On Time' ? 'active-pill' : ''}`}
                      onClick={() => {
                        api.updateTrainStatus(train._id, 'On Time').then(() => {
                          fetchTrains();
                          if (onSimulationTriggered) onSimulationTriggered();
                        });
                      }}
                    >
                      On Time
                    </button>
                    <button
                      className={`btn-pill-sm ${train.status === 'Running' ? 'active-pill' : ''}`}
                      onClick={() => {
                        api.updateTrainStatus(train._id, 'Running').then(() => {
                          fetchTrains();
                          if (onSimulationTriggered) onSimulationTriggered();
                        });
                      }}
                    >
                      Running
                    </button>
                    <button
                      className={`btn-pill-sm ${train.status?.includes('15 mins') ? 'active-pill' : ''}`}
                      onClick={() => {
                        api.updateTrainStatus(train._id, 'Delayed by 15 mins').then(() => {
                          fetchTrains();
                          if (onSimulationTriggered) onSimulationTriggered();
                        });
                      }}
                    >
                      +15m Delay
                    </button>
                    <button
                      className={`btn-pill-sm ${train.status?.includes('30 mins') ? 'active-pill' : ''}`}
                      onClick={() => {
                        api.updateTrainStatus(train._id, 'Delayed by 30 mins').then(() => {
                          fetchTrains();
                          if (onSimulationTriggered) onSimulationTriggered();
                        });
                      }}
                    >
                      +30m Delay
                    </button>
                    <button
                      className={`btn-pill-sm ${train.status?.includes('Departed') ? 'active-pill' : ''}`}
                      onClick={() => {
                        api.updateTrainStatus(train._id, 'Departed from Station').then(() => {
                          fetchTrains();
                          if (onSimulationTriggered) onSimulationTriggered();
                        });
                      }}
                    >
                      Departed
                    </button>
                    <button
                      className={`btn-pill-sm ${train.status?.includes('Arrived') ? 'active-pill' : ''}`}
                      onClick={() => {
                        api.updateTrainStatus(train._id, 'Arrived at Destination').then(() => {
                          fetchTrains();
                          if (onSimulationTriggered) onSimulationTriggered();
                        });
                      }}
                    >
                      Arrived
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
