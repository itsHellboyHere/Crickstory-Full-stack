// lib/store.ts

import { configureStore } from '@reduxjs/toolkit'
import postsReducer from '@/app/features/postsSlice'

export function makeStore() {
  return configureStore({
    reducer: {
      posts: postsReducer,
    },
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore['dispatch']
export type RootState = ReturnType<AppStore['getState']>
