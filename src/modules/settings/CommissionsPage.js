import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../core/utils/axios';
import './CommissionsPage.css';

const CommissionsPage = () => {
    const [summary, setSummary] = useState(null);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Per-shop selected month: { [shopId]: monthIndex }
    const [selectedMonths, setSelectedMonths] = useState({});
    // Per-shop commission percentage: { [shopId]: percentage }
    const [percentages, setPercentages] = useState({});
    // Per-shop calculated amount: { [shopId]: amount }
    const [calculations, setCalculations] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/admin/revenue');
            if (response.data.success) {
                const { summary, shops } = response.data.data;
                setSummary(summary);
                setShops(shops);
                
                // Initialize selected months to the first available month (most recent)
                const initialMonths = {};
                shops.forEach(shop => {
                    if (shop.monthlyBreakdown && shop.monthlyBreakdown.length > 0) {
                        initialMonths[shop.shopId] = 0;
                    }
                });
                setSelectedMonths(initialMonths);
                
            } else {
                setError(response.data.message || 'Failed to fetch revenue data');
            }
        } catch (err) {
            console.error('Error fetching revenue:', err);
            setError('Error connecting to the server. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleMonthChange = (shopId, index) => {
        setSelectedMonths({ ...selectedMonths, [shopId]: parseInt(index) });
        // Reset calculation when month changes
        setCalculations({ ...calculations, [shopId]: undefined });
    };

    const handlePercentageChange = (shopId, val) => {
        const num = Math.min(100, Math.max(0, parseFloat(val) || 0));
        setPercentages({ ...percentages, [shopId]: num });
    };

    const calculateCommission = (shopId, revenue) => {
        const pct = percentages[shopId] || 0;
        const amount = (revenue * pct) / 100;
        setCalculations({ ...calculations, [shopId]: amount });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getMonthName = (monthNumber) => {
        const date = new Date();
        date.setMonth(monthNumber - 1);
        return date.toLocaleString('default', { month: 'long' });
    };

    if (loading) {
        return (
            <div className="commissions-page loading-container">
                <div className="spinner"></div>
                <p>Synchronizing global revenue data...</p>
            </div>
        );
    }

    return (
        <div className="commissions-page">
            <div className="page-header-container">
                <Link to="/dashboard" className="back-link">
                    <span>←</span> Back to Dashboard
                </Link>
                <div className="page-header">
                    <h1>Shop Commissions</h1>
                </div>
            </div>

            {summary && (
                <div className="stats-overview">
                    <div className="stat-card">
                        <span className="label">Managed Revenue</span>
                        <div className="stat-main">
                            <span className="value">{formatCurrency(summary.totalRevenue)}</span>
                            <span className="sub-label">Cumulative Gross</span>
                        </div>
                        <div className="stat-comparison">
                            <div className="comparison-item">
                                <span className="comp-value">{formatCurrency(summary.currentMonthRevenue)}</span>
                                <span className="comp-label">This Month</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <span className="label">Delivered Orders</span>
                        <div className="stat-main">
                            <span className="value">{summary.totalOrders.toLocaleString()}</span>
                            <span className="sub-label">Success Rate Checked</span>
                        </div>
                        <div className="stat-comparison">
                            <div className="comparison-item">
                                <span className="comp-value">{summary.currentMonthOrders}</span>
                                <span className="comp-label">This Month</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <span className="label">Partnered Shops</span>
                        <div className="stat-main">
                            <span className="value">{summary.partnerShops}</span>
                            <span className="sub-label">Excluding Test Accounts</span>
                        </div>
                    </div>
                </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <div className="revenue-grid">
                {shops.map(shop => {
                    const mIndex = selectedMonths[shop.shopId];
                    const selectedData = shop.monthlyBreakdown && shop.monthlyBreakdown[mIndex];
                    
                    return (
                        <div key={shop.shopId} className="revenue-card">
                            <div className="card-header-row">
                                <div className="shop-identity">
                                    <h3>{shop.shopName}</h3>
                                    <span className="all-time-badge">
                                        All-time: {formatCurrency(shop.allTimeRevenue)}
                                    </span>
                                </div>
                                
                                {shop.monthlyBreakdown && shop.monthlyBreakdown.length > 0 && (
                                    <div className="month-selector-wrapper">
                                        <select 
                                            className="month-select"
                                            value={mIndex}
                                            onChange={(e) => handleMonthChange(shop.shopId, e.target.value)}
                                        >
                                            {shop.monthlyBreakdown.map((m, idx) => (
                                                <option key={`${shop.shopId}_${m.month}_${m.year}`} value={idx}>
                                                    {getMonthName(m.month)} {m.year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {selectedData ? (
                                <div className="card-stats-display">
                                    <div className="stat-box primary">
                                        <span className="amount">{formatCurrency(selectedData.revenue)}</span>
                                        <span className="desc">Monthly Revenue</span>
                                    </div>
                                    <div className="stat-box">
                                        <span className="amount">{selectedData.orders}</span>
                                        <span className="desc">Orders</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="no-history">No sales history detected for this shop yet.</div>
                            )}

                            {selectedData && (
                                <div className="commission-engine">
                                    <div className="engine-header">
                                        <span>⚙️</span> Commission Tool
                                    </div>
                                    <div className="engine-controls">
                                        <div className="input-container">
                                            <input
                                                type="number"
                                                placeholder="0.0"
                                                min="0"
                                                max="10"
                                                step="0.1"
                                                value={percentages[shop.shopId] || ''}
                                                onChange={(e) => handlePercentageChange(shop.shopId, e.target.value)}
                                            />
                                            <span className="percentage-symbol">%</span>
                                        </div>
                                        <button
                                            className="action-btn"
                                            onClick={() => calculateCommission(shop.shopId, selectedData.revenue)}
                                        >
                                            Calculate
                                        </button>
                                    </div>

                                    {calculations[shop.shopId] !== undefined && (
                                        <div className="engine-result">
                                            <span className="result-tag">Projected Share:</span>
                                            <span className="result-val">
                                                {formatCurrency(calculations[shop.shopId])}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CommissionsPage;
