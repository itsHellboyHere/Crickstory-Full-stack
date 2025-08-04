import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { addNewMessage } from "@/app/features/messageSlice";
import { AppDispatch } from "@/app/store/store";

type Message = {
  id: number;
  content: string;
  message_type: string;
  file_url: string | null;
  room: number;
  sender: {
    id: number;
    username: string;
    name?: string;
    image?: string;
  };
};

export default function useChatSocket(roomId: number) {
  const socketRef = useRef<WebSocket | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:8000/ws/chat/${roomId}/`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const newMessage: Message = JSON.parse(event.data);
        dispatch(addNewMessage(newMessage));
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    return () => {
      socket.close();
    };
  }, [roomId, dispatch]);

  const sendMessage = (payload: {
    message: string;
    message_type: string;
    file_url?: string;
  }) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    } else {
      console.warn("WebSocket not open, message not sent");
    }
  };

  return { sendMessage };
}
