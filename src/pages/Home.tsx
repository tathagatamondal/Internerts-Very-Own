import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Post } from '../types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowRight, Play, Clock, TrendingUp, Globe, Zap, MessageCircle } from 'lucide-react';
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

  const categories = ['All', 'News', 'Sport', 'Business', 'Innovation', 'Culture'];
  const filteredPosts = activeCategory === 'All' 
    ? posts 
    : posts.filter(p => p.category === activeCategory);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#B80000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const mainStory = filteredPosts[0];
  const secondaryStories = filteredPosts.slice(1, 4);
  const otherStories = filteredPosts.slice(4);
  const mostRead = posts.slice(0, 5); // Mock most read for now

  return (
    <div className="space-y-12">
      {/* Top News Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feature */}
        {mainStory && (
          <div className="lg:col-span-8 group">
            <Link to={`/post/${mainStory.id}`} className="block space-y-4">
              <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                <img
                  src={mainStory.imageUrl || `https://picsum.photos/seed/${mainStory.id}/1200/675`}
                  alt={mainStory.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 flex space-x-2">
                   <span className="bg-[#B80000] text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest flex items-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full mr-2 animate-pulse" />
                    Live
                   </span>
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-5xl font-serif font-black hover:text-[#B80000] transition-colors leading-tight">
                  {mainStory.title}
                </h2>
                <p className="text-lg text-[var(--fg)]/70 line-clamp-2 md:line-clamp-none">
                  {mainStory.subtitle || mainStory.content.substring(0, 180) + '...'}
                </p>
                <div className="flex items-center space-x-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <span className="text-[#B80000]">{mainStory.category}</span>
                  <span className="flex items-center"><Clock size={12} className="mr-1" /> {format(new Date(mainStory.createdAt), 'HH:mm')}</span>
                  <span className="flex items-center border-l border-gray-300 pl-4"><MessageCircle size={12} className="mr-1" /> 128 Comments</span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Secondary Grid */}
        <div className="lg:col-span-4 space-y-8">
          <div className="border-b border-gray-200 pb-2 mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest border-l-4 border-black pl-3">Top Stories</h3>
          </div>
          <div className="space-y-8">
            {secondaryStories.map((post) => (
              <Link key={post.id} to={`/post/${post.id}`} className="flex gap-4 group">
                <div className="w-32 h-20 shrink-0 overflow-hidden bg-gray-100">
                  <img
                    src={post.imageUrl || `https://picsum.photos/seed/${post.id}/300/200`}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold leading-tight group-hover:text-[#B80000] transition-colors line-clamp-3">
                    {post.title}
                  </h4>
                  <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400">
                    <span className="text-black dark:text-gray-200">{post.category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Newsletter Bento */}
          <div className="bg-gray-100 dark:bg-[#121212] p-8 border-t-4 border-[#B80000]">
            <Zap size={20} className="text-[#B80000] mb-4" />
            <h4 className="text-xl font-serif font-black mb-4 italic">The Global Brief.</h4>
            <p className="text-xs text-gray-500 mb-6">Receive the day's most important stories in your inbox every morning.</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Email address" 
                className="flex-1 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 px-4 py-2 text-xs focus:outline-none"
              />
              <button className="bg-black text-white px-4 py-2 text-[10px] font-bold uppercase transition-colors hover:bg-[#B80000]">Join</button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid + Sidebar */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 border-t border-gray-200">
        <div className="lg:col-span-8 space-y-12">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
             <h2 className="text-2xl font-serif font-black italic">More Live News</h2>
             <div className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-widest hidden sm:flex">
               {categories.map(cat => (
                 <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  className={cn("hover:text-[#B80000] transition-colors", activeCategory === cat && "text-[#B80000]")}
                 >
                   {cat}
                 </button>
               ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {otherStories.map((post) => (
              <Link key={post.id} to={`/post/${post.id}`} className="group space-y-4">
                <div className="aspect-video overflow-hidden bg-gray-100">
                  <img
                    src={post.imageUrl || `https://picsum.photos/seed/${post.id}/600/350`}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold leading-tight group-hover:text-[#B80000] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {post.subtitle || post.content.substring(0, 100) + '...'}
                  </p>
                  <div className="flex items-center space-x-3 text-[10px] font-bold text-gray-400 pt-2">
                    <span className="text-[#B80000]">{post.category}</span>
                    <span className="flex items-center"><Clock size={10} className="mr-1" /> {format(new Date(post.createdAt), 'MMM dd')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Most Read Sidebar */}
        <aside className="lg:col-span-4 space-y-10">
          <div className="border-b-2 border-black dark:border-white pb-3 mb-8">
            <h3 className="text-lg font-serif font-black italic tracking-tight">Most Read</h3>
          </div>
          <div className="space-y-8 divide-y divide-gray-100 dark:divide-gray-800">
            {mostRead.map((post, i) => (
              <Link key={post.id} to={`/post/${post.id}`} className="flex gap-6 pt-6 first:pt-0 group">
                <span className="text-4xl font-serif font-black text-gray-200 group-hover:text-[#B80000] transition-colors">{i + 1}</span>
                <div className="space-y-2">
                  <h4 className="text-base font-bold leading-snug group-hover:underline transition-all">
                    {post.title}
                  </h4>
                  <div className="flex items-center text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">
                    {post.category}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Reel Promotion */}
          <div className="bg-black text-white p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#B80000] -mr-16 -mt-16 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center space-x-2">
                <Play size={20} fill="currentColor" />
                <span className="text-xs font-black uppercase tracking-[0.3em]">Reel</span>
              </div>
              <p className="text-xl font-serif font-black italic leading-tight">Short documentaries that reveal the world’s secrets.</p>
              <button className="flex items-center text-[10px] font-black uppercase tracking-widest border-b border-white pb-1 group-hover:text-[#B80000] group-hover:border-[#B80000] transition-all">
                Watch Now <ArrowRight size={12} className="ml-2" />
              </button>
            </div>
          </div>
        </aside>
      </section>

      {filteredPosts.length === 0 && !loading && (
        <div className="py-20 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
          <h2 className="text-2xl font-serif font-black italic opacity-20 uppercase tracking-tighter">No Current Feed</h2>
          <p className="text-sm opacity-40 mt-4">There are no articles available in this section at the moment.</p>
          <button 
            onClick={() => setActiveCategory('All')}
            className="mt-8 text-[11px] font-black uppercase tracking-widest text-[#B80000] hover:underline"
          >
            Reset Frequency
          </button>
        </div>
      )}
    </div>
  );
}
