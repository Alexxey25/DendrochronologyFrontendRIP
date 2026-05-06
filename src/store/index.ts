import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'
import dendrochronologyReducer from './slices/dendrochronologySlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    dendrochronology: dendrochronologyReducer,
  },
  devTools: true,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch