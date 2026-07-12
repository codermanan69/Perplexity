import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../hook/useAuth';
import { useSelector, useDispatch } from 'react-redux';
import { Mail, Lock, User, Eye, EyeOff, Loader2, Compass, AlertCircle, Sun, Moon } from 'lucide-react';
import { setError } from '../auth.slice';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: 'bg-transparent' });
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { handleRegister } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authError = useSelector(state => state.auth.error);

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

  const checkPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-transparent' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score === 2 || score === 3) return { score, label: 'Medium', color: 'bg-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitLoading(true);
    dispatch(setError(null));

    const success = await handleRegister(formData);
    if (success) {
      setSuccessMessage('Account created successfully! Verification email sent.');
      setTimeout(() => {
        // Redirect user to the verification page pending screen
        navigate(`/verify-email?pending=true&email=${encodeURIComponent(formData.email)}`);
      }, 2000);
    } else {
      setIsSubmitLoading(false);
    }
  };

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

      {/* Left Presentation Pane */}
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
            Create your account.
          </h1>
          <p className="text-muted-text text-base leading-relaxed">
            Join users worldwide who discover, create, and refine ideas using a clean and structured interface. Elevate your everyday workflows.
          </p>

          <div className="space-y-4 pt-4">
            {[
              { title: "Personalized History", desc: "Save and search your chat histories effortlessly." },
              { title: "Real-Time Collaboration", desc: "Interact dynamically with state-of-the-art models." },
              { title: "Security First", desc: "Secure token verification and encrypted credential checking." }
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
            <h2 className="text-3xl font-extrabold tracking-tight">Get Started</h2>
            <p className="text-muted-text text-sm">
              Create an account to start compiling answers and sharing threads
            </p>
          </div>

          {/* Success / Error Alerts */}
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-fade-in">
              {successMessage}
            </div>
          )}

          {authError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-3 items-start animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username field */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-xs font-semibold text-muted-text uppercase tracking-wider">
                Username
              </label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text group-focus-within:text-primary transition-colors duration-200" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  placeholder="yourusername"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-input-bg text-text-app placeholder-muted-text border border-input-border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                />
              </div>
            </div>

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
              <label htmlFor="password" className="text-xs font-semibold text-muted-text uppercase tracking-wider">
                Password
              </label>
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-1 pt-1.5 animate-fade-in">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-text">Strength:</span>
                    <span className={`font-semibold ${
                      passwordStrength.label === 'Weak' ? 'text-red-500' :
                      passwordStrength.label === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-sidebar-border rounded-full overflow-hidden flex gap-0.5">
                    <div className={`h-full rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'
                    }`} style={{ width: passwordStrength.score >= 1 ? '33.33%' : '0%' }}></div>
                    <div className={`h-full rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'
                    }`} style={{ width: passwordStrength.score >= 2 ? '33.33%' : '0%' }}></div>
                    <div className={`h-full rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 4 ? passwordStrength.color : 'bg-transparent'
                    }`} style={{ width: passwordStrength.score >= 4 ? '33.33%' : '0%' }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitLoading}
              className="w-full bg-primary hover:bg-primary-hover text-slate-950 font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              {isSubmitLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer toggle link */}
          <div className="text-center text-sm text-muted-text">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;