import React, { useState, useEffect } from 'react';
import { useAuth } from '../core/context/AuthContext';
import api, { adminAPI } from '../core/services/api';
import './NoticesPage.css';

const NoticesPage = () => {
    const { admin } = useAuth();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingNotice, setEditingNotice] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        priority: 'medium',
        displayType: 'one-time',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            setLoading(true);
            console.log('🔄 Fetching notices...');
            console.log('🔑 Admin token exists:', !!localStorage.getItem('adminToken'));
            console.log('👤 Admin user:', admin?.name || 'Unknown');

            const response = await adminAPI.getNotices();
            if (response.data.success) {
                console.log('✅ Notices fetched successfully:', response.data.data.notices.length);
                setNotices(response.data.data.notices);
            }
        } catch (error) {
            console.error('Error fetching notices:', error);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            alert('Failed to fetch notices: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData
            };

            if (editingNotice) {
                // Update existing notice
                const response = await adminAPI.updateNotice(editingNotice._id, submitData);
                if (response.data.success) {
                    alert('Notice updated successfully!');
                    fetchNotices();
                    resetForm();
                }
            } else {
                // Create new notice
                const response = await adminAPI.createNotice(submitData);
                if (response.data.success) {
                    alert('Notice created successfully! All customers will see this alert immediately.');
                    fetchNotices();
                    resetForm();
                }
            }
        } catch (error) {
            console.error('Error saving notice:', error);
            alert('Failed to save notice: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (notice) => {
        setEditingNotice(notice);
        setFormData({
            title: notice.title,
            message: notice.message,
            type: notice.type,
            priority: notice.priority,
            displayType: notice.displayType || 'one-time',
            startDate: notice.startDate ? new Date(notice.startDate).toISOString().slice(0, 16) : '',
            endDate: notice.endDate ? new Date(notice.endDate).toISOString().slice(0, 16) : ''
        });
        setShowCreateModal(true);
    };

    const handleDelete = async (noticeId) => {
        if (window.confirm('Are you sure you want to delete this notice?')) {
            try {
                const response = await adminAPI.deleteNotice(noticeId);
                if (response.data.success) {
                    alert('Notice deleted successfully!');
                    fetchNotices();
                }
            } catch (error) {
                console.error('Error deleting notice:', error);
                alert('Failed to delete notice: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const toggleStatus = async (notice) => {
        try {
            console.log('🔄 Toggling notice status for:', notice._id, 'to:', !notice.isActive);
            console.log('🔑 Admin token exists:', !!localStorage.getItem('adminToken'));

            const response = await adminAPI.updateNotice(notice._id, {
                isActive: !notice.isActive
            });
            if (response.data.success) {
                console.log('✅ Notice status updated successfully');
                fetchNotices();
            }
        } catch (error) {
            console.error('Error toggling notice status:', error);
            console.error('Error details:', error.response?.data);
            alert('Failed to update notice status: ' + (error.response?.data?.message || error.message));
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            message: '',
            type: 'info',
            priority: 'medium',
            displayType: 'one-time',
            startDate: '',
            endDate: ''
        });
        setEditingNotice(null);
        setShowCreateModal(false);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return '#dc3545';
            case 'high': return '#fd7e14';
            case 'medium': return '#ffc107';
            case 'low': return '#28a745';
            default: return '#6c757d';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'error': return '#dc3545';
            case 'warning': return '#ffc107';
            case 'success': return '#28a745';
            case 'info': return '#17a2b8';
            default: return '#6c757d';
        }
    };

    if (loading) {
        return (
            <div className="notices-page">
                <div className="loading">Loading notices...</div>
            </div>
        );
    }

    return (
        <div className="notices-page">
            <div className="notices-header">
                <h1>Customer Notices Management</h1>
                <p>Create and manage important announcements that will be shown to all customers</p>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    + Create New Notice
                </button>
            </div>

            <div className="notices-list">
                {notices.length === 0 ? (
                    <div className="no-notices">
                        <h3>No notices created yet</h3>
                        <p>Create your first notice to send important announcements to customers</p>
                    </div>
                ) : (
                    notices.map(notice => (
                        <div key={notice._id} className={`notice-card ${!notice.isActive ? 'inactive' : ''}`}>
                            <div className="notice-header">
                                <div className="notice-title-section">
                                    <h3>{notice.title}</h3>
                                    <div className="notice-badges">
                                        <span
                                            className="badge priority-badge"
                                            style={{ backgroundColor: getPriorityColor(notice.priority) }}
                                        >
                                            {notice.priority.toUpperCase()}
                                        </span>
                                        <span
                                            className="badge type-badge"
                                            style={{ backgroundColor: getTypeColor(notice.type) }}
                                        >
                                            {notice.type.toUpperCase()}
                                        </span>
                                        <span className={`badge status-badge ${notice.isActive ? 'active' : 'inactive'}`}>
                                            {notice.isActive ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                        <span className={`badge display-badge ${notice.displayType === 'permanent' ? 'permanent' : 'one-time'}`}>
                                            {notice.displayType === 'permanent' ? '📌 PERMANENT' : '⚡ ONE-TIME'}
                                        </span>
                                    </div>
                                </div>
                                <div className="notice-actions">
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => handleEdit(notice)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className={`btn btn-sm ${notice.isActive ? 'btn-warning' : 'btn-success'}`}
                                        onClick={() => toggleStatus(notice)}
                                    >
                                        {notice.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(notice._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <div className="notice-content">
                                <p>{notice.message}</p>
                            </div>
                            <div className="notice-meta">
                                <div className="notice-dates">
                                    <span>Start: {new Date(notice.startDate).toLocaleString()}</span>
                                    {notice.endDate && (
                                        <span>End: {new Date(notice.endDate).toLocaleString()}</span>
                                    )}
                                </div>
                                <div className="notice-stats">
                                    <span>Views: {notice.viewedBy?.length || 0}</span>
                                    <span>Created: {new Date(notice.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingNotice ? 'Edit Notice' : 'Create New Notice'}</h2>
                            <button className="close-btn" onClick={resetForm}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="notice-form">
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    maxLength={100}
                                    placeholder="Enter notice title"
                                />
                            </div>

                            <div className="form-group">
                                <label>Message *</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                    maxLength={500}
                                    rows={4}
                                    placeholder="Enter notice message"
                                />
                                <small>{formData.message.length}/500 characters</small>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="info">Info</option>
                                        <option value="warning">Warning</option>
                                        <option value="success">Success</option>
                                        <option value="error">Error</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Display Type</label>
                                <select
                                    value={formData.displayType}
                                    onChange={(e) => setFormData({ ...formData, displayType: e.target.value })}
                                    required
                                >
                                    <option value="one-time">⚡ One-time Notice (Dismissible Alert)</option>
                                    <option value="permanent">📌 Permanent Notice (Always visible on dashboard)</option>
                                </select>
                                <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    One-time: Shows as full-screen alert, can be dismissed by users<br />
                                    Permanent: Shows as small banner on dashboard, always visible
                                </small>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>End Date (Optional)</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>



                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingNotice ? 'Update Notice' : 'Create Notice'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoticesPage;