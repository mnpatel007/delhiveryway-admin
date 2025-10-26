import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../services/api';
import './ShopperPerformancePage.css';

const ShopperPerformancePage = () => {
    const [shoppers, setShoppers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedShopper, setSelectedShopper] = useState(null);
    const [timeFilter, setTimeFilter] = useState('30'); // days
    const [sortBy, setSortBy] = useState('rating');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        fetchShopperPerformance();
    }, [timeFilter, sortBy, sortOrder]);

    const fetchShopperPerformance = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/admin/shoppers/performance?days=${timeFilter}&sortBy=${sortBy}&order=${sortOrder}`);
            setShoppers(response.data.data || []);
        } catch (err) {
            console.error('Error fetching shopper performance:', err);
            setError('Failed to load shopper performance data');
        } finally {
            setLoading(false);
        }
    };

    const getPerformanceGrade = (score) => {
        if (score >= 90) return { grade: 'A+', color: '#28a745', label: 'Excellent' };
        if (score >= 80) return { grade: 'A', color: '#28a745', label: 'Very Good' };
        if (score >= 70) return { grade: 'B', color: '#ffc107', label: 'Good' };
        if (score >= 60) return { grade: 'C', color: '#fd7e14', label: 'Average' };
        if (score >= 50) return { grade: 'D', color: '#dc3545', label: 'Below Average' };
        return { grade: 'F', color: '#dc3545', label: 'Poor' };
    };

    const calculatePerformanceScore = (shopper) => {
        const {
            completionRate = 0,
            avgRating = 0,
            onTimeDeliveryRate = 0,
            customerSatisfactionRate = 0,
            cancellationRate = 0
        } = shopper.performance || {};

        // Weighted scoring system
        const score = (
            (completionRate * 0.25) +
            (avgRating * 20 * 0.25) +
            (onTimeDeliveryRate * 0.2) +
            (customerSatisfactionRate * 0.2) +
            ((100 - cancellationRate) * 0.1)
        );

        return Math.round(score);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount || 0);
    };

    const formatPercentage = (value) => {
        return `${(value || 0).toFixed(1)}%`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#28a745';
            case 'inactive': return '#6c757d';
            case 'suspended': return '#dc3545';
            default: return '#6c757d';
        }
    };

    if (loading) {
        return (
            <div className="shopper-performance-page">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading shopper performance data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="shopper-performance-page">
                <div className="error-state">
                    <h3>Error</h3>
                    <p>{error}</p>
                    <button onClick={fetchShopperPerformance} className="btn btn-primary">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="shopper-performance-page">
            <div className="page-header">
                <h1>Shopper Performance Analytics</h1>
                <p>Monitor and analyze shopper performance metrics</p>
            </div>

            {/* Filters and Controls */}
            <div className="performance-controls">
                <div className="filter-group">
                    <label>Time Period:</label>
                    <select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 3 months</option>
                        <option value="365">Last year</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Sort by:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-select"
                    >
                        <option value="rating">Rating</option>
                        <option value="completionRate">Completion Rate</option>
                        <option value="totalOrders">Total Orders</option>
                        <option value="earnings">Earnings</option>
                        <option value="onTimeRate">On-Time Delivery</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Order:</label>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="filter-select"
                    >
                        <option value="desc">Highest First</option>
                        <option value="asc">Lowest First</option>
                    </select>
                </div>
            </div>

            {/* Performance Summary Cards */}
            <div className="performance-summary">
                <div className="summary-card">
                    <div className="summary-icon">👥</div>
                    <div className="summary-content">
                        <h3>{shoppers.length}</h3>
                        <p>Total Shoppers</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">⭐</div>
                    <div className="summary-content">
                        <h3>{shoppers.filter(s => calculatePerformanceScore(s) >= 80).length}</h3>
                        <p>High Performers</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">⚠️</div>
                    <div className="summary-content">
                        <h3>{shoppers.filter(s => calculatePerformanceScore(s) < 60).length}</h3>
                        <p>Need Attention</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">🚫</div>
                    <div className="summary-content">
                        <h3>{shoppers.filter(s => s.status === 'suspended').length}</h3>
                        <p>Suspended</p>
                    </div>
                </div>
            </div>

            {/* Shoppers Performance Table */}
            <div className="performance-table-container">
                <div className="table-header">
                    <h2>Shopper Performance Details</h2>
                </div>

                <div className="performance-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Shopper</th>
                                <th>Performance Score</th>
                                <th>Rating</th>
                                <th>Orders</th>
                                <th>Completion Rate</th>
                                <th>On-Time Delivery</th>
                                <th>Earnings</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shoppers.map(shopper => {
                                const performanceScore = calculatePerformanceScore(shopper);
                                const gradeInfo = getPerformanceGrade(performanceScore);

                                return (
                                    <tr key={shopper._id}>
                                        <td>
                                            <div className="shopper-info">
                                                <div className="shopper-avatar">
                                                    {shopper.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="shopper-details">
                                                    <div className="shopper-name">{shopper.name}</div>
                                                    <div className="shopper-phone">{shopper.phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="performance-score">
                                                <div
                                                    className="score-badge"
                                                    style={{ backgroundColor: gradeInfo.color }}
                                                >
                                                    {gradeInfo.grade}
                                                </div>
                                                <div className="score-details">
                                                    <div className="score-number">{performanceScore}/100</div>
                                                    <div className="score-label">{gradeInfo.label}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="rating-display">
                                                <span className="rating-stars">
                                                    {'★'.repeat(Math.floor(shopper.performance?.avgRating || 0))}
                                                    {'☆'.repeat(5 - Math.floor(shopper.performance?.avgRating || 0))}
                                                </span>
                                                <span className="rating-number">
                                                    {(shopper.performance?.avgRating || 0).toFixed(1)}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="orders-info">
                                                <div className="total-orders">{shopper.performance?.totalOrders || 0}</div>
                                                <div className="completed-orders">
                                                    {shopper.performance?.completedOrders || 0} completed
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="metric-display">
                                                <div className="metric-bar">
                                                    <div
                                                        className="metric-fill"
                                                        style={{
                                                            width: `${shopper.performance?.completionRate || 0}%`,
                                                            backgroundColor: (shopper.performance?.completionRate || 0) >= 80 ? '#28a745' : '#ffc107'
                                                        }}
                                                    ></div>
                                                </div>
                                                <span>{formatPercentage(shopper.performance?.completionRate)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="metric-display">
                                                <div className="metric-bar">
                                                    <div
                                                        className="metric-fill"
                                                        style={{
                                                            width: `${shopper.performance?.onTimeDeliveryRate || 0}%`,
                                                            backgroundColor: (shopper.performance?.onTimeDeliveryRate || 0) >= 80 ? '#28a745' : '#ffc107'
                                                        }}
                                                    ></div>
                                                </div>
                                                <span>{formatPercentage(shopper.performance?.onTimeDeliveryRate)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="earnings-info">
                                                <div className="total-earnings">
                                                    {formatCurrency(shopper.performance?.totalEarnings)}
                                                </div>
                                                <div className="avg-earnings">
                                                    Avg: {formatCurrency(shopper.performance?.avgEarningsPerOrder)}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className="status-badge"
                                                style={{ backgroundColor: getStatusColor(shopper.status) }}
                                            >
                                                {shopper.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => setSelectedShopper(shopper)}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detailed Shopper Modal */}
            {selectedShopper && (
                <div className="modal-overlay" onClick={() => setSelectedShopper(null)}>
                    <div className="shopper-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedShopper.name} - Performance Details</h2>
                            <button
                                className="close-btn"
                                onClick={() => setSelectedShopper(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-content">
                            <div className="performance-metrics-grid">
                                <div className="metric-card">
                                    <h4>📊 Overall Performance</h4>
                                    <div className="metric-value">
                                        {calculatePerformanceScore(selectedShopper)}/100
                                    </div>
                                    <div className="metric-label">
                                        {getPerformanceGrade(calculatePerformanceScore(selectedShopper)).label}
                                    </div>
                                </div>

                                <div className="metric-card">
                                    <h4>⭐ Average Rating</h4>
                                    <div className="metric-value">
                                        {(selectedShopper.performance?.avgRating || 0).toFixed(1)}
                                    </div>
                                    <div className="metric-label">
                                        Based on {selectedShopper.performance?.totalRatings || 0} reviews
                                    </div>
                                </div>

                                <div className="metric-card">
                                    <h4>✅ Completion Rate</h4>
                                    <div className="metric-value">
                                        {formatPercentage(selectedShopper.performance?.completionRate)}
                                    </div>
                                    <div className="metric-label">
                                        {selectedShopper.performance?.completedOrders || 0} of {selectedShopper.performance?.totalOrders || 0} orders
                                    </div>
                                </div>

                                <div className="metric-card">
                                    <h4>⏰ On-Time Delivery</h4>
                                    <div className="metric-value">
                                        {formatPercentage(selectedShopper.performance?.onTimeDeliveryRate)}
                                    </div>
                                    <div className="metric-label">
                                        Avg delivery time: {selectedShopper.performance?.avgDeliveryTime || 0} min
                                    </div>
                                </div>

                                <div className="metric-card">
                                    <h4>💰 Total Earnings</h4>
                                    <div className="metric-value">
                                        {formatCurrency(selectedShopper.performance?.totalEarnings)}
                                    </div>
                                    <div className="metric-label">
                                        Avg per order: {formatCurrency(selectedShopper.performance?.avgEarningsPerOrder)}
                                    </div>
                                </div>

                                <div className="metric-card">
                                    <h4>🚫 Cancellation Rate</h4>
                                    <div className="metric-value">
                                        {formatPercentage(selectedShopper.performance?.cancellationRate)}
                                    </div>
                                    <div className="metric-label">
                                        {selectedShopper.performance?.cancelledOrders || 0} cancelled orders
                                    </div>
                                </div>
                            </div>

                            <div className="recent-activity">
                                <h3>Recent Activity</h3>
                                <div className="activity-stats">
                                    <div className="stat-item">
                                        <span className="stat-label">Last Active:</span>
                                        <span className="stat-value">
                                            {selectedShopper.lastActive ?
                                                new Date(selectedShopper.lastActive).toLocaleDateString() :
                                                'Never'
                                            }
                                        </span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Orders This Week:</span>
                                        <span className="stat-value">
                                            {selectedShopper.performance?.ordersThisWeek || 0}
                                        </span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Customer Complaints:</span>
                                        <span className="stat-value">
                                            {selectedShopper.performance?.complaints || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopperPerformancePage;