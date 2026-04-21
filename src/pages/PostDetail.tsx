import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Post } from '../types';
import { format } from 'date-fns';
import { ArrowLeft, Share2, Bookmark, Clock, MessageCircle, Twitter, Facebook, Linkedin, Link as LinkIcon, Play, ChevronRight } from 'lucide-react';
import { motion, useScroll, useSpring } from 'motion/react';
import { cn } from '../lib/utils';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
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
          const postData = { id: docSnap.id, ...docSnap.data() } as Post;
          setPost(postData);
          
          // Fetch related
          const q = query(
            collection(db, 'posts'),
            where('category', '==', postData.category),
            where('published', '==', true),
            limit(4)
          );
          const relatedSnap = await getDocs(q);
          setRelatedPosts(relatedSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Post))
            .filter(p => p.id !== id)
          );
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
        <div className="w-8 h-8 border-4 border-[#B80000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-40 text-center">
        <h2 className="text-4xl font-serif font-black italic mb-6">Article Not Found</h2>
        <p className="text-gray-500 mb-8">The requested digital fragment could not be retrieved.</p>
        <Link to="/" className="text-[#B80000] font-bold uppercase tracking-widest border-b-2 border-[#B80000] pb-1">
          Return to News
        </Link>
      </div>
    );
  }

  return (
    <article ref={articleRef} className="max-w-7xl mx-auto pt-8">
      {/* Reading Progress Bar */}
      <motion.div 
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-1 bg-[#B80000] origin-left z-[60]"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Article Content */}
        <div className="lg:col-span-8 space-y-8">
          <header className="space-y-6">
            <Link 
              to="/" 
              className="text-[#B80000] font-black text-xs uppercase tracking-[0.2em] flex items-center group mb-8"
            >
              <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              {post.category}
            </Link>

            <h1 className="text-4xl sm:text-6xl font-serif font-black leading-[1.1]">
              {post.title}
            </h1>
            
            {post.subtitle && (
              <p className="text-xl sm:text-2xl text-gray-500 font-light leading-relaxed italic">
                {post.subtitle}
              </p>
            )}

            <div className="pt-6 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-gray-500">
               <div className="flex items-center space-x-6">
                 <div className="flex items-center">
                   <Clock size={14} className="mr-2" /> 
                   <span>{format(new Date(post.createdAt), 'MMMM dd, yyyy')}</span>
                 </div>
                 <div className="flex items-center">
                   <MessageCircle size={14} className="mr-2" /> 
                   <span>142 Comments</span>
                 </div>
               </div>
               <div className="flex items-center space-x-4">
                 <button className="hover:text-[#B80000] transition-colors"><Twitter size={16} /></button>
                 <button className="hover:text-[#B80000] transition-colors"><Facebook size={16} /></button>
                 <button className="hover:text-[#B80000] transition-colors"><Linkedin size={16} /></button>
                 <button className="hover:text-[#B80000] transition-colors"><LinkIcon size={16} /></button>
               </div>
            </div>
          </header>

          <figure className="aspect-[16/9] overflow-hidden bg-gray-100 mb-12">
            <img
              src={post.imageUrl || `https://picsum.photos/seed/${post.id}/1920/1080`}
              alt={post.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </figure>

          <div className="prose prose-xl prose-neutral dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-black prose-p:leading-relaxed prose-p:text-gray-800 dark:prose-p:text-gray-200">
            <div className="whitespace-pre-wrap font-sans">
              {post.content}
            </div>
          </div>

          <footer className="pt-12 border-t border-gray-100 mt-20">
            <div className="flex items-center space-x-6 mb-12">
               <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center font-black text-xl text-gray-400">
                 {post.author?.[0] || 'A'}
               </div>
               <div>
                 <p className="text-xs font-black uppercase tracking-widest text-gray-400 font-sans mb-1">Author</p>
                 <p className="text-lg font-bold">{post.author || 'Anonymous Writer'}</p>
                 <p className="text-sm text-gray-500">Senior Correspondent, Global Affairs</p>
               </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#121212] p-12 text-center space-y-6">
               <h3 className="text-2xl font-serif font-black italic">Share this story</h3>
               <div className="flex items-center justify-center space-x-4">
                  <button className="flex items-center space-x-3 bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#B80000] transition-all">
                    <Share2 size={16} />
                    <span>Share</span>
                  </button>
                  <button className="border-2 border-black dark:border-white p-3 hover:bg-black hover:text-white transition-all">
                    <Bookmark size={20} />
                  </button>
               </div>
            </div>
          </footer>
        </div>

        {/* Right Column: Trending/Related */}
        <aside className="lg:col-span-4 space-y-12">
          <div className="border-b-2 border-black dark:border-white pb-3 mb-8">
            <h3 className="text-lg font-serif font-black italic tracking-tight">Related Stories</h3>
          </div>
          <div className="space-y-8 divide-y divide-gray-100 dark:divide-gray-800">
            {relatedPosts.map((rPost) => (
              <Link key={rPost.id} to={`/post/${rPost.id}`} className="block pt-8 first:pt-0 group">
                <div className="space-y-4">
                  <div className="aspect-video overflow-hidden bg-gray-100">
                    <img 
                      src={rPost.imageUrl || `https://picsum.photos/seed/${rPost.id}/400/225`} 
                      alt={rPost.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <h4 className="text-lg font-bold leading-tight group-hover:text-[#B80000] transition-colors">
                    {rPost.title}
                  </h4>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none">
                    {rPost.category}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="bg-black text-white p-10 relative overflow-hidden group">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center space-x-2">
                <Play size={20} fill="currentColor" />
                <span className="text-xs font-black uppercase tracking-[0.3em]">Watch Live</span>
              </div>
              <p className="text-xl font-serif font-black italic leading-tight">Around the world in 80 seconds. Our daily video digest.</p>
              <button className="flex items-center text-[10px] font-black uppercase tracking-widest border-b border-white pb-1 group-hover:text-[#B80000] group-hover:border-[#B80000] transition-all">
                The Briefing <ChevronRight size={12} className="ml-2" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
