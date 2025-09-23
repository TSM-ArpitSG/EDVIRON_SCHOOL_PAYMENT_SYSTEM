import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../config/axios';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      setSuccess('Account created! Redirecting to dashboard...');
      const { access_token, user } = res.data;
      setTimeout(() => {
        login(access_token, user);
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  console.log('formData:', formData);
  console.log('error:', error);
  console.log('success:', success);
  console.log('loading:', loading);
  console.log('showPass:', showPass);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* animated blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 left-1/4 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply blur-3xl opacity-20 animate-pulse animation-delay-2000" />
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        {/* header text */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-blue-100">Join EDVIRON Payment System</p>
        </div>

        {/* card */}
        <div className="bg-white/10 backdrop-blur-lg px-8 py-10 rounded-3xl border border-white/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="bg-red-500/20 p-3 rounded text-red-100 text-sm">{error}</div>}
            {success && <div className="bg-green-500/20 p-3 rounded text-green-100 text-sm">{success}</div>}

            <div style={{display: 'flex', justifyContent: 'center', transform: 'translateX(-30px)'}}>
              <div>
                <div style={{display: 'grid', gridTemplateColumns: '180px 24px 280px', alignItems: 'center', marginBottom: '32px'}}>
                  <label className="text-white/90 text-sm font-semibold" style={{textAlign: 'right'}} htmlFor="username">Username</label>
                  <div></div>
                  <input id="username" name="username" required value={formData.username} onChange={onChange}
                    className="px-4 py-3 bg-white/5 border border-white/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200" placeholder="Enter username" />
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '180px 24px 280px', alignItems: 'center', marginBottom: '32px'}}>
                  <label className="text-white/90 text-sm font-semibold" style={{textAlign: 'right'}} htmlFor="email">Email</label>
                  <div></div>
                  <input id="email" name="email" type="email" required value={formData.email} onChange={onChange}
                    className="px-4 py-3 bg-white/5 border border-white/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200" placeholder="Enter email address" />
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '180px 24px 280px', alignItems: 'center', marginBottom: '32px'}}>
                  <label className="text-white/90 text-sm font-semibold" style={{textAlign: 'right'}} htmlFor="password">Password</label>
                  <div></div>
                  <input id="password" name="password" type={showPass? 'text':'password'} required value={formData.password} onChange={onChange}
                    className="px-4 py-3 bg-white/5 border border-white/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200" placeholder="Create password" />
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '180px 24px 280px', alignItems: 'center', marginBottom: '32px'}}>
                  <label className="text-white/90 text-sm font-semibold" style={{textAlign: 'right'}} htmlFor="confirmPassword">Confirm Password</label>
                  <div></div>
                  <input id="confirmPassword" name="confirmPassword" type={showPass? 'text':'password'} required value={formData.confirmPassword} onChange={onChange}
                    className="px-4 py-3 bg-white/5 border border-white/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200" placeholder="Confirm password" />
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '180px 24px 280px', alignItems: 'center', marginBottom: '40px'}}>
                  <div></div>
                  <div></div>
                  <button type="button" className="text-xs text-blue-300 hover:text-blue-200 transition-colors duration-200" onClick={()=>setShowPass(!showPass)}>
                    {showPass? '🙈 Hide passwords':'👁️ Show passwords'}
                  </button>
                </div>
              </div>
            </div>
            <button disabled={loading} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50">
              {loading? 'Creating...':'Create Account'}
            </button>
            <p className="text-center text-sm text-white/70">Already have an account? <Link to="/login" className="text-blue-300 underline">Sign in</Link></p>
          </form>
        </div>

        {/* small badges */}
        <div className="mt-8 flex justify-center gap-6 text-xs text-white/60">
          <span className="px-2 py-1 bg-white/10 rounded">🔒 Secure</span>
          <span className="px-2 py-1 bg-white/10 rounded">⚡ Fast</span>
          <span className="px-2 py-1 bg-white/10 rounded">✅ Reliable</span>
        </div>

        <p className="text-center text-xs text-white/40 mt-8"> 2024 EDVIRON School Payment System</p>
      </div>
    </div>
  );
}
