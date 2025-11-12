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
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingShop, setEditingShop] = useState(null);
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
        operatingHours: {
            monday: { open: '09:00', close: '21:00', closed: false },
            tuesday: { open: '09:00', close: '21:00', closed: false },
            wednesday: { open: '09:00', close: '21:00', closed: false },
            thursday: { open: '09:00', close: '21:00', closed: false },
            friday: { open: '09:00', close: '21:00', closed: false },
            saturday: { open: '09:00', close: '21:00', closed: false },
            sunday: { open: '10:00', close: '20:00', closed: false }
        },
        deliveryFee: 30,
        deliveryFeeMode: 'fixed',
        feePerKm: 10,
        hasTax: false,
        taxRate: 5,
        hasPackaging: false,
        packagingCharges: 10,
        inquiryAvailableTime: 15,
        vendorId: 'admin-created'
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
                operatingHours: {
                    monday: { open: '09:00', close: '21:00', closed: false },
                    tuesday: { open: '09:00', close: '21:00', closed: false },
                    wednesday: { open: '09:00', close: '21:00', closed: false },
                    thursday: { open: '09:00', close: '21:00', closed: false },
                    friday: { open: '09:00', close: '21:00', closed: false },
                    saturday: { open: '09:00', close: '21:00', closed: false },
                    sunday: { open: '10:00', close: '20:00', closed: false }
                },
                deliveryFee: 30,
                hasTax: false,
                taxRate: 5,
                hasPackaging: false,
                packagingCharges: 10,
                vendorId: 'admin-created'
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

    const handleToggleVisibility = async (shopId, currentVisibility) => {
        try {
            const response = await axiosInstance.put(`/admin/shops/${shopId}/visibility`, {
                isVisible: !currentVisibility
            });

            if (response.data.success) {
                // Update the shop in the local state
                setShops(shops.map(shop =>
                    shop._id === shopId
                        ? { ...shop, isVisible: !currentVisibility }
                        : shop
                ));
            }
        } catch (err) {
            setError('Failed to update shop visibility');
            console.error('Error updating shop visibility:', err);
        }
    };

    const handleEditShop = (shop) => {
        setEditingShop(shop);
        setNewShop({
            name: shop.name || '',
            description: shop.description || '',
            category: shop.category || 'grocery',
            address: {
                street: shop.address?.street || '',
                city: shop.address?.city || '',
                state: shop.address?.state || '',
                zipCode: shop.address?.zipCode || '',
                coordinates: {
                    lat: shop.address?.coordinates?.lat || 0,
                    lng: shop.address?.coordinates?.lng || 0
                }
            },
            operatingHours: shop.operatingHours || {
                monday: { open: '09:00', close: '21:00', closed: false },
                tuesday: { open: '09:00', close: '21:00', closed: false },
                wednesday: { open: '09:00', close: '21:00', closed: false },
                thursday: { open: '09:00', close: '21:00', closed: false },
                friday: { open: '09:00', close: '21:00', closed: false },
                saturday: { open: '09:00', close: '21:00', closed: false },
                sunday: { open: '10:00', close: '20:00', closed: false }
            },
            deliveryFee: shop.deliveryFee || 30,
            deliveryFeeMode: shop.deliveryFeeMode || 'fixed',
            feePerKm: shop.feePerKm || 10,
            hasTax: shop.hasTax || false,
            taxRate: shop.taxRate || 5,
            hasPackaging: shop.hasPackaging || false,
            packagingCharges: shop.packagingCharges || shop.packagingRate || 10,
            inquiryAvailableTime: shop.inquiryAvailableTime || 15,
            vendorId: 'admin-created'
        });
        setShowEditForm(true);
        setShowCreateForm(false);
    };

    const handleUpdateShop = async (e) => {
        e.preventDefault();
        try {
            // Validate coordinates
            if (!newShop.address.coordinates.lat || !newShop.address.coordinates.lng) {
                setError('Please provide valid coordinates (latitude and longitude)');
                return;
            }

            const response = await axiosInstance.put(`/admin/shops/${editingShop._id}`, newShop);
            console.log('Shop update response:', response.data);

            // Get the updated shop data from response
            const updatedShopData = response.data.data || response.data.shop || response.data;
            console.log('Updated shop data:', updatedShopData);

            // Update the shop in the list with the new data
            setShops(shops.map(shop =>
                shop._id === editingShop._id
                    ? { ...shop, ...updatedShopData }
                    : shop
            ));

            setShowEditForm(false);
            setEditingShop(null);
            setError(''); // Clear any previous errors

            // Show success message
            alert('Shop updated successfully!');

            // Refetch shops to ensure we have the latest data
            fetchShops(currentPage);
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
                operatingHours: {
                    monday: { open: '09:00', close: '21:00', closed: false },
                    tuesday: { open: '09:00', close: '21:00', closed: false },
                    wednesday: { open: '09:00', close: '21:00', closed: false },
                    thursday: { open: '09:00', close: '21:00', closed: false },
                    friday: { open: '09:00', close: '21:00', closed: false },
                    saturday: { open: '09:00', close: '21:00', closed: false },
                    sunday: { open: '10:00', close: '20:00', closed: false }
                },
                deliveryFee: 30,
                hasTax: false,
                taxRate: 5,
                hasPackaging: false,
                packagingCharges: 10,
                vendorId: 'admin-created'
            });
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update shop';
            setError(errorMessage);
            console.error('Error updating shop:', err);
            console.error('Response data:', err.response?.data);
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
        } else if (name.startsWith('operatingHours.')) {
            // operatingHours.monday.open | operatingHours.monday.close | operatingHours.monday.closed
            const [, day, field] = name.split('.');
            setNewShop(prev => ({
                ...prev,
                operatingHours: {
                    ...prev.operatingHours,
                    [day]: {
                        ...prev.operatingHours[day],
                        [field]: field === 'closed' ? e.target.checked : value
                    }
                }
            }));
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
            // Handle different input types
            let inputValue;
            if (e.target.type === 'checkbox') {
                inputValue = e.target.checked;
            } else if (e.target.type === 'number') {
                inputValue = parseFloat(value) || 0;
            } else {
                inputValue = value;
            }

            setNewShop({
                ...newShop,
                [name]: inputValue
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

                        <div className="form-group">
                            <label htmlFor="deliveryFee">Delivery Fee (₹)</label>
                            <input
                                type="number"
                                id="deliveryFee"
                                name="deliveryFee"
                                value={newShop.deliveryFee}
                                onChange={handleInputChange}
                                min="0"
                                step="1"
                                placeholder="Enter delivery fee (0 for free delivery)"
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    name="hasTax"
                                    checked={newShop.hasTax}
                                    onChange={handleInputChange}
                                />
                                Apply Tax
                            </label>
                        </div>

                        {newShop.hasTax && (
                            <div className="form-group">
                                <label htmlFor="taxRate">Tax Rate (%)</label>
                                <input
                                    type="number"
                                    id="taxRate"
                                    name="taxRate"
                                    value={newShop.taxRate}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="1000"
                                    step="0.1"
                                    placeholder="Enter tax rate (e.g., 5 for 5%)"
                                />
                            </div>
                        )}


                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    name="hasPackaging"
                                    checked={newShop.hasPackaging}
                                    onChange={handleInputChange}
                                />
                                Apply Packaging Charges
                            </label>
                        </div>

                        {newShop.hasPackaging && (
                            <div className="form-group">
                                <label htmlFor="packagingCharges">Packaging Charges (?)</label>
                                <input
                                    type="number"
                                    id="packagingCharges"
                                    name="packagingCharges"
                                    value={newShop.packagingCharges}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="1000"
                                    step="1"
                                    placeholder="Enter packaging charges (e.g., 10 for ?10)"
                                />
                            </div>
                        )}
                        {/* Operating Hours Section */}
                        <div className="form-group">
                            <h3>Operating Hours</h3>
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                <div className="form-row" key={day}>
                                    <div className="form-group">
                                        <label style={{ textTransform: 'capitalize' }}>{day}</label>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <input
                                                type="time"
                                                name={`operatingHours.${day}.open`}
                                                value={newShop.operatingHours[day].open}
                                                onChange={handleInputChange}
                                                disabled={newShop.operatingHours[day].closed}
                                                required={!newShop.operatingHours[day].closed}
                                            />
                                            <span>to</span>
                                            <input
                                                type="time"
                                                name={`operatingHours.${day}.close`}
                                                value={newShop.operatingHours[day].close}
                                                onChange={handleInputChange}
                                                disabled={newShop.operatingHours[day].closed}
                                                required={!newShop.operatingHours[day].closed}
                                            />
                                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <input
                                                    type="checkbox"
                                                    name={`operatingHours.${day}.closed`}
                                                    checked={!!newShop.operatingHours[day].closed}
                                                    onChange={handleInputChange}
                                                />
                                                Closed
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="form-group">
                            <label htmlFor="inquiryAvailableTime">Customer Inquiry Available After (minutes)</label>
                            <input
                                type="number"
                                id="inquiryAvailableTime"
                                name="inquiryAvailableTime"
                                value={newShop.inquiryAvailableTime}
                                onChange={handleInputChange}
                                min="5"
                                max="120"
                                step="1"
                                placeholder="Enter minutes (5-120)"
                            />
                            <small className="form-help">
                                Customers can inquire about their orders after this many minutes from order placement
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="deliveryFeeMode">Delivery Fee Mode</label>
                            <select
                                id="deliveryFeeMode"
                                name="deliveryFeeMode"
                                value={newShop.deliveryFeeMode || 'fixed'}
                                onChange={handleInputChange}
                            >
                                <option value="fixed">Fixed Fee (same for everyone)</option>
                                <option value="distance">Distance-based (per 500m from shop)</option>
                            </select>
                            <small className="form-help">
                                Fixed: Everyone pays the same delivery fee. Distance: Fee calculated based on distance from shop.
                            </small>
                        </div>

                        {(newShop.deliveryFeeMode === 'distance') && (
                            <div className="form-group">
                                <label htmlFor="feePerKm">Fee per 500m (Distance Mode)</label>
                                <input
                                    type="number"
                                    id="feePerKm"
                                    name="feePerKm"
                                    value={newShop.feePerKm || 10}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="100"
                                    step="1"
                                    placeholder="Enter fee per 500m"
                                />
                                <small className="form-help">
                                    Amount charged for every 500m distance from shop to customer
                                </small>
                            </div>
                        )}

                        <button type="submit" className="submit-btn">Create Shop</button>
                    </form>
                </div>
            )}

            {showEditForm && editingShop && (
                <div className="create-shop-form">
                    <h2>Edit Shop</h2>
                    <form onSubmit={handleUpdateShop}>
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

                        <div className="form-group">
                            <label htmlFor="deliveryFee">Delivery Fee (₹)</label>
                            <input
                                type="number"
                                id="deliveryFee"
                                name="deliveryFee"
                                value={newShop.deliveryFee}
                                onChange={handleInputChange}
                                min="0"
                                step="1"
                                placeholder="Enter delivery fee (0 for free delivery)"
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    name="hasTax"
                                    checked={newShop.hasTax}
                                    onChange={handleInputChange}
                                />
                                Apply Tax
                            </label>
                        </div>

                        {newShop.hasTax && (
                            <div className="form-group">
                                <label htmlFor="taxRate">Tax Rate (%)</label>
                                <input
                                    type="number"
                                    id="taxRate"
                                    name="taxRate"
                                    value={newShop.taxRate}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="1000"
                                    step="0.1"
                                    placeholder="Enter tax rate (e.g., 5 for 5%)"
                                />
                            </div>
                        )}


                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    name="hasPackaging"
                                    checked={newShop.hasPackaging}
                                    onChange={handleInputChange}
                                />
                                Apply Packaging Charges
                            </label>
                        </div>

                        {newShop.hasPackaging && (
                            <div className="form-group">
                                <label htmlFor="packagingCharges">Packaging Charges (?)</label>
                                <input
                                    type="number"
                                    id="packagingCharges"
                                    name="packagingCharges"
                                    value={newShop.packagingCharges}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="1000"
                                    step="1"
                                    placeholder="Enter packaging charges (e.g., 10 for ?10)"
                                />
                            </div>
                        )}
                        {/* Operating Hours Section */}
                        <div className="form-group">
                            <h3>Operating Hours</h3>
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                <div className="form-row" key={day}>
                                    <div className="form-group">
                                        <label style={{ textTransform: 'capitalize' }}>{day}</label>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <input
                                                type="time"
                                                name={`operatingHours.${day}.open`}
                                                value={newShop.operatingHours[day].open}
                                                onChange={handleInputChange}
                                                disabled={newShop.operatingHours[day].closed}
                                                required={!newShop.operatingHours[day].closed}
                                            />
                                            <span>to</span>
                                            <input
                                                type="time"
                                                name={`operatingHours.${day}.close`}
                                                value={newShop.operatingHours[day].close}
                                                onChange={handleInputChange}
                                                disabled={newShop.operatingHours[day].closed}
                                                required={!newShop.operatingHours[day].closed}
                                            />
                                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <input
                                                    type="checkbox"
                                                    name={`operatingHours.${day}.closed`}
                                                    checked={!!newShop.operatingHours[day].closed}
                                                    onChange={handleInputChange}
                                                />
                                                Closed
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="form-actions">
                            <div className="form-group">
                                <label htmlFor="inquiryAvailableTimeEdit">Customer Inquiry Available After (minutes)</label>
                                <input
                                    type="number"
                                    id="inquiryAvailableTimeEdit"
                                    name="inquiryAvailableTime"
                                    value={newShop.inquiryAvailableTime}
                                    onChange={handleInputChange}
                                    min="5"
                                    max="120"
                                    step="1"
                                    placeholder="Enter minutes (5-120)"
                                />
                                <small className="form-help">
                                    Customers can inquire about their orders after this many minutes from order placement
                                </small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="deliveryFeeModeEdit">Delivery Fee Mode</label>
                                <select
                                    id="deliveryFeeModeEdit"
                                    name="deliveryFeeMode"
                                    value={newShop.deliveryFeeMode || 'fixed'}
                                    onChange={handleInputChange}
                                >
                                    <option value="fixed">Fixed Fee (same for everyone)</option>
                                    <option value="distance">Distance-based (per 500m from shop)</option>
                                </select>
                                <small className="form-help">
                                    Fixed: Everyone pays the same delivery fee. Distance: Fee calculated based on distance from shop.
                                </small>
                            </div>

                            {(newShop.deliveryFeeMode === 'distance') && (
                                <div className="form-group">
                                    <label htmlFor="feePerKmEdit">Fee per 500m (Distance Mode)</label>
                                    <input
                                        type="number"
                                        id="feePerKmEdit"
                                        name="feePerKm"
                                        value={newShop.feePerKm || 10}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        step="1"
                                        placeholder="Enter fee per 500m"
                                    />
                                    <small className="form-help">
                                        Amount charged for every 500m distance from shop to customer
                                    </small>
                                </div>
                            )}

                            <button type="submit" className="submit-btn">Update Shop</button>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => {
                                    setShowEditForm(false);
                                    setEditingShop(null);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="shops-list">
                {shops.length === 0 ? (
                    <p>No shops found.</p>
                ) : (
                    shops.map(shop => (
                        <div key={shop._id} className={`shop-card ${shop.isVisible === false ? 'shop-hidden' : 'shop-visible'}`}>
                            <div className="shop-visibility-indicator">
                                {shop.isVisible !== false ? (
                                    <span className="visibility-badge visible">👁️ Visible to Customers</span>
                                ) : (
                                    <span className="visibility-badge hidden">🙈 Hidden from Customers</span>
                                )}
                            </div>
                            <div className="shop-info">
                                <h3>{shop.name}</h3>
                                <p>{shop.description}</p>
                                <p className="shop-address">
                                    {shop.address.street}, {shop.address.city}, {shop.address.state} {shop.address.zipCode}
                                </p>
                                <p className="shop-delivery-fee">
                                    Delivery: {shop.deliveryFeeMode === 'distance'
                                        ? `₹${shop.feePerKm || 10}/500m from shop`
                                        : (shop.deliveryFee === 0 ? 'Free' : `₹${shop.deliveryFee} fixed`)
                                    }
                                </p>
                                <p className="shop-tax-info">
                                    Tax: {shop.hasTax ? `${shop.taxRate}%` : 'No Tax'}
                                </p>
                                <p className="shop-packaging-info">
                                    Packaging: {shop.hasPackaging ? `₹${shop.packagingCharges || shop.packagingRate || 10}` : 'No Packaging Charges'}
                                </p>
                                <p className="shop-inquiry-time">
                                    📞 Inquiry Available: After {shop.inquiryAvailableTime || 15} minutes
                                </p>
                            </div>
                            <div className="shop-actions">
                                <button
                                    className={`visibility-toggle-btn ${shop.isVisible !== false ? 'visible' : 'hidden'}`}
                                    onClick={() => handleToggleVisibility(shop._id, shop.isVisible !== false)}
                                    title={shop.isVisible !== false ? 'Hide from customers' : 'Show to customers'}
                                >
                                    {shop.isVisible !== false ? (
                                        <>👁️ Hide Shop</>
                                    ) : (
                                        <>👀 Show Shop</>
                                    )}
                                </button>
                                <button
                                    className="edit-btn"
                                    onClick={() => handleEditShop(shop)}
                                >
                                    Edit
                                </button>
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


