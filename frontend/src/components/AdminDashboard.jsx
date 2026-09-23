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
  Clock
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
  const [newTrain, setNewTrain] = useState({
    trainNumber: '',
    trainName: '',
    source: 'NDLS',
    destination: 'BCT',
    totalSeats: 60,
    availableSeats: 60,
    status: 'Running'
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
        status: 'Running'
      });
      fetchData();
      if (onRefreshTrigger) onRefreshTrigger();
    } catch (err) {
      alert(err.message || 'Failed to create train');
    }
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

      {/* Recent Bookings Table (Exact Preclinic Table Style) */}
      <div className="table-card">
        <div className="card-header-between">
          <div>
            <h3 className="card-title">Recent Reservations</h3>
            <p className="card-subtitle">Real-time journey entries recorded across network</p>
          </div>
          <span className="table-count-badge">{bookings.length} Records</span>
        </div>

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
                      <button className="table-action-icon" title="View details">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
    </div>
  );
}
