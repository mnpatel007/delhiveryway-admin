import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import axiosInstance from '../utils/axios';
import './BulkProductUpload.css';

const BulkProductUpload = ({ shops, onClose, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Processing
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [selectedShop, setSelectedShop] = useState('');
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState(null);
    const [errors, setErrors] = useState([]);

    // Handle file selection
    const handleFileSelect = useCallback((selectedFile) => {
        if (!selectedFile) return;

        // Validate file type
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            '.xlsx',
            '.xls'
        ];

        const isValidType = validTypes.some(type =>
            selectedFile.type === type || selectedFile.name.toLowerCase().endsWith(type)
        );

        if (!isValidType) {
            alert('Please select a valid Excel file (.xlsx or .xls)');
            return;
        }

        // Validate file size (max 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        setFile(selectedFile);
        parseExcelFile(selectedFile);
    }, []);

    // Parse Excel file
    const parseExcelFile = (file) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Get first worksheet
                const worksheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[worksheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    defval: ''
                });

                if (jsonData.length < 2) {
                    alert('Excel file must have at least a header row and one data row');
                    return;
                }

                // Process the data
                const processedData = processExcelData(jsonData);
                setParsedData(processedData);
                setStep(2);

            } catch (error) {
                console.error('Error parsing Excel file:', error);
                alert('Error parsing Excel file. Please check the file format.');
            }
        };

        reader.readAsArrayBuffer(file);
    };

    // Process Excel data and map to product structure
    const processExcelData = (jsonData) => {
        const headers = jsonData[0].map(h => h.toString().toLowerCase().trim());
        const rows = jsonData.slice(1);

        // Find column indices
        const nameIndex = findColumnIndex(headers, ['name', 'product name', 'product', 'item']);
        const priceIndex = findColumnIndex(headers, ['price', 'cost', 'amount', 'rate']);
        const categoryIndex = findColumnIndex(headers, ['category', 'type', 'group', 'section']);

        if (nameIndex === -1) {
            alert('Could not find "Name" column in Excel file');
            return [];
        }

        if (priceIndex === -1) {
            alert('Could not find "Price" column in Excel file');
            return [];
        }

        const processed = rows.map((row, index) => {
            const name = row[nameIndex]?.toString().trim() || '';
            const price = parseFloat(row[priceIndex]) || 0;
            const category = row[categoryIndex]?.toString().trim() || 'General Items';

            // Detect unit based on product name
            const detectedUnit = detectUnitFromName(name);

            return {
                id: index + 1,
                name,
                price,
                originalPrice: price, // Same as price
                discount: 0,
                category,
                description: '.', // As requested
                stockQuantity: 1000,
                inStock: true,
                tags: ['Fresh'],
                unit: detectedUnit.unit,
                unitConfidence: detectedUnit.confidence,
                isValid: name && price > 0,
                errors: validateProduct(name, price, category)
            };
        }).filter(product => product.name); // Remove empty rows

        return processed;
    };

    // Find column index by multiple possible names
    const findColumnIndex = (headers, possibleNames) => {
        for (const name of possibleNames) {
            const index = headers.findIndex(h => h.includes(name));
            if (index !== -1) return index;
        }
        return -1;
    };

    // ULTRA-PRECISE unit detection based on product name
    const detectUnitFromName = (productName) => {
        if (!productName) return { unit: 'piece', confidence: 0 };

        const name = productName.toLowerCase().trim();

        // EXACT MATCHES (100% confidence) - Comprehensive Indian grocery list
        const exactMatches = {
            // KG items - Grains, Cereals, Bulk Vegetables
            kg: [
                // Rice varieties
                'rice', 'basmati rice', 'brown rice', 'jasmine rice', 'sona masoori', 'ponni rice',
                'parboiled rice', 'white rice', 'red rice', 'black rice', 'sticky rice',

                // Wheat & Flours
                'wheat', 'wheat flour', 'atta', 'whole wheat flour', 'maida', 'all purpose flour',
                'besan', 'gram flour', 'chickpea flour', 'corn flour', 'rice flour', 'ragi flour',
                'bajra flour', 'jowar flour', 'semolina', 'suji', 'rava',

                // Dals & Pulses
                'dal', 'toor dal', 'arhar dal', 'moong dal', 'mung dal', 'chana dal', 'urad dal',
                'masoor dal', 'red lentil', 'black gram', 'green gram', 'pigeon pea',
                'rajma', 'kidney beans', 'black beans', 'chickpeas', 'chana', 'kabuli chana',
                'white chickpeas', 'black chickpeas', 'lentils', 'split peas',

                // Sugar & Sweeteners
                'sugar', 'white sugar', 'brown sugar', 'jaggery', 'gur', 'rock sugar', 'mishri',
                'palm sugar', 'coconut sugar', 'raw sugar',

                // Bulk Vegetables
                'onion', 'onions', 'red onion', 'white onion', 'potato', 'potatoes', 'sweet potato',
                'tomato', 'tomatoes', 'ginger', 'garlic', 'carrot', 'carrots', 'cabbage',
                'cauliflower', 'brinjal', 'eggplant', 'okra', 'bhindi', 'pumpkin', 'bottle gourd',
                'ridge gourd', 'bitter gourd', 'snake gourd', 'drumstick', 'radish', 'turnip',
                'beetroot', 'yam', 'taro root', 'elephant yam',

                // Dry Fruits & Nuts (bulk)
                'almonds', 'cashews', 'walnuts', 'pistachios', 'dates', 'raisins', 'figs',
                'dried coconut', 'copra', 'groundnuts', 'peanuts'
            ],

            // GRAM items - Spices, Small quantities
            gram: [
                // Whole Spices
                'cumin seeds', 'jeera', 'coriander seeds', 'dhania', 'fennel seeds', 'saunf',
                'fenugreek seeds', 'methi seeds', 'mustard seeds', 'sarson', 'carom seeds', 'ajwain',
                'nigella seeds', 'kalonji', 'sesame seeds', 'til', 'poppy seeds', 'khus khus',

                // Powdered Spices
                'turmeric', 'haldi', 'turmeric powder', 'haldi powder', 'red chili powder',
                'lal mirch powder', 'coriander powder', 'dhania powder', 'cumin powder', 'jeera powder',
                'black pepper', 'kali mirch', 'white pepper', 'garam masala', 'chaat masala',
                'tandoori masala', 'biryani masala', 'sambhar powder', 'rasam powder', 'curry powder',
                'meat masala', 'chicken masala', 'fish masala', 'pav bhaji masala', 'chole masala',

                // Aromatic Spices
                'cardamom', 'elaichi', 'green cardamom', 'black cardamom', 'badi elaichi',
                'cinnamon', 'dalchini', 'cloves', 'laung', 'bay leaves', 'tej patta',
                'star anise', 'chakra phool', 'nutmeg', 'jaiphal', 'mace', 'javitri',
                'asafoetida', 'hing', 'saffron', 'kesar',

                // Tea & Coffee
                'tea', 'tea leaves', 'chai patti', 'green tea', 'black tea', 'earl grey',
                'coffee', 'coffee beans', 'coffee powder', 'instant coffee',

                // Salt varieties
                'salt', 'table salt', 'rock salt', 'sendha namak', 'black salt', 'kala namak',
                'pink salt', 'sea salt'
            ],

            // LITER items - Liquids, Oils, Dairy
            liter: [
                // Dairy
                'milk', 'full cream milk', 'toned milk', 'double toned milk', 'skimmed milk',
                'buffalo milk', 'cow milk', 'goat milk', 'buttermilk', 'chaas', 'lassi',

                // Cooking Oils
                'oil', 'cooking oil', 'sunflower oil', 'mustard oil', 'sarson oil', 'coconut oil',
                'olive oil', 'extra virgin olive oil', 'sesame oil', 'til oil', 'groundnut oil',
                'peanut oil', 'rice bran oil', 'safflower oil', 'corn oil', 'soybean oil',
                'refined oil', 'vegetable oil', 'palm oil',

                // Beverages
                'water', 'mineral water', 'packaged water', 'fruit juice', 'orange juice',
                'apple juice', 'mango juice', 'pomegranate juice', 'grape juice', 'mixed fruit juice',
                'vegetable juice', 'carrot juice', 'beetroot juice'
            ],

            // ML items - Sauces, Syrups, Small bottles
            ml: [
                // Sauces & Condiments
                'sauce', 'tomato sauce', 'ketchup', 'chili sauce', 'hot sauce', 'soy sauce',
                'worcestershire sauce', 'tabasco', 'sriracha', 'mayonnaise', 'mayo', 'mustard sauce',
                'barbecue sauce', 'bbq sauce', 'pasta sauce', 'pizza sauce', 'salsa',

                // Syrups & Honey
                'honey', 'maple syrup', 'golden syrup', 'corn syrup', 'agave syrup',
                'rose syrup', 'khus syrup', 'orange syrup', 'lemon syrup', 'chocolate syrup',
                'strawberry syrup', 'vanilla syrup',

                // Extracts & Essences
                'extract', 'vanilla extract', 'almond extract', 'rose water', 'gulab jal',
                'kewra water', 'orange blossom water', 'lemon extract', 'mint extract',

                // Vinegar
                'vinegar', 'white vinegar', 'apple cider vinegar', 'balsamic vinegar',
                'coconut vinegar', 'rice vinegar'
            ],

            // PIECE items - Individual fruits, vegetables, bakery
            piece: [
                // Fruits
                'apple', 'banana', 'orange', 'mango', 'grapes', 'strawberry', 'kiwi', 'pear',
                'peach', 'plum', 'apricot', 'cherry', 'lemon', 'lime', 'pomegranate', 'anar',
                'guava', 'amrud', 'custard apple', 'sitafal', 'dragon fruit', 'passion fruit',
                'avocado', 'coconut', 'nariyal', 'watermelon', 'muskmelon', 'papaya', 'pineapple',

                // Individual Vegetables
                'cucumber', 'kheera', 'bell pepper', 'capsicum', 'green chili', 'hari mirch',
                'red chili', 'lal mirch', 'corn', 'bhutta', 'sweet corn', 'baby corn',

                // Bakery Items
                'bread', 'white bread', 'brown bread', 'whole wheat bread', 'multigrain bread',
                'pav', 'bun', 'burger bun', 'hot dog bun', 'dinner roll', 'croissant',
                'bagel', 'muffin', 'donut', 'cake', 'pastry',

                // Eggs & Dairy blocks
                'egg', 'chicken egg', 'duck egg', 'quail egg', 'paneer', 'cheese', 'butter'
            ],

            // PACK items - Packaged foods, snacks
            pack: [
                // Snacks
                'chips', 'potato chips', 'banana chips', 'corn chips', 'tortilla chips', 'nachos',
                'popcorn', 'puffed rice', 'murmura', 'namkeen', 'mixture', 'chivda', 'sev',

                // Biscuits & Cookies
                'biscuits', 'cookies', 'crackers', 'digestive biscuits', 'marie biscuits',
                'glucose biscuits', 'cream biscuits', 'chocolate biscuits', 'wafers', 'rusks',

                // Noodles & Pasta
                'noodles', 'instant noodles', 'maggi', 'pasta', 'macaroni', 'spaghetti',
                'vermicelli', 'sevaiyan',

                // Cereals
                'cornflakes', 'muesli', 'granola', 'oats', 'breakfast cereal', 'puffed wheat'
            ]
        };

        // Check exact matches first
        for (const [unit, items] of Object.entries(exactMatches)) {
            if (items.includes(name)) {
                return { unit, confidence: 100 };
            }
        }

        // ENHANCED CONTAINS MATCHES (95% confidence)
        const enhancedContains = {
            kg: ['rice', 'flour', 'atta', 'dal', 'sugar', 'jaggery', 'onion', 'potato', 'tomato', 'wheat', 'grain', 'pulse'],
            gram: ['powder', 'masala', 'seeds', 'tea', 'coffee', 'spice', 'salt', 'saffron', 'hing'],
            liter: ['milk', 'oil', 'juice', 'water', 'liquid', 'ghee'],
            ml: ['sauce', 'honey', 'syrup', 'vinegar', 'extract', 'ketchup'],
            pack: ['chips', 'biscuit', 'cookie', 'noodle', 'pasta', 'cereal', 'namkeen'],
            piece: ['apple', 'banana', 'orange', 'mango', 'bread', 'egg', 'coconut']
        };

        for (const [unit, keywords] of Object.entries(enhancedContains)) {
            for (const keyword of keywords) {
                if (name.includes(keyword)) {
                    return { unit, confidence: 95 };
                }
            }
        }

        // ADVANCED PATTERN MATCHES (90% confidence)
        const patterns = {
            kg: /\b(rice|wheat|flour|atta|maida|besan|dal|sugar|jaggery|onion|potato|tomato|grain|pulse|lentil|bean|chickpea)\b/i,
            gram: /\b(powder|masala|spice|seeds?|tea|coffee|salt|turmeric|chili|cumin|coriander|cardamom|cinnamon|clove)\b/i,
            liter: /\b(milk|oil|juice|water|liquid|ghee|buttermilk|lassi)\b/i,
            ml: /\b(sauce|honey|syrup|vinegar|extract|ketchup|mayo|dressing)\b/i,
            pack: /\b(chips|biscuit|cookie|noodle|pasta|cereal|snack|namkeen|mixture)\b/i,
            piece: /\b(apple|banana|orange|mango|fruit|bread|egg|coconut|lemon|lime)\b/i
        };

        for (const [unit, pattern] of Object.entries(patterns)) {
            if (pattern.test(name)) {
                return { unit, confidence: 90 };
            }
        }

        // DEFAULT fallback
        return { unit: 'piece', confidence: 60 };
    };

    // Validate individual product
    const validateProduct = (name, price, category) => {
        const errors = [];

        if (!name || name.trim().length < 2) {
            errors.push('Product name is required (minimum 2 characters)');
        }

        if (!price || price <= 0) {
            errors.push('Valid price is required (must be greater than 0)');
        }

        if (name && name.length > 100) {
            errors.push('Product name cannot exceed 100 characters');
        }

        return errors;
    };

    // Handle bulk upload
    const handleBulkUpload = async () => {
        if (!selectedShop) {
            alert('Please select a shop');
            return;
        }

        const validProducts = parsedData.filter(p => p.isValid && p.errors.length === 0);

        if (validProducts.length === 0) {
            alert('No valid products to upload');
            return;
        }

        setStep(3);
        setProcessing(true);
        setProgress(0);

        try {
            // Prepare products for upload
            const productsToUpload = validProducts.map(product => ({
                name: product.name,
                description: product.description,
                category: product.category,
                price: product.price,
                originalPrice: product.originalPrice,
                discount: product.discount,
                stockQuantity: product.stockQuantity,
                inStock: product.inStock,
                unit: product.unit,
                tags: product.tags,
                shopId: selectedShop
            }));

            // Upload in batches of 50
            const batchSize = 50;
            const batches = [];
            for (let i = 0; i < productsToUpload.length; i += batchSize) {
                batches.push(productsToUpload.slice(i, i + batchSize));
            }

            let successCount = 0;
            let failureCount = 0;
            const failedProducts = [];

            for (let i = 0; i < batches.length; i++) {
                try {
                    const response = await axiosInstance.post('/admin/products/bulk-upload', {
                        products: batches[i]
                    });

                    if (response.data.success) {
                        successCount += response.data.data.successCount || batches[i].length;
                        if (response.data.data.failures) {
                            failureCount += response.data.data.failures.length;
                            failedProducts.push(...response.data.data.failures);
                        }
                    }
                } catch (error) {
                    console.error('Batch upload error:', error);
                    failureCount += batches[i].length;
                    failedProducts.push(...batches[i].map(p => ({ product: p, error: 'Upload failed' })));
                }

                // Update progress
                setProgress(Math.round(((i + 1) / batches.length) * 100));
            }

            setResults({
                total: productsToUpload.length,
                success: successCount,
                failure: failureCount,
                failures: failedProducts
            });

            if (successCount > 0) {
                onSuccess && onSuccess();
            }

        } catch (error) {
            console.error('Bulk upload error:', error);
            alert('Error during bulk upload: ' + (error.response?.data?.message || error.message));
        } finally {
            setProcessing(false);
        }
    };

    // Render file upload step
    const renderUploadStep = () => (
        <div className="upload-step">
            <h3>📊 Upload Excel File</h3>

            {/* Shop Selection First */}
            <div className="shop-selection-first">
                <h4>🏪 Select Target Shop</h4>
                <p>Choose which shop you want to add these products to:</p>
                <select
                    value={selectedShop}
                    onChange={(e) => setSelectedShop(e.target.value)}
                    className="shop-select-large"
                    required
                >
                    <option value="">Choose a shop...</option>
                    {shops.map(shop => (
                        <option key={shop._id} value={shop._id}>
                            {shop.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedShop && (
                <>
                    <div className="upload-instructions">
                        <p><strong>Excel Format Required:</strong></p>
                        <ul>
                            <li>Column 1: <strong>Name</strong> (Product Name)</li>
                            <li>Column 2: <strong>Price</strong> (Product Price)</li>
                            <li>Column 3: <strong>Category</strong> (Optional - will default to "General Items")</li>
                        </ul>
                        <p><em>Units will be automatically detected based on product names!</em></p>
                    </div>

                    <div className="file-upload-area">
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => handleFileSelect(e.target.files[0])}
                            className="file-input"
                            id="excel-file"
                        />
                        <label htmlFor="excel-file" className="file-upload-label">
                            📁 Choose Excel File (.xlsx, .xls)
                        </label>
                        {file && (
                            <div className="file-info">
                                ✅ Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );

    // Render preview step
    const renderPreviewStep = () => {
        const validProducts = parsedData.filter(p => p.isValid && p.errors.length === 0);
        const invalidProducts = parsedData.filter(p => !p.isValid || p.errors.length > 0);

        return (
            <div className="preview-step">
                <h3>📋 Preview Products ({parsedData.length} total)</h3>

                <div className="selected-shop-info">
                    <h4>🏪 Target Shop: <span className="shop-name">{shops.find(shop => shop._id === selectedShop)?.name || 'Unknown Shop'}</span></h4>
                    <p>All products will be added to this shop.</p>
                </div>

                <div className="preview-stats">
                    <div className="stat valid">✅ Valid: {validProducts.length}</div>
                    <div className="stat invalid">❌ Invalid: {invalidProducts.length}</div>
                </div>

                <div className="bulk-unit-actions">
                    <h5>🔧 Quick Unit Fixes (Select products and click to apply):</h5>
                    <div className="bulk-unit-buttons">
                        <button
                            className="bulk-unit-btn"
                            onClick={() => {
                                const updatedData = parsedData.map(p =>
                                    p.name.toLowerCase().includes('rice') ||
                                        p.name.toLowerCase().includes('flour') ||
                                        p.name.toLowerCase().includes('dal') ||
                                        p.name.toLowerCase().includes('sugar') ||
                                        p.name.toLowerCase().includes('onion') ||
                                        p.name.toLowerCase().includes('potato')
                                        ? { ...p, unit: 'kg', unitConfidence: 100 }
                                        : p
                                );
                                setParsedData(updatedData);
                            }}
                        >
                            Fix Bulk Items → KG
                        </button>
                        <button
                            className="bulk-unit-btn"
                            onClick={() => {
                                const updatedData = parsedData.map(p =>
                                    p.name.toLowerCase().includes('powder') ||
                                        p.name.toLowerCase().includes('masala') ||
                                        p.name.toLowerCase().includes('spice') ||
                                        p.name.toLowerCase().includes('tea') ||
                                        p.name.toLowerCase().includes('coffee')
                                        ? { ...p, unit: 'gram', unitConfidence: 100 }
                                        : p
                                );
                                setParsedData(updatedData);
                            }}
                        >
                            Fix Spices → GRAM
                        </button>
                        <button
                            className="bulk-unit-btn"
                            onClick={() => {
                                const updatedData = parsedData.map(p =>
                                    p.name.toLowerCase().includes('milk') ||
                                        p.name.toLowerCase().includes('oil') ||
                                        p.name.toLowerCase().includes('juice')
                                        ? { ...p, unit: 'liter', unitConfidence: 100 }
                                        : p
                                );
                                setParsedData(updatedData);
                            }}
                        >
                            Fix Liquids → LITER
                        </button>
                        <button
                            className="bulk-unit-btn"
                            onClick={() => {
                                const updatedData = parsedData.map(p =>
                                    p.name.toLowerCase().includes('apple') ||
                                        p.name.toLowerCase().includes('banana') ||
                                        p.name.toLowerCase().includes('orange') ||
                                        p.name.toLowerCase().includes('bread') ||
                                        p.name.toLowerCase().includes('egg')
                                        ? { ...p, unit: 'piece', unitConfidence: 100 }
                                        : p
                                );
                                setParsedData(updatedData);
                            }}
                        >
                            Fix Individual → PIECE
                        </button>
                    </div>
                </div>

                <div className="preview-table-container">
                    <table className="preview-table">
                        <thead>
                            <tr>
                                <th>In Stock</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Category</th>
                                <th>Unit</th>
                                <th>Confidence</th>
                                <th>Errors</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parsedData.slice(0, 100).map(product => (
                                <tr key={product.id} className={product.isValid && product.errors.length === 0 ? 'valid' : 'invalid'}>
                                    <td>
                                        <label className="stock-toggle">
                                            <input
                                                type="checkbox"
                                                checked={product.inStock}
                                                onChange={(e) => {
                                                    const updatedData = parsedData.map(p =>
                                                        p.id === product.id
                                                            ? { ...p, inStock: e.target.checked }
                                                            : p
                                                    );
                                                    setParsedData(updatedData);
                                                }}
                                            />
                                            <span className="toggle-slider"></span>
                                            <span className="toggle-label">
                                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </label>
                                    </td>
                                    <td>{product.name}</td>
                                    <td>₹{product.price}</td>
                                    <td>{product.category}</td>
                                    <td>
                                        <select
                                            value={product.unit}
                                            onChange={(e) => {
                                                const updatedData = parsedData.map(p =>
                                                    p.id === product.id
                                                        ? { ...p, unit: e.target.value, unitConfidence: 100 }
                                                        : p
                                                );
                                                setParsedData(updatedData);
                                            }}
                                            className={`unit-select confidence-${Math.floor(product.unitConfidence / 20)}`}
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
                                    </td>
                                    <td>{product.unitConfidence}%</td>
                                    <td className="errors">
                                        {product.errors.map((error, i) => (
                                            <div key={i} className="error">{error}</div>
                                        ))}
                                        {product.isValid && product.errors.length === 0 && (
                                            <span className="valid-indicator">✅ Ready</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {parsedData.length > 100 && (
                        <div className="table-note">
                            Showing first 100 products. All {parsedData.length} will be processed.
                        </div>
                    )}
                </div>

                <div className="preview-actions">
                    <button onClick={() => setStep(1)} className="btn-secondary">
                        ← Back to Upload
                    </button>
                    <button
                        onClick={handleBulkUpload}
                        disabled={!selectedShop || validProducts.length === 0}
                        className="btn-primary"
                    >
                        Upload {validProducts.length} Products →
                    </button>
                </div>
            </div>
        );
    };

    // Render processing step
    const renderProcessingStep = () => (
        <div className="processing-step">
            <h3>🚀 Uploading Products...</h3>

            {processing && (
                <div className="progress-container">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="progress-text">{progress}% Complete</div>
                </div>
            )}

            {results && (
                <div className="results-container">
                    <h4>📊 Upload Results</h4>
                    <div className="results-stats">
                        <div className="stat success">✅ Successful: {results.success}</div>
                        <div className="stat failure">❌ Failed: {results.failure}</div>
                        <div className="stat total">📊 Total: {results.total}</div>
                    </div>

                    {results.failures && results.failures.length > 0 && (
                        <div className="failures-list">
                            <h5>Failed Products:</h5>
                            {results.failures.slice(0, 10).map((failure, i) => (
                                <div key={i} className="failure-item">
                                    {failure.product?.name || 'Unknown'}: {failure.error}
                                </div>
                            ))}
                            {results.failures.length > 10 && (
                                <div className="more-failures">
                                    ... and {results.failures.length - 10} more
                                </div>
                            )}
                        </div>
                    )}

                    <div className="results-actions">
                        <button onClick={onClose} className="btn-primary">
                            ✅ Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="bulk-upload-modal">
            <div className="modal-backdrop" onClick={onClose}></div>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>📊 Bulk Product Upload</h2>
                    <button onClick={onClose} className="close-btn">✖</button>
                </div>

                <div className="modal-body">
                    {step === 1 && renderUploadStep()}
                    {step === 2 && renderPreviewStep()}
                    {step === 3 && renderProcessingStep()}
                </div>
            </div>
        </div>
    );
};

export default BulkProductUpload;