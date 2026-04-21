import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { LogIn, Shield, Globe, Lock } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-[#121212] border border-[var(--border)] p-12 text-center shadow-2xl relative"
      >
        {/* Branding */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center space-x-1 group">
            {['I', 'V'].map((char, i) => (
              <span key={i} className="bg-black text-white dark:bg-white dark:text-black w-10 h-10 flex items-center justify-center font-black text-lg transition-colors group-hover:bg-[#B80000] group-hover:text-white">
                {char}
              </span>
            ))}
            <span className="ml-3 font-bold tracking-tight text-2xl">NEWS</span>
          </div>
        </div>
        
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-serif font-black italic">Sign In</h2>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Access your personal news dashboard and independent journalism archive.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest border-l-4 border-red-600">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-4 bg-black text-white dark:bg-white dark:text-black py-4 px-8 font-black uppercase tracking-widest text-[11px] transition-all hover:bg-[#B80000] dark:hover:bg-[#B80000] dark:hover:text-white disabled:opacity-50 group"
        >
          <LogIn size={18} className="transition-transform group-hover:translate-x-1" />
          <span>{loading ? 'Verifying...' : 'Sign in with Google'}</span>
        </button>

        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 space-y-6">
          <div className="flex items-center justify-center space-x-4 text-gray-400">
            <Shield size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Secure Authentication</span>
          </div>
          <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-relaxed">
            By signing in, you agree to our <br/>
            <a href="#" className="underline hover:text-black dark:hover:text-white">Terms of Service</a> & <a href="#" className="underline hover:text-black dark:hover:text-white">Privacy Policy</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
