import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Train, 
  Clock, 
  ShieldCheck, 
  Zap, 
  RefreshCw,
  PlusCircle,
  Users
} from 'lucide-react';
import { api } from '../services/api';
import BookingModal from './BookingModal';

export default function TrainSearch({ currentUser, onBookingSuccess }) {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    source: '',
    destination: '',
    search: '',
  });

  const [selectedTrain, setSelectedTrain] = useState(null);
  const [seeding, setSeeding] = useState(false);

  const fetchTrains = async () => {
    setLoading(true);
    try {
      const data = await api.getTrains(searchParams);
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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTrains();
  };

  const seedSampleFleet = async () => {
    setSeeding(true);
    try {
      const sampleFleet = [
        {
          trainNumber: '12952',
          trainName: 'Mumbai Rajdhani Express',
          source: 'NDLS',
          destination: 'BCT',
          totalSeats: 60,
          availableSeats: 48,
          status: 'Running'
        },
        {
          trainNumber: '12004',
          trainName: 'Lucknow Swarna Shatabdi',
          source: 'NDLS',
          destination: 'LKO',
          totalSeats: 50,
          availableSeats: 32,
          status: 'Running'
        },
        {
          trainNumber: '22436',
          trainName: 'Vande Bharat Express',
          source: 'NDLS',
          destination: 'BSB',
          totalSeats: 80,
          availableSeats: 15,
          status: 'Running'
        },
        {
          trainNumber: '12302',
          trainName: 'Howrah Rajdhani',
          source: 'NDLS',
          destination: 'HWH',
          totalSeats: 70,
          availableSeats: 54,
          status: 'Running'
        }
      ];

      for (const t of sampleFleet) {
        await api.createTrain(t).catch(() => null);
      }
      await fetchTrains();
    } catch (err) {
      console.error('Failed to seed:', err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="search-landing-container">
      {/* Hero Banner */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={14} className="badge-zap" />
            <span>Smart Railway Operations & Booking Engine</span>
          </div>
          <h1 className="hero-heading">
            Seamless Train Travel & <br />
            <span>Real-Time Fleet Intelligence</span>
          </h1>
          <p className="hero-subtext">
            Search trains across stations, view live seat matrix with automated refund protection, 
            and track journey statuses through our centralized telemetry platform.
          </p>
        </div>

        {/* Floating Search Bar */}
        <div className="search-card-wrapper">
          <form onSubmit={handleSearch} className="search-card">
            <div className="search-input-group">
              <label><MapPin size={15} /> Origin Station</label>
              <input
                type="text"
                placeholder="e.g. NDLS (Delhi)"
                value={searchParams.source}
                onChange={(e) => setSearchParams({ ...searchParams, source: e.target.value })}
              />
            </div>

            <div className="search-divider-icon">
              <ArrowRight size={16} />
            </div>

            <div className="search-input-group">
              <label><MapPin size={15} /> Destination</label>
              <input
                type="text"
                placeholder="e.g. BCT (Mumbai)"
                value={searchParams.destination}
                onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
              />
            </div>

            <div className="search-input-group">
              <label><Search size={15} /> Train Name / No.</label>
              <input
                type="text"
                placeholder="e.g. 12952 or Rajdhani"
                value={searchParams.search}
                onChange={(e) => setSearchParams({ ...searchParams, search: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary search-submit-btn">
              <Search size={18} />
              <span>Search Trains</span>
            </button>
          </form>
        </div>
      </section>

      {/* Available Trains Section */}
      <section className="trains-results-section">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Available Schedules & Seat Telemetry</h2>
            <p className="section-subtitle">Real-time seat quotas updated directly from the operational database</p>
          </div>

          <div className="header-actions">
            <button 
              className="btn btn-outline btn-sm"
              onClick={fetchTrains}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
              <span>Refresh</span>
            </button>
            {trains.length === 0 && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={seedSampleFleet}
                disabled={seeding}
              >
                <PlusCircle size={14} />
                <span>{seeding ? 'Adding...' : 'Load Demo Fleet'}</span>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <RefreshCw size={28} className="spin-icon" />
            <p>Querying real-time train availability...</p>
          </div>
        ) : trains.length === 0 ? (
          <div className="empty-state-card">
            <Train size={42} className="empty-icon" />
            <h3>No Trains Matching Your Query</h3>
            <p>Try searching for "NDLS" or load our pre-configured fleet to test booking instantly.</p>
            <button className="btn btn-primary" onClick={seedSampleFleet}>
              Load Demo Trains
            </button>
          </div>
        ) : (
          <div className="trains-grid">
            {trains.map((train) => {
              const total = train.totalSeats || 50;
              const avail = train.availableSeats ?? 50;
              const occupancy = Math.round(((total - avail) / total) * 100);

              return (
                <div key={train._id} className="train-card">
                  {/* Top card info */}
                  <div className="train-card-top">
                    <div className="train-identity">
                      <div className="train-icon-avatar">
                        <Train size={20} />
                      </div>
                      <div>
                        <h4 className="train-name">{train.trainName}</h4>
                        <span className="train-number">#{train.trainNumber}</span>
                      </div>
                    </div>

                    <span className={`status-pill status-${(train.status || 'Running').toLowerCase().replace(/\s+/g, '-')}`}>
                      <span className="status-dot" />
                      {train.status || 'Running'}
                    </span>
                  </div>

                  {/* Route Timeline */}
                  <div className="route-timeline">
                    <div className="route-point">
                      <span className="point-code">{train.source || 'NDLS'}</span>
                      <span className="point-sub">Origin</span>
                    </div>
                    <div className="route-line">
                      <div className="line-bar" />
                      <ArrowRight size={14} className="line-arrow" />
                    </div>
                    <div className="route-point text-right">
                      <span className="point-code">{train.destination || 'BCT'}</span>
                      <span className="point-sub">Destination</span>
                    </div>
                  </div>

                  {/* Seat Availability Bar */}
                  <div className="seat-quota-container">
                    <div className="seat-quota-header">
                      <span className="quota-label">
                        <Users size={13} /> Available Quota
                      </span>
                      <span className={`quota-numbers ${avail <= 10 ? 'text-danger' : 'text-success'}`}>
                        <strong>{avail}</strong> / {total} Seats
                      </span>
                    </div>
                    <div className="quota-progress-track">
                      <div 
                        className={`quota-progress-fill ${avail <= 10 ? 'fill-danger' : 'fill-primary'}`}
                        style={{ width: `${100 - occupancy}%` }}
                      />
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="train-card-footer">
                    <div className="fare-box">
                      <span className="fare-sub">Standard Fare</span>
                      <span className="fare-amount">₹1,500</span>
                    </div>

                    <button
                      className="btn btn-primary btn-book"
                      disabled={avail <= 0}
                      onClick={() => setSelectedTrain(train)}
                    >
                      {avail <= 0 ? 'Waitlist Only' : 'Reserve Seat'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Booking Modal */}
      {selectedTrain && (
        <BookingModal
          train={selectedTrain}
          currentUser={currentUser}
          onClose={() => setSelectedTrain(null)}
          onBookingSuccess={() => {
            fetchTrains();
            if (onBookingSuccess) onBookingSuccess();
          }}
        />
      )}
    </div>
  );
}
