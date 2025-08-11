import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
    const { admin, logout } = useAuth();

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>Admin Dashboard</h1>
                    <p>Welcome back, {admin?.name}</p>
                </div>
                <div className="header-right">
                    <button className="logout-btn" onClick={logout}>
                        Logout
                    </button>
                </div>
            </header>

            <nav className="dashboard-nav">
                <Link to="/dashboard" className="nav-link active">Dashboard</Link>
                <Link to="/shops" className="nav-link">Shops</Link>
                <Link to="/products" className="nav-link">Products</Link>
            </nav>

            <main className="dashboard-content">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">🏪</div>
                        <div className="stat-info">
                            <h3>Total Shops</h3>
                            <p className="stat-number">0</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">📦</div>
                        <div className="stat-info">
                            <h3>Total Products</h3>
                            <p className="stat-number">0</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">🛒</div>
                        <div className="stat-info">
                            <h3>Total Orders</h3>
                            <p className="stat-number">0</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">🛍️</div>
                        <div className="stat-info">
                            <h3>Personal Shoppers</h3>
                            <p className="stat-number">0</p>
                        </div>
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
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;