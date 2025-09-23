import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../config/axios';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/auth/login', formData);
      const { access_token, user } = response.data;
      
      login(access_token, user);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response?.status === 401) {
        setError('Invalid username or password. Please try again.');
      } else if (err.response?.status === 404) {
        setError('User not found. Please check your username or register for a new account.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">EDVIRON</h1>
          <p className="text-xl text-blue-100 mb-1">Payment System</p>
          <p className="text-sm text-blue-200">Welcome back! Please sign in to continue</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg px-8 py-10 rounded-3xl border border-white/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 p-3 rounded text-red-100 text-sm">{error}</div>
            )}

            <div style={{display: 'flex', justifyContent: 'center', transform: 'translateX(-30px)'}}>
              <div>
                <div style={{display: 'grid', gridTemplateColumns: '180px 24px 280px', alignItems: 'center', marginBottom: '32px'}}>
                  <label className="text-white/90 text-sm font-semibold" style={{textAlign: 'right'}} htmlFor="username">Username</label>
                  <div></div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="px-4 py-3 bg-white/5 border border-white/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                    placeholder="Enter your username"
                  />
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '180px 24px 280px', alignItems: 'center', marginBottom: '32px'}}>
                  <label className="text-white/90 text-sm font-semibold" style={{textAlign: 'right'}} htmlFor="password">Password</label>
                  <div></div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="px-4 py-3 bg-white/5 border border-white/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                    placeholder="Enter your password"
                  />
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '180px 24px 280px', alignItems: 'center', marginBottom: '40px'}}>
                  <div></div>
                  <div></div>
                  <button
                    type="button"
                    className="text-xs text-blue-300 hover:text-blue-200 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '🙈 Hide password' : '👁️ Show password'}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Register Link */}
            <div className="text-center pt-4 border-t border-white/20">
              <p className="text-sm text-white/70">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-semibold text-blue-300 hover:text-blue-200 transition-colors duration-200 underline underline-offset-2"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Tiny feature badges – no big SVGs */}
        <div className="mt-6 flex justify-center gap-4 text-xs text-white/60">
          <span className="px-2 py-1 bg-white/10 rounded">🔒 Secure</span>
          <span className="px-2 py-1 bg-white/10 rounded">⚡ Fast</span>
          <span className="px-2 py-1 bg-white/10 rounded">✅ Reliable</span>
        </div>
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-white/40">
            2024 EDVIRON School Payment System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
