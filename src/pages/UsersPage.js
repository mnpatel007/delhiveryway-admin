import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';
import './UsersPage.css';

const UsersPage = () => {
    const { admin } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);



    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    const fetchUsers = async (page) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/admin/users?page=${page}`);
            if (response.data.success) {
                setUsers(response.data.data.users || []);
                setTotalPages(response.data.data.pagination?.pages || 1);
            } else {
                setError(response.data.message || 'Failed to fetch users');
            }
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch users');
            setLoading(false);
            console.error('Error fetching users:', err);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axiosInstance.delete(`/admin/users/${userId}`);
                setUsers(users.filter(user => user._id !== userId));
            } catch (err) {
                setError('Failed to delete user');
                console.error('Error deleting user:', err);
            }
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) {
        return <div className="users-page">Loading users...</div>;
    }

    if (error) {
        return <div className="users-page error">{error}</div>;
    }

    return (
        <div className="users-page">
            <div className="users-header">
                <h1>Manage Users</h1>
            </div>

            <div className="users-list">
                {users.length === 0 ? (
                    <p>No users found.</p>
                ) : (
                    users.map(user => (
                        <div key={user._id} className="user-card">
                            <div className="user-info">
                                <h3>{user.name}</h3>
                                <p className="user-email">Email: {user.email}</p>
                                <p className="user-role">Role: {user.role}</p>
                                <p className="user-date">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="user-actions">
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDeleteUser(user._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default UsersPage;