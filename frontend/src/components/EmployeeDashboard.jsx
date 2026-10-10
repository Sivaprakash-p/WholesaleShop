import { useState } from 'react';
import './Dashboard.css';

const MOCK_CITIES = [];
const MOCK_SHOPS = [];

const MOCK_PRODUCTS = [];

export default function EmployeeDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCity, setSelectedCity] = useState(null);
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [shopSearchTerm, setShopSearchTerm] = useState('');
  
  // Order State
  const [activeShopForOrder, setActiveShopForOrder] = useState(null);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [orderItems, setOrderItems] = useState([]);

  const handleAddProductToOrder = (product) => {
    if (!orderItems.find(item => item.id === product.id)) {
      setOrderItems([...orderItems, { ...product, qty: 1, free: 0 }]);
    }
    setProductSearchTerm('');
  };

  const updateOrderItem = (id, field, value) => {
    setOrderItems(orderItems.map(item => {
      if (item.id === id) {
        return { ...item, [field]: Number(value) };
      }
      return item;
    }));
  };

  const removeOrderItem = (id) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

  const renderNewOrderFlow = () => {
    if (activeShopForOrder) {
      const filteredProducts = productSearchTerm 
        ? MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(productSearchTerm.toLowerCase()))
        : [];

      const grandTotal = orderItems.reduce((acc, item) => acc + (item.qty * item.mrp), 0);

      return (
        <div className="content-section fade-in">
          <div className="section-header" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button className="back-btn" onClick={() => { setActiveShopForOrder(null); setOrderItems([]); setProductSearchTerm(''); }}>
                ← Back to Shops
              </button>
              <h2>Order Form</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{activeShopForOrder.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                {activeShopForOrder.city} • {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <input 
              type="text" 
              placeholder="Search products to add..." 
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              className="search-input"
            />
            {filteredProducts.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxWidth: '500px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', marginTop: '8px', zIndex: 10, overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                {filteredProducts.map(prod => (
                  <div key={prod.id} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }} onClick={() => handleAddProductToOrder(prod)} className="product-search-item">
                    <div style={{ fontWeight: '500' }}>{prod.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>MRP: ${prod.mrp.toFixed(2)} | GST: {prod.gst}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="data-table-container" style={{ marginBottom: '24px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th style={{ width: '80px' }}>Quantity</th>
                  <th style={{ width: '80px' }}>Free</th>
                  <th>MRP</th>
                  <th>GST %</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.length > 0 ? orderItems.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td>
                      <input type="number" min="1" value={item.qty} onChange={(e) => updateOrderItem(item.id, 'qty', e.target.value)} style={{ width: '60px', background: 'rgba(15,23,42,0.4)', border: '1px solid var(--border-color)', color: 'white', padding: '6px', borderRadius: '6px' }} />
                    </td>
                    <td>
                      <input type="number" min="0" value={item.free} onChange={(e) => updateOrderItem(item.id, 'free', e.target.value)} style={{ width: '60px', background: 'rgba(15,23,42,0.4)', border: '1px solid var(--border-color)', color: 'white', padding: '6px', borderRadius: '6px' }} />
                    </td>
                    <td>${item.mrp.toFixed(2)}</td>
                    <td>{item.gst}%</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>${(item.qty * item.mrp).toFixed(2)}</td>
                    <td>
                      <button className="action-link" style={{ color: '#ef4444' }} onClick={() => removeOrderItem(item.id)}>Remove</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No products added yet. Search above to add items to the order.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.5)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Total Items: {orderItems.reduce((acc, item) => acc + item.qty, 0)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Grand Total</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-main)' }}>${grandTotal.toFixed(2)}</div>
              </div>
              <button className="submit-btn" style={{ margin: 0, padding: '14px 32px', fontSize: '16px' }} disabled={orderItems.length === 0}>
                Submit Order
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (selectedCity) {
      const cityShops = MOCK_SHOPS
        .filter(s => s.city === selectedCity)
        .filter(s => s.name.toLowerCase().includes(shopSearchTerm.toLowerCase()));
      
      return (
        <div className="content-section fade-in">
          <div className="section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button className="back-btn" onClick={() => { setSelectedCity(null); setShopSearchTerm(''); }}>
                ← Back to Cities
              </button>
              <h2>Select a Shop in {selectedCity}</h2>
            </div>
          </div>

          <div className="city-search-container" style={{ marginBottom: '24px' }}>
            <input 
              type="text" 
              placeholder="Search shops..." 
              value={shopSearchTerm}
              onChange={(e) => setShopSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="cities-flex-list">
            {cityShops.length > 0 ? cityShops.map((shop, index) => (
              <div key={shop.id} className="city-list-item" style={{ cursor: 'default' }}>
                <span className="city-index">{index + 1}.</span>
                <div style={{ flex: 1 }}>
                  <div className="city-name" style={{ marginBottom: '4px' }}>{shop.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{shop.owner} • {shop.contact}</div>
                </div>
                <button className="submit-btn" style={{ margin: 0, padding: '8px 16px', fontSize: '13px' }} onClick={() => setActiveShopForOrder(shop)}>
                  Start Order
                </button>
              </div>
            )) : (
              <div className="placeholder-box" style={{ width: '100%' }}>
                <p>No shops found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="content-section fade-in">
        <div className="section-header">
          <h2>Select a City for New Order</h2>
        </div>
        
        <div className="city-search-container" style={{ marginBottom: '24px' }}>
          <input 
            type="text" 
            placeholder="Search cities..." 
            value={citySearchTerm}
            onChange={(e) => setCitySearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="cities-flex-list">
          {MOCK_CITIES
            .filter(city => city.toLowerCase().includes(citySearchTerm.toLowerCase()))
            .map((city, index) => {
              const cityShopCount = MOCK_SHOPS.filter(s => s.city === city).length;
              return (
                <div key={city} className="city-list-item" onClick={() => setSelectedCity(city)}>
                  <span className="city-index">{index + 1}.</span>
                  <span className="city-name">{city}</span>
                  <span className="city-count">({cityShopCount} Shop{cityShopCount !== 1 ? 's' : ''})</span>
                </div>
              );
          })}
          {MOCK_CITIES.filter(city => city.toLowerCase().includes(citySearchTerm.toLowerCase())).length === 0 && (
            <div className="placeholder-box" style={{ width: '100%' }}>
              <p>No cities found matching "{citySearchTerm}".</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'newOrder':
        return renderNewOrderFlow();
      
      case 'history':
        return (
          <div className="content-section fade-in">
            <h2>Your Order History</h2>
            <div className="placeholder-box">
              <p>Your previous orders will appear here...</p>
            </div>
          </div>
        );

      case 'dashboard':
      default:
        return (
          <div className="fade-in">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Orders Taken Today</h3>
                <p className="stat-value">0</p>
                <span className="stat-change text-neutral">No orders yet</span>
              </div>
              <div className="stat-card">
                <h3>Sales Volume Today</h3>
                <p className="stat-value">$0</p>
                <span className="stat-change text-neutral">No sales yet</span>
              </div>
              <div className="stat-card">
                <h3>Shops Visited</h3>
                <p className="stat-value">0</p>
                <span className="stat-change text-neutral">Route not started</span>
              </div>
            </div>

            <div className="content-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ margin: 0 }}>Recent Orders</h2>
                <button 
                  className="submit-btn" 
                  style={{ margin: 0, padding: '8px 16px', fontSize: '14px' }}
                  onClick={() => { setActiveTab('newOrder'); setSelectedCity(null); }}
                >
                  + New Order
                </button>
              </div>
              
              <div className="order-list">
                <div className="placeholder-box" style={{ width: '100%' }}>
                  <p>No recent orders found.</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container employee-theme">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Sales Rep Portal</h2>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'newOrder' ? 'active' : ''}`}
            onClick={() => { setActiveTab('newOrder'); setSelectedCity(null); setActiveShopForOrder(null); }}
          >
            Take New Order
          </button>
          <button 
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Order History
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Field Sales Dashboard</h1>
          <div className="user-profile">
            <div className="avatar employee-avatar">SR</div>
            <span>Sales Rep</span>
          </div>
        </header>

        <div className="dashboard-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
