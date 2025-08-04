import axios from "@/app/utils/axios";
import { useInfiniteQuery } from "@tanstack/react-query";

export const fetchInfiniteSearch = async ({ pageParam = 1, queryKey }: any) => {
  console.log("querykey ",queryKey)
  const [, debouncedQuery, type] = queryKey;
  const response = await axios.get(`/api/search/`, {
    params: { q: debouncedQuery, page: pageParam, type },
  });
  return response.data;
};

export default function useInfiniteSearchQuery(debouncedQuery: string, type: string) {
  return useInfiniteQuery({
    queryKey: ['search', debouncedQuery, type],
    queryFn: fetchInfiniteSearch,
    enabled: !!debouncedQuery,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.has_more ? lastPage.page + 1 : undefined;
    },
    staleTime: 1000 * 60 * 5,
  });
}
