export function connectCommentSocket(postId: number): WebSocket {
  
    const socket = new WebSocket(`ws://localhost:8000/ws/posts/${postId}/comments/`);
  
    socket.onopen = () => {
      console.log(`✅ WebSocket connected for post ${postId}`);
    };
  
    socket.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    };
  
    socket.onclose = (event) => {
      console.warn("⚠️ WebSocket closed", event);
    };
  
    return socket;
}