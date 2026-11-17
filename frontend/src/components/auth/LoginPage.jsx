import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, role } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      if (role === 'admin') navigate('/admin/dashboard', { replace: true });
      else navigate('/users/all', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);

      // Check for redirect query param
      const searchParams = new URLSearchParams(location.search);
      const redirectPath = searchParams.get('redirect');

      if (redirectPath) {
        if (redirectPath === '/form') {
          navigate(user.role === 'admin' ? '/admin/form' : '/users/form', { replace: true });
        } else {
          navigate(redirectPath, { replace: true });
        }
      } else {
        // Default role redirection
        if (user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/users/all', { replace: true });
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Cannot connect to backend server at http://localhost:6002. Please ensure the backend service is running.');
      } else {
        setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 font-sans text-gray-800">
      {/* Background subtle glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#31747d]/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10"
      >
        {/* Lumos Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/lumos_logo.png"
            alt="Lumos Logo"
            className="h-16 object-contain mb-3 cursor-pointer bg-transparent"
            onClick={() => navigate('/')}
          />
          <h2 className="text-2xl font-bold font-sans text-[#31747d] tracking-tight">
            Sign In to Lumos
          </h2>
          <p className="text-sm text-gray-500 font-sans mt-1">
            Access your event portal & data
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-sans flex items-center gap-2"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field Only */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lumos.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-[#31747d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#31747d]/20 focus:border-[#31747d] transition-all font-sans"
              />
            </div>
          </div>

          {/* Password Field Only */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-300 bg-white text-[#31747d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#31747d]/20 focus:border-[#31747d] transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-[#31747d] hover:bg-[#255b62] text-white rounded-full font-semibold font-sans flex items-center justify-center gap-2 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#31747d]/50 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Back to Home Link */}
        <div className="mt-8 text-center pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs text-gray-500 hover:text-[#31747d] font-sans font-medium transition-colors cursor-pointer"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
