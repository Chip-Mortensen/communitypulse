export type Issue = {
  id: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
  user_id: string;
  upvotes: number;
  image_url?: string;
};

export type Comment = {
  id: string;
  issue_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  upvotes: number;
};

export type User = {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
}; 