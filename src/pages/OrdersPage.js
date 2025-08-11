import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './OrdersPage.css';

const OrdersPage = () => {
    const { admin } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchOrders(currentPage);
    }, [currentPage]);

    const fetchOrders = async (page) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/admin/orders?page=${page}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            setOrders(response.data.orders);
            setTotalPages(response.data.pagination.pages);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch orders');
            setLoading(false);
            console.error('Error fetching orders:', err);
        }
    };

    const handleUpdateOrderStatus = async (orderId, status) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/orders/${orderId}`,
                { status },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                }
            );

            // Update the order in the state
            setOrders(orders.map(order =>
                order._id === orderId ? { ...order, status: response.data.status } : order
            ));
        } catch (err) {
            setError('Failed to update order status');
            console.error('Error updating order status:', err);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) {
        return <div className="orders-page">Loading orders...</div>;
    }

    if (error) {
        return <div className="orders-page error">{error}</div>;
    }

    return (
        <div className="orders-page">
            <div className="orders-header">
                <h1>Manage Orders</h1>
            </div>

            <div className="orders-list">
                {orders.length === 0 ? (
                    <p>No orders found.</p>
                ) : (
                    orders.map(order => (
                        <div key={order._id} className="order-card">
                            <div className="order-info">
                                <h3>Order #{order._id}</h3>
                                <p className="order-customer">Customer: {order.customerId?.name || 'Unknown'}</p>
                                <p className="order-shop">Shop: {order.shopId?.name || 'Unknown'}</p>
                                <p className="order-shopper">Shopper: {order.personalShopperId?.name || 'Unassigned'}</p>
                                <p className="order-status">Status: {order.status}</p>
                                <p className="order-total">Total: ${order.totalAmount}</p>
                                <p className="order-date">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="order-actions">
                                <select
                                    value={order.status}
                                    onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                    className="status-select"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="preparing">Preparing</option>
                                    <option value="ready_for_pickup">Ready for Pickup</option>
                                    <option value="out_for_delivery">Out for Delivery</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
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

export default OrdersPage;