import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const adminData = localStorage.getItem('adminData');
            if (adminData) {
                setAdmin(JSON.parse(adminData));
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            // For now, we'll use a simple hardcoded admin login
            // In production, this should be a proper API call
            if (email === 'admin@delhiveryway.com' && password === 'admin123') {
                const adminData = {
                    id: 'admin1',
                    name: 'Admin',
                    email: 'admin@delhiveryway.com'
                };
                
                const token = 'admin-token-' + Date.now();
                localStorage.setItem('adminToken', token);
                localStorage.setItem('adminData', JSON.stringify(adminData));
                
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setAdmin(adminData);
                
                return { success: true };
            } else {
                return { success: false, message: 'Invalid credentials' };
            }
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        delete axios.defaults.headers.common['Authorization'];
        setAdmin(null);
    };

    const value = {
        admin,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};