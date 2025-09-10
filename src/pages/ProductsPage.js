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
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
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
        setError(''); // Clear any existing errors
        try {
            // Validate required fields
            if (!newProduct.name?.trim()) {
                setError('Product name is required');
                return;
            }
            if (!newProduct.shopId) {
                setError('Please select a shop');
                return;
            }
            if (!newProduct.category?.trim()) {
                setError('Category is required');
                return;
            }
            if (!newProduct.price || isNaN(parseFloat(newProduct.price))) {
                setError('Valid price is required');
                return;
            }

            // Validate unit
            const allowedUnits = ['piece', 'kg', 'gram', 'liter', 'ml', 'dozen', 'pack', 'box', 'bottle', 'can', 'strip'];
            const unit = newProduct.unit?.toLowerCase() || 'piece';
            const validUnit = allowedUnits.includes(unit) ? unit : 'piece';

            const productData = {
                name: newProduct.name?.trim(),
                description: newProduct.description?.trim(),
                shopId: newProduct.shopId,
                category: newProduct.category?.trim(),
                price: parseFloat(newProduct.price),
                originalPrice: newProduct.originalPrice && newProduct.originalPrice !== '' ? parseFloat(newProduct.originalPrice) : null,
                discount: newProduct.discount && newProduct.discount !== '' ? parseFloat(newProduct.discount) : 0,
                stockQuantity: parseInt(newProduct.stockQuantity) || 0,
                unit: validUnit,
                tags: newProduct.tags ? newProduct.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
                inStock: newProduct.inStock !== false
            };

            console.log('Creating product with data:', productData);
            const response = await axiosInstance.post(`/admin/products`, productData);
            console.log('Product creation response:', response.data);
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
                shopId: '',
                stockQuantity: '',
                category: '',
                tags: '',
                inStock: true
            });
        } catch (err) {
            setError('Failed to create product: ' + (err.response?.data?.message || err.message));
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

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setNewProduct({
            name: product.name || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            originalPrice: product.originalPrice?.toString() || '',
            discount: product.discount?.toString() || '',
            unit: product.unit || '',
            shopId: product.shopId?._id || product.shopId || '',
            stockQuantity: product.stockQuantity?.toString() || '',
            category: product.category || '',
            tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
            inStock: product.inStock !== false
        });
        setShowEditForm(true);
        setShowCreateForm(false);
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        setError(''); // Clear any existing errors
        try {
            // Validate required fields
            if (!newProduct.name?.trim()) {
                setError('Product name is required');
                return;
            }
            if (!newProduct.shopId) {
                setError('Please select a shop');
                return;
            }
            if (!newProduct.category?.trim()) {
                setError('Category is required');
                return;
            }
            if (!newProduct.price || isNaN(parseFloat(newProduct.price))) {
                setError('Valid price is required');
                return;
            }

            // Validate unit
            const allowedUnits = ['piece', 'kg', 'gram', 'liter', 'ml', 'dozen', 'pack', 'box', 'bottle', 'can', 'strip'];
            const unit = newProduct.unit?.toLowerCase() || 'piece';
            const validUnit = allowedUnits.includes(unit) ? unit : 'piece';

            const productData = {
                name: newProduct.name?.trim(),
                description: newProduct.description?.trim(),
                shopId: newProduct.shopId,
                category: newProduct.category?.trim(),
                price: parseFloat(newProduct.price),
                originalPrice: newProduct.originalPrice && newProduct.originalPrice !== '' ? parseFloat(newProduct.originalPrice) : null,
                discount: newProduct.discount && newProduct.discount !== '' ? parseFloat(newProduct.discount) : 0,
                stockQuantity: parseInt(newProduct.stockQuantity) || 0,
                unit: validUnit,
                tags: newProduct.tags ? newProduct.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
                inStock: newProduct.inStock !== false
            };

            console.log('Updating product with data:', productData);
            const response = await axiosInstance.put(`/admin/products/${editingProduct._id}`, productData);
            console.log('Product update response:', response.data);

            // Update the product in the list
            setProducts(products.map(product =>
                product._id === editingProduct._id
                    ? { ...product, ...response.data.data }
                    : product
            ));

            setShowEditForm(false);
            setEditingProduct(null);
            setNewProduct({
                name: '',
                description: '',
                price: '',
                originalPrice: '',
                discount: '',
                unit: '',
                shopId: '',
                stockQuantity: '',
                category: '',
                tags: '',
                inStock: true
            });
        } catch (err) {
            console.error('Error updating product:', err);
            setError('Failed to update product: ' + (err.response?.data?.message || err.message));
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

                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <input
                                type="text"
                                id="category"
                                name="category"
                                value={newProduct.category}
                                onChange={handleInputChange}
                                placeholder="e.g., Vegetables, Fruits, Dairy"
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
                                    min="0"
                                    max="100"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="unit">Unit</label>
                                <select
                                    id="unit"
                                    name="unit"
                                    value={newProduct.unit}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="piece">Piece</option>
                                    <option value="kg">Kilogram (kg)</option>
                                    <option value="gram">Gram</option>
                                    <option value="liter">Liter</option>
                                    <option value="ml">Milliliter (ml)</option>
                                    <option value="dozen">Dozen</option>
                                    <option value="pack">Pack</option>
                                    <option value="box">Box</option>
                                    <option value="bottle">Bottle</option>
                                    <option value="can">Can</option>
                                    <option value="strip">Strip</option>
                                </select>
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
                                            {shop.name} ({shop._id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="stockQuantity">Stock Quantity</label>
                                <input
                                    type="number"
                                    id="stockQuantity"
                                    name="stockQuantity"
                                    value={newProduct.stockQuantity}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="tags">Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    id="tags"
                                    name="tags"
                                    value={newProduct.tags}
                                    onChange={handleInputChange}
                                    placeholder="e.g., organic, fresh, local"
                                />
                            </div>
                        </div>

                        <div className="checkbox-group">
                            <input
                                type="checkbox"
                                id="inStock-create"
                                name="inStock"
                                checked={newProduct.inStock}
                                onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })}
                            />
                            <label htmlFor="inStock-create">In Stock</label>
                        </div>

                        <button type="submit" className="submit-btn">Create Product</button>
                    </form>
                </div>
            )}

            {showEditForm && editingProduct && (
                <div className="create-product-form">
                    <h2>Edit Product</h2>
                    <form onSubmit={handleUpdateProduct}>
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

                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <input
                                type="text"
                                id="category"
                                name="category"
                                value={newProduct.category}
                                onChange={handleInputChange}
                                placeholder="e.g., Vegetables, Fruits, Dairy"
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
                                    min="0"
                                    max="100"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="unit">Unit</label>
                                <select
                                    id="unit"
                                    name="unit"
                                    value={newProduct.unit}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="piece">Piece</option>
                                    <option value="kg">Kilogram (kg)</option>
                                    <option value="gram">Gram</option>
                                    <option value="liter">Liter</option>
                                    <option value="ml">Milliliter (ml)</option>
                                    <option value="dozen">Dozen</option>
                                    <option value="pack">Pack</option>
                                    <option value="box">Box</option>
                                    <option value="bottle">Bottle</option>
                                    <option value="can">Can</option>
                                    <option value="strip">Strip</option>
                                </select>
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
                                            {shop.name} ({shop._id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="stockQuantity">Stock Quantity</label>
                                <input
                                    type="number"
                                    id="stockQuantity"
                                    name="stockQuantity"
                                    value={newProduct.stockQuantity}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="tags">Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    id="tags"
                                    name="tags"
                                    value={newProduct.tags}
                                    onChange={handleInputChange}
                                    placeholder="e.g., organic, fresh, local"
                                />
                            </div>
                        </div>

                        <div className="checkbox-group">
                            <input
                                type="checkbox"
                                id="inStock-edit"
                                name="inStock"
                                checked={newProduct.inStock}
                                onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })}
                            />
                            <label htmlFor="inStock-edit">In Stock</label>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="submit-btn">Update Product</button>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => {
                                    setShowEditForm(false);
                                    setEditingProduct(null);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
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
                                <p className="product-stock">Stock: {product.stockQuantity || 0} {product.unit}</p>
                                <div className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                                </div>
                                {product.category && (
                                    <p className="product-category">Category: {product.category}</p>
                                )}
                                {product.tags && product.tags.length > 0 && (
                                    <p className="product-tags">Tags: {product.tags.join(', ')}</p>
                                )}
                                <p className="product-shop">Shop: {product.shopId?.name || 'Unknown'}</p>
                            </div>
                            <div className="product-actions">
                                <button
                                    className="edit-btn"
                                    onClick={() => handleEditProduct(product)}
                                >
                                    Edit
                                </button>
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