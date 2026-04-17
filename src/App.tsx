import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from './types';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminEditPost from './pages/AdminEditPost';
import Login from './pages/Login';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUserProfile({ uid: firebaseUser.uid, ...userDoc.data() } as UserProfile);
        } else {
          // Create default user profile
          const isFirstAdmin = firebaseUser.email === 'tathagata2416@gmail.com';
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            role: isFirstAdmin ? 'admin' : 'user',
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505] text-white">
        <div className="animate-pulse font-mono text-xs uppercase tracking-widest">Loading Internets Very Own...</div>
      </div>
    );
  }

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'editor';

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<Layout userProfile={userProfile} />}>
          <Route path="/" element={<Home />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={isAdmin ? <AdminLayout userProfile={userProfile} /> : <Navigate to="/login" />}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="new" element={<AdminEditPost />} />
          <Route path="edit/:id" element={<AdminEditPost />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
