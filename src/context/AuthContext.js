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
                try {
                    const parsedAdmin = JSON.parse(adminData);
                    setAdmin(parsedAdmin);
                    // Set axios default header
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                } catch (error) {
                    console.error('Error parsing admin data:', error);
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminData');
                }
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axiosInstance.post('/admin/login', {
                email,
                password
            });

            if (response.data.success) {
                const { user, token } = response.data.data;

                localStorage.setItem('adminToken', token);
                localStorage.setItem('adminData', JSON.stringify(user));
                setAdmin(user);

                // Set axios default header
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                return { success: true };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Login failed'
                };
            }
        } catch (error) {
            console.error('Admin login error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed. Please try again.'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        delete axiosInstance.defaults.headers.common['Authorization'];
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