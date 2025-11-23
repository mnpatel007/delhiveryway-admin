import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import './DeliveryDiscountsPage.css';

const DeliveryDiscountsPage = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        discountType: 'fixed',
        discountValue: '',
        minOrderValue: 0,
        startDate: '',
        endDate: '',
        description: ''
    });

    useEffect(() => {
        fetchDiscounts();
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

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosInstance.post('/delivery/discounts', formData);
            if (res.data.success) {
                setShowCreateModal(false);
                setFormData({
                    name: '',
                    discountType: 'fixed',
                    discountValue: '',
                    minOrderValue: 0,
                    startDate: '',
                    endDate: '',
                    description: ''
                });
                fetchDiscounts();
            }
        } catch (err) {
            alert('Failed to create discount');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
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
                    <button className="btn-primary" onClick={() => setShowCreateModal(true)}>+ Add Discount</button>
                </header>
            </div>

            {loading ? <div className="loading">Loading...</div> : (
                <div className="discounts-grid">
                    {discounts.map(d => (
                        <div key={d._id} className={`discount-card ${d.isActive ? 'active' : 'inactive'}`}>
                            <div className="card-header">
                                <h3>{d.name}</h3>
                                <span className={`status-badge ${d.isActive ? 'active' : 'inactive'}`}>
                                    {d.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="description">{d.description}</p>
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
                                <div className="detail-item">
                                    <span className="label">Min Order:</span>
                                    <span className="value">₹{d.minOrderValue}</span>
                                </div>
                            </div>
                            <div className="discount-dates">
                                <p>Start: {new Date(d.startDate).toLocaleDateString()}</p>
                                <p>End: {new Date(d.endDate).toLocaleDateString()}</p>
                            </div>
                            <div className="card-actions">
                                <button className="btn-secondary" onClick={() => handleToggle(d._id)}>
                                    {d.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button className="btn-danger" onClick={() => handleDelete(d._id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Create Discount</h2>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    placeholder="e.g. Festival Offer"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
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
                                <label>Min Order Value</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={formData.minOrderValue}
                                    onChange={e => setFormData({ ...formData, minOrderValue: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Start Date</label>
                                <input
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date</label>
                                <input
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    placeholder="Description"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryDiscountsPage;
