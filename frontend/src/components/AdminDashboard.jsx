import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  DollarSign, 
  Train, 
  RotateCcw, 
  Users, 
  TrendingUp, 
  Calendar, 
  Plus, 
  MoreVertical, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Copy,
  Check,
  Trash2
} from 'lucide-react';
import { api } from '../services/api';
import StatCard from './StatCard';

export default function AdminDashboard({ onRefreshTrigger }) {
  const [metrics, setMetrics] = useState({
    totalBookings: 0,
    revenue: 0,
    status: [],
  });
  const [bookings, setBookings] = useState([]);
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addTrainModal, setAddTrainModal] = useState(false);
  const [tableTab, setTableTab] = useState('fleet');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [copiedPnr, setCopiedPnr] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [newTrain, setNewTrain] = useState({
    trainNumber: '',
    trainName: '',
    source: 'NDLS',
    destination: 'BCT',
    totalSeats: 60,
    availableSeats: 60,
    status: 'Scheduled'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashData, bookingsData, trainsData] = await Promise.all([
        api.getDashboardMetrics().catch(() => ({ totalBookings: 0, revenue: 0, status: [] })),
        api.getAllBookings(1).catch(() => []),
        api.getTrains().catch(() => [])
      ]);

      setMetrics(dashData);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setTrains(Array.isArray(trainsData) ? trainsData : []);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTrain = async (e) => {
    e.preventDefault();
    try {
      await api.createTrain(newTrain);
      setAddTrainModal(false);
      setNewTrain({
        trainNumber: '',
        trainName: '',
        source: 'NDLS',
        destination: 'BCT',
        totalSeats: 60,
        availableSeats: 60,
        status: 'Scheduled'
      });
      setTableTab('fleet');
      await fetchData();
      if (onRefreshTrigger) onRefreshTrigger();
    } catch (err) {
      alert(err.message || 'Failed to create train');
    }
  };

  const handleDeleteTrain = async (trainId, trainName) => {
    if (!window.confirm(`Are you sure you want to remove train "${trainName}" from active fleet?`)) {
      return;
    }
    try {
      await api.deleteTrain(trainId);
      await fetchData();
      if (onRefreshTrigger) onRefreshTrigger();
    } catch (err) {
      alert(err.message || 'Failed to delete train');
    }
  };

  const handleCancelReservation = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? An 80% refund will be issued and the seat returned to train inventory.')) {
      return;
    }
    setCancelling(true);
    try {
      await api.cancelBooking(bookingId, 'Admin administrative cancellation');
      setSelectedBooking(null);
      await fetchData();
      if (onRefreshTrigger) onRefreshTrigger();
    } catch (err) {
      alert(err.message || 'Failed to cancel reservation');
    } finally {
      setCancelling(false);
    }
  };

  const handleCopyPnr = (pnr) => {
    if (!pnr) return;
    navigator.clipboard.writeText(pnr);
    setCopiedPnr(true);
    setTimeout(() => setCopiedPnr(false), 2000);
  };

  // Status metrics counts
  const confirmedCount = metrics.status?.find(s => s._id === 'Confirmed')?.count || 0;
  const cancelledCount = metrics.status?.find(s => s._id === 'Cancelled')?.count || 0;
  const totalCount = metrics.totalBookings || 1;
  const confirmedPercent = Math.round((confirmedCount / totalCount) * 100) || 85;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthHeights = [45, 60, 52, 78, 65, 90, 82, 95, 70, 85, 92, 75];

  return (
    <div className="admin-dashboard-container">
      {/* Page Title & Actions */}
      <div className="dashboard-top-bar">
        <div>
          <h2 className="dashboard-main-heading">Railway Operations Dashboard</h2>
          <p className="dashboard-subtext">Centralized telemetry, passenger booking volume & fleet analytics</p>
        </div>

        <div className="dashboard-actions-right">
          <button 
            className="btn btn-outline btn-sm" 
            onClick={fetchData} 
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
            <span>Sync Live</span>
          </button>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => setAddTrainModal(true)}
          >
            <Plus size={15} />
            <span>Add New Train</span>
          </button>
        </div>
      </div>

      {/* Top 4 Stat Cards Row (Preclinic Reference Design) */}
      <div className="stat-cards-row">
        <StatCard
          title="Total Bookings"
          value={metrics.totalBookings || 0}
          trend="+28%"
          trendPositive={true}
          subtext="in last 7 Days"
          icon={Ticket}
          color="blue"
          bars={[35, 55, 45, 75, 60, 90, 80, 88]}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(metrics.revenue || 0).toLocaleString()}`}
          trend="+19%"
          trendPositive={true}
          subtext="in last 7 Days"
          icon={DollarSign}
          color="orange"
          bars={[40, 50, 65, 55, 80, 70, 95, 85]}
        />
        <StatCard
          title="Active Fleet"
          value={trains.length || 0}
          trend="+8%"
          trendPositive={true}
          subtext="operational routes"
          icon={Train}
          color="green"
          bars={[60, 70, 65, 80, 75, 90, 85, 92]}
        />
        <StatCard
          title="Cancelled Tickets"
          value={cancelledCount}
          trend="-15%"
          trendPositive={false}
          subtext="80% refund processed"
          icon={RotateCcw}
          color="red"
          bars={[20, 30, 25, 40, 35, 25, 20, 15]}
        />
      </div>

      {/* Visual Analytics Row: Bar Graph & Donut Breakdown */}
      <div className="analytics-visual-grid">
        {/* Monthly Booking Velocity Chart */}
        <div className="chart-card">
          <div className="card-header-between">
            <div>
              <h3 className="card-title">Booking Velocity</h3>
              <p className="card-subtitle">Monthly passenger volume & completed journeys</p>
            </div>
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-dot dot-primary" /> Confirmed</span>
              <span className="legend-item"><span className="legend-dot dot-success" /> Completed</span>
            </div>
          </div>

          <div className="bar-chart-visual">
            <div className="bars-container">
              {months.map((m, idx) => (
                <div key={m} className="bar-column">
                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ height: `${monthHeights[idx]}%` }}
                      title={`${m}: ${monthHeights[idx] * 4} Bookings`}
                    />
                  </div>
                  <span className="bar-label">{m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Donut Statistics Breakdown */}
        <div className="donut-card">
          <div className="card-header-between">
            <div>
              <h3 className="card-title">Booking Statistics</h3>
              <p className="card-subtitle">Reservation fulfillment ratio</p>
            </div>
            <span className="badge-monthly">Monthly</span>
          </div>

          <div className="donut-circle-wrapper">
            <div className="donut-ring">
              <div className="donut-center-text">
                <span className="donut-pct">{confirmedPercent}%</span>
                <span className="donut-sub">Success</span>
              </div>
            </div>
          </div>

          <div className="donut-breakdown-list">
            <div className="breakdown-item">
              <div className="breakdown-info">
                <span className="legend-dot dot-success" />
                <span>Confirmed</span>
              </div>
              <strong>{confirmedCount}</strong>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-info">
                <span className="legend-dot dot-danger" />
                <span>Cancelled</span>
              </div>
              <strong>{cancelledCount}</strong>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-info">
                <span className="legend-dot dot-warning" />
                <span>Total Managed</span>
              </div>
              <strong>{metrics.totalBookings || 0}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Data Table: Toggle between Active Fleet & Reservations */}
      <div className="table-card">
        <div className="card-header-between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className={`btn btn-sm ${tableTab === 'fleet' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTableTab('fleet')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Train size={15} />
              <span>Active Fleet ({trains.length})</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm ${tableTab === 'reservations' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTableTab('reservations')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Ticket size={15} />
              <span>Recent Bookings ({bookings.length})</span>
            </button>
          </div>
          <span className="table-count-badge">
            {tableTab === 'fleet' ? `${trains.length} Trains Registered` : `${bookings.length} Passenger Records`}
          </span>
        </div>

        {tableTab === 'fleet' ? (
          <div className="table-responsive">
            <table className="preclinic-table">
              <thead>
                <tr>
                  <th>Train Identity & Number</th>
                  <th>Operational Route</th>
                  <th>Total Capacity</th>
                  <th>Available Quota</th>
                  <th>Operational Status</th>
                  <th className="text-right">Fleet Actions</th>
                </tr>
              </thead>
              <tbody>
                {trains.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-muted">
                      No trains registered in fleet. Click "+ Add Fleet Train" to register rolling stock.
                    </td>
                  </tr>
                ) : (
                  trains.map((t) => (
                    <tr key={t._id}>
                      <td>
                        <div className="table-user-cell">
                          <div className="table-user-avatar" style={{ background: '#eff6ff', color: '#2563eb' }}>
                            <Train size={16} />
                          </div>
                          <div>
                            <strong className="user-primary-name">{t.trainName}</strong>
                            <span className="user-sub-info font-mono font-bold" style={{ color: '#2563eb' }}>#{t.trainNumber}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="route-cell-tag">
                          {t.source || 'NDLS'} ➜ {t.destination || 'BCT'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{t.totalSeats || 60} Seats</strong>
                      </td>
                      <td>
                        <span className="seat-cell-badge" style={{ color: (t.availableSeats ?? t.totalSeats) > 10 ? '#16a34a' : '#ea580c' }}>
                          {t.availableSeats ?? t.totalSeats} Seats Left
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill status-${(t.status || 'Running').toLowerCase().replace(/\s+/g, '-')}`}>
                          <span className="status-dot" />
                          {t.status || 'Running'}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          className="table-action-icon"
                          title="Remove Train from Fleet"
                          onClick={() => handleDeleteTrain(t._id, t.trainName)}
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="preclinic-table">
              <thead>
                <tr>
                  <th>Passenger / PNR</th>
                  <th>Journey Date</th>
                  <th>Route</th>
                  <th>Seat</th>
                  <th>Status</th>
                  <th>Fare</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-muted">
                      No reservations logged yet. Create a booking to populate telemetry.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <div className="table-user-cell">
                          <div className="table-user-avatar">
                            {b.pnr ? b.pnr.slice(-2) : 'TK'}
                          </div>
                          <div>
                            <strong className="user-primary-name">{b.pnr}</strong>
                            <span className="user-sub-info">Standard Booking</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="table-date-cell">
                          <span>{new Date(b.journeyDate || b.createdAt).toLocaleDateString()}</span>
                          <span className="date-time-sub">
                            <Clock size={11} /> {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="route-cell-tag">
                          {b.source || 'NDLS'} ➜ {b.destination || 'BCT'}
                        </span>
                      </td>
                      <td>
                        <span className="seat-cell-badge">{b.seatNumber || 'S1-12'}</span>
                      </td>
                      <td>
                        <span className={`status-pill status-${(b.status || 'Confirmed').toLowerCase()}`}>
                          <span className="status-dot" />
                          {b.status || 'Confirmed'}
                        </span>
                      </td>
                      <td>
                        <strong className="fare-cell-text">₹{b.fare || 1500}</strong>
                      </td>
                      <td className="text-right">
                        <button 
                          className="table-action-icon" 
                          title="View details & actions"
                          onClick={() => setSelectedBooking(b)}
                        >
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Train Modal */}
      {addTrainModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-header-title">
                <Train size={20} className="modal-title-icon" />
                <div>
                  <h3>Add Fleet Train</h3>
                  <p>Register new rolling stock schedule</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleCreateTrain} className="booking-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Train Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12424"
                    value={newTrain.trainNumber}
                    onChange={(e) => setNewTrain({ ...newTrain, trainNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Train Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dibrugarh Rajdhani"
                    value={newTrain.trainName}
                    onChange={(e) => setNewTrain({ ...newTrain, trainName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Origin Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NDLS"
                    value={newTrain.source}
                    onChange={(e) => setNewTrain({ ...newTrain, source: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="form-group">
                  <label>Destination Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DBRG"
                    value={newTrain.destination}
                    onChange={(e) => setNewTrain({ ...newTrain, destination: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="form-group">
                  <label>Total Seats</label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={newTrain.totalSeats}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setNewTrain({ ...newTrain, totalSeats: val, availableSeats: val });
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Operational Status</label>
                  <select
                    value={newTrain.status}
                    onChange={(e) => setNewTrain({ ...newTrain, status: e.target.value })}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="On Time">On Time</option>
                    <option value="Running">Running</option>
                    <option value="Delayed by 15 mins">Delayed by 15 mins</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setAddTrainModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Train
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reservation Details & Actions Modal */}
      {selectedBooking && (
        <div className="modal-backdrop" onClick={() => setSelectedBooking(null)}>
          <div 
            className="modal-card" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '540px', 
              borderRadius: '16px', 
              overflow: 'hidden', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
              background: '#ffffff'
            }}
          >
            {/* Modal Header */}
            <div className="modal-header" style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff' }}>
              <div className="modal-header-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ticket size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 700, color: '#0f172a' }}>Reservation Details & Audit</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    PNR: <strong style={{ color: '#2563eb', fontFamily: 'monospace', fontSize: '12.5px', letterSpacing: '0.3px' }}>{selectedBooking.pnr}</strong>
                  </p>
                </div>
              </div>
              <button 
                className="modal-close-btn" 
                onClick={() => setSelectedBooking(null)}
                style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                title="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', background: '#ffffff' }}>
              <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                
                {/* 2-Column Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Route</span>
                    <strong style={{ color: '#0f172a', fontSize: '14px' }}>{selectedBooking.source || 'NDLS'} ➔ {selectedBooking.destination || 'BCT'}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Seat / Berth</span>
                    <span className="seat-cell-badge" style={{ display: 'inline-block' }}>{selectedBooking.seatNumber || 'S1-12'}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Journey Date</span>
                    <strong style={{ color: '#0f172a' }}>{new Date(selectedBooking.journeyDate || selectedBooking.createdAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Status</span>
                    <span className={`status-pill status-${(selectedBooking.status || 'Confirmed').toLowerCase()}`}>
                      <span className="status-dot" />
                      {selectedBooking.status || 'Confirmed'}
                    </span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Total Fare</span>
                    <strong style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>₹{selectedBooking.fare || 1500}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Booked On</span>
                    <span style={{ color: '#334155', fontWeight: 500 }}>{new Date(selectedBooking.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                </div>

                {/* Passenger Info Sub-box */}
                {selectedBooking.passengerId && typeof selectedBooking.passengerId === 'object' && (
                  <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #e2e8f0', fontSize: '12.5px' }}>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Passenger Info</span>
                    <div style={{ color: '#0f172a', fontWeight: 500 }}>
                      <strong style={{ fontWeight: 700 }}>{selectedBooking.passengerId.name || 'Passenger'}</strong>
                      {selectedBooking.passengerId.phone && <span style={{ color: '#64748b' }}> • {selectedBooking.passengerId.phone}</span>}
                      {selectedBooking.passengerId.email && <span style={{ color: '#64748b' }}> • {selectedBooking.passengerId.email}</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer / Actions */}
            <div style={{ padding: '16px 24px 20px 24px', borderTop: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                type="button" 
                className="btn btn-outline btn-sm"
                onClick={() => handleCopyPnr(selectedBooking.pnr)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', padding: '8px 14px' }}
              >
                {copiedPnr ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
                <span>{copiedPnr ? 'PNR Copied!' : 'Copy PNR'}</span>
              </button>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {selectedBooking.status !== 'Cancelled' && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleCancelReservation(selectedBooking._id)}
                    disabled={cancelling}
                    style={{ background: '#ef4444', color: '#ffffff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', padding: '8px 16px', borderRadius: '6px', fontWeight: 600 }}
                  >
                    <XCircle size={14} />
                    <span>{cancelling ? 'Cancelling...' : 'Cancel & 80% Refund'}</span>
                  </button>
                )}
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setSelectedBooking(null)}
                  style={{ fontSize: '12.5px', padding: '8px 16px' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
