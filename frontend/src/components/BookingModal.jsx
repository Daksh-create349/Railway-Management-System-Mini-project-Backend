import React, { useState } from 'react';
import { X, CheckCircle, Ticket, ArrowRight, User, Phone, Mail, Calendar, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

function getBerthDetails(seatNumberInCoach) {
  const mod = seatNumberInCoach % 8;
  switch (mod) {
    case 1:
    case 4:
      return { code: 'LB', name: 'Lower Berth' };
    case 2:
    case 5:
      return { code: 'MB', name: 'Middle Berth' };
    case 3:
    case 6:
      return { code: 'UB', name: 'Upper Berth' };
    case 7:
      return { code: 'SL', name: 'Side Lower' };
    case 0:
      return { code: 'SU', name: 'Side Upper' };
    default:
      return { code: 'UB', name: 'Upper Berth' };
  }
}

function allocateSmartBerth(train, preference = 'NONE') {
  const total = train?.totalSeats || 60;
  const avail = train?.availableSeats ?? 60;
  const bookedCount = Math.max(0, total - avail);

  // Deterministic seat index in the fleet
  const seatIndex = bookedCount + 1;
  const coachNum = Math.floor((seatIndex - 1) / 72) + 1;
  const coach = `B${coachNum}`;
  let seatInCoach = ((seatIndex - 1) % 72) + 1;

  // Honor passenger preference in the current 8-berth bay if specified
  if (preference && preference !== 'NONE') {
    const bayStart = Math.floor((seatInCoach - 1) / 8) * 8;
    const prefMap = {
      'LB': 1,
      'MB': 2,
      'UB': 3,
      'SL': 7,
      'SU': 8
    };
    if (prefMap[preference]) {
      const candidate = bayStart + prefMap[preference];
      if (candidate <= 72 && candidate <= total) {
        seatInCoach = candidate;
      }
    }
  }

  const berth = getBerthDetails(seatInCoach);
  const formattedSeat = `${coach}-${seatInCoach.toString().padStart(2, '0')}`;
  return {
    coach,
    seatInCoach,
    formattedSeat,
    berthCode: berth.code,
    berthName: berth.name,
    fullLabel: `${formattedSeat} (${berth.code} - ${berth.name})`
  };
}

export default function BookingModal({ train, onClose, onBookingSuccess, currentUser }) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '9876543210',
    age: '26',
    gender: 'Male',
    berthPreference: 'NONE',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const previewAllocation = allocateSmartBerth(train, formData.berthPreference);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Allocate smart berth deterministically
      const allocated = allocateSmartBerth(train, formData.berthPreference);

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
        seatNumber: allocated.fullLabel,
        fare: 1500,
      });

      setConfirmedBooking({
        ...booking,
        passengerName: formData.name,
        trainName: train.trainName,
        trainNumber: train.trainNumber,
        allocatedBerth: allocated,
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

              <div className="form-group">
                <label>Berth Preference (IRCTC Layout)</label>
                <select
                  value={formData.berthPreference}
                  onChange={(e) => setFormData({ ...formData, berthPreference: e.target.value })}
                >
                  <option value="NONE">No Preference (Auto-Allocate)</option>
                  <option value="LB">Lower Berth (LB) - Preferred for Seniors</option>
                  <option value="MB">Middle Berth (MB)</option>
                  <option value="UB">Upper Berth (UB)</option>
                  <option value="SL">Side Lower (SL)</option>
                  <option value="SU">Side Upper (SU)</option>
                </select>
              </div>

              <div className="berth-preview-banner">
                <span className="berth-preview-label">Deterministic Berth Allocation:</span>
                <strong className="berth-preview-val">{previewAllocation.fullLabel}</strong>
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
