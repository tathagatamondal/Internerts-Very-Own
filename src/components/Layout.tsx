import { Link, Outlet, useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { Sun, Moon, Search, Menu, X, Globe, User, LogOut, LayoutDashboard } from 'lucide-react';
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

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const sections = ['News', 'Sport', 'Business', 'Innovation', 'Culture', 'Travel', 'Earth'];

  return (
    <div className="min-h-screen bg-[var(--bg)] transition-colors duration-300">
      {/* Top Branding Bar */}
      <header className="bg-black text-white w-full sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-0.5 group">
              {['I', 'V'].map((char, i) => (
                <span key={i} className="bg-white text-black w-6 h-6 flex items-center justify-center font-black text-xs group-hover:bg-[#B80000] group-hover:text-white transition-colors">
                  {char}
                </span>
              ))}
              <span className="ml-2 font-bold tracking-tight text-sm">NEWS</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6 text-[11px] font-bold uppercase tracking-wider h-full">
              {userProfile ? (
                <div className="flex items-center space-x-6">
                  <Link to="/admin" className="flex items-center hover:text-[#B80000] transition-colors">
                    <LayoutDashboard size={14} className="mr-2" />
                    Dashboard
                  </Link>
                </div>
              ) : (
                <Link to="/login" className="flex items-center hover:text-[#B80000] transition-colors">
                  <User size={14} className="mr-2" />
                  Sign In
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-white/10 transition-colors"
            >
              <Search size={18} />
            </button>
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-white/10 transition-colors"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-white/10 transition-colors md:hidden"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {/* Search Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white dark:bg-[#121212] border-b border-[var(--border)] overflow-hidden"
            >
              <div className="max-w-3xl mx-auto px-4 py-8 relative">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Search IV News..." 
                  className="w-full bg-[var(--subtle)] text-[var(--fg)] px-6 py-4 rounded-none border-b-2 border-black dark:border-white focus:outline-none text-2xl font-serif italic"
                />
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-[var(--fg)]/40 hover:text-black dark:hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Navigation Section Links */}
        <nav className="hidden md:block bg-white dark:bg-[#0a0a0a] border-b border-[var(--border)] overflow-x-auto selection-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-10 h-11">
              {sections.map((section) => (
                <Link 
                  key={section} 
                  to={`#${section.toLowerCase()}`}
                  className="text-[13px] font-bold text-[var(--fg)] hover:text-[#B80000] transition-colors whitespace-nowrap h-full flex items-center border-b-2 border-transparent hover:border-[#B80000]"
                >
                  {section}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Breaking News Bar */}
      <div className="bg-[#B80000] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center">
          <span className="text-[10px] font-black uppercase tracking-widest bg-white text-[#B80000] px-2 py-0.5 mr-4 breaking-anim">Breaking</span>
          <div className="overflow-hidden flex-1 relative h-full flex items-center">
            <motion.p 
              animate={{ x: [800, -1000] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="text-[11px] font-bold whitespace-nowrap"
            >
              Global markets react to new climate policies. • Live coverage of the International Summit. • New archaeological discovery in the Amazon forest.
            </motion.p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Global Footer */}
      <footer className="bg-[#121212] text-gray-400 py-20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center space-x-0.5 group mb-6">
                {['I', 'V'].map((char, i) => (
                  <span key={i} className="bg-white text-black w-8 h-8 flex items-center justify-center font-black text-sm transition-colors">
                    {char}
                  </span>
                ))}
                <span className="ml-3 font-bold tracking-tight text-lg text-white">NEWS</span>
              </Link>
              <p className="text-sm max-w-sm leading-relaxed mb-6">
                Independent, verified and around the clock. Your destination for global storytelling and world-class journalism.
              </p>
              <div className="flex items-center space-x-4">
                <Globe size={18} />
                <span className="text-xs uppercase tracking-widest font-bold">World Edition</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-white text-sm font-bold uppercase tracking-widest">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Newsletters</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-white text-sm font-bold uppercase tracking-widest">About</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-bold uppercase tracking-[0.2em]">
            <span>© Internets Very Own</span>
            <div className="flex items-center space-x-8">
              <a href="#" className="hover:text-white">Editorial Guidelines</a>
              <a href="#" className="hover:text-white">Advertise</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
