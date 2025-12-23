import React from 'react';
import '/css/basics.css';

const Factor01Dashboard = () => {
  // Sample data - replace with props or API data
  const dashboardData = {
    totalNav: '$101.9M',
    totalHoldings: 64,
    interestRate: '+14.2%',
    benchmark: '↑ 2.4% vs benchmark',
    cashflowForecast: '$1.9M',
    cashHoldings: 24
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="logo">FACTOR 01</div>
        <h1 className="main-title">OVERVIEW</h1>
        <p className="subtitle">Investment Performance Dashboard</p>
      </div>

      <div className="dashboard-grid">
        {/* Performance Card */}
        <div className="dashboard-card performance">
          <div className="card-title">FACTOR 01 PERFORMANCE</div>
          <div className="metric-primary glow">{dashboardData.totalNav}</div>
          <div className="metric-secondary">TOTAL NAV</div>
          <div className="badge">{dashboardData.totalHoldings} holdings</div>
        </div>

        {/* Cash Flow Card */}
        <div className="dashboard-card">
          <div className="card-title">CASH FLOW</div>
          <div className="metric-highlight">
            <span className="arrow-up">↑</span>
            <span>{dashboardData.interestRate}</span>
          </div>
          <div className="metric-secondary">AVG. INTEREST RATE</div>
          <div className="comparison">{dashboardData.benchmark}</div>
        </div>

        {/* Forecast Card */}
        <div className="dashboard-card">
          <div className="card-title">12M CASHFLOW FORECAST</div>
          <div className="metric-primary glow">{dashboardData.cashflowForecast}</div>
          <div className="metric-secondary">TOTAL CASH</div>
          <div className="badge">{dashboardData.cashHoldings} holdings</div>
        </div>
      </div>
    </div>
  );
};

export default Factor01Dashboard;