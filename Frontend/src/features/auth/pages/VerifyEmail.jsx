import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { useAuth } from '../hook/useAuth';
import { CheckCircle2, XCircle, Mail, Loader2, ArrowRight } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const errorMsg = searchParams.get('error');
  const pending = searchParams.get('pending') === 'true';
  const emailParam = searchParams.get('email') || '';
  const tokenParam = searchParams.get('token') || '';
  const { handleResendVerification } = useAuth();

  const [email, setEmail] = useState(emailParam);
  const [resendStatus, setResendStatus] = useState({ loading: false, success: false, message: '' });

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setResendStatus({ loading: true, success: false, message: '' });
    const res = await handleResendVerification({ email });
    if (res.success) {
      setResendStatus({ loading: false, success: true, message: 'Verification link has been sent to your email!' });
    } else {
      setResendStatus({ loading: false, success: false, message: res.message });
    }
  };

  // Determine state
  const isVerifying = success === null && tokenParam !== '';
  const isSuccess = success === 'true';
  const isFailure = success === 'false';
  const isPending = pending || (emailParam && success === null && tokenParam === '');
  const isDefault = success === null && tokenParam === '' && !emailParam && !pending;

  return (
    <div className="min-h-screen bg-bg-app text-text-app flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Glowing Blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse [animation-delay:2s]"></div>

      {/* Premium Verification Card */}
      <div className="w-full max-w-md bg-card-bg border border-card-border p-8 rounded-2xl shadow-xl animate-fade-in relative overflow-hidden">
        
        {/* Loading State (Only if a token is present and we are actually verifying) */}
        {isVerifying && (
          <div className="flex flex-col items-center justify-center text-center py-10 space-y-6">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <h2 className="text-2xl font-semibold tracking-tight">Verifying your email...</h2>
            <p className="text-muted-text text-sm">Please wait while we confirm your email verification status.</p>
          </div>
        )}

        {/* Success State */}
        {isSuccess && (
          <div className="flex flex-col items-center text-center space-y-6 animate-fade-in-up">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl scale-125"></div>
              <CheckCircle2 className="w-20 h-20 text-emerald-500 relative z-10 animate-scale-in" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight animate-fade-in">Verification Success!</h2>
              <p className="text-muted-text text-sm max-w-sm">
                Your email has been verified. Welcome aboard! You can now access all features of our platform.
              </p>
            </div>

            <Link
              to="/login"
              className="w-full bg-primary hover:bg-primary-hover text-slate-950 font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group mt-4 cursor-pointer"
            >
              Go to Login
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        )}

        {/* Pending Verification State */}
        {isPending && (
          <div className="flex flex-col items-center text-center space-y-6 animate-fade-in-up">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-125"></div>
              <Mail className="w-20 h-20 text-primary relative z-10 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight">Verify Your Email</h2>
              <p className="text-muted-text text-sm max-w-sm">
                We have sent a verification link to your email inbox. Please click the link to verify your account.
              </p>
            </div>

            <div className="w-full border-t border-card-border my-6 pt-6 text-left">
              <h3 className="text-sm font-semibold mb-2">Didn't receive the email?</h3>
              <p className="text-xs text-muted-text mb-4">
                Verify the email address below and click the button to resend the verification link.
              </p>

              {resendStatus.message && (
                <div className={`mb-4 p-3 rounded-lg text-xs font-medium border ${
                  resendStatus.success 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {resendStatus.message}
                </div>
              )}

              <form onSubmit={handleResend} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-input-bg text-text-app placeholder-muted-text border border-input-border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={resendStatus.loading || !email}
                  className="w-full bg-primary hover:bg-primary-hover text-slate-950 font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {resendStatus.loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Link...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>
              </form>
            </div>

            <Link to="/login" className="text-sm text-primary hover:underline">
              Back to Login
            </Link>
          </div>
        )}

        {/* Error / Failure State */}
        {isFailure && (
          <div className="flex flex-col items-center text-center space-y-6 animate-fade-in-up">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl scale-125"></div>
              <XCircle className="w-20 h-20 text-red-500 relative z-10 animate-scale-in" />
            </div>

            <div className="space-y-2 w-full">
              <h2 className="text-3xl font-extrabold tracking-tight text-red-500">Verification Failed</h2>
              <p className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3 inline-block mt-2">
                {errorMsg || 'The verification link is invalid or has expired.'}
              </p>
            </div>

            <div className="w-full border-t border-card-border my-6 pt-6 text-left">
              <h3 className="text-sm font-semibold mb-2">Resend Verification Email</h3>
              <p className="text-xs text-muted-text mb-4">
                Enter your email address below to receive another verification link.
              </p>

              {resendStatus.message && (
                <div className={`mb-4 p-3 rounded-lg text-xs font-medium border ${
                  resendStatus.success 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {resendStatus.message}
                </div>
              )}

              <form onSubmit={handleResend} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-input-bg text-text-app placeholder-muted-text border border-input-border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={resendStatus.loading || !email}
                  className="w-full bg-primary hover:bg-primary-hover text-slate-950 font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {resendStatus.loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Link...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>
              </form>
            </div>

            <Link to="/login" className="text-sm text-primary hover:underline">
              Back to Login
            </Link>
          </div>
        )}

        {/* Default / Direct Access State */}
        {isDefault && (
          <div className="flex flex-col items-center text-center space-y-6 animate-fade-in-up">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-125"></div>
              <Mail className="w-20 h-20 text-primary relative z-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight">Email Verification</h2>
              <p className="text-muted-text text-sm max-w-sm">
                Need to verify your account? Enter your registered email address below to receive a verification link.
              </p>
            </div>

            <div className="w-full border-t border-card-border my-6 pt-6 text-left">
              {resendStatus.message && (
                <div className={`mb-4 p-3 rounded-lg text-xs font-medium border ${
                  resendStatus.success 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {resendStatus.message}
                </div>
              )}

              <form onSubmit={handleResend} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-input-bg text-text-app placeholder-muted-text border border-input-border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={resendStatus.loading || !email}
                  className="w-full bg-primary hover:bg-primary-hover text-slate-950 font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {resendStatus.loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Link...
                    </>
                  ) : (
                    'Send Verification Email'
                  )}
                </button>
              </form>
            </div>
            <Link to="/login" className="text-sm text-primary hover:underline">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
