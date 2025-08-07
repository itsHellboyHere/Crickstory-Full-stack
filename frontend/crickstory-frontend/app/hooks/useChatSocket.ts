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

export default function useChatSocket(roomId: number, onTyping?: (username: string | null) => void) {
  const socketRef = useRef<WebSocket | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:8000/ws/chat/${roomId}/`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "typing") {
          onTyping?.(data.username); // show typing
        } else if (data.type === "stop_typing") {
          onTyping?.(null); // hide typing
        } else {
          dispatch(addNewMessage(data));
        }
      } catch (err) {
        console.error("WebSocket parse error:", err);
      }
    };

    return () => {
      socket.close();
    };
  }, [roomId, dispatch, onTyping]);

  const sendMessage = (payload: { message: string; message_type: string; file_url?: string }) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ ...payload, type: "message" }));
    }
  };

  const sendTyping = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "typing" }));
    }
  };

  const sendStopTyping = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "stop_typing" }));
    }
  };

  return { sendMessage, sendTyping, sendStopTyping };
}


