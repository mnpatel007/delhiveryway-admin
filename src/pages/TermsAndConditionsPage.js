import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import './TermsAndConditionsPage.css';

const TermsAndConditionsPage = () => {
    const [activeView, setActiveView] = useState('list'); // 'list', 'create', 'details'
    const [terms, setTerms] = useState([]);
    const [selectedTerms, setSelectedTerms] = useState(null);
    const [formData, setFormData] = useState({ title: '', content: '', version: '1.0' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchAllTerms();
        // Set up polling for real-time acceptance count updates
        const interval = setInterval(() => {
            if (selectedTerms) {
                fetchTermsDetails(selectedTerms._id);
            }
        }, 3000); // Poll every 3 seconds for real-time updates

        return () => clearInterval(interval);
    }, [selectedTerms]);

    const fetchAllTerms = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/terms/all');
            if (response.data.success) {
                setTerms(response.data.data.terms || []);
                setError('');
            } else {
                setError(response.data.message || 'Failed to fetch terms');
            }
        } catch (err) {
            setError('Failed to fetch terms and conditions');
            console.error('Error fetching terms:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTermsDetails = async (termsId) => {
        try {
            const response = await axiosInstance.get(`/terms/${termsId}/details`);
            if (response.data.success) {
                setSelectedTerms(response.data.data.terms);
            }
        } catch (err) {
            console.error('Error fetching terms details:', err);
        }
    };

    const handleCreateTerms = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            setError('Title and content are required');
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.post('/terms/create', formData);
            if (response.data.success) {
                setSuccess('Terms & Conditions created and published successfully!');
                setFormData({ title: '', content: '', version: '1.0' });
                setActiveView('list');
                // Refresh the terms list
                await fetchAllTerms();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(response.data.message || 'Failed to create terms');
            }
        } catch (err) {
            setError('Failed to create terms and conditions');
            console.error('Error creating terms:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (termsItem) => {
        fetchTermsDetails(termsItem._id);
        setSelectedTerms(termsItem);
        setActiveView('details');
    };

    const handleBackToList = () => {
        setSelectedTerms(null);
        setActiveView('list');
    };

    return (
        <div className="terms-page">
            <header className="terms-header">
                <h1>Terms & Conditions Management</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setActiveView('create');
                        setFormData({ title: '', content: '', version: '1.0' });
                    }}
                >
                    + Create New Terms
                </button>
            </header>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {activeView === 'list' && (
                <div className="terms-list-section">
                    <h2>All Terms & Conditions</h2>
                    {loading ? (
                        <div className="loading">Loading terms...</div>
                    ) : terms.length === 0 ? (
                        <div className="no-data">
                            <p>No terms and conditions created yet.</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => setActiveView('create')}
                            >
                                Create First Terms
                            </button>
                        </div>
                    ) : (
                        <div className="terms-grid">
                            {terms.map(termsItem => (
                                <div key={termsItem._id} className={`terms-card ${termsItem.isActive ? 'active' : 'inactive'}`}>
                                    <div className="terms-card-header">
                                        <h3>{termsItem.title}</h3>
                                        <span className={`badge ${termsItem.isActive ? 'badge-active' : 'badge-inactive'}`}>
                                            {termsItem.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="terms-card-body">
                                        <p><strong>Version:</strong> {termsItem.version}</p>
                                        <p><strong>Acceptances:</strong> <span className="acceptance-count">{termsItem.acceptanceCount || 0}</span></p>
                                        <p><strong>Created:</strong> {new Date(termsItem.createdAt).toLocaleDateString()}</p>
                                        {termsItem.createdBy && (
                                            <p><strong>Created By:</strong> {termsItem.createdBy.name || termsItem.createdBy.email}</p>
                                        )}
                                    </div>
                                    <div className="terms-card-footer">
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => handleViewDetails(termsItem)}
                                        >
                                            View Details & Stats
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeView === 'create' && (
                <div className="terms-create-section">
                    <h2>Create New Terms & Conditions</h2>
                    <form onSubmit={handleCreateTerms} className="terms-form">
                        <div className="form-group">
                            <label>Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Terms of Service - v2.0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Version (optional)</label>
                            <input
                                type="text"
                                value={formData.version}
                                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                placeholder="e.g., 1.0, 2.0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Content *</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Enter the full terms and conditions text here..."
                                rows="12"
                                required
                            />
                            <small>You can use HTML for formatting</small>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setActiveView('list')}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Publishing...' : 'Create & Publish'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeView === 'details' && selectedTerms && (
                <div className="terms-details-section">
                    <div className="details-header">
                        <button className="btn btn-secondary" onClick={handleBackToList}>
                            ← Back to List
                        </button>
                        <h2>{selectedTerms.title} <span className={`badge ${selectedTerms.isActive ? 'badge-active' : 'badge-inactive'}`}>{selectedTerms.isActive ? 'Active' : 'Inactive'}</span></h2>
                    </div>

                    <div className="details-content">
                        <div className="details-grid">
                            <div className="detail-box">
                                <h4>Acceptance Stats (Real-Time)</h4>
                                <div className="stat-big">{selectedTerms.acceptanceCount || 0}</div>
                                <p>users have accepted these terms</p>
                            </div>
                            <div className="detail-box">
                                <h4>Version</h4>
                                <p>{selectedTerms.version}</p>
                            </div>
                            <div className="detail-box">
                                <h4>Created</h4>
                                <p>{new Date(selectedTerms.createdAt).toLocaleDateString()} {new Date(selectedTerms.createdAt).toLocaleTimeString()}</p>
                            </div>
                            <div className="detail-box">
                                <h4>Created By</h4>
                                <p>{selectedTerms.createdBy?.name || selectedTerms.createdBy?.email || 'System'}</p>
                            </div>
                        </div>

                        <div className="terms-content-box">
                            <h4>Terms Content</h4>
                            <div className="terms-content" dangerouslySetInnerHTML={{ __html: selectedTerms.content }} />
                        </div>

                        <div className="acceptances-box">
                            <h4>Recent Acceptances ({selectedTerms.acceptedBy?.length || 0})</h4>
                            {selectedTerms.acceptedBy && selectedTerms.acceptedBy.length > 0 ? (
                                <div className="acceptances-list">
                                    {selectedTerms.acceptedBy.slice(-20).map((acceptance, idx) => (
                                        <div key={idx} className="acceptance-item">
                                            <div>
                                                <p className="user-name">{acceptance.userId?.name || 'Unknown'}</p>
                                                <p className="user-email">{acceptance.userId?.email || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="accepted-time">{new Date(acceptance.acceptedAt).toLocaleString()}</p>
                                                {acceptance.ipAddress && <p className="ip-address">{acceptance.ipAddress}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No acceptances yet</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TermsAndConditionsPage;
