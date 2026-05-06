import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  addConstructionToDraft,
  deleteDendrochronologyApplication,
  finishDendrochronologyApplication,
  formDendrochronologyApplication,
  getDendrochronologyCart,
  getDendrochronologyDetail,
  listDendrochronologies,
  removeDendrochronologyItem,
  saveDendrochronologyApplication,
  updateDendrochronologyItem,
  type ApplicationFilters,
  type DendrochronologyApplication,
  type DendrochronologyCart,
  type DendrochronologyDetail,
} from '../../modules/dendrochronologiesApi'
import { logoutUser } from './userSlice'
import { apiErrorMessage } from '../utils/apiError'

function defaultFilters(): ApplicationFilters {
  return {
    fromDate: '',
    toDate: '',
    status: '',
    creatorLogin: '',
  }
}

interface DendrochronologyState {
  cart: DendrochronologyCart
  cartLoading: boolean
  detail: DendrochronologyDetail | null
  detailLoading: boolean
  detailError: string | null
  list: DendrochronologyApplication[]
  listLoading: boolean
  listError: string | null
  filters: ApplicationFilters
  applicationMutationLoading: boolean
  itemMutationLoading: Record<string, boolean>
}

const emptyCart: DendrochronologyCart = {
  hasDraft: false,
  constructionsCount: 0,
}

function buildInitialState(): DendrochronologyState {
  return {
    cart: emptyCart,
    cartLoading: false,
    detail: null,
    detailLoading: false,
    detailError: null,
    list: [],
    listLoading: false,
    listError: null,
    filters: defaultFilters(),
    applicationMutationLoading: false,
    itemMutationLoading: {},
  }
}

type AuthState = { user: { isAuthenticated: boolean } }

export const fetchDendrochronologyCart = createAsyncThunk(
  'dendrochronology/fetchCart',
  async (_, { getState }) => {
    const state = getState() as AuthState
    if (!state.user.isAuthenticated) return emptyCart
    return getDendrochronologyCart()
  },
)

export const addConstructionToDendrochronology = createAsyncThunk(
  'dendrochronology/addConstruction',
  async (constructionId: number, { rejectWithValue }) => {
    try {
      return await addConstructionToDraft(constructionId)
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error))
    }
  },
)

export const fetchDendrochronologyDetail = createAsyncThunk(
  'dendrochronology/fetchDetail',
  async (applicationId: number, { rejectWithValue }) => {
    try {
      return await getDendrochronologyDetail(applicationId)
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error))
    }
  },
)

export const fetchDendrochronologyList = createAsyncThunk(
  'dendrochronology/fetchList',
  async (filtersArg: ApplicationFilters | undefined, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { dendrochronology: { filters: ApplicationFilters } }
      return await listDendrochronologies(filtersArg ?? state.dendrochronology.filters)
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error))
    }
  },
)

export const saveDendrochronologyDraft = createAsyncThunk(
  'dendrochronology/saveDraft',
  async (
    {
      applicationId,
      title,
      items,
    }: {
      applicationId: number
      title: string
      items: Array<{
        constructionId: number
        itemId?: number
        dateCorrection: number
        cuttingDate: number
        samplesCount: number
      }>
    },
    { dispatch, rejectWithValue },
  ) => {
    try {
      await saveDendrochronologyApplication(applicationId, title)
      await Promise.all(
        items.map((item) =>
          updateDendrochronologyItem(applicationId, item.constructionId, {
            itemId: item.itemId,
            dateCorrection: item.dateCorrection,
            cuttingDate: item.cuttingDate,
            samplesCount: item.samplesCount,
          }),
        ),
      )
      await dispatch(fetchDendrochronologyDetail(applicationId))
      await dispatch(fetchDendrochronologyCart())
      return true
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error))
    }
  },
)

export const removeConstructionFromDendrochronology = createAsyncThunk(
  'dendrochronology/removeConstruction',
  async (
    { applicationId, constructionId }: { applicationId: number; constructionId: number },
    { dispatch, rejectWithValue },
  ) => {
    try {
      await removeDendrochronologyItem(applicationId, constructionId)
      await dispatch(fetchDendrochronologyDetail(applicationId))
      await dispatch(fetchDendrochronologyCart())
      return constructionId
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error))
    }
  },
)

export const formDendrochronologyDraft = createAsyncThunk(
  'dendrochronology/formDraft',
  async (applicationId: number, { dispatch, rejectWithValue }) => {
    try {
      await formDendrochronologyApplication(applicationId)
      await dispatch(fetchDendrochronologyDetail(applicationId))
      await dispatch(fetchDendrochronologyCart())
      await dispatch(fetchDendrochronologyList(undefined))
      return true
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error))
    }
  },
)

export const deleteDendrochronologyDraft = createAsyncThunk(
  'dendrochronology/deleteDraft',
  async (applicationId: number, { dispatch, rejectWithValue }) => {
    try {
      await deleteDendrochronologyApplication(applicationId)
      await dispatch(fetchDendrochronologyCart())
      await dispatch(fetchDendrochronologyList(undefined))
      return true
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error))
    }
  },
)

export const finishDendrochronology = createAsyncThunk(
  'dendrochronology/finish',
  async (
    { applicationId, status }: { applicationId: number; status: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      await finishDendrochronologyApplication(applicationId, status)
      await dispatch(fetchDendrochronologyList(undefined))
      return { applicationId, status }
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error))
    }
  },
)

const dendrochronologySlice = createSlice({
  name: 'dendrochronology',
  initialState: buildInitialState(),
  reducers: {
    setApplicationFilters: (state, action: PayloadAction<Partial<ApplicationFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetApplicationFilters: (state) => {
      state.filters = defaultFilters()
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser, () => buildInitialState())
      .addCase(fetchDendrochronologyCart.pending, (state) => {
        state.cartLoading = true
      })
      .addCase(fetchDendrochronologyCart.fulfilled, (state, action) => {
        state.cartLoading = false
        state.cart = action.payload
      })
      .addCase(fetchDendrochronologyCart.rejected, (state) => {
        state.cartLoading = false
        state.cart = emptyCart
      })
      .addCase(addConstructionToDendrochronology.pending, (state) => {
        state.applicationMutationLoading = true
      })
      .addCase(addConstructionToDendrochronology.fulfilled, (state, action) => {
        state.applicationMutationLoading = false
        state.cart = action.payload
      })
      .addCase(addConstructionToDendrochronology.rejected, (state) => {
        state.applicationMutationLoading = false
      })
      .addCase(fetchDendrochronologyDetail.pending, (state) => {
        state.detailLoading = true
        state.detailError = null
      })
      .addCase(fetchDendrochronologyDetail.fulfilled, (state, action) => {
        state.detailLoading = false
        state.detail = action.payload
      })
      .addCase(fetchDendrochronologyDetail.rejected, (state, action) => {
        state.detailLoading = false
        state.detailError = action.payload as string
      })
      .addCase(fetchDendrochronologyList.pending, (state) => {
        state.listLoading = true
        state.listError = null
      })
      .addCase(fetchDendrochronologyList.fulfilled, (state, action) => {
        state.listLoading = false
        state.list = action.payload
      })
      .addCase(fetchDendrochronologyList.rejected, (state, action) => {
        state.listLoading = false
        state.listError = action.payload as string
      })
      .addCase(saveDendrochronologyDraft.pending, (state) => {
        state.applicationMutationLoading = true
      })
      .addCase(saveDendrochronologyDraft.fulfilled, (state) => {
        state.applicationMutationLoading = false
      })
      .addCase(saveDendrochronologyDraft.rejected, (state) => {
        state.applicationMutationLoading = false
      })
      .addCase(formDendrochronologyDraft.pending, (state) => {
        state.applicationMutationLoading = true
      })
      .addCase(formDendrochronologyDraft.fulfilled, (state) => {
        state.applicationMutationLoading = false
      })
      .addCase(formDendrochronologyDraft.rejected, (state) => {
        state.applicationMutationLoading = false
      })
      .addCase(deleteDendrochronologyDraft.pending, (state) => {
        state.applicationMutationLoading = true
      })
      .addCase(deleteDendrochronologyDraft.fulfilled, (state) => {
        state.applicationMutationLoading = false
        state.detail = null
      })
      .addCase(deleteDendrochronologyDraft.rejected, (state) => {
        state.applicationMutationLoading = false
      })
      .addCase(removeConstructionFromDendrochronology.pending, (state, action) => {
        state.itemMutationLoading[`remove-${action.meta.arg.constructionId}`] = true
      })
      .addCase(removeConstructionFromDendrochronology.fulfilled, (state, action) => {
        delete state.itemMutationLoading[`remove-${action.payload}`]
      })
      .addCase(removeConstructionFromDendrochronology.rejected, (state, action) => {
        delete state.itemMutationLoading[`remove-${action.meta.arg.constructionId}`]
      })
      .addCase(finishDendrochronology.pending, (state, action) => {
        state.itemMutationLoading[`finish-${action.meta.arg.applicationId}`] = true
      })
      .addCase(finishDendrochronology.fulfilled, (state, action) => {
        const { applicationId, status } = action.payload
        delete state.itemMutationLoading[`finish-${applicationId}`]
        state.list = state.list.map((item) =>
          item.dendrochronology_id === applicationId
            ? {
                ...item,
                status,
                finish_date: item.finish_date ?? new Date().toISOString(),
              }
            : item,
        )
      })
      .addCase(finishDendrochronology.rejected, (state, action) => {
        delete state.itemMutationLoading[`finish-${action.meta.arg.applicationId}`]
      })
  },
})

export const { setApplicationFilters, resetApplicationFilters } =
  dendrochronologySlice.actions
export default dendrochronologySlice.reducer
