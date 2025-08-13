import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';
import './ShoppersPage.css';

const ShoppersPage = () => {
    const { admin } = useAuth();
    const [shoppers, setShoppers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchShoppers(currentPage);
    }, [currentPage]);

    const fetchShoppers = async (page) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/admin/shoppers?page=${page}`);
            if (response.data.success) {
                setShoppers(response.data.data.shoppers || []);
                setTotalPages(response.data.data.pagination?.pages || 1);
            } else {
                setError(response.data.message || 'Failed to fetch shoppers');
            }
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch shoppers');
            setLoading(false);
            console.error('Error fetching shoppers:', err);
        }
    };

    const handleDeleteShopper = async (shopperId) => {
        if (window.confirm('Are you sure you want to delete this shopper?')) {
            try {
                await axiosInstance.delete(`/admin/shoppers/${shopperId}`);
                setShoppers(shoppers.filter(shopper => shopper._id !== shopperId));
            } catch (err) {
                setError('Failed to delete shopper');
                console.error('Error deleting shopper:', err);
            }
        }
    };

    const handleUpdateShopperStatus = async (shopperId, isOnline) => {
        try {
            const response = await axiosInstance.put(`/admin/shoppers/${shopperId}`,
                { isOnline }
            );

            if (response.data.success) {
                // Update the shopper in the state
                setShoppers(shoppers.map(shopper =>
                    shopper._id === shopperId ? { ...shopper, isOnline: response.data.isOnline } : shopper
                ));

                console.log(`✅ Shopper status updated: ${isOnline ? 'Online' : 'Offline'}`);
            } else {
                setError(response.data.message || 'Failed to update shopper status');
            }
        } catch (err) {
            setError('Failed to update shopper status');
            console.error('Error updating shopper status:', err);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) {
        return <div className="shoppers-page">Loading shoppers...</div>;
    }

    if (error) {
        return <div className="shoppers-page error">{error}</div>;
    }

    return (
        <div className="shoppers-page">
            <div className="shoppers-header">
                <h1>Manage Personal Shoppers</h1>
            </div>

            <div className="shoppers-list">
                {shoppers.length === 0 ? (
                    <p>No shoppers found.</p>
                ) : (
                    shoppers.map(shopper => (
                        <div key={shopper._id} className="shopper-card">
                            <div className="shopper-info">
                                <h3>{shopper.name}</h3>
                                <p className="shopper-email">Email: {shopper.email}</p>
                                <p className="shopper-phone">Phone: {shopper.phone}</p>
                                <p className="shopper-status">Status:
                                    <span className={shopper.isOnline ? 'status-online' : 'status-offline'}>
                                        {shopper.isOnline ? ' Online' : ' Offline'}
                                    </span>
                                </p>
                                <p className="shopper-date">Joined: {new Date(shopper.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="shopper-actions">
                                <button
                                    className={shopper.isOnline ? 'status-btn offline' : 'status-btn online'}
                                    onClick={() => handleUpdateShopperStatus(shopper._id, !shopper.isOnline)}
                                >
                                    {shopper.isOnline ? 'Set Offline' : 'Set Online'}
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDeleteShopper(shopper._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShoppersPage;