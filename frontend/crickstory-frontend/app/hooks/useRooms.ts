import { useInfiniteQuery } from '@tanstack/react-query';
import axios from '@/app/utils/axios';

// Define types for the API response
type Member = {
  id: number;
  username: string;
  name: string;
  image: string | null;
};

type LastMessage = {
  id: number;
  room: number;
  sender: Member;
  content: string;
  file_url: string | null;
  message_type: string;
  created_at: string;
  updated_at: string;
};

type Room = {
  id: number;
  room_type: string;
  name: string;
  members: Member[];
  created_at: string;
  last_message: LastMessage | null;
  display_name: string;
  display_avatar: string | null;
};

type RoomsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Room[];
};

const fetchRooms = async ({ pageParam }: { pageParam?: number }): Promise<RoomsResponse> => {
  const response = await axios.get('/api/chat/rooms/', {
    params: {
      page: pageParam,
    },
  });
  return response.data;
};

const useRooms = () => {
  return useInfiniteQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
    initialPageParam: 1,
    getNextPageParam: (lastPage: RoomsResponse) => {
      if (lastPage.next) {
        const url = new URL(lastPage.next);
        const page = url.searchParams.get('page');
        return page ? parseInt(page) : undefined;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 1,
  });
};

export default useRooms;