import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../core/utils/axios';
import './CommissionsPage.css';

const CommissionsPage = () => {
    const [revenueData, setRevenueData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [percentages, setPercentages] = useState({}); // shopId_month_year -> percentage
    const [calculations, setCalculations] = useState({}); // shopId_month_year -> amount

    useEffect(() => {
        fetchRevenueData();
    }, []);

    const fetchRevenueData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/admin/revenue');
            if (response.data.success) {
                setRevenueData(response.data.data.revenue);
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

    const handlePercentageChange = (id, val) => {
        // Clamp value between 0 and 100 (though user asked 0-10, let's be flexible but safe)
        const numericVal = Math.min(100, Math.max(0, parseFloat(val) || 0));
        setPercentages({
            ...percentages,
            [id]: numericVal
        });
    };

    const calculateCommission = (id, revenue) => {
        const percentage = percentages[id] || 0;
        const amount = (revenue * percentage) / 100;
        setCalculations({
            ...calculations,
            [id]: amount
        });
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
                <p>Analyzing financial records...</p>
            </div>
        );
    }

    const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalOrders = revenueData.reduce((acc, curr) => acc + curr.orders, 0);

    return (
        <div className="commissions-page">
            <div className="page-header-container">
                <Link to="/dashboard" className="back-link">
                    <span>←</span> Back to Dashboard
                </Link>
                <div className="page-header">
                    <h1>Shop Commissions</h1>
                    <div className="period-badge">{new Date().getFullYear()} Overview</div>
                </div>
            </div>

            <div className="stats-overview">
                <div className="stat-card">
                    <span className="label">Total Managed Revenue</span>
                    <span className="value">{formatCurrency(totalRevenue)}</span>
                </div>
                <div className="stat-card">
                    <span className="label">Total Delivered Orders</span>
                    <span className="value">{totalOrders.toLocaleString()}</span>
                </div>
                <div className="stat-card">
                    <span className="label">Partner Shops</span>
                    <span className="value">{[...new Set(revenueData.map(r => r.shopId))].length}</span>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {revenueData.length === 0 ? (
                <div className="no-data">
                    <h3>No revenue data found</h3>
                    <p>When shops start processing orders, their monthly performance will appear here.</p>
                </div>
            ) : (
                <div className="revenue-grid">
                    {revenueData.map((item, index) => {
                        const uniqueId = `${item.shopId}_${item.month}_${item.year}`;
                        return (
                            <div key={uniqueId} className="revenue-card">
                                <div className="card-top">
                                    <div className="shop-info">
                                        <h3>{item.shopName}</h3>
                                        <div className="period-badge">
                                            {getMonthName(item.month)} {item.year}
                                        </div>
                                    </div>
                                </div>

                                <div className="revenue-display">
                                    <span className="amount">{formatCurrency(item.revenue)}</span>
                                    <span className="orders-count">{item.orders} Successfull Orders</span>
                                </div>

                                <div className="commission-calculator">
                                    <div className="calculator-title">
                                        <span>⚙️</span> Commission Tool
                                    </div>
                                    <div className="calculator-controls">
                                        <div className="percentage-input-wrapper">
                                            <input
                                                type="number"
                                                placeholder="0.0"
                                                min="0"
                                                max="10"
                                                step="0.1"
                                                value={percentages[uniqueId] || ''}
                                                onChange={(e) => handlePercentageChange(uniqueId, e.target.value)}
                                            />
                                            <span className="percent-symbol">%</span>
                                        </div>
                                        <button
                                            className="calculate-btn"
                                            onClick={() => calculateCommission(uniqueId, item.revenue)}
                                        >
                                            Calculate
                                        </button>
                                    </div>

                                    {calculations[uniqueId] !== undefined && (
                                        <div className="calculation-result">
                                            <span className="result-label">Projected Commission:</span>
                                            <span className="result-amount">
                                                {formatCurrency(calculations[uniqueId])}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CommissionsPage;
