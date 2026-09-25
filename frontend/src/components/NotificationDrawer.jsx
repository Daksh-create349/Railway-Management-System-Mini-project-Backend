import React from 'react';
import { Bell, X, Radio, Clock, CheckCircle } from 'lucide-react';

export default function NotificationDrawer({ isOpen, onClose, notifications }) {
  if (!isOpen) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title">
            <Bell size={18} className="text-primary" />
            <h3>Live Telemetry Alerts</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {notifications.length === 0 ? (
            <div className="empty-notif">
              <Bell size={32} className="text-muted" />
              <p>No live alerts received yet. Real-time train status updates from Operations Control will appear here.</p>
            </div>
          ) : (
            <div className="notif-list">
              {notifications.map((n, idx) => (
                <div key={n._id || idx} className="notif-card">
                  <div className="notif-icon-box">
                    <Radio size={16} />
                  </div>
                  <div className="notif-content">
                    <div className="notif-title-row">
                      <strong className="notif-type">{n.type || 'Telemetry Broadcast'}</strong>
                      <span className="notif-time">
                        <Clock size={11} /> {new Date(n.createdAt || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="notif-msg">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
