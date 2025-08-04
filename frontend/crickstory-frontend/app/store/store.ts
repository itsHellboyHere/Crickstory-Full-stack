// lib/store.ts

import { configureStore } from '@reduxjs/toolkit'
import postsReducer from '@/app/features/postsSlice'
import messagesReducer from '@/app/features/messageSlice'

export function makeStore() {
  return configureStore({
    reducer: {
      posts: postsReducer,
      messages:messagesReducer,
    },
  })
} 

export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore['dispatch']
export type RootState = ReturnType<AppStore['getState']>
