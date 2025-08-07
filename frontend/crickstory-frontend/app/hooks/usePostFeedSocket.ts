// hooks/usePostFeedSocket.ts
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addMultiplePosts, addNewPost } from '@/app/features/postsSlice';
import { Post } from '@/types/next-auth';

export function usePostFeedSocket() {
  const dispatch = useDispatch();
    const socketRef = useRef<WebSocket | null>(null);

useEffect(() => {
  let reconnectTimeout: NodeJS.Timeout;

  const connect = () => {
    const socket = new WebSocket(`ws://localhost:8000/ws/posts/feed/`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('🔌 WebSocket connected for post feed');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_post' && data.post) {
        dispatch(addNewPost(data.post));
      }
    if (data.type === 'bulk_posts' && Array.isArray(data.posts)) {
          dispatch(addMultiplePosts(data.posts));
        }
    };

    socket.onclose = (event) => {
      console.log('❌ WebSocket disconnected:', event.reason);
      // 🔁 Reconnect after 3s
      reconnectTimeout = setTimeout(connect, 3000);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      socket.close(); // optional: force close on error
    };
  };

  connect();

  return () => {
    clearTimeout(reconnectTimeout);
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }
  };
}, [dispatch]);

}
