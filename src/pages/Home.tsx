import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Post } from '../types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowUpRight, TrendingUp, Clock, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );

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

  const categories = ['All', ...new Set(posts.map(p => p.category))];
  const filteredPosts = activeCategory === 'All' 
    ? posts 
    : posts.filter(p => p.category === activeCategory);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-2 border-[var(--accent)]/20 rounded-full animate-ping" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-t-2 border-[var(--accent)] rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  const featuredPost = filteredPosts[0];
  const secondaryPosts = filteredPosts.slice(1, 3);
  const remainingPosts = filteredPosts.slice(3);

  return (
    <div className="space-y-24">
      {/* Hero Header */}
      <section className="relative py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="px-3 py-1 glass rounded-full flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Live Archive</span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40">Frequency_04.16</span>
          </div>
          <h1 className="text-6xl sm:text-8xl font-display font-black uppercase tracking-tighter leading-[0.85] gradient-text mb-8">
            Digital Artifacts <br/> For The Modern <br/> Visionary.
          </h1>
          <p className="text-lg text-[var(--fg)]/60 max-w-xl leading-relaxed text-balance">
            Curating the finest streams of culture, technology, and aesthetic evolution. Welcome to the silent revolution of the web.
          </p>
        </motion.div>
      </section>

      {/* Category Filter */}
      <section className="flex items-center space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
              activeCategory === cat 
                ? "bg-[var(--fg)] text-[var(--bg)] shadow-lg shadow-black/10" 
                : "glass hover:bg-[var(--accent)]/10"
            )}
          >
            {cat}
          </button>
        ))}
      </section>

      {/* Complex Bento Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Featured Post - Large Bento */}
        {featuredPost && (
          <motion.div 
            whileHover={{ y: -5 }}
            className="lg:col-span-8 group"
          >
            <Link to={`/post/${featuredPost.id}`} className="block h-full border border-[var(--border)] rounded-[2.5rem] overflow-hidden bg-[var(--card-bg)] relative shadow-sm hover:shadow-2xl transition-all duration-500">
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={featuredPost.imageUrl || `https://picsum.photos/seed/${featuredPost.id}/1200/800`}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold text-[var(--accent)]">{featuredPost.category}</span>
                    <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">{format(new Date(featuredPost.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                    <ArrowUpRight size={20} />
                  </div>
                </div>
                <h2 className="text-4xl sm:text-6xl font-display font-black uppercase tracking-tighter leading-none group-hover:text-[var(--accent)] transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-base text-[var(--fg)]/60 max-w-2xl leading-relaxed line-clamp-2">
                  {featuredPost.subtitle || featuredPost.content.substring(0, 160) + '...'}
                </p>
                <div className="flex items-center space-x-8 pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center space-x-2 text-[10px] font-mono opacity-40">
                    <Clock size={12} />
                    <span>5 MIN READ</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] font-mono opacity-40">
                    <TrendingUp size={12} />
                    <span>TRENDING</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Secondary Posts Column */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-8">
          {secondaryPosts.map((post) => (
            <motion.div 
              key={post.id}
              whileHover={{ x: 5 }}
              className="group"
            >
              <Link to={`/post/${post.id}`} className="block h-full bento-card border border-[var(--border)] rounded-[2.5rem] bg-[var(--card-bg)] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                <div className="aspect-[16/9] mb-6 rounded-2xl overflow-hidden">
                  <img
                    src={post.imageUrl || `https://picsum.photos/seed/${post.id}/600/400`}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-4">
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold text-[var(--accent)]">{post.category}</span>
                  <h3 className="text-2xl font-display font-bold uppercase tracking-tight leading-none group-hover:text-[var(--accent)] transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">Read Entry</span>
                    <ArrowUpRight size={14} className="text-[var(--accent)]" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          
          {/* Quick Links / Newsletter Bento */}
          <div className="rounded-[2.5rem] p-8 border border-[var(--border)] bg-gradient-to-br from-[var(--fg)] to-[var(--accent)] text-[var(--bg)] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 animate-pulse" />
            <Zap size={24} className="mb-6 animate-bounce" />
            <h4 className="text-2xl font-display font-black uppercase tracking-tighter mb-4">Join The Pulse.</h4>
            <p className="text-xs opacity-70 mb-8 leading-relaxed">Weekly artifact deliveries straight to your digital workspace.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="INPUT_EMAIL..." 
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-[10px] font-mono uppercase placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white text-[var(--fg)] flex items-center justify-center hover:scale-110 transition-transform">
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Remaining Archive Grid */}
      <section className="space-y-12">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-8">
          <h2 className="text-3xl font-display font-black uppercase tracking-tighter">Extended_Archive</h2>
          <div className="flex items-center space-x-2 text-[10px] font-mono opacity-40">
            <span>VOLUME_01</span>
            <span className="opacity-20">//</span>
            <span>EDITION_2026</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {remainingPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link to={`/post/${post.id}`} className="group space-y-4">
                  <div className="aspect-[4/5] rounded-[2rem] border border-[var(--border)] overflow-hidden bg-[var(--subtle)] transition-all duration-500 group-hover:rounded-[1rem] group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                    <img
                      src={post.imageUrl || `https://picsum.photos/seed/${post.id}/600/800`}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--accent)]">{post.category}</span>
                      <span className="text-[9px] font-mono opacity-30">{format(new Date(post.createdAt), 'yy.MM.dd')}</span>
                    </div>
                    <h3 className="text-xl font-display font-bold uppercase tracking-tight leading-[1.1] group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {filteredPosts.length === 0 && !loading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-40 text-center glass rounded-[3rem]"
        >
          <Zap size={48} className="mx-auto mb-8 opacity-10 animate-pulse" />
          <h2 className="text-4xl font-display font-black uppercase tracking-tighter opacity-20">No_Active_Streams</h2>
          <p className="font-mono text-[10px] uppercase tracking-widest opacity-40 mt-4">The artifact archive for this category is currently empty.</p>
          <button 
            onClick={() => setActiveCategory('All')}
            className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-[var(--fg)] pb-2 hover:opacity-50 transition-opacity"
          >
            Reset Frequency
          </button>
        </motion.div>
      )}
    </div>
  );
}
