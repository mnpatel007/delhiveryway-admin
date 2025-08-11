import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ShopsPage = () => {
    const { logout } = useAuth();

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>Shops Management</h1>
                </div>
                <div className="header-right">
                    <button className="logout-btn" onClick={logout}>
                        Logout
                    </button>
                </div>
            </header>

            <nav className="dashboard-nav">
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/shops" className="nav-link active">Shops</Link>
                <Link to="/products" className="nav-link">Products</Link>
            </nav>

            <main className="dashboard-content">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <h2>Shops Management</h2>
                    <p>This page will allow you to add, edit, and manage shops.</p>
                    <p>Coming soon...</p>
                </div>
            </main>
        </div>
    );
};

export default ShopsPage;