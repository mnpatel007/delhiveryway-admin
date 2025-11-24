import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../core/utils/axios';
import './DeliveryDiscountsPage.css';

const DeliveryDiscountsPage = () => {
    const [discounts, setDiscounts] = useState([]);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        discountType: 'fixed',
        discountValue: '',
        startDate: '',
        endDate: '',
        shopId: ''
    });

    useEffect(() => {
        fetchDiscounts();
        fetchShops();
    }, []);

    const fetchDiscounts = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/delivery/discounts');
            if (res.data.success) {
                setDiscounts(res.data.data.discounts);
            }
        } catch (err) {
            setError('Failed to fetch discounts');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchShops = async () => {
        try {
            const res = await axiosInstance.get('/shops');
            if (res.data.success) {
                setShops(res.data.data.shops || []);
            }
        } catch (err) {
            console.error('Failed to fetch shops', err);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            discountType: 'fixed',
            discountValue: '',
            startDate: '',
            endDate: '',
            shopId: ''
        });
        setIsEditing(false);
        setEditId(null);
        setShowCreateModal(false);
    };

    const handleEdit = (discount) => {
        setFormData({
            name: discount.name || '',
            discountType: discount.discountType,
            discountValue: discount.discountValue || '',
            startDate: discount.startDate ? new Date(discount.startDate).toISOString().slice(0, 16) : '',
            endDate: discount.endDate ? new Date(discount.endDate).toISOString().slice(0, 16) : '',
            shopId: discount.shopId?._id || ''
        });
        setIsEditing(true);
        setEditId(discount._id);
        setShowCreateModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (!payload.shopId) payload.shopId = null; // Ensure null if empty string

            let res;
            if (isEditing) {
                res = await axiosInstance.put(`/delivery/discounts/${editId}`, payload);
            } else {
                res = await axiosInstance.post('/delivery/discounts', payload);
            }

            if (res.data.success) {
                resetForm();
                fetchDiscounts();
            }
        } catch (err) {
            alert(isEditing ? 'Failed to update discount' : 'Failed to create discount');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this discount?')) return;
        try {
            await axiosInstance.delete(`/delivery/discounts/${id}`);
            fetchDiscounts();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const handleToggle = async (id) => {
        try {
            await axiosInstance.patch(`/delivery/discounts/${id}/toggle`);
            fetchDiscounts();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="discounts-page">
            <div className="page-header-container">
                <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
                <header className="page-header">
                    <h1>Delivery Discounts</h1>
                    <button className="btn-primary" onClick={() => { resetForm(); setShowCreateModal(true); }}>+ Add Discount</button>
                </header>
            </div>

            {loading ? <div className="loading">Loading...</div> : (
                <div className="discounts-grid">
                    {discounts.map(d => (
                        <div key={d._id} className={`discount-card ${d.isActive ? 'active' : 'inactive'}`}>
                            <div className="card-header">
                                <h3>{d.name || 'Untitled Discount'}</h3>
                                <span className={`status-badge ${d.isActive ? 'active' : 'inactive'}`}>
                                    {d.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="shop-badge">
                                {d.shopId ? `Shop: ${d.shopId.name}` : 'All Shops'}
                            </p>
                            <div className="discount-details">
                                <div className="detail-item">
                                    <span className="label">Type:</span>
                                    <span className="value">{d.discountType}</span>
                                </div>
                                {d.discountType !== 'free' && (
                                    <div className="detail-item">
                                        <span className="label">Value:</span>
                                        <span className="value">{d.discountValue}</span>
                                    </div>
                                )}
                            </div>
                            <div className="discount-dates">
                                <p><strong>Start:</strong> {new Date(d.startDate).toLocaleDateString()}</p>
                                <p><strong>End:</strong> {new Date(d.endDate).toLocaleDateString()}</p>
                            </div>
                            <div className="card-actions">
                                <button className="btn-secondary" onClick={() => handleToggle(d._id)}>
                                    {d.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button className="btn-secondary" onClick={() => handleEdit(d)}>Edit</button>
                                <button className="btn-danger" onClick={() => handleDelete(d._id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{isEditing ? 'Edit Discount' : 'Create Discount'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Name (Optional)</label>
                                <input
                                    placeholder="e.g. Festival Offer"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Applicable Shop</label>
                                <select
                                    value={formData.shopId}
                                    onChange={e => setFormData({ ...formData, shopId: e.target.value })}
                                >
                                    <option value="">All Shops</option>
                                    {shops.map(shop => (
                                        <option key={shop._id} value={shop._id}>{shop.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select
                                    value={formData.discountType}
                                    onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                                >
                                    <option value="fixed">Fixed Amount Off</option>
                                    <option value="percentage">Percentage Off</option>
                                    <option value="free">Free Delivery</option>
                                </select>
                            </div>
                            {formData.discountType !== 'free' && (
                                <div className="form-group">
                                    <label>Value</label>
                                    <input
                                        type="number"
                                        placeholder="Value"
                                        value={formData.discountValue}
                                        onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                                        required
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
                                <button type="submit" className="btn-primary">{isEditing ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryDiscountsPage;
