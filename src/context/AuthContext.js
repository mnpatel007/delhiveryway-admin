import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

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

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            const adminData = localStorage.getItem('adminData');
            if (adminData) {
                setAdmin(JSON.parse(adminData));
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            // Make API call to admin login endpoint
            const response = await axiosInstance.post('/admin/login', {
                email,
                password
            });

            // Store token and admin data
            const token = response.data.token;
            const adminData = response.data.user;

            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminData', JSON.stringify(adminData));

            setAdmin(adminData);

            return { success: true };
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