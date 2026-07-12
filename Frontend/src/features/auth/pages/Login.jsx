import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router';
import { useAuth } from '../hook/useAuth';
import { useSelector, useDispatch } from 'react-redux';
import { Mail, Lock, Eye, EyeOff, Loader2, Compass, AlertCircle, Sun, Moon } from 'lucide-react';
import { setError } from '../auth.slice';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  const user = useSelector(state => state.auth.user);
  const loading = useSelector(state => state.auth.loading);
  const authError = useSelector(state => state.auth.error);

  const { handleLogin } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Clear any previous errors on mount
    dispatch(setError(null));
  }, [dispatch]);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setError(null));
    const success = await handleLogin(formData);
    if (success) {
      navigate("/");
    }
  };

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-bg-app text-text-app flex flex-col md:flex-row relative font-sans transition-colors duration-200">
      
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        type="button"
        className="absolute top-4 right-4 p-2.5 rounded-xl bg-sidebar-bg border border-sidebar-border hover:bg-sidebar-hover text-muted-text transition-all duration-200 z-50 cursor-pointer"
        aria-label="Toggle theme"
      >
        {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
      </button>

      {/* Left Presentation Pane (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-sidebar-bg border-r border-sidebar-border p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] -z-10"></div>
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse"></div>

        {/* Top Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Compass className="w-5 h-5 text-slate-950" />
          </div>
          <span className="text-xl font-bold tracking-tight">Perplexity</span>
        </div>

        {/* Feature Presentation */}
        <div className="space-y-6 max-w-md">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Where knowledge begins.
          </h1>
          <p className="text-muted-text text-base leading-relaxed">
            Get instant, accurate answers to your questions, explore topics in depth, and write code cleanly. Experience the premium companion built for developers.
          </p>
          
          <div className="space-y-4 pt-4">
            {[
              { title: "Sourced Answers", desc: "Every response is paired with reliable search references." },
              { title: "Interactive Coding", desc: "Write, copy, and understand code in a visual sandbox." },
              { title: "Custom Theme System", desc: "Comfort reading designed for both day and night." }
            ].map((feat, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary text-xs font-semibold mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-sm font-semibold">{feat.title}</h4>
                  <p className="text-xs text-muted-text">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer Details */}
        <div className="text-xs text-muted-text">
          &copy; 2026 Perplexity AI. Beautifully crafted frontend environment.
        </div>
      </div>

      {/* Right Form Pane */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          
          {/* Header */}
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight">Welcome Back</h2>
            <p className="text-muted-text text-sm">
              Please enter your credentials to log in to your account
            </p>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-3 items-start animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-muted-text uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text group-focus-within:text-primary transition-colors duration-200" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-input-bg text-text-app placeholder-muted-text border border-input-border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-semibold text-muted-text uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text group-focus-within:text-primary transition-colors duration-200" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-input-bg text-text-app placeholder-muted-text border border-input-border rounded-xl pl-11 pr-12 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-text-app p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-slate-950 font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer toggle link */}
          <div className="text-center text-sm text-muted-text">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;