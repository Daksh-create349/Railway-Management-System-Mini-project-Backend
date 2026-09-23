import React, { useState } from 'react';
import { 
  Ticket, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  Calendar, 
  User, 
  Train, 
  DollarSign, 
  RotateCcw,
  Copy,
  Check
} from 'lucide-react';
import { api } from '../services/api';

export default function PnrLookup({ onCancelSuccess }) {
  const [pnrInput, setPnrInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!pnrInput.trim()) return;

    setLoading(true);
    setError('');
    setBookingData(null);
    setCancelSuccess(null);

    try {
      const data = await api.getBookingByPNR(pnrInput.trim());
      if (Array.isArray(data) && data.length > 0) {
        setBookingData(data[0]);
      } else {
        setError('No booking found with this PNR number. Please verify and try again.');
      }
    } catch (err) {
      setError(err.message || 'Error searching PNR');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingData?._id) return;
    setCancelling(true);

    try {
      const res = await api.cancelBooking(bookingData._id, 'Customer cancellation via Web Portal');
      setCancelSuccess(res.cancellation);
      setBookingData({
        ...bookingData,
        status: 'Cancelled',
      });
      setCancelModal(false);
      if (onCancelSuccess) onCancelSuccess();
    } catch (err) {
      alert(err.message || 'Failed to cancel ticket');
    } finally {
      setCancelling(false);
    }
  };

  const copyPnr = () => {
    if (bookingData?.pnr) {
      navigator.clipboard?.writeText(bookingData.pnr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const passenger = bookingData?.passengerDetails?.[0] || {};
  const train = bookingData?.trainDetails?.[0] || {};

  return (
    <div className="pnr-container">
      {/* Search Header Card */}
      <div className="pnr-search-card">
        <div className="pnr-header-text">
          <div className="pnr-icon-badge">
            <Ticket size={24} />
          </div>
          <div>
            <h2>PNR Status & Digital E-Ticket</h2>
            <p>Query aggregated passenger information and train telemetry directly from the operational database</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="pnr-form">
          <div className="pnr-input-wrapper">
            <Search size={18} className="pnr-input-icon" />
            <input
              type="text"
              placeholder="Enter 10-15 digit PNR (e.g. PNR1790141226175)"
              value={pnrInput}
              onChange={(e) => setPnrInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Check Status'}
          </button>
        </form>

        {error && (
          <div className="error-alert">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Cancellation Success Alert */}
      {cancelSuccess && (
        <div className="cancel-success-banner">
          <CheckCircle size={22} className="text-success" />
          <div>
            <strong>Ticket Cancelled Successfully</strong>
            <p>
              Seat released back to train pool. 80% refund of <strong>₹{cancelSuccess.refundAmount}</strong> has been credited to the original payment source.
            </p>
          </div>
        </div>
      )}

      {/* Ticket Boarding Pass View */}
      {bookingData && (
        <div className="ticket-boarding-pass">
          {/* Top notch */}
          <div className="pass-header">
            <div className="pass-brand">
              <Train size={18} />
              <span>SMARTRAIL BOARDING PASS</span>
            </div>
            <div className="pass-status">
              <span className={`status-pill status-${(bookingData.status || 'Confirmed').toLowerCase()}`}>
                <span className="status-dot" />
                {bookingData.status || 'Confirmed'}
              </span>
            </div>
          </div>

          {/* Main Pass Body */}
          <div className="pass-body">
            {/* Route row */}
            <div className="pass-route-row">
              <div className="pass-station">
                <span className="station-code">{bookingData.source || train.source || 'NDLS'}</span>
                <span className="station-label">Boarding Station</span>
              </div>
              <div className="pass-arrow-wrap">
                <span className="train-meta-badge">{train.trainName || 'Express'} (#{train.trainNumber || '12952'})</span>
                <div className="pass-arrow-line">
                  <div className="pass-line" />
                  <ArrowRight size={18} />
                </div>
              </div>
              <div className="pass-station text-right">
                <span className="station-code">{bookingData.destination || train.destination || 'BCT'}</span>
                <span className="station-label">Arrival Station</span>
              </div>
            </div>

            {/* Grid Details */}
            <div className="pass-grid">
              <div className="pass-item">
                <span className="item-label"><User size={13} /> Passenger Name</span>
                <strong className="item-val">{passenger.name || 'Primary Passenger'}</strong>
                <span className="item-sub">{passenger.gender || 'Adult'}, {passenger.age || '26'} yrs</span>
              </div>

              <div className="pass-item">
                <span className="item-label">Allocated Seat</span>
                <span className="pass-seat-badge">{bookingData.seatNumber || 'B1-24'}</span>
              </div>

              <div className="pass-item">
                <span className="item-label"><Calendar size={13} /> Date of Journey</span>
                <strong className="item-val">
                  {bookingData.journeyDate 
                    ? new Date(bookingData.journeyDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                    : new Date().toLocaleDateString()}
                </strong>
                <span className="item-sub">Standard Class</span>
              </div>

              <div className="pass-item">
                <span className="item-label">Booking PNR</span>
                <div className="pnr-copy-box">
                  <span className="pnr-code-text">{bookingData.pnr}</span>
                  <button className="copy-btn" onClick={copyPnr} title="Copy PNR">
                    {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Fare & Cancellation Action Footer */}
            <div className="pass-footer">
              <div className="pass-fare-info">
                <span className="fare-label">Total Fare Paid</span>
                <strong className="fare-value">₹{bookingData.fare || 1500}</strong>
              </div>

              {bookingData.status !== 'Cancelled' ? (
                <button 
                  className="btn btn-danger-outline" 
                  onClick={() => setCancelModal(true)}
                >
                  <RotateCcw size={15} />
                  <span>Cancel Ticket & Refund</span>
                </button>
              ) : (
                <div className="cancelled-badge-note">
                  <span>Ticket was cancelled • 80% refund processed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Dialog */}
      {cancelModal && (
        <div className="modal-backdrop">
          <div className="modal-card modal-sm">
            <div className="modal-header">
              <div className="modal-header-title">
                <AlertTriangle size={20} className="text-danger" />
                <div>
                  <h3>Confirm Cancellation</h3>
                  <p>PNR: {bookingData.pnr}</p>
                </div>
              </div>
            </div>
            <div className="cancel-modal-body">
              <p>Are you sure you want to cancel this booking?</p>
              <div className="refund-breakdown-box">
                <div className="refund-row">
                  <span>Ticket Fare:</span>
                  <strong>₹{bookingData.fare || 1500}</strong>
                </div>
                <div className="refund-row">
                  <span>Cancellation Deduction (20%):</span>
                  <span className="text-danger">- ₹{(bookingData.fare || 1500) * 0.2}</span>
                </div>
                <div className="refund-divider" />
                <div className="refund-row total-refund">
                  <span>Estimated Refund (80%):</span>
                  <strong className="text-success">₹{(bookingData.fare || 1500) * 0.8}</strong>
                </div>
              </div>
              <p className="refund-note">The seat will be instantly restored to the train quota.</p>
            </div>
            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setCancelModal(false)}
                disabled={cancelling}
              >
                Keep Booking
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleCancelBooking}
                disabled={cancelling}
              >
                {cancelling ? 'Processing...' : 'Confirm & Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
