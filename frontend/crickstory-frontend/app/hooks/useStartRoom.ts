// hooks/useStartConversation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/app/utils/axios';
// start a new dm conversation
import { useAuth } from '../context/AuthContext';
export function  useStartConversation() {
  const queryClient = useQueryClient();
  const {user} = useAuth()

  return useMutation({
    mutationFn: async (userId: number) => {
      
      const res = await axios.post(`/api/chat/rooms/`, {
        room_type: 'dm',
         members: [userId], 
 
      });
      console.log(res.data)
      return res.data;
    },
    onSuccess: () => {
      // Invalidate rooms list to show the new room
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
