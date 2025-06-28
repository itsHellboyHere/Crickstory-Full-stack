// utils/savePost.ts
import axios from "@/app/utils/axios";

export const toggleSave = async (postId: number): Promise<{ saved: boolean }> => {
  const res = await axios.post(`/api/posts/${postId}/save/`);
  return res.data; 
};
