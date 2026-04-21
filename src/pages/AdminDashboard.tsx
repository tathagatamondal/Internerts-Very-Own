import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Post } from '../types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Edit, Trash2, Eye, EyeOff, PlusCircle, Search, Activity, FileText, Globe, ArrowUpRight, Filter, LayoutDashboard, CheckCircle, Clock } from 'lucide-react';
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
    if (window.confirm('Delete this article? This action cannot be undone.')) {
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
    { label: 'Total Articles', count: posts.length, icon: FileText, color: '#000000' },
    { label: 'Live Now', count: posts.filter(p => p.published).length, icon: Globe, color: '#B80000' },
    { label: 'Pending Drafts', count: posts.filter(p => !p.published).length, icon: Clock, color: '#666666' },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pb-10 border-b border-gray-200">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-[#B80000]">
            <span className="w-2 h-2 bg-[#B80000] rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Editorial Core</span>
          </div>
          <h2 className="text-5xl font-serif font-black italic tracking-tight">Editorial Arch</h2>
        </div>
        <Link
          to="/admin/new"
          className="flex items-center space-x-3 bg-black text-white px-8 py-4 font-black uppercase tracking-widest text-[11px] hover:bg-[#B80000] transition-all"
        >
          <PlusCircle size={16} />
          <span>Write New Article</span>
        </Link>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-8 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121212] group"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
                <div className="text-4xl font-serif font-black italic">
                  {stat.count}
                </div>
              </div>
              <stat.icon size={24} style={{ color: stat.color }} className="opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Article List Interface */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:max-w-md px-4 py-3 border border-gray-200 dark:border-gray-800 flex items-center space-x-3 focus-within:border-black dark:focus-within:border-white transition-all">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Filter by title or category..."
              className="bg-transparent border-none focus:outline-none text-sm w-full font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 w-32">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Article</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 w-40">Section</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 w-40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-8 h-8 border-4 border-[#B80000] border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Archive...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-[#121212] transition-colors group">
                      <td className="px-8 py-6">
                        <button
                          onClick={() => togglePublish(post.id, post.published)}
                          className={cn(
                            "flex items-center space-x-2 px-3 py-1 text-[9px] font-bold uppercase tracking-widest transition-all",
                            post.published 
                              ? "bg-green-50 text-green-700 dark:bg-green-900/10 dark:text-green-400 border border-green-200" 
                              : "bg-gray-100 text-gray-500 dark:bg-gray-900/10 dark:text-gray-400 border border-gray-200"
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", post.published ? "bg-green-600" : "bg-gray-400")} />
                          <span>{post.published ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={post.imageUrl || `https://picsum.photos/seed/${post.id}/100/100`} 
                            className="w-12 h-12 object-cover grayscale transition-all group-hover:grayscale-0" 
                            referrerPolicy="no-referrer" 
                          />
                          <div>
                            <p className="text-sm font-bold group-hover:text-[#B80000] transition-colors">{post.title}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                              {post.author || 'Editorial Staff'} • {format(new Date(post.createdAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{post.category}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link 
                            to={`/admin/edit/${post.id}`} 
                            className="p-2 border border-gray-200 dark:border-gray-800 hover:bg-black hover:text-white transition-all"
                          >
                            <Edit size={14} />
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-2 border border-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No matching articles found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
