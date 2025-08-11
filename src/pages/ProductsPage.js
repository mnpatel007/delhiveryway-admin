import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProductsPage = () => {
    const { logout } = useAuth();

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>Products Management</h1>
                </div>
                <div className="header-right">
                    <button className="logout-btn" onClick={logout}>
                        Logout
                    </button>
                </div>
            </header>

            <nav className="dashboard-nav">
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/shops" className="nav-link">Shops</Link>
                <Link to="/products" className="nav-link active">Products</Link>
            </nav>

            <main className="dashboard-content">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <h2>Products Management</h2>
                    <p>This page will allow you to add products to shops and manage inventory.</p>
                    <p>Coming soon...</p>
                </div>
            </main>
        </div>
    );
};

export default ProductsPage;