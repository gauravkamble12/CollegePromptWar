import React, { useState } from 'react';
import { X, LogIn, UserPlus, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModalA11y } from '../hooks/useModalA11y';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const dialogRef = useModalA11y<HTMLDivElement>(onClose);
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(email, username, password, fullName);
      } else {
        await login(emailOrUsername, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (usr: string, pass: string) => {
    setError(null);
    setSubmitting(true);
    try {
      await login(usr, pass);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div ref={dialogRef} tabIndex={-1} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 focus:outline-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              {isRegister ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            </div>
            <div>
              <h3 id="auth-modal-title" className="text-base font-bold text-slate-900">
                {isRegister ? 'Join City Life Explorer' : 'Sign In to City Life'}
              </h3>
              <p className="text-xs text-slate-500">Access verified itineraries and community reporting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close authentication dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister ? (
            <>
              <div>
                <label htmlFor="auth-fullname" className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  id="auth-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Gaurav Sharma"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-indigo-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label htmlFor="auth-email" className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="explorer@citylife.org"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-indigo-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label htmlFor="auth-username" className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                <input
                  id="auth-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="pune_explorer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-indigo-600 focus:outline-hidden"
                />
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="auth-emailoruser" className="block text-xs font-bold text-slate-700 mb-1">Email or Username</label>
              <input
                id="auth-emailoruser"
                type="text"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="explorer or user@citylife.org"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-indigo-600 focus:outline-hidden"
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-password" className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <input
              id="auth-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors disabled:opacity-50"
          >
            {submitting ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            {isRegister ? 'Already registered? Sign In' : 'Need an account? Register'}
          </button>
        </div>

        {/* Quick Demo Logins for Pair Programming & Evaluation */}
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
          <div className="font-bold text-slate-700 text-[10px] uppercase tracking-wider flex items-center gap-1">
            <KeyRound className="w-3 h-3 text-indigo-600" /> Quick Demo Role Switcher:
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('moderator', 'mod123')}
              className="py-1 px-1.5 rounded-lg bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 text-[11px] font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              Moderator
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin123')}
              className="py-1 px-1.5 rounded-lg bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 text-[11px] font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('explorer', 'user123')}
              className="py-1 px-1.5 rounded-lg bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 text-[11px] font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              Explorer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
