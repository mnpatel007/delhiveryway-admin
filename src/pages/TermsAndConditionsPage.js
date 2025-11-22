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
    return (
        <div>
            {activeView === 'modal' && (
                <div style={{
                    background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
                    borderRadius: '24px',
                    padding: '0',
                    boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.25)',
                    color: '#222',
                    maxWidth: '600px',
                    margin: '80px auto',
                    border: 'none',
                    overflow: 'hidden',
                    fontFamily: 'Segoe UI, Roboto, Arial, sans-serif',
                }}>
                    <div style={{
                        padding: '36px 36px 0 36px',
                        background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
                        borderTopLeftRadius: '24px',
                        borderTopRightRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        <span style={{ fontSize: '2.7rem', marginRight: '20px' }}>📜</span>
                        <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '2px', color: '#fff', marginBottom: '6px' }}>PLEASE READ</div>
                            <div style={{ fontSize: '2.4rem', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>Terms and Conditions</div>
                        </div>
                    </div>
                    <div style={{ padding: '36px', background: '#f8f9fa', fontSize: '1.15rem', minHeight: '140px', color: '#222', lineHeight: '1.7' }}>
                        {content}
                    </div>
                    <div style={{ padding: '0 36px 36px 36px', background: '#f8f9fa', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <div style={{ color: '#666', fontSize: '1.05rem', marginBottom: '20px', fontStyle: 'italic' }}>
                            ✓ You need to accept these terms to continue using our services
                        </div>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <button onClick={onDecline} style={{
                                padding: '13px 36px',
                                borderRadius: '10px',
                                border: '1px solid #bbb',
                                background: '#fff',
                                color: '#232526',
                                fontWeight: 'bold',
                                fontSize: '1.13rem',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                transition: 'background 0.2s',
                            }}>✗ Decline & Exit</button>
                            <button onClick={onAccept} style={{
                                padding: '13px 36px',
                                borderRadius: '10px',
                                border: 'none',
                                background: 'linear-gradient(90deg, #0072ff 0%, #00c6ff 100%)',
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: '1.13rem',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                                transition: 'background 0.2s',
                            }}>✓ Accept & Continue</button>
                        </div>
                    </div>
                </div>
            )}
            return (
            <div>
                {activeView === 'modal' && (
                    <div style={{
                        background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
                        borderRadius: '24px',
                        padding: '0',
                        boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.25)',
                        color: '#222',
                        maxWidth: '600px',
                        margin: '80px auto',
                        border: 'none',
                        overflow: 'hidden',
                        fontFamily: 'Segoe UI, Roboto, Arial, sans-serif',
                    }}>
                        <div style={{
                            padding: '36px 36px 0 36px',
                            background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
                            borderTopLeftRadius: '24px',
                            borderTopRightRadius: '24px',
                            display: 'flex',
                            alignItems: 'center',
                        }}>
                            <span style={{ fontSize: '2.7rem', marginRight: '20px' }}>📜</span>
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '2px', color: '#fff', marginBottom: '6px' }}>PLEASE READ</div>
                                <div style={{ fontSize: '2.4rem', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>Terms and Conditions</div>
                            </div>
                        </div>
                        <div style={{ padding: '36px', background: '#f8f9fa', fontSize: '1.15rem', minHeight: '140px', color: '#222', lineHeight: '1.7' }}>
                            {content}
                        </div>
                        <div style={{ padding: '0 36px 36px 36px', background: '#f8f9fa', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <div style={{ color: '#666', fontSize: '1.05rem', marginBottom: '20px', fontStyle: 'italic' }}>
                                ✓ You need to accept these terms to continue using our services
                            </div>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <button onClick={onDecline} style={{
                                    padding: '13px 36px',
                                    borderRadius: '10px',
                                    border: '1px solid #bbb',
                                    background: '#fff',
                                    color: '#232526',
                                    fontWeight: 'bold',
                                    fontSize: '1.13rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                    transition: 'background 0.2s',
                                }}>✗ Decline & Exit</button>
                                <button onClick={onAccept} style={{
                                    padding: '13px 36px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: 'linear-gradient(90deg, #0072ff 0%, #00c6ff 100%)',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    fontSize: '1.13rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                                    transition: 'background 0.2s',
                                }}>✓ Accept & Continue</button>
                            </div>
                        </div>
                    </div>
                )}
                {activeView === 'create' && (
                    <div className="terms-create-section">
                        {/* ...existing code for create section... */}
                    </div>
                )}
            </div>

            {
                activeView === 'create' && (
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
                )
            }

            {
                activeView === 'details' && selectedTerms && (
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
                )
            }
        </div >
    );
};

export default TermsAndConditionsPage;
