// types/post.ts
export interface User {
    id: number;
    username: string;
    name: string | null;
    image: string | null;
  }
  
  export interface Like {
    id: number;
    user: User;
    created_at: string;
  }
  
  export interface Comment {
    id: number;
    content: string;
    user: User;
    created_at: string;
  }
  
  export interface SavedPost {
    id: number;
    user: User;
    created_at: string;
  }
  
  export interface Post {
    id: number;
    title: string;
    media: {
      id: number;
      media_type: 'image' | 'video';
      url: string;
    }[];
    user: User;
    likes_count: number;
    comments_count: number;
    is_liked: boolean;
    is_saved: boolean;
    created_at: string;
    updated_at: string;
    tags: string[];
    location: string | null;
  }
  
  export interface PostsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Post[];
  }

  export interface FollowerItem {
    id: number
    follower: User
    created_at: string
    is_following: boolean
  }
  
  export interface FollowingItem {
    id: number
    following: User
    created_at: string
    is_following: boolean
  }