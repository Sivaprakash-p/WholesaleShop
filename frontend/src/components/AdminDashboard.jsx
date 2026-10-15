import { useState, useEffect } from 'react';
import './Dashboard.css';

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dynamic State
  const [cities, setCities] = useState([]);
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);

  // Fetch initial data on load
  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetch('http://localhost:8080/api/cities')
      .then(res => res.json())
      .then(data => setCities(data.map(c => c.name)))
      .catch(err => console.error("Error fetching cities:", err));

    fetch('http://localhost:8080/api/shops')
      .then(res => res.json())
      .then(data => {
        setShops(data.map(s => ({
          id: s.id,
          name: s.name,
          city: s.city.name,
          owner: s.owner || s.address, // Fallback to address if owner is null (legacy)
          contact: s.contact || 'N/A'
        })));
      })
      .catch(err => console.error("Error fetching shops:", err));

    fetchProducts();
  }, []);

  // View State for Clients tab
  const [selectedCityView, setSelectedCityView] = useState(null); // null = show cities, string = show shops in that city
  const [showAddCity, setShowAddCity] = useState(false);
  const [showAddShop, setShowAddShop] = useState(false);
  const [selectedShopDetails, setSelectedShopDetails] = useState(null);

  // Form State
  const [newCityName, setNewCityName] = useState('');
  const [newShop, setNewShop] = useState({ name: '', city: '', owner: '', contact: '' });
  const [citySearchTerm, setCitySearchTerm] = useState('');

  // Product Form State & Filter State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedTaxFilter, setSelectedTaxFilter] = useState('ALL');
  const [productForm, setProductForm] = useState({
    name: '',
    hsnCode: '',
    netRate: '',
    taxGst: '18'
  });

  const handleAddCity = async (e) => {
    e.preventDefault();
    const trimmedCity = newCityName.trim();
    if (trimmedCity && !cities.includes(trimmedCity)) {
      try {
        const response = await fetch('http://localhost:8080/api/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: trimmedCity })
        });

        if (response.ok) {
          setCities([...cities, trimmedCity]);
          setNewCityName('');
          setShowAddCity(false);
        } else {
          console.error("Failed to save city");
        }
      } catch (err) {
        console.error("Error saving city:", err);
      }
    }
  };

  const handleAddShop = async (e) => {
    e.preventDefault();
    if (newShop.name && newShop.city) {
      try {
        // First we need the city ID. Since the UI only has the city name, we need to fetch cities to match.
        const citiesRes = await fetch('http://localhost:8080/api/cities');
        const allCities = await citiesRes.json();
        const cityObj = allCities.find(c => c.name === newShop.city);

        if (!cityObj) {
          console.error("City not found in database!");
          return;
        }

        const response = await fetch('http://localhost:8080/api/shops', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newShop.name,
            owner: newShop.owner,
            contact: newShop.contact,
            address: 'Not Provided',
            city: { id: cityObj.id }
          })
        });

        if (response.ok) {
          const savedShop = await response.json();
          setShops([...shops, {
            id: savedShop.id,
            name: savedShop.name,
            city: newShop.city, // The backend response might only contain the city ID, so use the known name
            owner: savedShop.owner || savedShop.address,
            contact: savedShop.contact || 'N/A'
          }]);
          setNewShop({ name: '', city: '', owner: '', contact: '' });
          setShowAddShop(false);
        } else {
          console.error("Failed to save shop");
        }
      } catch (err) {
        console.error("Error saving shop:", err);
      }
    }
  };

  // Tax calculation helper for preview & live updates (Invoice standard: Rate = Net Rate / (1 + GST%))
  const calculateTaxBreakdown = (netRateInput, taxGstInput) => {
    const net = parseFloat(netRateInput) || 0;
    const gst = parseFloat(taxGstInput) || 0;
    const divisor = 1.0 + (gst / 100.0);
    const baseRate = divisor > 0 ? (net / divisor) : net;
    const roundedRate = Math.round(baseRate * 100) / 100;
    const totalTax = Math.round((net - roundedRate) * 100) / 100;
    const cgstPercent = Math.round((gst / 2.0) * 100) / 100;
    const sgstPercent = Math.round((gst / 2.0) * 100) / 100;
    const cgstAmount = Math.round((totalTax / 2.0) * 100) / 100;
    const sgstAmount = Math.round((totalTax - cgstAmount) * 100) / 100;

    return {
      netRate: net,
      taxGst: gst,
      rate: roundedRate,
      cgstPercent,
      sgstPercent,
      cgstAmount,
      sgstAmount,
      taxAmount: totalTax
    };
  };

  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({ name: '', hsnCode: '', netRate: '', taxGst: '18' });
    setShowAddProduct(true);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      hsnCode: product.hsnCode || '',
      netRate: product.netRate.toString(),
      taxGst: product.taxGst.toString()
    });
    setShowAddProduct(true);
  };

  const closeProductModal = () => {
    setShowAddProduct(false);
    setEditingProduct(null);
    setProductForm({ name: '', hsnCode: '', netRate: '', taxGst: '18' });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.netRate) {
      return;
    }

    const payload = {
      name: productForm.name.trim(),
      hsnCode: productForm.hsnCode.trim(),
      netRate: parseFloat(productForm.netRate),
      taxGst: parseFloat(productForm.taxGst) || 0
    };

    try {
      if (editingProduct) {
        const res = await fetch(`http://localhost:8080/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated = await res.json();
          setProducts(products.map(p => p.id === updated.id ? updated : p));
          closeProductModal();
        }
      } else {
        const res = await fetch('http://localhost:8080/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created = await res.json();
          setProducts([...products, created]);
          closeProductModal();
        }
      }
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const res = await fetch(`http://localhost:8080/api/products/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setProducts(products.filter(p => p.id !== id));
        }
      } catch (err) {
        console.error("Error deleting product:", err);
      }
    }
  };

  const renderInventoryTab = () => {
    const preview = calculateTaxBreakdown(productForm.netRate, productForm.taxGst);

    const filteredProducts = products.filter(p => {
      return p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        (p.hsnCode && p.hsnCode.toLowerCase().includes(productSearchTerm.toLowerCase()));
    });

    return (
      <div className="content-section fade-in">
        <div className="section-header">
          <div>
            <h2>Products & GST Catalog</h2>
            <p className="section-subtitle">Manage products, HSN codes, Net Rates, and automatic Tax calculations</p>
          </div>
          <button className="submit-btn" style={{ margin: 0, padding: '10px 20px', fontSize: '14px' }} onClick={openAddProductModal}>
            + Add Product
          </button>
        </div>

        {/* Quick Stats Banner */}
        <div className="product-summary-bar">
          <div className="summary-item">
            <span className="summary-label">Total Catalog Items</span>
            <span className="summary-val">{products.length} Products</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="product-filter-bar">
          <div className="product-search-wrapper">
            <input
              type="text"
              placeholder="Search by product name or HSN code..."
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Product Name</th>
                <th>HSN Code</th>
                <th style={{ textAlign: 'right' }}>Net Rate (₹)</th>
                <th style={{ textAlign: 'center' }}>Tax (GST %)</th>
                <th style={{ textAlign: 'right', background: 'rgba(99, 102, 241, 0.08)' }}>
                  Rate (Excl. Tax)
                  <span className="th-subtext">Reduced after tax</span>
                </th>
                <th style={{ textAlign: 'right' }}>
                  CGST Value
                  <span className="th-subtext">Central GST</span>
                </th>
                <th style={{ textAlign: 'right' }}>
                  SGST Value
                  <span className="th-subtext">State GST</span>
                </th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <tr key={product.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                    <td>
                      <div className="product-table-name">
                        <strong>{product.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="hsn-badge">{product.hsnCode || '—'}</span>
                    </td>
                    <td style={{ textAlign: 'right' }} className="rate-cell net-rate">
                      ₹{Number(product.netRate).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="gst-tag">
                        {product.taxGst}%
                        <small className="gst-split">({(product.taxGst / 2).toFixed(1)}% + {(product.taxGst / 2).toFixed(1)}%)</small>
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', background: 'rgba(99, 102, 241, 0.04)' }} className="rate-cell base-rate">
                      ₹{Number(product.rate).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right' }} className="tax-cell">
                      ₹{Number(product.cgstAmount).toFixed(2)}
                      <small className="tax-percent-sub">{product.cgstPercent}%</small>
                    </td>
                    <td style={{ textAlign: 'right' }} className="tax-cell">
                      ₹{Number(product.sgstAmount).toFixed(2)}
                      <small className="tax-percent-sub">{product.sgstPercent}%</small>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="table-action-btns">
                        <button className="action-link edit-link" onClick={() => openEditProductModal(product)}>
                          Edit
                        </button>
                        <button className="action-link delete-link" onClick={() => handleDeleteProduct(product.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div className="empty-catalog-box">
                      <div className="empty-icon">📦</div>
                      <h3>No products found</h3>
                      <p>{productSearchTerm || selectedTaxFilter !== 'ALL' ? 'No products match your search or filter criteria.' : 'Start by adding your first wholesale product with Net Rate and GST.'}</p>
                      <button className="submit-btn" style={{ marginTop: '16px', display: 'inline-block' }} onClick={openAddProductModal}>
                        + Add First Product
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add / Edit Product Modal */}
        {showAddProduct && (
          <div className="modal-overlay">
            <div className="modal-content product-modal">
              <div className="modal-header">
                <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <span className="modal-desc">
                  Enter product details. The Base Rate and CGST/SGST amounts will be calculated automatically from the Net Rate.
                </span>
              </div>

              <form onSubmit={handleSaveProduct}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                        required
                        placeholder="e.g. Parle-G Gold 250g"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>HSN Code</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        value={productForm.hsnCode}
                        onChange={e => setProductForm({ ...productForm, hsnCode: e.target.value })}
                        placeholder="e.g. 19053100"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Net Rate (₹) * <small className="label-tip">(Inclusive of Tax)</small></label>
                    <div className="input-wrapper currency-input-wrapper">
                      <span className="input-prefix">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={productForm.netRate}
                        onChange={e => setProductForm({ ...productForm, netRate: e.target.value })}
                        required
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Tax (GST %) *</label>
                    <div className="input-wrapper percent-input-wrapper">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={productForm.taxGst}
                        onChange={e => setProductForm({ ...productForm, taxGst: e.target.value })}
                        required
                        placeholder="e.g. 18"
                      />
                      <span className="input-suffix">%</span>
                    </div>

                    {/* Quick GST buttons */}
                    <div className="quick-gst-chips">
                      {[0, 5, 12, 18, 28].map(slab => (
                        <button
                          key={slab}
                          type="button"
                          className={`gst-chip ${Number(productForm.taxGst) === slab ? 'selected' : ''}`}
                          onClick={() => setProductForm({ ...productForm, taxGst: slab.toString() })}
                        >
                          {slab}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Real-Time GST & Base Rate Breakdown Card */}
                <div className="tax-breakdown-card">
                  <div className="breakdown-header">
                    <span className="breakdown-title">⚡ Live Tax Calculation Breakdown</span>
                    <span className="breakdown-pill">Auto-Computed</span>
                  </div>

                  <div className="breakdown-grid">
                    <div className="breakdown-item">
                      <span className="bd-label">Rate (Excluded Tax)</span>
                      <span className="bd-value rate-highlight">₹{preview.rate.toFixed(2)}</span>
                      <span className="bd-formula">Net Rate ÷ (1 + {preview.taxGst}%)</span>
                    </div>

                    <div className="breakdown-item">
                      <span className="bd-label">CGST ({preview.cgstPercent}%)</span>
                      <span className="bd-value tax-highlight">₹{preview.cgstAmount.toFixed(2)}</span>
                      <span className="bd-formula">Central Tax (50%)</span>
                    </div>

                    <div className="breakdown-item">
                      <span className="bd-label">SGST ({preview.sgstPercent}%)</span>
                      <span className="bd-value tax-highlight">₹{preview.sgstAmount.toFixed(2)}</span>
                      <span className="bd-formula">State Tax (50%)</span>
                    </div>

                    <div className="breakdown-item final-total">
                      <span className="bd-label">Net Rate (Final Price)</span>
                      <span className="bd-value total-highlight">₹{preview.netRate.toFixed(2)}</span>
                      <span className="bd-formula">Rate + CGST + SGST</span>
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={closeProductModal}>Cancel</button>
                  <button type="submit" className="submit-btn">{editingProduct ? 'Update Product' : 'Save Product'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderClientsTab = () => {
    if (selectedCityView) {
      // Show shops in selected city
      const cityShops = shops.filter(s => s.city === selectedCityView);
      return (
        <div className="content-section fade-in">
          <div className="section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button className="back-btn" onClick={() => setSelectedCityView(null)}>
                ← Back
              </button>
              <h2>Shops in {selectedCityView}</h2>
            </div>
            <button className="submit-btn" style={{ margin: 0, padding: '8px 16px', fontSize: '14px' }} onClick={() => {
              setNewShop({ ...newShop, city: selectedCityView });
              setShowAddShop(true);
            }}>
              + Add Shop Here
            </button>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Shop Name</th>
                  <th>Owner</th>
                  <th>Contact</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cityShops.length > 0 ? cityShops.map(shop => (
                  <tr key={shop.id}>
                    <td><strong>{shop.name}</strong></td>
                    <td>{shop.owner}</td>
                    <td>{shop.contact}</td>
                    <td>
                      <button className="action-link" onClick={() => setSelectedShopDetails(shop)}>View Details</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No shops found in this city yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add Shop Modal */}
          {showAddShop && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Add New Shop</h3>
                <form onSubmit={handleAddShop}>
                  <div className="form-group">
                    <label>Shop Name</label>
                    <div className="input-wrapper">
                      <input type="text" value={newShop.name} onChange={e => setNewShop({ ...newShop, name: e.target.value })} required placeholder="e.g. Super Mart" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <div className="input-wrapper" style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', padding: '14px 16px', color: 'var(--text-muted)' }}>
                      {newShop.city || selectedCityView}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Owner Name</label>
                    <div className="input-wrapper">
                      <input type="text" value={newShop.owner} onChange={e => setNewShop({ ...newShop, owner: e.target.value })} required placeholder="e.g. John Doe" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Contact Number</label>
                    <div className="input-wrapper">
                      <input type="text" value={newShop.contact} onChange={e => setNewShop({ ...newShop, contact: e.target.value })} required placeholder="e.g. 9876543210" />
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="cancel-btn" onClick={() => setShowAddShop(false)}>Cancel</button>
                    <button type="submit" className="submit-btn">Save Shop</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Shop Details Modal */}
          {selectedShopDetails && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Shop Details</h3>
                <div style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                  <p><strong>Name:</strong> {selectedShopDetails.name}</p>
                  <p><strong>City:</strong> {selectedShopDetails.city}</p>
                  <p><strong>Owner:</strong> {selectedShopDetails.owner}</p>
                  <p><strong>Contact:</strong> {selectedShopDetails.contact}</p>
                </div>
                <div className="modal-actions">
                  <button type="button" className="submit-btn" onClick={() => setSelectedShopDetails(null)}>Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Show all cities
    return (
      <div className="content-section fade-in">
        <div className="section-header">
          <h2>Cities & Regions</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="submit-btn" style={{ margin: 0, padding: '8px 16px', fontSize: '14px' }} onClick={() => setShowAddCity(true)}>
              + Add City
            </button>
          </div>
        </div>

        {/* Add City Modal */}
        {showAddCity && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Add New City</h3>
              <form onSubmit={handleAddCity}>
                <div className="form-group">
                  <label>City Name</label>
                  <div className="input-wrapper">
                    <input autoFocus type="text" value={newCityName} onChange={e => setNewCityName(e.target.value)} required placeholder="e.g. Bangalore" />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowAddCity(false)}>Cancel</button>
                  <button type="submit" className="submit-btn">Save City</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="city-search-container" style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Search cities or villages..."
            value={citySearchTerm}
            onChange={(e) => setCitySearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="cities-flex-list">
          {cities
            .filter(city => city.toLowerCase().includes(citySearchTerm.toLowerCase()))
            .map((city, index) => {
              const cityShopCount = shops.filter(s => s.city === city).length;
              return (
                <div key={city} className="city-list-item" onClick={() => setSelectedCityView(city)}>
                  <span className="city-index">{index + 1}.</span>
                  <span className="city-name">{city}</span>
                  <span className="city-count">({cityShopCount} Shop{cityShopCount !== 1 ? 's' : ''})</span>
                </div>
              );
            })}
          {cities.filter(city => city.toLowerCase().includes(citySearchTerm.toLowerCase())).length === 0 && (
            <div className="placeholder-box" style={{ width: '100%' }}>
              <p>No cities found matching "{citySearchTerm}".</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'inventory':
        return renderInventoryTab();

      case 'clients':
        return renderClientsTab();

      case 'dashboard':
      default:
        return (
          <div className="fade-in">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Orders Today</h3>
                <p className="stat-value">0</p>
                <span className="stat-change text-neutral">No orders yet</span>
              </div>
              <div className="stat-card">
                <h3>Total Products</h3>
                <p className="stat-value">{products.length}</p>
                <span className="stat-change text-neutral">Active in catalog</span>
              </div>
              <div className="stat-card">
                <h3>Total Cities Active</h3>
                <p className="stat-value">{cities.length}</p>
                <span className="stat-change text-neutral">With {shops.length} registered shops</span>
              </div>
            </div>

            <div className="content-section">
              <h2>Incoming Orders (Awaiting Approval)</h2>
              <div className="order-list">
                <div className="placeholder-box" style={{ width: '100%' }}>
                  <p>No incoming orders at the moment.</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container admin-theme">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Wholesale Admin</h2>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setSelectedCityView(null); }}
          >
            Dashboard
          </button>
          <button className="nav-item">All Orders</button>
          <button
            className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => { setActiveTab('inventory'); setSelectedCityView(null); }}
          >
            Inventory & Products
          </button>
          <button
            className={`nav-item ${activeTab === 'clients' ? 'active' : ''}`}
            onClick={() => setActiveTab('clients')}
          >
            Cities & Shops
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Central Dashboard</h1>
          <div className="user-profile">
            <div className="avatar">AW</div>
            <span>Admin Wholesale</span>
          </div>
        </header>

        <div className="dashboard-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
