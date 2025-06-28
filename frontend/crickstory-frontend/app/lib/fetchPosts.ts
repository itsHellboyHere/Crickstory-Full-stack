import axios from "@/app/utils/axios";
import { PostsResponse } from '@/types/next-auth';

export const fetchPosts = async (cursor?: string): Promise<PostsResponse> => {
  const response = await axios.get('/api/posts/', {
    params: cursor ? { cursor } : {},
  });
  return response.data;
};
