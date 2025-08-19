import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import './ProductsPage.css';

const ProductsPage = () => {
    const { admin } = useAuth();
    const [products, setProducts] = useState([]);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        discount: '',
        unit: '',
        shopId: ''
    });



    useEffect(() => {
        fetchProducts(currentPage);
        fetchShops();
    }, [currentPage]);

    const fetchProducts = async (page) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/admin/products?page=${page}`);
            if (response.data.success) {
                setProducts(response.data.data.products || []);
                setTotalPages(response.data.data.pagination?.pages || 1);
            } else {
                setError(response.data.message || 'Failed to fetch products');
            }
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch products');
            setLoading(false);
            console.error('Error fetching products:', err);
        }
    };

    const fetchShops = async () => {
        try {
            const response = await axiosInstance.get(`/admin/shops`);
            setShops(response.data.data?.shops || []);
        } catch (err) {
            console.error('Error fetching shops:', err);
            setShops([]);
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const productData = {
                ...newProduct,
                price: parseFloat(newProduct.price),
                originalPrice: parseFloat(newProduct.originalPrice),
                discount: parseFloat(newProduct.discount)
            };

            const response = await axiosInstance.post(`/admin/products`, productData);
            const newProductData = response.data.data || response.data;
            setProducts([newProductData, ...products]);
            setShowCreateForm(false);
            setNewProduct({
                name: '',
                description: '',
                price: '',
                originalPrice: '',
                discount: '',
                unit: '',
                shopId: ''
            });
        } catch (err) {
            setError('Failed to create product');
            console.error('Error creating product:', err);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axiosInstance.delete(`/admin/products/${productId}`);
                setProducts(products.filter(product => product._id !== productId));
            } catch (err) {
                setError('Failed to delete product');
                console.error('Error deleting product:', err);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({
            ...newProduct,
            [name]: value
        });
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) {
        return <div className="products-page">Loading products...</div>;
    }

    if (error) {
        return <div className="products-page error">{error}</div>;
    }

    return (
        <div className="products-page">
            <div className="products-header">
                <h1>Manage Products</h1>
                <button
                    className="create-product-btn"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? 'Cancel' : 'Create New Product'}
                </button>
            </div>

            {showCreateForm && (
                <div className="create-product-form">
                    <h2>Create New Product</h2>
                    <form onSubmit={handleCreateProduct}>
                        <div className="form-group">
                            <label htmlFor="name">Product Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={newProduct.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={newProduct.description}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="price">Price</label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={newProduct.price}
                                    onChange={handleInputChange}
                                    required
                                    step="0.01"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="originalPrice">Original Price</label>
                                <input
                                    type="number"
                                    id="originalPrice"
                                    name="originalPrice"
                                    value={newProduct.originalPrice}
                                    onChange={handleInputChange}
                                    required
                                    step="0.01"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="discount">Discount (%)</label>
                                <input
                                    type="number"
                                    id="discount"
                                    name="discount"
                                    value={newProduct.discount}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    max="100"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="unit">Unit</label>
                                <input
                                    type="text"
                                    id="unit"
                                    name="unit"
                                    value={newProduct.unit}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="shopId">Shop</label>
                                <select
                                    id="shopId"
                                    name="shopId"
                                    value={newProduct.shopId}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select a shop</option>
                                    {shops?.map(shop => (
                                        <option key={shop._id} value={shop._id}>
                                            {shop.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="submit-btn">Create Product</button>
                    </form>
                </div>
            )}

            <div className="products-list">
                {products.length === 0 ? (
                    <p>No products found.</p>
                ) : (
                    products.map(product => (
                        <div key={product._id} className="product-card">
                            <div className="product-info">
                                <h3>{product.name}</h3>
                                <p>{product.description}</p>
                                <div className="product-pricing">
                                    <span className="current-price">₹{product.price}</span>
                                    <span className="original-price">₹{product.originalPrice}</span>
                                    <span className="discount">{product.discount}% off</span>
                                </div>
                                <p className="product-unit">Unit: {product.unit}</p>
                                <p className="product-shop">Shop: {product.shopId?.name || 'Unknown'}</p>
                            </div>
                            <div className="product-actions">
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDeleteProduct(product._id)}
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

export default ProductsPage;