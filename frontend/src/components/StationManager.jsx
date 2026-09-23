import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Search, Building2, Globe, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function StationManager() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newStation, setNewStation] = useState({
    stationCode: '',
    stationName: '',
    city: '',
    state: ''
  });

  const fetchStations = async () => {
    setLoading(true);
    try {
      const data = await api.getStations({ search });
      setStations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching stations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, [search]);

  const handleCreateStation = async (e) => {
    e.preventDefault();
    try {
      await api.createStation(newStation);
      setModalOpen(false);
      setNewStation({ stationCode: '', stationName: '', city: '', state: '' });
      fetchStations();
    } catch (err) {
      alert(err.message || 'Failed to create station');
    }
  };

  const seedSampleStations = async () => {
    const list = [
      { stationCode: 'NDLS', stationName: 'New Delhi Railway Station', city: 'New Delhi', state: 'Delhi' },
      { stationCode: 'BCT', stationName: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
      { stationCode: 'LKO', stationName: 'Lucknow Charbagh', city: 'Lucknow', state: 'Uttar Pradesh' },
      { stationCode: 'BSB', stationName: 'Varanasi Junction', city: 'Varanasi', state: 'Uttar Pradesh' },
      { stationCode: 'HWH', stationName: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal' }
    ];

    for (const s of list) {
      await api.createStation(s).catch(() => null);
    }
    fetchStations();
  };

  return (
    <div className="stations-container">
      {/* Top Header */}
      <div className="dashboard-top-bar">
        <div>
          <h2 className="dashboard-main-heading">Railway Station Directory</h2>
          <p className="dashboard-subtext">Manage operational junctions, terminal codes, and geographic hubs</p>
        </div>

        <div className="dashboard-actions-right">
          {stations.length === 0 && (
            <button className="btn btn-secondary btn-sm" onClick={seedSampleStations}>
              Load Major Junctions
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>
            <Plus size={15} />
            <span>Add Station</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="table-search-bar">
        <Search size={16} />
        <input
          type="text"
          placeholder="Filter by station name, code or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Stations Grid */}
      {loading ? (
        <div className="loading-state">
          <RefreshCw size={24} className="spin-icon" />
          <p>Querying station database...</p>
        </div>
      ) : stations.length === 0 ? (
        <div className="empty-state-card">
          <Building2 size={36} className="empty-icon" />
          <p>No stations registered yet. Click below to initialize major railway hubs.</p>
          <button className="btn btn-primary" onClick={seedSampleStations}>
            Load Major Junctions
          </button>
        </div>
      ) : (
        <div className="stations-grid">
          {stations.map((st) => (
            <div key={st._id} className="station-card">
              <div className="station-top">
                <span className="station-code-badge">{st.stationCode}</span>
                <span className="station-type-pill">Active Terminal</span>
              </div>
              <h4 className="station-name-text">{st.stationName}</h4>
              <div className="station-location-row">
                <MapPin size={13} className="text-muted" />
                <span>{st.city || 'City'}, {st.state || 'State'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-header-title">
                <MapPin size={20} className="modal-title-icon" />
                <div>
                  <h3>Add Junction Station</h3>
                  <p>Register new geographic station code</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateStation} className="booking-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Station Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CNB"
                    value={newStation.stationCode}
                    onChange={(e) => setNewStation({ ...newStation, stationCode: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="form-group">
                  <label>Station Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kanpur Central"
                    value={newStation.stationName}
                    onChange={(e) => setNewStation({ ...newStation, stationName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kanpur"
                    value={newStation.city}
                    onChange={(e) => setNewStation({ ...newStation, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Uttar Pradesh"
                    value={newStation.state}
                    onChange={(e) => setNewStation({ ...newStation, state: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
