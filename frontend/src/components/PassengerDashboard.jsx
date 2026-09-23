import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Calendar, 
  Train, 
  ArrowRight, 
  CheckCircle, 
  RotateCcw, 
  Clock, 
  MapPin, 
  Search, 
  Copy, 
  Check, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function PassengerDashboard({ currentUser, onNavigateSearch, onRefreshTrigger }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedPnr, setCopiedPnr] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getAllBookings(1);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCopy = (pnr) => {
    navigator.clipboard?.writeText(pnr);
    setCopiedPnr(pnr);
    setTimeout(() => setCopiedPnr(null), 2000);
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this ticket? You will receive an 80% refund credited immediately.')) return;
    setCancellingId(bookingId);
    try {
      await api.cancelBooking(bookingId, 'Passenger cancelled via My Journeys');
      await fetchMyBookings();
      if (onRefreshTrigger) onRefreshTrigger();
    } catch (err) {
      alert(err.message || 'Failed to cancel');
    } finally {
      setCancellingId(null);
    }
  };

  const activeBookings = bookings.filter(b => b.status !== 'Cancelled');
  const cancelledBookings = bookings.filter(b => b.status === 'Cancelled');

  return (
    <div className="passenger-portal-container">
      {/* Welcome Banner */}
      <div className="passenger-hero-card">
        <div className="passenger-hero-info">
          <span className="passenger-role-pill">PASSENGER TRAVEL PORTAL</span>
          <h2>Welcome aboard, {currentUser?.name || 'Traveler'}!</h2>
          <p>Manage your upcoming rail journeys, download digital boarding passes, and track seat allocations.</p>
        </div>
        <button className="btn btn-primary" onClick={onNavigateSearch}>
          <Search size={16} />
          <span>Book New Journey</span>
        </button>
      </div>

      {/* Quick Passenger Stat Cards */}
      <div className="passenger-stats-grid">
        <div className="passenger-stat-box box-active">
          <div className="p-stat-icon">
            <Ticket size={20} />
          </div>
          <div>
            <span className="p-stat-number">{activeBookings.length}</span>
            <span className="p-stat-label">Active Reservations</span>
          </div>
        </div>

        <div className="passenger-stat-box box-completed">
          <div className="p-stat-icon">
            <CheckCircle size={20} />
          </div>
          <div>
            <span className="p-stat-number">{bookings.length}</span>
            <span className="p-stat-label">Total Bookings Made</span>
          </div>
        </div>

        <div className="passenger-stat-box box-refunded">
          <div className="p-stat-icon">
            <RotateCcw size={20} />
          </div>
          <div>
            <span className="p-stat-number">{cancelledBookings.length}</span>
            <span className="p-stat-label">Refunds Processed (80%)</span>
          </div>
        </div>
      </div>

      {/* Bookings List Section */}
      <div className="section-header-row mt-6">
        <div>
          <h3 className="section-title">My Journey Reservations</h3>
          <p className="section-subtitle">Digital boarding passes & real-time travel itineraries</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchMyBookings} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <RefreshCw size={26} className="spin-icon" />
          <p>Loading your boarding passes...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state-card">
          <Ticket size={40} className="empty-icon" />
          <h3>No Journeys Booked Yet</h3>
          <p>Find available trains and reserve your seats with instant confirmation.</p>
          <button className="btn btn-primary" onClick={onNavigateSearch}>
            Search & Book Trains
          </button>
        </div>
      ) : (
        <div className="passenger-tickets-list">
          {bookings.map((b) => {
            const isCancelled = b.status === 'Cancelled';
            const isCancelling = cancellingId === b._id;

            return (
              <div key={b._id} className={`my-ticket-card ${isCancelled ? 'ticket-cancelled' : ''}`}>
                <div className="ticket-card-header">
                  <div className="ticket-pnr-badge">
                    <span className="pnr-title-label">PNR:</span>
                    <strong>{b.pnr}</strong>
                    <button 
                      className="copy-icon-btn" 
                      onClick={() => handleCopy(b.pnr)}
                      title="Copy PNR"
                    >
                      {copiedPnr === b.pnr ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    </button>
                  </div>

                  <span className={`status-pill status-${(b.status || 'Confirmed').toLowerCase()}`}>
                    <span className="status-dot" />
                    {b.status || 'Confirmed'}
                  </span>
                </div>

                <div className="ticket-card-body">
                  <div className="ticket-route-display">
                    <div className="ticket-station">
                      <span className="station-city">{b.source || 'NDLS'}</span>
                      <span className="station-desc">Departure Hub</span>
                    </div>

                    <div className="ticket-path-arrow">
                      <div className="path-line" />
                      <Train size={16} />
                      <div className="path-line" />
                    </div>

                    <div className="ticket-station text-right">
                      <span className="station-city">{b.destination || 'BCT'}</span>
                      <span className="station-desc">Arrival Terminal</span>
                    </div>
                  </div>

                  <div className="ticket-meta-grid">
                    <div>
                      <span className="meta-sub">Date of Travel</span>
                      <strong>{new Date(b.journeyDate || b.createdAt).toLocaleDateString()}</strong>
                    </div>

                    <div>
                      <span className="meta-sub">Allocated Berth / Seat</span>
                      <span className="seat-badge-text">{b.seatNumber || 'B1-24'}</span>
                    </div>

                    <div>
                      <span className="meta-sub">Paid Fare</span>
                      <strong>₹{b.fare || 1500}</strong>
                    </div>

                    <div className="text-right">
                      {!isCancelled ? (
                        <button
                          className="btn btn-danger-outline btn-sm"
                          onClick={() => handleCancel(b._id)}
                          disabled={isCancelling}
                        >
                          <RotateCcw size={13} />
                          <span>{isCancelling ? 'Processing...' : 'Cancel & 80% Refund'}</span>
                        </button>
                      ) : (
                        <span className="refund-credited-pill">
                          ₹{(b.fare || 1500) * 0.8} Refund Credited
                        </span>
                      )}
                    </div>
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
