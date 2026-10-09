import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SocialLogin from './components/SocialLogin';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import './App.css';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [animateKey, setAnimateKey] = useState(0);
  const [userRole, setUserRole] = useState(null); // 'admin' | 'employee' | null

  // Re-trigger animation when switching tabs
  useEffect(() => {
    setAnimateKey(prev => prev + 1);
  }, [isLogin]);

  const handleLogin = (role) => {
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserRole(null);
  };

  if (userRole === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (userRole === 'employee') {
    return <EmployeeDashboard onLogout={handleLogout} />;
  }

  return (
    <>
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      
      <div className="auth-container">
        <div className="auth-header">
          <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p>{isLogin ? 'Enter your details to access your account' : 'Sign up to get started with our platform'}</p>
        </div>

        <div className="auth-toggle">
          <div 
            className="toggle-slider" 
            style={{ transform: `translateX(${isLogin ? '0' : '100%'})` }} 
          />
          <button 
            className={`auth-toggle-btn ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Log In
          </button>
          <button 
            className={`auth-toggle-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        <div key={animateKey}>
          {isLogin ? <LoginForm onLogin={handleLogin} /> : <RegisterForm />}
        </div>

        <SocialLogin />
      </div>
    </>
  );
}

export default App;
