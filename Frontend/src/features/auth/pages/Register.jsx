import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../hook/useAuth';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { handleRegister } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await handleRegister(formData)
    if (success) {
      setSuccessMessage('Account created successfully!');
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Glowing Blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse [animation-delay:2s]"></div>

      {/* Glassmorphic Container */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-2xl shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-primary/5 hover:border-primary/30">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2 text-center">
            Create Account
          </h2>
          <p className="text-slate-400 text-sm text-center">
            Sign up to get started with your new account
          </p>
        </div>

        {/* Alert Messages */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary-hover text-sm text-center animate-fade-in">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                id="username"
                name="username"
                required
                placeholder="yourusername"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-slate-950/80 text-white placeholder-slate-500 border border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                </svg>
              </div>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-950/80 text-white placeholder-slate-500 border border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-950/80 text-white placeholder-slate-500 border border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-hover text-slate-950 font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-200 transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-950 flex items-center justify-center cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <p className="text-sm text-slate-400 text-center mt-8">
          Already have an account?
          <Link to="/login" className="text-primary hover:text-primary-hover font-semibold transition-colors duration-200 ml-1 underline underline-offset-4 decoration-primary/30 hover:decoration-primary-hover">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;