import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TermsPage.css';

const TermsPage = () => {
    const [terms, setTerms] = useState([]);
    const [currentTerms, setCurrentTerms] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [liveCount, setLiveCount] = useState(0);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        version: ''
    });

    // Test if terms routes are available
    const testTermsRoutes = async () => {
        try {
            console.log('🧪 Testing terms routes...');
            const response = await axios.get('/api/admin/terms/test');
            console.log('✅ Terms routes test successful:', response.data);
            return true;
        } catch (error) {
            console.error('❌ Terms routes test failed:', error);
            if (error.response?.status === 404) {
                setError('Terms routes not found on server. Backend needs to be updated.');
            }
            return false;
        }
    };

    // Fetch all terms
    const fetchTerms = async () => {
        try {
            setLoading(true);

            // First test if routes are available
            const routesAvailable = await testTermsRoutes();
            if (!routesAvailable) {
                return;
            }

            const response = await axios.get('/api/admin/terms/all');

            if (response.data.success) {
                setTerms(response.data.data.terms);
                const active = response.data.data.terms.find(t => t.isActive);
                setCurrentTerms(active);

                if (active) {
                    fetchLiveCount(active._id);
                }
            }
        } catch (error) {
            console.error('Failed to fetch terms:', error);
            setError('Failed to load terms and conditions');
        } finally {
            setLoading(false);
        }
    };

    // Fetch live acceptance count
    const fetchLiveCount = async (termsId) => {
        try {
            const response = await axios.get(`/api/admin/terms/${termsId}/count`);
            if (response.data.success) {
                setLiveCount(response.data.data.acceptanceCount);
            }
        } catch (error) {
            console.error('Failed to fetch live count:', error);
        }
    };

    // Create new terms
    const createTerms = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content.trim()) {
            setError('Title and content are required');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('🚀 Creating terms with data:', formData);
            console.log('🔗 API URL:', '/api/terms/create');

            const response = await axios.post('/api/admin/terms/create', formData);
            console.log('✅ Terms creation response:', response.data);

            if (response.data.success) {
                setFormData({ title: '', content: '', version: '' });
                setShowCreateForm(false);
                fetchTerms(); // Refresh the list
                alert('Terms and conditions created successfully! All customers will see this immediately.');
            }
        } catch (error) {
            console.error('❌ Failed to create terms:', error);
            console.error('❌ Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                url: error.config?.url,
                method: error.config?.method
            });

            let errorMessage = 'Failed to create terms and conditions';

            if (error.response?.status === 405) {
                errorMessage = 'Server route not found. Please ensure the backend is updated with terms routes.';
            } else if (error.response?.status === 401) {
                errorMessage = 'Authentication failed. Please login again.';
            } else if (error.response?.status === 403) {
                errorMessage = 'Access denied. Admin permissions required.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    // Set up live updates via polling (you could also use socket.io)
    useEffect(() => {
        fetchTerms();

        // Poll for live count updates every 5 seconds
        const interval = setInterval(() => {
            if (currentTerms) {
                fetchLiveCount(currentTerms._id);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [currentTerms?._id]);

    return (
        <div className="terms-page">
            <div className="terms-header">
                <h1>Terms & Conditions Management</h1>
                <button
                    className="create-terms-btn"
                    onClick={() => setShowCreateForm(true)}
                    disabled={loading}
                >
                    + Create New Terms
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {/* Live Stats */}
            {currentTerms && (
                <div className="live-stats">
                    <div className="stat-card active">
                        <h3>Current Active Terms</h3>
                        <p className="stat-title">{currentTerms.title}</p>
                        <p className="stat-version">Version {currentTerms.version}</p>
                        <p className="stat-date">Created: {formatDate(currentTerms.createdAt)}</p>
                    </div>

                    <div className="stat-card live-count">
                        <h3>Live Acceptance Count</h3>
                        <p className="stat-number">{liveCount}</p>
                        <p className="stat-label">customers accepted</p>
                        <div className="live-indicator">🟢 LIVE</div>
                    </div>
                </div>
            )}

            {/* Create Form Modal */}
            {showCreateForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Create New Terms & Conditions</h2>
                            <button
                                className="close-btn"
                                onClick={() => setShowCreateForm(false)}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={createTerms} className="terms-form">
                            <div className="form-group">
                                <label htmlFor="title">Title *</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Terms and Conditions of Service"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="version">Version</label>
                                <input
                                    type="text"
                                    id="version"
                                    name="version"
                                    value={formData.version}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 2.0, 2024.1"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="content">Content *</label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    placeholder="Enter the complete terms and conditions content..."
                                    rows={15}
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setShowCreateForm(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Creating...' : 'Create & Activate'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Terms History */}
            <div className="terms-history">
                <h2>Terms History</h2>

                {loading && terms.length === 0 ? (
                    <div className="loading">Loading terms...</div>
                ) : (
                    <div className="terms-list">
                        {terms.map(term => (
                            <div
                                key={term._id}
                                className={`term-card ${term.isActive ? 'active' : ''}`}
                            >
                                <div className="term-header">
                                    <h3>{term.title}</h3>
                                    <div className="term-badges">
                                        <span className="version-badge">v{term.version}</span>
                                        {term.isActive && <span className="active-badge">ACTIVE</span>}
                                    </div>
                                </div>

                                <div className="term-stats">
                                    <div className="stat">
                                        <span className="stat-label">Acceptances:</span>
                                        <span className="stat-value">{term.acceptanceCount}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">Created:</span>
                                        <span className="stat-value">{formatDate(term.createdAt)}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">By:</span>
                                        <span className="stat-value">{term.createdBy?.name || 'Admin'}</span>
                                    </div>
                                </div>

                                <div className="term-content-preview">
                                    {term.content.substring(0, 200)}...
                                </div>
                            </div>
                        ))}

                        {terms.length === 0 && !loading && (
                            <div className="no-terms">
                                <p>No terms and conditions created yet.</p>
                                <button
                                    className="create-first-btn"
                                    onClick={() => setShowCreateForm(true)}
                                >
                                    Create First Terms
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TermsPage;