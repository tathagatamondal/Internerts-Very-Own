export interface Post {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  author: string;
  authorUid: string;
  category: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
  published: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'editor' | 'user';
}
