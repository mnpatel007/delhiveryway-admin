import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';
import './OrdersPage.css';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const calculateOrderTotal = (order) => {
        // Try different total field names
        if (order.totalAmount) return order.totalAmount;
        if (order.total) return order.total;
        if (order.grandTotal) return order.grandTotal;
        if (order.finalAmount) return order.finalAmount;
        if (order.amount) return order.amount;

        // Calculate from items if available
        if (order.items && Array.isArray(order.items)) {
            const itemsTotal = order.items.reduce((sum, item) => {
                return sum + ((item.price || 0) * (item.quantity || 1));
            }, 0);
            const deliveryFee = order.deliveryFee || 30;
            // NO TAXES - ONLY subtotal + delivery fee
            return itemsTotal + deliveryFee;
        }

        // Default fallback
        return 150;
    };

    useEffect(() => {
        fetchOrders(currentPage);
    }, [currentPage]);

    const fetchOrders = async (page) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/admin/orders?page=${page}`);
            if (response.data.success) {
                const orders = response.data.data.orders || [];
                console.log('Orders data:', orders);
                if (orders.length > 0) {
                    console.log('First order structure:', orders[0]);
                }
                setOrders(orders);
                setTotalPages(response.data.data.pagination?.pages || 1);
            } else {
                setError(response.data.message || 'Failed to fetch orders');
            }
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch orders');
            setLoading(false);
            console.error('Error fetching orders:', err);
        }
    };

    const handleUpdateOrderStatus = async (orderId, status) => {
        try {
            const response = await axiosInstance.put(`/admin/orders/${orderId}/status`,
                { status }
            );

            if (response.data.success) {
                // Update the order in the state
                setOrders(orders.map(order =>
                    order._id === orderId ? { ...order, status } : order
                ));
                setError(''); // Clear any previous errors
            } else {
                setError(response.data.message || 'Failed to update order status');
            }
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
                            <div className="order-header">
                                <h3>Order #{order._id?.slice(-8) || 'N/A'}</h3>
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

                            <div className="order-details">
                                <div className="order-basic-info">
                                    <p><strong>Customer:</strong> {order.customerId?.name || order.customer?.name || 'Unknown'}</p>
                                    <p><strong>Shop:</strong> {order.shopId?.name || order.shop?.name || 'Unknown'}</p>
                                    <p><strong>Shopper:</strong> {order.personalShopperId?.name || order.shopper?.name || 'Not Assigned'}</p>
                                    <p><strong>Status:</strong> <span className={`status-${order.status}`}>{order.status || 'pending'}</span></p>
                                    <p><strong>Date:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                                </div>

                                {/* Original Order Details */}
                                <div className="order-breakdown">
                                    <div className="original-order">
                                        <h4>Original Order</h4>
                                        {order.items && order.items.length > 0 ? (
                                            <div className="items-list">
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="item-row">
                                                        <span className="item-name">{item.name || 'Unknown Item'}</span>
                                                        <span className="item-details">
                                                            {item.quantity || 1} × ₹{item.price || 0} = ₹{(item.quantity || 1) * (item.price || 0)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p>No items found</p>
                                        )}
                                        <div className="order-totals">
                                            <div className="total-row">
                                                <span>Subtotal:</span>
                                                <span>₹{order.orderValue?.subtotal || 0}</span>
                                            </div>
                                            <div className="total-row">
                                                <span>Delivery Fee:</span>
                                                <span>₹{order.orderValue?.deliveryFee || 0}</span>
                                            </div>
                                            <div className="total-row grand-total">
                                                <span>Total:</span>
                                                <span>₹{order.orderValue?.total || calculateOrderTotal(order)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Revised Order Details (if exists) */}
                                    {order.revisedOrderValue && (
                                        <div className="revised-order">
                                            <h4>Revised Order</h4>
                                            {order.revisedItems && order.revisedItems.length > 0 ? (
                                                <div className="items-list">
                                                    {order.revisedItems.map((item, index) => (
                                                        <div key={index} className="item-row">
                                                            <span className="item-name">
                                                                {item.name || 'Unknown Item'}
                                                                {item.isAvailable === false && <span className="unavailable"> (Unavailable)</span>}
                                                            </span>
                                                            <span className="item-details">
                                                                {item.revisedQuantity !== undefined ? item.revisedQuantity : item.quantity || 1} ×
                                                                ₹{item.revisedPrice !== undefined ? item.revisedPrice : item.price || 0} =
                                                                ₹{(item.revisedQuantity !== undefined ? item.revisedQuantity : item.quantity || 1) *
                                                                    (item.revisedPrice !== undefined ? item.revisedPrice : item.price || 0)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p>No revised items</p>
                                            )}
                                            <div className="order-totals">
                                                <div className="total-row">
                                                    <span>Subtotal:</span>
                                                    <span>₹{order.revisedOrderValue?.subtotal || 0}</span>
                                                </div>
                                                <div className="total-row">
                                                    <span>Delivery Fee:</span>
                                                    <span>₹{order.revisedOrderValue?.deliveryFee || order.orderValue?.deliveryFee || 0}</span>
                                                </div>
                                                <div className="total-row grand-total">
                                                    <span>Total:</span>
                                                    <span>₹{order.revisedOrderValue?.total || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Shopper Commission */}
                                    <div className="shopper-commission">
                                        <h4>Shopper Earnings</h4>
                                        <div className="total-row">
                                            <span>Commission:</span>
                                            <span>₹{order.shopperCommission || order.orderValue?.deliveryFee || 0}</span>
                                        </div>
                                    </div>
                                </div>
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