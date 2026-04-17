import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { ArrowLeft, Save, Image as ImageIcon, CheckCircle2, AlertCircle, Sparkles, Layout, Type, Hash, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminEditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    category: 'Culture',
    imageUrl: '',
    published: false,
  });

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const docRef = doc(db, 'posts', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData({
              title: data.title || '',
              subtitle: data.subtitle || '',
              content: data.content || '',
              category: data.category || 'Culture',
              imageUrl: data.imageUrl || '',
              published: data.published || false,
            });
          }
        } catch (error) {
          console.error('Error fetching post:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      const postData = {
        ...formData,
        author: user.displayName || user.email || 'Anonymous',
        authorUid: user.uid,
        updatedAt: new Date().toISOString(),
      };

      if (id) {
        await updateDoc(doc(db, 'posts', id), postData);
      } else {
        await addDoc(collection(db, 'posts'), {
          ...postData,
          createdAt: new Date().toISOString(),
        });
      }

      setSuccess(true);
      setTimeout(() => navigate('/admin'), 1500);
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-1 bg-[var(--accent)]/20 rounded-full overflow-hidden">
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full bg-[var(--accent)]"
          />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.5em] opacity-30">Initializing_Interface...</span>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pb-12 border-b border-[var(--border)]">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-[var(--accent)]">
            <Sparkles size={16} />
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em]">Editor_Layer_v2.4</span>
          </div>
          <h2 className="text-6xl font-display font-black uppercase tracking-tighter leading-none">
            {id ? 'Patch_Archive' : 'New_Artifact'}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center space-x-3 px-6 py-4 glass rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--accent)]/10 transition-all"
          >
            <Layout size={16} />
            <span>{previewMode ? 'Edit_Code' : 'Preview_UI'}</span>
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center space-x-3 px-6 py-4 glass rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:text-red-500 transition-all"
          >
            <ArrowLeft size={16} />
            <span>Abort_Process</span>
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-16">
        {/* Main Workspace */}
        <div className="xl:col-span-8 space-y-12">
          <AnimatePresence mode="wait">
            {previewMode ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass rounded-[3rem] p-12 sm:p-20 space-y-12 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 p-8 text-[9px] font-mono uppercase opacity-20 tracking-widest">UI_PREVIEW_MODE</div>
                <div className="space-y-8">
                  <span className="px-4 py-1.5 bg-[var(--accent)] text-white text-[10px] font-bold uppercase tracking-widest rounded-full">{formData.category}</span>
                  <h1 className="text-5xl sm:text-7xl font-display font-black uppercase tracking-tighter leading-[0.85] gradient-text text-balance">
                    {formData.title || 'Artifact_Untitled'}
                  </h1>
                  <p className="text-xl text-[var(--fg)]/60 leading-relaxed font-medium">
                    {formData.subtitle || 'Metadata_Summary_Pending...'}
                  </p>
                </div>
                <div className="aspect-video rounded-[2rem] overflow-hidden border border-[var(--border)] bg-[var(--subtle)]">
                  <img src={formData.imageUrl || 'https://picsum.photos/seed/ivo/1200/800'} alt="Preview" className="w-full h-full object-cover grayscale opacity-50" />
                </div>
                <div className="prose dark:prose-invert max-w-none opacity-40 italic">
                  Content stream suppressed in preview mode...
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                {/* Headline Input */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 opacity-30">
                    <Type size={14} />
                    <label className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold">Headline_Stream</label>
                  </div>
                  <input
                    required
                    type="text"
                    className="w-full bg-transparent border-b border-[var(--border)] py-8 text-5xl font-display font-black uppercase tracking-tighter focus:outline-none focus:border-[var(--accent)] transition-all placeholder:text-[var(--fg)]/10"
                    placeholder="DEFINE_ARTICLE_HEADLINE..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                {/* Summary TextArea */}
                <div className="space-y-4">
                   <div className="flex items-center space-x-3 opacity-30">
                    <Layout size={14} />
                    <label className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold">Metadata_Summary</label>
                  </div>
                  <textarea
                    className="w-full glass rounded-[2rem] p-8 text-lg font-medium leading-relaxed focus:outline-none focus:border-[var(--accent)] transition-all placeholder:text-[var(--fg)]/20"
                    rows={3}
                    placeholder="Input_short_artifact_description..."
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  />
                </div>

                {/* Content TextArea */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 opacity-30">
                    <FileText size={14} />
                    <label className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold">Primary_Data_Payload</label>
                  </div>
                  <textarea
                    required
                    className="w-full glass rounded-[3rem] p-10 sm:p-14 text-lg font-sans leading-relaxed focus:outline-none focus:border-[var(--accent)] transition-all min-h-[600px] scrollbar-hide"
                    placeholder="Commence_data_injection..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Control Sidebar */}
        <aside className="xl:col-span-4 space-y-10">
          <div className="glass rounded-[3rem] p-10 border border-[var(--border)] space-y-10 sticky top-12">
            <div className="space-y-6">
              <h3 className="text-[11px] font-mono uppercase tracking-[0.4em] opacity-40 font-black border-b border-[var(--border)] pb-4">Config_Parameters</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 opacity-30">
                  <Hash size={14} />
                  <label className="text-[9px] font-mono uppercase tracking-[0.2em] font-bold">Category_Node</label>
                </div>
                <select
                  className="w-full glass rounded-2xl p-5 text-[10px] font-bold uppercase tracking-widest focus:outline-none appearance-none cursor-pointer hover:bg-[var(--accent)]/5 transition-colors"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {['Culture', 'Tech', 'Music', 'Politics', 'Fashion', 'Art'].map(cat => (
                    <option key={cat} value={cat} className="bg-[var(--bg)]">{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 opacity-30">
                  <ImageIcon size={14} />
                  <label className="text-[9px] font-mono uppercase tracking-[0.2em] font-bold">Visual_Asset_Pointer</label>
                </div>
                <input
                  type="url"
                  className="w-full glass rounded-2xl p-5 text-[10px] font-mono focus:outline-none placeholder:text-[var(--fg)]/20"
                  placeholder="HTTPS://CDN.VO.ARTIFACT/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
                <AnimatePresence>
                  {formData.imageUrl && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-2xl overflow-hidden border border-[var(--border)] aspect-square bg-[var(--subtle)]"
                    >
                      <img src={formData.imageUrl} alt="Asset" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between p-6 glass rounded-2xl border border-[var(--border)] group cursor-pointer" onClick={() => setFormData({ ...formData, published: !formData.published })}>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest">Global_Status</p>
                  <p className={cn("text-[9px] font-mono font-bold transition-colors", formData.published ? "text-green-500" : "text-amber-500 uppercase")}>
                    {formData.published ? 'ONLINE' : 'STAGING_DRAFT'}
                  </p>
                </div>
                <div className={cn(
                  "w-12 h-6 rounded-full relative transition-all duration-500",
                  formData.published ? "bg-green-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-[var(--border)]"
                )}>
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500",
                    formData.published ? "left-7 shadow-lg" : "left-1"
                  )} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className={cn(
                "w-full relative py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] overflow-hidden transition-all duration-500 group flex items-center justify-center space-x-4",
                success 
                  ? "bg-green-500 text-white" 
                  : "bg-[var(--fg)] text-[var(--bg)] hover:bg-[var(--accent)] hover:text-white"
              )}
            >
              {success ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>SYNCHRONIZATION_COMPLETE</span>
                </>
              ) : (
                <>
                  <Save size={18} className="group-hover:scale-110 transition-transform" />
                  <span>{saving ? 'INJECTING_DATA...' : 'COMMIT_ARTIFACT'}</span>
                </>
              )}
            </button>
            
            <div className="p-8 border border-[var(--border)] rounded-[2rem] bg-[var(--fg)]/5 space-y-4">
              <div className="flex items-center space-x-2 opacity-30">
                <AlertCircle size={14} />
                <span className="text-[9px] font-mono uppercase tracking-widest font-bold">System_Advice</span>
              </div>
              <ul className="text-[9px] font-mono space-y-3 opacity-50 uppercase tracking-widest leading-relaxed">
                <li>• Ensure_high_entropy_titles</li>
                <li>• Verify_all_data_fragments</li>
                <li>• Realtime_sync_is_active</li>
              </ul>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
