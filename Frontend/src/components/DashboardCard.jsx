import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, colorClass }) => {
  return (
    <div className={`dashboard-card ${colorClass}`}>
      <div className="card-icon">
        <Icon size={32} />
      </div>
      <div className="card-info">
        <h3>{title}</h3>
        <p className="card-value">{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
