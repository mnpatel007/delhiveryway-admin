import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ORDER_STATUS_OPTIONS, getStatusLabel, getStatusMeta } from '../constants/orderStatus';
import './OrderMonitoring.css';

const OrderMonitoring = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
        // Set up real-time updates
        const interval = setInterval(fetchOrders, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/admin/orders');
            if (response.data.success) {
                setOrders(response.data.data.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        const meta = getStatusMeta(status);
        return {
            backgroundColor: meta.background,
            color: meta.color
        };
    };

    const IN_PROGRESS_STATUSES = [
        'accepted_by_shopper',
        'shopper_at_shop',
        'shopping_in_progress',
        'shopper_revised_order',
        'customer_reviewing_revision',
        'customer_approved_revision',
        'revision_rejected',
        'final_shopping',
        'bill_uploaded',
        'bill_approved',
        'bill_rejected',
        'out_for_delivery'
    ];

    const ATTENTION_STATUSES = [
        'shopper_revised_order',
        'customer_reviewing_revision',
        'revision_rejected',
        'bill_uploaded',
        'bill_rejected'
    ];

    const CANCELLED_STATUSES = ['cancelled', 'refunded'];

    const filteredOrders = orders.filter(order => {
        const matchesFilter = filter === 'all' || order.status === filter;
        const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.personalShopperId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getOrderStats = () => {
        const stats = {
            total: orders.length,
            pending: orders.filter(o => o.status === 'pending_shopper').length,
            inProgress: orders.filter(o => IN_PROGRESS_STATUSES.includes(o.status)).length,
            needsAttention: orders.filter(o => ATTENTION_STATUSES.includes(o.status)).length,
            completed: orders.filter(o => o.status === 'delivered').length,
            cancelled: orders.filter(o => CANCELLED_STATUSES.includes(o.status)).length
        };
        return stats;
    };

    const stats = getOrderStats();

    if (loading) {
        return (
            <div className="order-monitoring">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading order data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="order-monitoring">
            <div className="monitoring-header">
                <h2>Order Monitoring Dashboard</h2>
                <p>Real-time tracking of all orders in the system</p>
            </div>

            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-number">{stats.total}</div>
                    <div className="stat-label">Total Orders</div>
                </div>
                <div className="stat-card pending">
                    <div className="stat-number">{stats.pending}</div>
                    <div className="stat-label">Pending Assignment</div>
                </div>
                <div className="stat-card in-progress">
                    <div className="stat-number">{stats.inProgress}</div>
                    <div className="stat-label">In Progress</div>
                </div>
                <div className="stat-card attention">
                    <div className="stat-number">{stats.needsAttention}</div>
                    <div className="stat-label">Needs Attention</div>
                </div>
                <div className="stat-card completed">
                    <div className="stat-number">{stats.completed}</div>
                    <div className="stat-label">Completed</div>
                </div>
                <div className="stat-card cancelled">
                    <div className="stat-number">{stats.cancelled}</div>
                    <div className="stat-label">Cancelled</div>
                </div>
            </div>

            <div className="monitoring-controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by order number, customer, or shopper..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="filter-controls">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Orders</option>
                        {ORDER_STATUS_OPTIONS.map(({ value, label }) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="orders-table">
                <div className="table-header">
                    <div className="col-order">Order</div>
                    <div className="col-customer">Customer</div>
                    <div className="col-shopper">Shopper</div>
                    <div className="col-status">Status</div>
                    <div className="col-amount">Amount</div>
                    <div className="col-time">Time</div>
                    <div className="col-actions">Actions</div>
                </div>

                <div className="table-body">
                    {filteredOrders.map(order => (
                        <div key={order._id} className="table-row">
                            <div className="col-order">
                                <div className="order-info">
                                    <span className="order-number">#{order.orderNumber}</span>
                                    <span className="order-items">{order.items?.length || 0} items</span>
                                </div>
                            </div>
                            <div className="col-customer">
                                <div className="customer-info">
                                    <span className="customer-name">{order.customerId?.name || 'N/A'}</span>
                                    <span className="customer-phone">{order.deliveryAddress?.contactPhone || order.customerId?.phone || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="col-shopper">
                                <div className="shopper-info">
                                    <span className="shopper-name">
                                        {order.personalShopperId?.name || 'Unassigned'}
                                    </span>
                                    {order.personalShopperId?.phone && (
                                        <span className="shopper-phone">{order.personalShopperId.phone}</span>
                                    )}
                                </div>
                            </div>
                            <div className="col-status">
                                <span
                                    className="status-badge"
                                    style={getStatusStyle(order.status)}
                                >
                                    {getStatusLabel(order.status)}
                                </span>
                            </div>
                            <div className="col-amount">
                                <div className="amount-info">
                                    <span className="original-amount">
                                        ₹{order.orderValue?.total?.toFixed(2) || '0.00'}
                                    </span>
                                    {order.revisedOrderValue?.total && (
                                        <span className="revised-amount">
                                            → ₹{order.revisedOrderValue.total.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="col-time">
                                <div className="time-info">
                                    <span className="created-time">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className="created-time-detail">
                                        {new Date(order.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                            <div className="col-actions">
                                <button
                                    className="action-btn view"
                                    onClick={() => window.open(`/admin/orders/${order._id}`, '_blank')}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {filteredOrders.length === 0 && (
                <div className="no-orders">
                    <div className="no-orders-icon">📋</div>
                    <h3>No orders found</h3>
                    <p>No orders match your current filter criteria.</p>
                </div>
            )}
        </div>
    );
};

export default OrderMonitoring;







