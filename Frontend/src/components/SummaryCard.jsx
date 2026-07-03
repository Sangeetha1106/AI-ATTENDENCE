import React from 'react';
import { formatPercentage } from '../utils/helpers';

const SummaryCard = ({ title, content, type = 'default' }) => {
  return (
    <div className={`summary-card ${type}`}>
      <h4>{title}</h4>
      <div className="summary-content">
        {content}
      </div>
    </div>
  );
};

export default SummaryCard;
