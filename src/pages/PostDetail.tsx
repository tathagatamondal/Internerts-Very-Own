import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Post } from '../types';
import { format } from 'date-fns';
import { ArrowLeft, Share2, Bookmark, Command, Clock, Eye, MessageSquare, Twitter, Facebook, Link as LinkIcon } from 'lucide-react';
import { motion, useScroll, useSpring } from 'motion/react';
import { cn } from '../lib/utils';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const articleRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: articleRef,
    offset: ["start start", "end end"]
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() } as Post);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-t-[var(--accent)] border-[var(--border)] rounded-full"
        />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-40 text-center glass rounded-[3rem]">
        <h2 className="text-4xl font-display font-black uppercase tracking-tighter opacity-20">Stream_Lost</h2>
        <p className="font-mono text-[10px] uppercase tracking-widest opacity-40 mt-4">The requested data fragment could not be retrieved.</p>
        <Link to="/" className="inline-block mt-12 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-[var(--fg)] pb-2 hover:opacity-50 transition-opacity">
          Return to Hub
        </Link>
      </div>
    );
  }

  return (
    <article ref={articleRef} className="relative">
      {/* Reading Progress Bar */}
      <motion.div 
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--accent)] to-[var(--fg)] origin-left z-[60]"
      />

      {/* Hero Section */}
      <header className="relative h-[80vh] min-h-[600px] overflow-hidden flex items-end pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            transition={{ duration: 1.5 }}
            src={post.imageUrl || `https://picsum.photos/seed/${post.id}/1920/1080`}
            alt={post.title}
            className="w-full h-full object-cover grayscale dark:opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-8"
          >
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <span className="px-4 py-1.5 bg-[var(--accent)] text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                {post.category}
              </span>
              <div className="flex items-center space-x-2 text-[10px] font-mono opacity-60">
                <Clock size={12} />
                <span>8 MIN READ</span>
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-[10px] font-mono opacity-60">
                <Eye size={12} />
                <span>2.4K STREAMS</span>
              </div>
            </div>

            <h1 className="text-5xl sm:text-8xl font-display font-black uppercase tracking-tighter leading-[0.85] gradient-text text-balance max-w-5xl">
              {post.title}
            </h1>

            {post.subtitle && (
              <p className="text-xl sm:text-2xl text-[var(--fg)]/60 max-w-3xl leading-relaxed text-balance">
                {post.subtitle}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-8 border-t border-[var(--border)] max-w-fit mx-auto lg:mx-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold">
                  {post.author?.[0] || 'A'}
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest">{post.author || 'Anonymous Writer'}</p>
                  <p className="text-[9px] font-mono opacity-40 uppercase">Lead Architect</p>
                </div>
              </div>
              <div className="w-px h-8 bg-[var(--border)] hidden sm:block" />
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest">{format(new Date(post.createdAt), 'MMMM dd, yyyy')}</p>
                <p className="text-[9px] font-mono opacity-40 uppercase">Publication Date</p>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col lg:flex-row gap-16 relative">
        {/* Floating Actions Sidebar */}
        <aside className="lg:w-20 hidden lg:block sticky top-32 h-fit space-y-4">
          <div className="flex flex-col items-center space-y-6">
            <button className="w-12 h-12 rounded-2xl glass flex items-center justify-center hover:bg-[var(--accent)] hover:text-white transition-all duration-300">
              <Twitter size={20} />
            </button>
            <button className="w-12 h-12 rounded-2xl glass flex items-center justify-center hover:bg-[var(--accent)] hover:text-white transition-all duration-300">
              <Facebook size={20} />
            </button>
            <button className="w-12 h-12 rounded-2xl glass flex items-center justify-center hover:bg-[var(--accent)] hover:text-white transition-all duration-300">
              <LinkIcon size={20} />
            </button>
            <div className="w-px h-12 bg-[var(--border)]" />
            <button className="w-12 h-12 rounded-2xl glass flex items-center justify-center hover:bg-[var(--accent)] hover:text-white transition-all duration-300 text-[var(--accent)]">
              <Bookmark size={20} fill="currentColor" />
            </button>
          </div>
        </aside>

        {/* Content Column */}
        <div className="flex-1 space-y-20 relative">
          {/* Article Deco Element */}
          <div className="absolute -left-20 top-0 h-full w-px bg-gradient-to-b from-[var(--accent)] via-[var(--border)] to-transparent opacity-20 hidden lg:block" />

          <div className="prose prose-xl prose-neutral dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-p:leading-relaxed prose-p:text-[var(--fg)]/80">
            <div className="whitespace-pre-wrap font-sans">
              {post.content}
            </div>
          </div>

          {/* Post Footer / Engagement */}
          <footer className="space-y-12">
            <div className="glass rounded-[3rem] p-12 sm:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <h4 className="text-2xl font-display font-black uppercase tracking-tighter">Did you enjoy this artifact?</h4>
                <p className="text-sm text-[var(--fg)]/60 max-w-md">The archive grows through human interaction. Share your thoughts or save this stream for later.</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-3 bg-[var(--fg)] text-[var(--bg)] px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-all">
                  <Share2 size={16} />
                  <span>Share Stream</span>
                </button>
                <button className="glass p-4 rounded-2xl hover:bg-[var(--accent)]/10 transition-colors">
                  <Bookmark size={20} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[var(--border)] pt-8">
              <div className="flex items-center space-x-3 text-[10px] font-mono opacity-40 uppercase tracking-widest">
                <Command size={14} />
                <span>End of Transmission // Session_Active</span>
              </div>
              <Link 
                to="/" 
                className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] group"
              >
                <span>Browse Archive</span>
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform rotate-180" />
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </article>
  );
}
