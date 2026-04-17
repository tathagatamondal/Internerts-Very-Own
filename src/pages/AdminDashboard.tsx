import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Post } from '../types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Edit, Trash2, Eye, EyeOff, PlusCircle, Search, Activity, FileText, Globe, ArrowUpRight, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching posts:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('PERMANENTLY_DELETE_ARTIFACT? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'posts', id));
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'posts', id), {
        published: !currentStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'TOTAL_STREAMS', count: posts.length, icon: FileText, color: 'var(--accent)' },
    { label: 'ACTIVE_PUBS', count: posts.filter(p => p.published).length, icon: Globe, color: '#10b981' },
    { label: 'DRAFT_STREAMS', count: posts.filter(p => !p.published).length, icon: Activity, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-16">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pb-12 border-b border-[var(--border)]">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-[var(--accent)]">
            <Activity size={16} className="animate-pulse" />
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em]">Internal_Monitoring_Active</span>
          </div>
          <h2 className="text-6xl font-display font-black uppercase tracking-tighter leading-none">Command_Arch</h2>
        </div>
        <Link
          to="/admin/new"
          className="group relative flex items-center space-x-4 bg-[var(--fg)] text-[var(--bg)] px-10 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest overflow-hidden transition-all hover:pr-14"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <PlusCircle size={18} />
          <span>New_Archive_Entry</span>
          <ArrowUpRight size={16} className="absolute right-6 opacity-0 group-hover:opacity-100 transition-all" />
        </Link>
      </header>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass p-8 rounded-[2.5rem] border border-[var(--border)] relative group overflow-hidden"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40 font-bold">{stat.label}</p>
                <div className="text-5xl font-display font-black uppercase tracking-tighter tabular-nums flex items-baseline space-x-2">
                  <span>{stat.count < 10 ? `0${stat.count}` : stat.count}</span>
                  <span className="text-[10px] opacity-20">/ UNIT</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-[2rem] bg-[var(--fg)]/5 flex items-center justify-center transition-transform group-hover:rotate-12 group-hover:scale-110">
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
            </div>
            {/* Decorative Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle,var(--fg)_1px,transparent_1px)] bg-[size:20px_20px]" />
          </motion.div>
        ))}
      </div>

      {/* Database Interface */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="glass w-full md:max-w-md px-6 py-4 rounded-2xl flex items-center space-x-4 border border-[var(--border)] focus-within:border-[var(--accent)] transition-all">
            <Search size={18} className="opacity-30" />
            <input
              type="text"
              placeholder="QUERY_METADATA..."
              className="bg-transparent border-none focus:outline-none text-[10px] font-mono w-full uppercase tracking-widest placeholder:text-[var(--fg)]/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-3">
            <button className="glass p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center space-x-2 opacity-50 hover:opacity-100 transition-opacity">
              <Filter size={16} />
              <span>Filter_Type</span>
            </button>
          </div>
        </div>

        <div className="glass rounded-[3rem] border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--fg)]/5">
                  <th className="px-10 py-6 text-[10px] font-mono uppercase tracking-widest opacity-40 font-bold w-32">Status</th>
                  <th className="px-10 py-6 text-[10px] font-mono uppercase tracking-widest opacity-40 font-bold">Entry_Profile</th>
                  <th className="px-10 py-6 text-[10px] font-mono uppercase tracking-widest opacity-40 font-bold w-40">Frequency</th>
                  <th className="px-10 py-6 text-[10px] font-mono uppercase tracking-widest opacity-40 font-bold w-48 text-right">Interaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/30 text-balance">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-32 text-center">
                        <div className="flex flex-col items-center space-y-6">
                          <div className="w-12 h-12 border-2 border-t-[var(--accent)] border-[var(--border)] rounded-full animate-spin" />
                          <span className="text-[10px] font-mono uppercase tracking-[0.5em] opacity-30">SYNCING_CORE_DATABASE...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPosts.length > 0 ? (
                    filteredPosts.map((post, idx) => (
                      <motion.tr 
                        key={post.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group hover:bg-[var(--accent)]/5 transition-colors"
                      >
                        <td className="px-10 py-8">
                          <button
                            onClick={() => togglePublish(post.id, post.published)}
                            className={cn(
                              "flex items-center space-x-2 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all",
                              post.published 
                                ? "border-green-500/30 bg-green-500/5 text-green-500 hover:bg-green-500 hover:text-white" 
                                : "border-amber-500/30 bg-amber-500/5 text-amber-500 hover:bg-amber-500 hover:text-white"
                            )}
                          >
                            <span className={cn("w-1.5 h-1.5 rounded-full", post.published ? "bg-green-500 group-hover:bg-white" : "bg-amber-500 group-hover:bg-white")} />
                            <span>{post.published ? 'LIVE' : 'DRAFT'}</span>
                          </button>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--subtle)]">
                              <img src={post.imageUrl || `https://picsum.photos/seed/${post.id}/100/100`} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" referrerPolicy="no-referrer" />
                            </div>
                            <div className="space-y-1.5">
                              <p className="text-[13px] font-bold uppercase tracking-tight group-hover:text-[var(--accent)] transition-colors">{post.title}</p>
                              <div className="flex items-center space-x-3 text-[9px] font-mono opacity-40 uppercase tracking-widest">
                                <span>{post.author || 'SYSTEM'}</span>
                                <span className="opacity-20">//</span>
                                <span>{post.content.length.toLocaleString()} CHARS</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-mono font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-[var(--border)] rounded">{post.category}</span>
                            <p className="text-[10px] font-mono opacity-40">{format(new Date(post.createdAt), 'yy/MM/dd HH:mm')}</p>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center justify-end space-x-4">
                            <Link to={`/admin/edit/${post.id}`} className="w-12 h-12 rounded-2xl glass flex items-center justify-center hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-all" title="Modify Entry">
                              <Edit size={16} />
                            </Link>
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                              title="Expunge Entry"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-32 text-center">
                        <p className="text-[10px] font-mono uppercase tracking-[0.5em] opacity-30">NO_DATA_STREAM_MATCHES_QUERY</p>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
