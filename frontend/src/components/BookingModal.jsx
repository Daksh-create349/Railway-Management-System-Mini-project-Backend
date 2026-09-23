import React, { useState } from 'react';
import { X, CheckCircle, Ticket, ArrowRight, User, Phone, Mail, Calendar, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function BookingModal({ train, onClose, onBookingSuccess, currentUser }) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '9876543210',
    age: '26',
    gender: 'Male',
    seatNumber: `S${Math.floor(Math.random() * 4) + 1}-${Math.floor(Math.random() * 48) + 1}`,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create passenger profile
      const passenger = await api.createPassenger({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        age: Number(formData.age),
        gender: formData.gender,
      });

      // 2. Create booking linked with passenger & train
      const booking = await api.createBooking({
        passengerId: passenger._id,
        trainId: train._id,
        source: train.source,
        destination: train.destination,
        journeyDate: new Date(),
        seatNumber: formData.seatNumber,
        fare: 1500,
      });

      setConfirmedBooking({
        ...booking,
        passengerName: formData.name,
        trainName: train.trainName,
        trainNumber: train.trainNumber,
      });

      if (onBookingSuccess) onBookingSuccess();
    } catch (err) {
      setError(err.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-title">
            <Ticket size={20} className="modal-title-icon" />
            <div>
              <h3>{confirmedBooking ? 'Booking Confirmed!' : 'Express Seat Reservation'}</h3>
              <p>{train.trainName} (#{train.trainNumber})</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        {confirmedBooking ? (
          <div className="confirmation-content">
            <div className="success-badge-circle">
              <CheckCircle size={44} className="text-success" />
            </div>
            <h4>Ticket Reserved Successfully</h4>
            <p className="success-sub">Your digital boarding pass has been registered on the network.</p>

            <div className="ticket-receipt">
              <div className="receipt-row">
                <span className="receipt-label">PNR Number</span>
                <span className="receipt-pnr">{confirmedBooking.pnr}</span>
              </div>
              <div className="receipt-divider" />
              <div className="receipt-grid">
                <div>
                  <span className="receipt-sub">Passenger</span>
                  <strong>{confirmedBooking.passengerName}</strong>
                </div>
                <div>
                  <span className="receipt-sub">Seat Allocated</span>
                  <span className="seat-badge">{confirmedBooking.seatNumber}</span>
                </div>
                <div>
                  <span className="receipt-sub">Route</span>
                  <span>{train.source} <ArrowRight size={12} className="inline-arrow" /> {train.destination}</span>
                </div>
                <div>
                  <span className="receipt-sub">Total Fare</span>
                  <strong className="fare-badge">₹{confirmedBooking.fare || 1500}</strong>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-primary btn-block"
                onClick={() => {
                  navigator.clipboard?.writeText(confirmedBooking.pnr);
                  onClose();
                }}
              >
                Copy PNR & Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="booking-form">
            {error && <div className="error-alert">{error}</div>}

            <div className="train-summary-banner">
              <div className="summary-route">
                <strong>{train.source}</strong>
                <ArrowRight size={14} />
                <strong>{train.destination}</strong>
              </div>
              <div className="summary-seats">
                <span className="available-pill">{train.availableSeats} Seats Left</span>
                <span className="price-tag">₹1,500</span>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label><User size={14} /> Passenger Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daksh Srivastava"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label><Mail size={14} /> Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. passenger@test.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label><Phone size={14} /> Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="10 digit number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-row-compact">
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    min="1"
                    max="110"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="security-notice">
              <ShieldCheck size={16} />
              <span>Instant seat reservation & automatic 80% refund policy on cancellation.</span>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={onClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading || train.availableSeats <= 0}
              >
                {loading ? 'Confirming...' : 'Confirm & Reserve Seat'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
