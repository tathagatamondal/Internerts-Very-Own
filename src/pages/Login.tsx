import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { LogIn, ShieldCheck, Cpu, Terminal } from 'lucide-react';
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
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] bg-[var(--accent)] blur-[150px] opacity-10 rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[30%] h-[30%] bg-blue-500 blur-[150px] opacity-10 rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass rounded-[3rem] p-12 sm:p-20 text-center relative z-10 border border-[var(--border)] overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8">
          <Terminal size={12} className="opacity-20" />
        </div>
        
        <div className="flex justify-center mb-10">
          <div className="relative">
            <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-[var(--fg)] to-[var(--accent)] p-0.5 animate-float">
              <div className="w-full h-full bg-[var(--bg)] rounded-[1.8rem] flex items-center justify-center">
                <ShieldCheck size={32} className="text-[var(--accent)]" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-[var(--bg)]" />
          </div>
        </div>
        
        <h2 className="text-4xl font-display font-black uppercase tracking-tighter mb-4 leading-none">Identity_Check</h2>
        <div className="flex items-center justify-center space-x-2 text-[10px] font-mono uppercase tracking-[0.4em] opacity-40 mb-14 font-black">
          <Cpu size={12} />
          <span>Authorization_Mandatory</span>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-10 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-mono uppercase tracking-widest font-bold leading-relaxed"
          >
            {error}
          </motion.div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="group relative w-full flex items-center justify-center space-x-4 bg-[var(--fg)] text-[var(--bg)] py-6 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <LogIn size={18} className="transition-transform group-hover:scale-110" />
          <span>{loading ? 'Processing...' : 'Authenticate_Google'}</span>
        </button>

        <div className="mt-16 space-y-4">
          <div className="w-12 h-0.5 bg-[var(--border)] mx-auto" />
          <p className="text-[9px] font-mono uppercase opacity-30 leading-relaxed tracking-[0.2em] font-bold">
            SECURE_HANDSHAKE_V2.94 <br/>
            ENCRYPTED_SESSION_REQUIRED
          </p>
        </div>
        
        {/* Subtle noise overlay */}
        <div className="noise" />
      </motion.div>
    </div>
  );
}
