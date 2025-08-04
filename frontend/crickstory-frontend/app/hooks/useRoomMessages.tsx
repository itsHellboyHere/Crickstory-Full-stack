import { useInfiniteQuery } from "@tanstack/react-query"
import axios from "@/app/utils/axios"

export function useRoomMessages(roomId: number) {
    const fetchMessages = async ({ pageParam = 1 }) => {
        const res = await axios.get(`/api/chat/rooms/${roomId}/messages/?page=${pageParam}`)
        return res.data
    }

    return useInfiniteQuery({
        queryKey: ["messages", roomId],
        queryFn: fetchMessages,
        getNextPageParam: (lastPage) => {
            if (!lastPage.next) return null;
            try {
                const url = new URL(lastPage.next);
                const page = url.searchParams.get('page');
                return page ? parseInt(page, 10) : null;
            } catch (err) {
                console.error('Failed to parse next page URL:', err);
                return null;
            }
        },
        initialPageParam: 1,

    })


}



