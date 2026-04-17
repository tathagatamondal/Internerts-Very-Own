import { Link, Outlet, useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { Sun, Moon, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  userProfile: UserProfile | null;
}

export default function Layout({ userProfile }: LayoutProps) {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen complex-bg relative">
      <div className="noise" />
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-[var(--accent)] blur-[120px] rounded-full opacity-10"
        />
        <motion.div 
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-[var(--accent)] blur-[100px] rounded-full opacity-10"
        />
      </div>

      {/* Floating Modern Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl"
      >
        <div className="glass rounded-[2rem] px-8 py-4 flex items-center justify-between shadow-xl shadow-black/5">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--fg)] to-[var(--accent)] flex items-center justify-center p-[1px]">
              <div className="w-full h-full bg-[var(--bg)] rounded-[11px] flex items-center justify-center">
                <span className="text-[var(--fg)] font-black text-xl leading-none">V</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-display font-black uppercase tracking-tighter leading-none">Internets</span>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40">Very_Own</span>
            </div>
          </Link>

          <nav className="flex items-center space-x-6">
            <div className="hidden sm:flex items-center space-x-6 mr-6 border-r border-[var(--border)] pr-6">
              <Link to="/" className="text-[10px] font-bold uppercase tracking-widest hover:text-[var(--accent)] transition-colors">Discover</Link>
              <a href="#" className="text-[10px] font-bold uppercase tracking-widest hover:text-[var(--accent)] transition-colors">Manifesto</a>
            </div>

            <button 
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--subtle)] hover:bg-[var(--accent)] hover:text-white transition-all duration-300"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </nav>
        </div>
      </motion.header>

      <main className="pt-32 pb-24 relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Outlet />
      </main>

      <footer className="relative z-10 mt-12 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="glass rounded-[3rem] p-12 sm:p-20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[var(--accent-glow)] to-transparent opacity-20" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
            <div className="space-y-8">
              <h2 className="text-5xl sm:text-7xl font-display font-black uppercase tracking-tighter leading-[0.9] gradient-text">
                The New <br/> Standard.
              </h2>
              <p className="max-w-md text-sm text-[var(--fg)]/60 leading-relaxed text-balance">
                Creating space for the culture of the internet. A digital artifact dedicated to the visionaries, the builders, and the dreamers.
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center group hover:border-[var(--accent)] transition-colors cursor-pointer">
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Read our story</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 sm:gap-24">
              <div className="space-y-6">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">Artifacts</span>
                <ul className="space-y-3 font-display font-bold text-sm">
                  <li><a href="#" className="hover:text-[var(--accent)] transition-colors">Archive</a></li>
                  <li><a href="#" className="hover:text-[var(--accent)] transition-colors">Collections</a></li>
                  <li><a href="#" className="hover:text-[var(--accent)] transition-colors">Exhibits</a></li>
                </ul>
              </div>
              <div className="space-y-6">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">Legal_Protocol</span>
                <ul className="space-y-3 font-display font-bold text-sm">
                  <li><a href="#" className="hover:text-[var(--accent)] transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-[var(--accent)] transition-colors">Terms</a></li>
                  <li><a href="#" className="hover:text-[var(--accent)] transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-12 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest opacity-40 text-center sm:text-left">
                System Active // {new Date().toLocaleTimeString()}
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">
              &copy; {new Date().getFullYear()} IVO_CORP // All Rights Reserved
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
