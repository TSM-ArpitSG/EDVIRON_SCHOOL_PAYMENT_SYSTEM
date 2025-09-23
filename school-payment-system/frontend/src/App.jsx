import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SchoolTransactions from './pages/SchoolTransactions';
import TransactionStatus from './pages/TransactionStatus';
import { HomeIcon, AcademicCapIcon, DocumentCheckIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

// Navigation Component
function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  if (!user) return null;
  
  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: HomeIcon },
    { path: '/school-transactions', name: 'School Transactions', icon: AcademicCapIcon },
    { path: '/transaction-status', name: 'Check Status', icon: DocumentCheckIcon }
  ];
  
  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 shadow-xl border-b-4 border-indigo-300" style={{width: '100%'}}>
      <div className="max-w-7xl mx-auto px-6" style={{width: '100%', maxWidth: '100%'}}>
        {/* Top row - Title and Welcome/Logout */}
        <div className="flex justify-between items-center h-16" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
          <div className="flex-shrink-0" style={{flexShrink: 0}}>
            <h1 className="text-2xl font-black text-white tracking-wide">
              🏫 School Payment System
            </h1>
          </div>
          
          {/* Right side - Welcome & Logout */}
          <div className="flex items-center space-x-4" style={{display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0}}>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-sm font-semibold text-white">
                👋 Welcome, <span className="text-yellow-200 font-bold">{user.username}</span>
              </span>
            </div>
            <button
              onClick={logout}
              className="group inline-flex items-center px-4 py-2 border-2 border-white text-sm font-bold rounded-xl text-white bg-transparent hover:bg-white hover:text-indigo-600 transition-all duration-300 transform hover:scale-105"
              style={{display: 'inline-flex', alignItems: 'center'}}
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" style={{width: '16px', height: '16px', marginRight: '8px'}} />
              Logout
            </button>
          </div>
        </div>
        
        {/* Bottom row - Navigation Items centered */}
        <div className="flex justify-center pb-4" style={{display: 'flex', justifyContent: 'center', paddingBottom: '1rem'}}>
          <div className="flex space-x-8" style={{display: 'flex', gap: '2rem'}}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative inline-flex items-center px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    location.pathname === item.path
                      ? 'bg-white text-indigo-700 shadow-lg'
                      : 'text-white hover:bg-white/20 hover:text-yellow-200'
                  }`}
                  style={{display: 'inline-flex', alignItems: 'center'}}
                >
                  <Icon className="h-5 w-5 mr-3" style={{width: '20px', height: '20px', marginRight: '12px'}} />
                  <span className="tracking-wide">{item.name}</span>
                  {location.pathname === item.path && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/school-transactions"
              element={
                <ProtectedRoute>
                  <SchoolTransactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transaction-status"
              element={
                <ProtectedRoute>
                  <TransactionStatus />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
