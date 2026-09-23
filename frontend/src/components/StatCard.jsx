import React from 'react';

export default function StatCard({ 
  title, 
  value, 
  subtext = 'in last 7 Days', 
  trend = '+21%', 
  trendPositive = true, 
  icon: Icon, 
  color = 'blue',
  bars = [40, 65, 50, 80, 60, 95, 75, 85]
}) {
  return (
    <div className={`stat-card card-${color}`}>
      {/* Top Header */}
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <div className={`stat-card-icon-box box-${color}`}>
          {Icon && <Icon size={18} />}
        </div>
      </div>

      {/* Main Counter */}
      <div className="stat-card-body">
        <div className="stat-card-main">
          <span className="stat-counter">{value}</span>
          <span className={`stat-trend-badge ${trendPositive ? 'trend-up' : 'trend-down'}`}>
            {trend}
          </span>
        </div>
      </div>

      {/* Sparkline & Subtext Footer */}
      <div className="stat-card-footer">
        <div className="sparkline-bars">
          {bars.map((height, i) => (
            <div 
              key={i} 
              className={`spark-bar bar-${color}`} 
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <span className="stat-footer-text">{subtext}</span>
      </div>
    </div>
  );
}
