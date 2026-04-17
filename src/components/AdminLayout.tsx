import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { UserProfile } from '../types';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { LayoutDashboard, FileText, PlusCircle, LogOut, Globe, Sun, Moon, Settings, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface AdminLayoutProps {
  userProfile: UserProfile | null;
}

export default function AdminLayout({ userProfile }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
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

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Archive', path: '/admin', icon: FileText },
    { label: 'Ingest_Data', path: '/admin/new', icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] font-sans complex-bg relative flex flex-col lg:flex-row overflow-hidden">
      <div className="noise" />
      
      {/* Background Glow */}
      <div className="fixed -top-[20%] -right-[10%] w-[50%] h-[50%] bg-[var(--accent)] blur-[120px] rounded-full opacity-5 pointer-events-none" />

      {/* Admin Sidebar */}
      <aside className="w-full lg:w-80 relative z-20 glass lg:h-screen lg:fixed lg:left-0 lg:top-0 border-r border-[var(--border)] flex flex-col transition-all duration-500">
        <div className="p-10 border-b border-[var(--border)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" />
          <div className="relative z-10 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--fg)] to-[var(--accent)] p-0.5">
              <div className="w-full h-full bg-[var(--bg)] rounded-[14px] flex items-center justify-center">
                <Shield size={24} className="text-[var(--accent)]" />
              </div>
            </div>
            <div>
              <h1 className="font-display font-black text-xl uppercase tracking-tighter leading-none">IVO_SYSTEM</h1>
              <p className="font-mono text-[9px] uppercase opacity-40 tracking-[0.3em] mt-1.5 font-bold">CORE_ADMIN_V1</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <span className="px-4 text-[9px] font-mono uppercase tracking-[0.4em] opacity-30 block mb-6 px-4">Navigation_Layer</span>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={cn(
                  "flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                  isActive 
                    ? "bg-[var(--fg)] text-[var(--bg)] shadow-2xl shadow-black/20" 
                    : "hover:bg-[var(--accent)]/5 text-[var(--fg)]/60 hover:text-[var(--fg)]"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-gradient-to-r from-[var(--accent)] to-[var(--fg)] -z-10"
                  />
                )}
                <item.icon size={18} className={cn("transition-transform group-hover:scale-110", isActive && "text-[var(--bg)]")} />
                <span className={cn("text-[10px] font-bold uppercase tracking-[0.2em]", isActive && "text-[var(--bg)]")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-8 border-t border-[var(--border)] space-y-8 bg-[var(--subtle)]/30">
          <div className="flex items-center space-x-4 p-4 glass rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-black">
              {userProfile?.displayName?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold uppercase tracking-widest truncate">{userProfile?.displayName}</p>
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[9px] font-mono opacity-40 uppercase font-bold tracking-widest">{userProfile?.role}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <button 
              onClick={toggleTheme}
              className="flex items-center justify-center p-4 glass rounded-2xl hover:bg-[var(--accent)] hover:text-white transition-all duration-300 group"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={18} className="group-hover:rotate-45 transition-transform" /> : <Moon size={18} className="group-hover:-rotate-12 transition-transform" />}
            </button>
            <Link 
              to="/" 
              className="flex items-center justify-center p-4 glass rounded-2xl hover:bg-[var(--accent)] hover:text-white transition-all duration-300 group"
              title="Return to Site"
            >
              <Globe size={18} className="group-hover:rotate-12 transition-transform" />
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 p-5 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-500"
          >
            <LogOut size={16} />
            <span>Terminate_Session</span>
          </button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 relative z-10 lg:ml-80 h-screen overflow-y-auto scrollbar-hide">
        <div className="p-6 sm:p-12 lg:p-20 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
