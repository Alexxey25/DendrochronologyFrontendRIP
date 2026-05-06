import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { parseIsModeratorFromToken } from '../utils/jwt'

export interface UserState {
  login: string
  isAuthenticated: boolean
  isModerator: boolean
}

const initialState: UserState = {
  login: '',
  isAuthenticated: false,
  isModerator: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSucceeded: (
      state,
      action: PayloadAction<{ login: string; token?: string; isModerator?: boolean }>,
    ) => {
      const token = action.payload.token ?? localStorage.getItem('token') ?? ''
      const isModerator =
        action.payload.isModerator ?? parseIsModeratorFromToken(token)

      state.login = action.payload.login
      state.isAuthenticated = true
      state.isModerator = isModerator

      localStorage.setItem('login', action.payload.login)
      localStorage.setItem('isModerator', String(isModerator))
      if (token) localStorage.setItem('token', token)
    },
    logoutUser: () => {
      localStorage.removeItem('token')
      localStorage.removeItem('login')
      localStorage.removeItem('isModerator')
      return {
        login: '',
        isAuthenticated: false,
        isModerator: false,
      }
    },
  },
})

export const { loginSucceeded, logoutUser } = userSlice.actions
export default userSlice.reducer
