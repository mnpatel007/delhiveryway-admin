import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import './SettingsPage.css';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        deliverySettings: {
            feePerKm: 10,
            campusRadius: 2000,
            campusCoordinates: {
                lat: 22.5201,
                lng: 75.9220
            }
        },
        generalSettings: {
            platformName: 'DelhiveryWay',
            supportEmail: 'support@delhiveryway.com',
            supportPhone: '+91-9999999999'
        },
        orderSettings: {
            maxOrderValue: 10000,
            minOrderValue: 50
        }
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/admin/settings');

            if (response.data.success) {
                setSettings(response.data.data);
            } else {
                setError('Failed to load settings');
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleNestedInputChange = (section, nestedField, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [nestedField]: {
                    ...prev[section][nestedField],
                    [field]: value
                }
            }
        }));
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const response = await axiosInstance.put('/admin/settings', settings);

            if (response.data.success) {
                setSuccess('Settings updated successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(response.data.message || 'Failed to update settings');
            }
        } catch (err) {
            console.error('Error updating settings:', err);
            setError(err.response?.data?.message || 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="settings-page">
                <div className="loading">Loading settings...</div>
            </div>
        );
    }

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h1>Platform Settings</h1>
                <p>Configure delivery fees, campus boundaries, and other platform settings</p>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {success && (
                <div className="success-message">
                    {success}
                </div>
            )}

            <form onSubmit={handleSaveSettings} className="settings-form">
                {/* Delivery Settings */}
                <div className="settings-section">
                    <h2>🚚 Delivery Fee Settings</h2>
                    <p className="section-description">
                        Configure location-based delivery fees. Customers within campus pay base shop fee,
                        others pay base fee + distance charges.
                    </p>

                    <div className="form-group">
                        <label htmlFor="feePerKm">Fee per 500m (Outside Campus)</label>
                        <div className="input-with-unit">
                            <span className="currency">₹</span>
                            <input
                                type="number"
                                id="feePerKm"
                                value={settings.deliverySettings.feePerKm}
                                onChange={(e) => handleInputChange('deliverySettings', 'feePerKm', parseFloat(e.target.value) || 0)}
                                min="0"
                                max="100"
                                step="1"
                                required
                            />
                        </div>
                        <small className="form-help">
                            Additional fee charged for every 500m outside campus boundary
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="campusRadius">Campus Radius (meters)</label>
                        <div className="input-with-unit">
                            <input
                                type="number"
                                id="campusRadius"
                                value={settings.deliverySettings.campusRadius}
                                onChange={(e) => handleInputChange('deliverySettings', 'campusRadius', parseFloat(e.target.value) || 0)}
                                min="500"
                                max="10000"
                                step="100"
                                required
                            />
                            <span className="unit">m</span>
                        </div>
                        <small className="form-help">
                            Radius around campus center where base delivery fee applies
                        </small>
                    </div>

                    <div className="coordinates-group">
                        <h3>Campus Center Coordinates</h3>
                        <div className="coordinates-inputs">
                            <div className="form-group">
                                <label htmlFor="campusLat">Latitude</label>
                                <input
                                    type="number"
                                    id="campusLat"
                                    value={settings.deliverySettings.campusCoordinates.lat}
                                    onChange={(e) => handleNestedInputChange('deliverySettings', 'campusCoordinates', 'lat', parseFloat(e.target.value) || 0)}
                                    step="0.000001"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="campusLng">Longitude</label>
                                <input
                                    type="number"
                                    id="campusLng"
                                    value={settings.deliverySettings.campusCoordinates.lng}
                                    onChange={(e) => handleNestedInputChange('deliverySettings', 'campusCoordinates', 'lng', parseFloat(e.target.value) || 0)}
                                    step="0.000001"
                                    required
                                />
                            </div>
                        </div>
                        <small className="form-help">
                            Current coordinates are set for IIT Indore campus center
                        </small>
                    </div>
                </div>

                {/* General Settings */}
                <div className="settings-section">
                    <h2>⚙️ General Settings</h2>

                    <div className="form-group">
                        <label htmlFor="platformName">Platform Name</label>
                        <input
                            type="text"
                            id="platformName"
                            value={settings.generalSettings.platformName}
                            onChange={(e) => handleInputChange('generalSettings', 'platformName', e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="supportEmail">Support Email</label>
                        <input
                            type="email"
                            id="supportEmail"
                            value={settings.generalSettings.supportEmail}
                            onChange={(e) => handleInputChange('generalSettings', 'supportEmail', e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="supportPhone">Support Phone</label>
                        <input
                            type="tel"
                            id="supportPhone"
                            value={settings.generalSettings.supportPhone}
                            onChange={(e) => handleInputChange('generalSettings', 'supportPhone', e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Order Settings */}
                <div className="settings-section">
                    <h2>📦 Order Settings</h2>

                    <div className="form-group">
                        <label htmlFor="minOrderValue">Minimum Order Value</label>
                        <div className="input-with-unit">
                            <span className="currency">₹</span>
                            <input
                                type="number"
                                id="minOrderValue"
                                value={settings.orderSettings.minOrderValue}
                                onChange={(e) => handleInputChange('orderSettings', 'minOrderValue', parseFloat(e.target.value) || 0)}
                                min="0"
                                step="10"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="maxOrderValue">Maximum Order Value</label>
                        <div className="input-with-unit">
                            <span className="currency">₹</span>
                            <input
                                type="number"
                                id="maxOrderValue"
                                value={settings.orderSettings.maxOrderValue}
                                onChange={(e) => handleInputChange('orderSettings', 'maxOrderValue', parseFloat(e.target.value) || 0)}
                                min="100"
                                step="100"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="save-btn"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsPage;