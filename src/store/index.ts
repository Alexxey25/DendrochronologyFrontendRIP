import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'
import dendrochronologyReducer from './slices/dendrochronologySlice'
import servicesFilterReducer from './slices/servicesFilterSlice'

/** DevTools: расширение «Redux DevTools» в браузере (Chrome / Firefox и др.) */
export const store = configureStore({
  reducer: {
    user: userReducer,
    dendrochronology: dendrochronologyReducer,
    servicesFilter: servicesFilterReducer,
  },
  devTools: true,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch