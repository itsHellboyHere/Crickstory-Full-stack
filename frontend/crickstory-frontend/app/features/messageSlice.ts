// features/messageSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/app/utils/axios";
import { Message, PaginatedMessages } from "@/types/next-auth";

interface RoomMessages {
  messages: Message[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  nextPage: number | null;
  hasNextPage: boolean;
  loadedMessageIds: Record<number, true>;
}

interface MessagesState {
  messagesByRoom: {
    [roomId: number]: RoomMessages;
  };
}

const initialState: MessagesState = {
  messagesByRoom: {},
};

export const fetchMessagesThunk = createAsyncThunk<
  PaginatedMessages,
  { roomId: number; page: number },
  { rejectValue: string }
>("messages/fetchMessages", async ({ roomId, page }, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/api/chat/rooms/${roomId}/messages/?page=${page}`);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Failed to load messages");
  }
});

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    resetMessages(state, action) {
      const roomId = action.payload;
      delete state.messagesByRoom[roomId];
    },
    addNewMessage(state, action) {
      const message: Message = action.payload;
      const roomId = message.room;

      if (!state.messagesByRoom[roomId]) {
        state.messagesByRoom[roomId] = {
          messages: [],
          loadedMessageIds: {},
          status: "idle",
          error: null,
          nextPage: 1,
          hasNextPage: true,
        };
      }

      const room = state.messagesByRoom[roomId];

      if (!room.loadedMessageIds[message.id]) {
        room.messages.push(message);
        room.loadedMessageIds[message.id] = true;
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchMessagesThunk.pending, (state, action) => {
        const { roomId } = action.meta.arg;
        if (!state.messagesByRoom[roomId]) {
          state.messagesByRoom[roomId] = {
            messages: [],
            loadedMessageIds: {}, 
            status: "idle",
            error: null,
            nextPage: 1,
            hasNextPage: true,
          };
        }
        state.messagesByRoom[roomId].status = "loading";
      })
      .addCase(fetchMessagesThunk.fulfilled, (state, action) => {
        const { roomId, page } = action.meta.arg;
        const room = state.messagesByRoom[roomId];
        room.status = "succeeded";

        // ✅ Filter out already-loaded messages
        const newMessages = action.payload.results.filter(msg => !room.loadedMessageIds[msg.id]);

        // ✅ Mark loaded message IDs
        newMessages.forEach(msg => {
          room.loadedMessageIds[msg.id] = true;
        });

        // ✅ Merge and sort: always keep messages oldest → newest
        room.messages = [...room.messages, ...newMessages];
        room.messages.sort((a, b) => a.id - b.id); // id ↑ means time ↑

        // ✅ Pagination
        const nextUrl = action.payload.next;
        if (nextUrl) {
          const parsed = new URL(nextUrl);
          const nextPageStr = parsed.searchParams.get("page");
          room.nextPage = nextPageStr ? parseInt(nextPageStr, 10) : null;
          room.hasNextPage = !!room.nextPage;
        } else {
          room.nextPage = null;
          room.hasNextPage = false;
        }
      })

      .addCase(fetchMessagesThunk.rejected, (state, action) => {
        const { roomId } = action.meta.arg;
        const room = state.messagesByRoom[roomId];
        room.status = "failed";
        room.error = action.payload || "Error fetching messages";
      });
  },
});

export const { resetMessages, addNewMessage } = messageSlice.actions;
export default messageSlice.reducer;
