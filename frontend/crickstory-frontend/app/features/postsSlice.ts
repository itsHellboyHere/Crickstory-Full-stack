
import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import { Post,PostsResponse } from "@/types/next-auth";
import axios from "@/app/utils/axios";
interface PostsState {
  posts: Post[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  nextCursor: string | null;
  hasMore: boolean;
}

const initialState: PostsState = {
  posts: [],
  status: 'idle',
  error: null,
  nextCursor: null,
  hasMore: true,
};

export const fetchPostsThunk = createAsyncThunk<
  PostsResponse,
  string | undefined,
  { rejectValue: string }
>('posts/fetchPosts', async (cursor, { rejectWithValue }) => {
  try {
    const res = await axios.get('/api/posts/', {
      params: cursor ? { cursor } : {},
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Failed to load posts');
  }
});

const postsSlice = createSlice({
    name:'posts',
    initialState,
    reducers:{
        resetPosts(state){
            state.posts=[]
            state.status = 'idle';
            state.error = null;
            state.nextCursor = null;
            state.hasMore = true;
        },
        addNewPost: (state, action) => {
      state.posts.unshift(action.payload);
    },
    },
    extraReducers:builder =>{
        builder
        .addCase(fetchPostsThunk.pending ,state=>{
            state.status='loading'
        })
        .addCase(fetchPostsThunk.fulfilled, (state,action)=>{
            state.status ='succeeded';

            const newPosts = action.payload.results.filter(
                newPost => !state.posts.some(post=>post.id === newPost.id)
            );
            state.posts.push(...newPosts);
            const next = action.payload.next
            ? new URL(action.payload.next).searchParams.get('cursor')
            : null;
            state.nextCursor = next;
            state.hasMore = !!next;
        })
        .addCase(fetchPostsThunk.rejected, (state , action)=>{
            state.status='failed';
            state.error= action.payload || 'Error fetching posts';
        })
        
        
    }
})

export const {resetPosts,addNewPost} = postsSlice.actions
export default postsSlice.reducer
