import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react';
import { loginAdmin } from '../services/api';
import Toast from '../components/Toast';

const LoginPage = ({ onNavigate, onLoginSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await loginAdmin(data);
      if (response.success && response.token) {
        setToast({ message: 'Authentication successful! Redirecting...', type: 'success' });
        setTimeout(() => {
          onLoginSuccess(response.token, response.user);
        }, 1000);
      } else {
        setToast({ message: response.message || 'Login failed. Please check credentials.', type: 'error' });
      }
    } catch (error) {
      console.error('Login error:', error);
      const serverMessage = error.response?.data?.message || 'Invalid email or password. Please try again.';
      setToast({ message: serverMessage, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-[calc(100vh-140px)] flex items-center justify-center p-6 bg-gradient-mesh"
    >
      <div className="w-full max-w-md">
        {/* Animated Card Container */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="glass-card p-8 rounded-3xl border border-indigo-500/25 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative glows */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>

          {/* Heading */}
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Admin Portal</h1>
            <p className="text-xs text-slate-400 mt-1.5 font-light">
              Sign in to manage your inbound customer proposals.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative z-10">
            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950/60 border ${
                    errors.email ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-indigo-950 focus:border-indigo-500 focus:ring-indigo-500/20'
                  } text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 transition-all text-sm`}
                  placeholder="admin@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: 'Please enter a valid email address'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <span className="text-xs text-rose-400 mt-1 block">{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950/60 border ${
                    errors.password ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-indigo-950 focus:border-indigo-500 focus:ring-indigo-500/20'
                  } text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 transition-all text-sm`}
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                />
              </div>
              {errors.password && (
                <span className="text-xs text-rose-400 mt-1 block">{errors.password.message}</span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 mt-6 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-75 disabled:cursor-not-allowed btn-ripple cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Toast Alert System */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LoginPage;
