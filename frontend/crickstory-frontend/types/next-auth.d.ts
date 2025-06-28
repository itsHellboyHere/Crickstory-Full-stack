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
    imageUrl: string;
    user: User;
    likes: Like[];
    comments: Comment[];
    saved_by: SavedPost[];
    created_at: string;
    updated_at: string;
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