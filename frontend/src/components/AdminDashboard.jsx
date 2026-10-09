import { useState } from 'react';
import './Dashboard.css';

const MOCK_PRODUCTS = [
  { id: 1, name: 'Premium Basmati Rice 25kg', category: 'Grains', stock: 120, price: 45.00 },
  { id: 2, name: 'Wheat Flour 10kg', category: 'Flour', stock: 45, price: 12.50 },
  { id: 3, name: 'Refined Sugar 50kg', category: 'Sugar', stock: 8, price: 38.00 }
];

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dynamic State
  const [cities, setCities] = useState(['Mumbai', 'Pune', 'Delhi']);
  const [shops, setShops] = useState([
    { id: 1, name: 'Patel Supermart', city: 'Mumbai', owner: 'R. Patel', contact: '9876543210' },
    { id: 2, name: 'Sharma Kirana Store', city: 'Pune', owner: 'A. Sharma', contact: '9876543212' },
    { id: 3, name: 'Gupta General Store', city: 'Delhi', owner: 'M. Gupta', contact: '9876543214' }
  ]);

  // View State for Clients tab
  const [selectedCityView, setSelectedCityView] = useState(null); // null = show cities, string = show shops in that city
  const [showAddCity, setShowAddCity] = useState(false);
  const [showAddShop, setShowAddShop] = useState(false);

  // Form State
  const [newCityName, setNewCityName] = useState('');
  const [newShop, setNewShop] = useState({ name: '', city: '', owner: '', contact: '' });
  const [citySearchTerm, setCitySearchTerm] = useState('');

  const handleAddCity = (e) => {
    e.preventDefault();
    if (newCityName.trim() && !cities.includes(newCityName.trim())) {
      setCities([...cities, newCityName.trim()]);
      setNewCityName('');
      setShowAddCity(false);
    }
  };

  const handleAddShop = (e) => {
    e.preventDefault();
    if (newShop.name && newShop.city) {
      setShops([...shops, { ...newShop, id: Date.now() }]);
      setNewShop({ name: '', city: '', owner: '', contact: '' });
      setShowAddShop(false);
    }
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
                      <button className="action-link">View Details</button>
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
        return (
          <div className="content-section fade-in">
            <div className="section-header">
              <h2>Inventory & Products</h2>
              <button className="submit-btn" style={{ margin: 0, padding: '8px 16px', fontSize: '14px' }}>+ Add Product</button>
            </div>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Unit Price</th>
                    <th>Current Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PRODUCTS.map(product => (
                    <tr key={product.id}>
                      <td><strong>{product.name}</strong></td>
                      <td>{product.category}</td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>{product.stock} units</td>
                      <td>
                        <span className={`status-badge ${product.stock < 15 ? 'status-danger' : 'status-success'}`}>
                          {product.stock < 15 ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'clients':
        return renderClientsTab();

      case 'dashboard':
      default:
        return (
          <div className="fade-in">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Orders Today</h3>
                <p className="stat-value">124</p>
                <span className="stat-change positive">+15% vs yesterday</span>
              </div>
              <div className="stat-card">
                <h3>Total Revenue Today</h3>
                <p className="stat-value">$32,450</p>
                <span className="stat-change positive">+8% vs yesterday</span>
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
                <div className="order-item">
                  <div className="order-info">
                    <h4>Patel Supermart</h4>
                    <p>Rep: Amit K. • Mumbai • 15 Items</p>
                  </div>
                  <div className="order-total">$450.00</div>
                  <div className="order-actions">
                    <button className="btn-approve">Approve</button>
                    <button className="btn-reject">Reject</button>
                  </div>
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
