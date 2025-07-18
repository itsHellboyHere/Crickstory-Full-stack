export function connectSocket(): WebSocket {
  const socket = new WebSocket("ws://localhost/ws/notifications/");

  socket.onopen = () => {
    console.log("✅ WebSocket connection established");
  };

  socket.onerror = (error) => {
    console.error("❌ WebSocket error", error);
  };

  socket.onclose = (event) => {
    console.warn("⚠️ WebSocket closed", event);
  };

  return socket;
}
