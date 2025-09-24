import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';
import OrderMonitoring from '../components/OrderMonitoring';
import Logo from '../components/Logo';
import './Dashboard.css';

const Dashboard = () => {
    const { admin, logout } = useAuth();
    const [activeView, setActiveView] = useState('dashboard');
    const [stats, setStats] = useState({
        shopsCount: 0,
        productsCount: 0,
        ordersCount: 0,
        usersCount: 0,
        shoppersCount: 0,
        recentOrders: [],
        orderStatusDistribution: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axiosInstance.get('/admin/dashboard');

                if (response.data.success) {
                    const data = response.data.data;
                    setStats({
                        shopsCount: data.stats.totalShops || 0,
                        productsCount: data.stats.totalProducts || 0,
                        ordersCount: data.stats.totalOrders || 0,
                        usersCount: data.stats.totalUsers || 0,
                        shoppersCount: data.stats.totalShoppers || 0,
                        recentOrders: data.recentOrders || [],
                        orderStatusDistribution: data.orderStatusStats || []
                    });
                } else {
                    setError(response.data.message || 'Failed to fetch dashboard statistics');
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch dashboard statistics');
                setLoading(false);
                console.error('Error fetching stats:', err);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="dashboard">
                <header className="dashboard-header">
                    <div className="header-left">
                        <h1>Admin Dashboard</h1>
                        <p>Loading...</p>
                    </div>
                    <div className="header-right">
                        <button className="logout-btn" onClick={logout}>
                            Logout
                        </button>
                    </div>
                </header>
                <div className="loading">Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard">
                <header className="dashboard-header">
                    <div className="header-left">
                        <h1>Admin Dashboard</h1>
                    </div>
                </header>
                <OrderMonitoring />
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <Logo size="large" showText={true} />
                        <h1>Admin Dashboard</h1>
                    </div>
                    <div className="header-actions">
                        <span>Welcome, {admin?.name || 'Admin'}</span>
                        <button onClick={logout} className="logout-btn">Logout</button>
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                <nav className="dashboard-nav">
                    <Link to="/dashboard" className="nav-link active">Dashboard</Link>
                    <Link to="/shops" className="nav-link">Shops</Link>
                    <Link to="/products" className="nav-link">Products</Link>
                    <Link to="/orders" className="nav-link">Orders</Link>
                    <Link to="/users" className="nav-link">Users</Link>
                    <Link to="/shoppers" className="nav-link">Shoppers</Link>
                    <Link to="/notices" className="nav-link">📢 Notices</Link>
                </nav>

                <div className="dashboard-content">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">🏪</div>
                            <div className="stat-info">
                                <h3>Total Shops</h3>
                                <p className="stat-number">{stats.shopsCount}</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">📦</div>
                            <div className="stat-info">
                                <h3>Total Products</h3>
                                <p className="stat-number">{stats.productsCount}</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">🛒</div>
                            <div className="stat-info">
                                <h3>Total Orders</h3>
                                <p className="stat-number">{stats.ordersCount}</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">🛍️</div>
                            <div className="stat-info">
                                <h3>Personal Shoppers</h3>
                                <p className="stat-number">{stats.shoppersCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="analytics-section">
                        <div className="recent-orders">
                            <h2>Recent Orders</h2>
                            {!stats.recentOrders || stats.recentOrders.length === 0 ? (
                                <p>No recent orders</p>
                            ) : (
                                <div className="orders-list">
                                    {stats.recentOrders.slice(0, 4).map(order => (
                                        <div key={order._id} className="order-item">
                                            <div className="order-details">
                                                <p className="order-id">Order #{order.orderNumber || order._id?.slice(-8) || 'N/A'}</p>
                                                <p className="order-customer">{order.customerId?.name || 'Unknown'}</p>
                                                <p className="order-shop">{order.shopId?.name || 'Unknown'}</p>
                                            </div>
                                            <div className="order-status">
                                                <span className={`status-${order.status}`}>{order.status}</span>
                                            </div>
                                            <div className="order-totals">
                                                <div className="original-total">
                                                    ₹{order.orderValue?.total || 0}
                                                </div>
                                                {order.revisedOrderValue && order.revisedOrderValue.total && (
                                                    <div className="revised-total">
                                                        Revised: ₹{order.revisedOrderValue.total}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="order-status-distribution">
                            <h2>Order Status Distribution</h2>
                            {!stats.orderStatusDistribution || stats.orderStatusDistribution.length === 0 ? (
                                <p>No order status data</p>
                            ) : (
                                <div className="status-chart">
                                    {stats.orderStatusDistribution.map(status => (
                                        <div key={status._id} className="status-bar">
                                            <div className="status-label">{status._id}</div>
                                            <div className="status-value">{status.count}</div>
                                            <div className="status-progress">
                                                <div
                                                    className="status-progress-fill"
                                                    style={{ width: `${(status.count / stats.ordersCount) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="quick-actions">
                        <h2>Quick Actions</h2>
                        <div className="actions-grid">
                            <Link to="/shops" className="action-card">
                                <div className="action-icon">🏪</div>
                                <h3>Manage Shops</h3>
                                <p>Add, edit, or remove shops</p>
                            </Link>

                            <Link to="/products" className="action-card">
                                <div className="action-icon">📦</div>
                                <h3>Manage Products</h3>
                                <p>Add products to shops</p>
                            </Link>

                            <Link to="/orders" className="action-card">
                                <div className="action-icon">🛒</div>
                                <h3>Manage Orders</h3>
                                <p>View and update orders</p>
                            </Link>

                            <div className="action-card" onClick={() => setActiveView('order-monitoring')}>
                                <div className="action-icon">📊</div>
                                <h3>Order Monitoring</h3>
                                <p>Real-time order workflow tracking</p>
                            </div>

                            <Link to="/users" className="action-card">
                                <div className="action-icon">👥</div>
                                <h3>Manage Users</h3>
                                <p>View and manage users</p>
                            </Link>

                            <Link to="/shoppers" className="action-card">
                                <div className="action-icon">🛍️</div>
                                <h3>Manage Shoppers</h3>
                                <p>View and manage shoppers</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;