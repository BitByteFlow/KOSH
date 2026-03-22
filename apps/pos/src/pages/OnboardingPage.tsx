import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth, type AuthStore } from '../context/AuthContext';
import { Button } from "@kosh/ui/components/button";
import { Input } from "@kosh/ui/components/input";
import { CheckCircle, AlertCircle, Loader2, Store, ArrowRight, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const validateStoreId = async (storeId: string, token: string): Promise<{ valid: boolean; store?: AuthStore; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE}/storeMember/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        storeId,
      }),
    });

    const json = await response.json();
    if (json?.success && json?.store) {
      return { valid: true, store: json.store as AuthStore };
    }

    return { valid: false, error: 'Store not found. Please check the ID and try again.' };
  } catch {
    return { valid: false, error: 'Network error. Please check your connection.' };
  }
};

type Step = 'input' | 'validating' | 'success' | 'error';

const OnboardingPage: React.FC = () => {
  const { user, token, enrollInStore, logout } = useAuth();
  const navigate = useNavigate();
  const [storeId, setStoreId] = useState('');
  const [step, setStep] = useState<Step>('input');
  const [errorMsg, setErrorMsg] = useState('');
  const [validatedStore, setValidatedStore] = useState<AuthStore | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = storeId.trim();

    if (!trimmedId) {
      toast.error('Please enter a Store ID');
      return;
    }

    if (!token) {
      toast.error('Session expired. Please log in again.');
      logout();
      return;
    }

    setStep('validating');
    setErrorMsg('');

    const result = await validateStoreId(trimmedId, token);

    if (!result.valid) {
      setStep('error');
      setErrorMsg(result.error ?? 'Invalid Store ID.');
      return;
    }

    setValidatedStore(result.store!);
    setStep('success');
  };

  const handleConfirmEnrollment = () => {
    if (!validatedStore) return;
    enrollInStore(validatedStore.storeId, validatedStore.storeName);
    navigate('/', { replace: true });
  };

  const handleRetry = () => {
    setStep('input');
    setErrorMsg('');
    setStoreId('');
    setValidatedStore(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-blue-100/80 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-blue-500 to-violet-500" />

          <div className="p-10">
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-white font-black text-sm leading-none">K</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">KOSH POS</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Connect to Store</h1>
                <p className="text-slate-500 text-sm font-medium mt-1">
                  Welcome, <span className="font-bold text-slate-700">{user?.username}</span>! Enter your Store ID to get started.
                </p>
              </div>
              <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50" title="Sign out">
                <LogOut size={18} />
              </button>
            </div>

            {step === 'input' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Store ID</label>
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                      value={storeId}
                      onChange={(e) => setStoreId(e.target.value)}
                      placeholder="e.g. f47ac10b-58cc-4372..."
                      className="pl-11 h-12 rounded-xl border-slate-200 font-mono text-sm"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Ask your store administrator for the Store ID. It is a unique identifier found in the store settings.
                  </p>
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl font-bold gap-2" size="lg">
                  Verify Store <ArrowRight size={16} />
                </Button>
              </form>
            )}

            {step === 'validating' && (
              <div className="flex flex-col items-center py-8 gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <div className="text-center">
                  <p className="font-bold text-slate-700">Verifying Store ID...</p>
                  <p className="text-xs text-slate-400 mt-1">Connecting to the server</p>
                </div>
              </div>
            )}

            {step === 'error' && (
              <div className="space-y-4">
                <div className="flex flex-col items-center py-6 gap-3">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertCircle className="text-red-500" size={32} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-700">Connection Failed</p>
                    <p className="text-sm text-red-500 mt-1">{errorMsg}</p>
                  </div>
                </div>
                <Button onClick={handleRetry} variant="outline" className="w-full h-12 rounded-xl font-bold border-slate-200">
                  Try Again
                </Button>
              </div>
            )}

            {step === 'success' && validatedStore && (
              <div className="space-y-6">
                <div className="flex flex-col items-center py-4 gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                    className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center"
                  >
                    <CheckCircle className="text-green-500" size={40} />
                  </motion.div>
                  <div className="text-center">
                    <p className="font-bold text-green-700 text-lg">Store Found!</p>
                    <p className="text-slate-500 text-sm mt-1">You are about to connect to:</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Store size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{validatedStore.storeName}</p>
                      <p className="text-xs text-slate-400 font-mono">ID: {validatedStore.storeId}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button onClick={handleConfirmEnrollment} className="w-full h-12 rounded-xl font-bold gap-2" size="lg">
                    Connect & Start Working <ArrowRight size={16} />
                  </Button>
                  {!validateStoreId || errorMsg && (
                    <Button onClick={handleRetry} variant="ghost" className="w-full h-10 rounded-xl text-slate-500 font-bold text-sm">
                      Use a different Store ID
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4 font-medium">
          KOSH Point of Sale · Cashier Edition
        </p>
      </motion.div>
    </div>
  );
};

export default OnboardingPage;
