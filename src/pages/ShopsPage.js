import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';
import './ShopsPage.css';

const ShopsPage = () => {
    const { admin } = useAuth();
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newShop, setNewShop] = useState({
        name: '',
        description: '',
        category: 'grocery',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            coordinates: {
                lat: 0,
                lng: 0
            }
        },
        vendorId: null
    });



    useEffect(() => {
        fetchShops(currentPage);
    }, [currentPage]);

    const fetchShops = async (page) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/admin/shops?page=${page}`);
            if (response.data.success) {
                setShops(response.data.data.shops || []);
                setTotalPages(response.data.data.pagination?.pages || 1);
            } else {
                setError(response.data.message || 'Failed to fetch shops');
            }
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch shops');
            setLoading(false);
            console.error('Error fetching shops:', err);
        }
    };

    const handleCreateShop = async (e) => {
        e.preventDefault();
        try {
            // Validate coordinates
            if (!newShop.address.coordinates.lat || !newShop.address.coordinates.lng) {
                setError('Please provide valid coordinates (latitude and longitude)');
                return;
            }

            const response = await axiosInstance.post(`/admin/shops`, newShop);
            console.log('Shop creation response:', response.data);
            
            // Handle different response formats
            const newShopData = response.data.data || response.data;
            setShops([newShopData, ...shops]);
            setShowCreateForm(false);
            setNewShop({
                name: '',
                description: '',
                category: 'grocery',
                address: {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    coordinates: {
                        lat: 0,
                        lng: 0
                    }
                },
                vendorId: null
            });
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to create shop';
            setError(errorMessage);
            console.error('Error creating shop:', err);
            console.error('Response data:', err.response?.data);
        }
    };

    const handleDeleteShop = async (shopId) => {
        if (window.confirm('Are you sure you want to delete this shop?')) {
            try {
                await axiosInstance.delete(`/admin/shops/${shopId}`);
                setShops(shops.filter(shop => shop._id !== shopId));
            } catch (err) {
                setError('Failed to delete shop');
                console.error('Error deleting shop:', err);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('address.coordinates.')) {
            const coordField = name.split('.')[2];
            setNewShop({
                ...newShop,
                address: {
                    ...newShop.address,
                    coordinates: {
                        ...newShop.address.coordinates,
                        [coordField]: parseFloat(value) || 0
                    }
                }
            });
        } else if (name.includes('address.')) {
            const addressField = name.split('.')[1];
            setNewShop({
                ...newShop,
                address: {
                    ...newShop.address,
                    [addressField]: value
                }
            });
        } else {
            setNewShop({
                ...newShop,
                [name]: value
            });
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) {
        return <div className="shops-page">Loading shops...</div>;
    }

    if (error) {
        return <div className="shops-page error">{error}</div>;
    }

    return (
        <div className="shops-page">
            <div className="shops-header">
                <h1>Manage Shops</h1>
                <button
                    className="create-shop-btn"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? 'Cancel' : 'Create New Shop'}
                </button>
            </div>

            {showCreateForm && (
                <div className="create-shop-form">
                    <h2>Create New Shop</h2>
                    <form onSubmit={handleCreateShop}>
                        <div className="form-group">
                            <label htmlFor="name">Shop Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={newShop.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={newShop.description}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <select
                                id="category"
                                name="category"
                                value={newShop.category}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="grocery">Grocery</option>
                                <option value="pharmacy">Pharmacy</option>
                                <option value="electronics">Electronics</option>
                                <option value="clothing">Clothing</option>
                                <option value="restaurant">Restaurant</option>
                                <option value="bakery">Bakery</option>
                                <option value="books">Books</option>
                                <option value="sports">Sports</option>
                                <option value="beauty">Beauty</option>
                                <option value="home">Home</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="street">Street</label>
                            <input
                                type="text"
                                id="street"
                                name="address.street"
                                value={newShop.address.street}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="city">City</label>
                                <input
                                    type="text"
                                    id="city"
                                    name="address.city"
                                    value={newShop.address.city}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="state">State</label>
                                <input
                                    type="text"
                                    id="state"
                                    name="address.state"
                                    value={newShop.address.state}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="zipCode">Zip Code</label>
                                <input
                                    type="text"
                                    id="zipCode"
                                    name="address.zipCode"
                                    value={newShop.address.zipCode}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="lat">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    id="lat"
                                    name="address.coordinates.lat"
                                    value={newShop.address.coordinates.lat}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="lng">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    id="lng"
                                    name="address.coordinates.lng"
                                    value={newShop.address.coordinates.lng}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="submit-btn">Create Shop</button>
                    </form>
                </div>
            )}

            <div className="shops-list">
                {shops.length === 0 ? (
                    <p>No shops found.</p>
                ) : (
                    shops.map(shop => (
                        <div key={shop._id} className="shop-card">
                            <div className="shop-info">
                                <h3>{shop.name}</h3>
                                <p>{shop.description}</p>
                                <p className="shop-address">
                                    {shop.address.street}, {shop.address.city}, {shop.address.state} {shop.address.zipCode}
                                </p>
                            </div>
                            <div className="shop-actions">
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDeleteShop(shop._id)}
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

export default ShopsPage;