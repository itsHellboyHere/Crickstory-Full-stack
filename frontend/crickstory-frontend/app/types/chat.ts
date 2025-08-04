export interface Room {
  id: string;
  room_type: 'dm' | 'group';
  name?: string;
  members: User[];
  last_message?: Message;
  display_name: string;
  display_avatar?: string;
}

export interface Message {
  id: string;
  room: string;
  sender: User;
  content: string;
  file_url?: string;
  message_type: 'text' | 'image' | 'video' | 'file';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  username: string;
  name?: string;
  image?: string;
}

export interface MessageRequest {
  id: string;
  sender: User;
  content: string;
  message_type: 'text' | 'image' | 'video' | 'file';
  file_url?: string;
  created_at: string;
}