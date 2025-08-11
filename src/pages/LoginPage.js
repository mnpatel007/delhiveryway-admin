import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: 'admin@delhiveryway.com',
        password: 'admin123'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(formData.email, formData.password);
        
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
        
        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">
                <form className="login-form" onSubmit={handleSubmit}>
                    <h1 className="login-title">Admin Portal</h1>
                    <p className="login-subtitle">Manage shops and products</p>
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                    
                    <div className="demo-info">
                        <p>Demo Credentials:</p>
                        <p>Email: admin@delhiveryway.com</p>
                        <p>Password: admin123</p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;