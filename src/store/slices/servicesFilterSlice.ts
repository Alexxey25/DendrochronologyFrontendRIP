import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface ServicesFilterState {
  /** Применённый текстовый фильтр каталога услуг (к запросу к API и отображению) */
  appliedQuery: string
}

const initialState: ServicesFilterState = {
  appliedQuery: '',
}

const servicesFilterSlice = createSlice({
  name: 'servicesFilter',
  initialState,
  reducers: {
    setServicesFilterQuery(state, action: PayloadAction<string>) {
      state.appliedQuery = action.payload.trim()
    },
    clearServicesFilter(state) {
      state.appliedQuery = ''
    },
  },
})

export const { setServicesFilterQuery, clearServicesFilter } = servicesFilterSlice.actions
export default servicesFilterSlice.reducer
