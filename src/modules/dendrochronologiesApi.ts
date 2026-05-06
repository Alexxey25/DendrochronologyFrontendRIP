import axios from 'axios'
import { api } from '../api'
import { CONSTRUCTIONS_MOCK } from './mock'

export interface DendrochronologyCart {
  hasDraft: boolean
  constructionsCount: number
  id?: number
  incompleteItemsCount?: number
}

export interface DendrochronologyApplication {
  dendrochronology_id: number
  status: string
  created_at?: string
  creator_login?: string
  moderator_login?: string | null
  forming_date?: string | null
  finish_date?: string | null
  title?: string | null
  build_year?: number | null
  constructions_count?: number
  incomplete_items_count?: number
}

export interface DendrochronologyConstructionItem {
  item_id?: number
  dendrochronology_id: number
  construction_id: number
  quantity: number
  date_correction: number
  cutting_date: number
  samples_count: number
  sort_order?: number
}

export interface DendrochronologyDetail {
  dendrochronology: DendrochronologyApplication
  items: DendrochronologyConstructionItem[]
}

export interface ApplicationFilters {
  fromDate: string
  toDate: string
  status: string
  creatorLogin: string
}

const LOCAL_DRAFT_KEY = 'dendrochronology-local-draft'
const LOCAL_APPLICATIONS_KEY = 'dendrochronology-local-applications'
const EMPTY_CART: DendrochronologyCart = {
  hasDraft: false,
  constructionsCount: 0,
}

function isAuthError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return [401, 403].includes(error.response?.status ?? 0)
  }
  if (error && typeof error === 'object' && 'status' in error) {
    return [401, 403].includes(Number((error as { status?: unknown }).status))
  }
  return false
}

function normalizeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

function normalizeDateValue(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value
  if (typeof value === 'number' && Number.isFinite(value)) {
    const timestamp = value > 1_000_000_000_000 ? value : value * 1000
    return new Date(timestamp).toISOString()
  }
  return undefined
}

function firstDateField(data: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = normalizeDateValue(data[key])
    if (value) return value
  }
  return undefined
}

function normalizeApplication(value: unknown): DendrochronologyApplication {
  const data = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>
  return {
    dendrochronology_id: normalizeNumber(
      data.dendrochronology_id ?? data.id ?? data.application_id,
    ),
    status: typeof data.status === 'string' ? data.status : 'draft',
    created_at: firstDateField(data, [
      'created_at',
      'createdAt',
      'created_date',
      'createdDate',
      'creation_date',
      'creationDate',
      'date_created',
      'create_date',
      'date_create',
      'dateCreate',
      'dateCreated',
      'created',
    ]),
    creator_login: typeof data.creator_login === 'string' ? data.creator_login : undefined,
    moderator_login:
      typeof data.moderator_login === 'string' ? data.moderator_login : null,
    forming_date:
      firstDateField(data, [
        'forming_date',
        'formingDate',
        'formation_date',
        'formationDate',
        'formed_at',
        'formedAt',
        'formed_date',
        'form_date',
        'formDate',
        'date_forming',
        'date_formation',
        'date_form',
        'date_formed',
        'dateFormed',
      ]) ?? null,
    finish_date:
      firstDateField(data, [
        'finish_date',
        'finishDate',
        'finished_at',
        'finishedAt',
        'completion_date',
        'completionDate',
        'completed_at',
        'completedAt',
        'closed_at',
        'closedAt',
        'date_finish',
        'date_finished',
        'date_completed',
        'dateCompleted',
      ]) ?? null,
    title: typeof data.title === 'string' ? data.title : null,
    build_year: normalizeNumber(data.build_year ?? data.buildYear ?? data.build_date, undefined),
    constructions_count: normalizeNumber(data.constructions_count, undefined),
    incomplete_items_count: normalizeNumber(data.incomplete_items_count, undefined),
  }
}

function normalizeItem(value: unknown): DendrochronologyConstructionItem {
  const data = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>
  return {
    item_id: normalizeNumber(data.item_id ?? data.itemId ?? data.ID, undefined),
    dendrochronology_id: normalizeNumber(data.dendrochronology_id ?? data.application_id),
    construction_id: normalizeNumber(data.construction_id ?? data.constructionId ?? data.id),
    quantity: Math.max(1, normalizeNumber(data.quantity ?? data.count ?? data.samples_count, 1)),
    date_correction: normalizeNumber(data.date_correction ?? data.dateCorrection, 0),
    cutting_date: normalizeNumber(data.cutting_date ?? data.cuttingDate, 0),
    samples_count: Math.max(
      1,
      normalizeNumber(data.samples_count ?? data.samplesCount ?? data.quantity ?? data.count, 1),
    ),
    sort_order: normalizeNumber(data.sort_order, undefined),
  }
}

function normalizeDetail(value: unknown): DendrochronologyDetail | null {
  if (!value || typeof value !== 'object') return null
  const data = value as Record<string, unknown>
  const appValue = data.dendrochronology ?? data.application ?? data.department_application ?? data
  const itemsValue = data.items ?? data.constructions ?? []
  if (!Array.isArray(itemsValue)) return null

  return {
    dendrochronology: normalizeApplication(appValue),
    items: itemsValue.map(normalizeItem),
  }
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function getLocalDraft(): DendrochronologyDetail | null {
  return readJson<DendrochronologyDetail | null>(LOCAL_DRAFT_KEY, null)
}

function saveLocalDraft(detail: DendrochronologyDetail | null): void {
  if (!detail) {
    localStorage.removeItem(LOCAL_DRAFT_KEY)
    return
  }
  writeJson(LOCAL_DRAFT_KEY, detail)
}

function getLocalApplications(): DendrochronologyDetail[] {
  return readJson<DendrochronologyDetail[]>(LOCAL_APPLICATIONS_KEY, [])
}

function localDetailById(id: number): DendrochronologyDetail | null {
  const draft = getLocalDraft()
  if (draft?.dendrochronology.dendrochronology_id === id) return draft
  return (
    getLocalApplications().find(
      (item) => item.dendrochronology.dendrochronology_id === id,
    ) ?? null
  )
}

function refreshLocalCount(detail: DendrochronologyDetail): DendrochronologyDetail {
  return {
    ...detail,
    dendrochronology: {
      ...detail.dendrochronology,
      constructions_count: detail.items.length,
      incomplete_items_count: detail.items.filter((item) => item.quantity <= 0).length,
    },
  }
}

function localCartPayload(): DendrochronologyCart {
  const draft = getLocalDraft()
  return {
    hasDraft: Boolean(draft),
    constructionsCount: draft?.items.length ?? 0,
    id: draft?.dendrochronology.dendrochronology_id,
    incompleteItemsCount: draft?.dendrochronology.incomplete_items_count ?? 0,
  }
}

async function requestFirst<T>(
  variants: Array<() => Promise<{ data: T }>>,
): Promise<T> {
  let lastError: unknown
  for (const variant of variants) {
    try {
      const response = await variant()
      return response.data
    } catch (error) {
      lastError = error
      if (isAuthError(error)) throw error
    }
  }
  throw lastError
}

function generatedResponse<T>(request: () => Promise<{ data: T }>): () => Promise<{ data: T }> {
  return request
}

export async function getDendrochronologyCart(): Promise<DendrochronologyCart> {
  try {
    const data = await requestFirst<unknown>([
      generatedResponse(() => api.dendrochronologies.cartList()),
    ])
    const value = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
    const count = normalizeNumber(value.constructions_count ?? value.constructionsCount)
    const id = value.dendrochronology_id ?? value.id
    const cart: DendrochronologyCart = {
      ...EMPTY_CART,
      hasDraft: value.status !== 'no_draft' && count > 0,
      constructionsCount: count,
      id: typeof id === 'number' ? id : undefined,
      incompleteItemsCount: normalizeNumber(value.incomplete_items_count, undefined),
    }
    if (!cart.hasDraft) saveLocalDraft(null)
    return cart
  } catch (error) {
    void error
    return localCartPayload()
  }
}

export async function addConstructionToDraft(
  constructionId: number,
): Promise<DendrochronologyCart> {
  await requestFirst<unknown>([
    generatedResponse(() =>
      api.constructions.addToDendrochronologyCreate(constructionId),
    ),
  ])

  return getDendrochronologyCart()
}

export async function getDendrochronologyDetail(
  applicationId: number,
): Promise<DendrochronologyDetail> {
  try {
    const data = await requestFirst<unknown>([
      generatedResponse(() => api.dendrochronologies.dendrochronologiesDetail(applicationId)),
    ])
    const detail = normalizeDetail(data)
    if (!detail) throw new Error('Неверный ответ сервера')
    return detail
  } catch (error) {
    if (isAuthError(error)) throw error
    const detail = localDetailById(applicationId)
    if (detail) return detail
    throw error
  }
}

export async function listDendrochronologies(
  filters: ApplicationFilters,
): Promise<DendrochronologyApplication[]> {
  try {
    const params: Record<string, string> = {}
    if (filters.fromDate) params.from_date = filters.fromDate
    if (filters.toDate) params.to_date = filters.toDate
    if (filters.status) params.status = filters.status
    const data = await requestFirst<unknown>([
      generatedResponse(() =>
        api.dendrochronologies.dendrochronologiesList({
          from_date: params.from_date,
          to_date: params.to_date,
          status: params.status,
        }),
      ),
    ])
    const rows = Array.isArray(data) ? data : []
    return rows.map(normalizeApplication)
  } catch (error) {
    if (isAuthError(error)) throw error
    const rows = getLocalApplications().map((item) => item.dendrochronology)
    const draft = getLocalDraft()
    if (draft) rows.unshift(draft.dendrochronology)
    return rows
  }
}

export async function updateDendrochronologyItem(
  applicationId: number,
  constructionId: number,
  body: {
    itemId?: number
    dateCorrection: number
    cuttingDate: number
    samplesCount: number
  },
): Promise<void> {
  const detail = localDetailById(applicationId)
  if (detail) {
    const next = {
      ...detail,
      items: detail.items.map((item) =>
        item.construction_id === constructionId
          ? {
              ...item,
              quantity: body.samplesCount,
              date_correction: body.dateCorrection,
              cutting_date: body.cuttingDate,
              samples_count: body.samplesCount,
            }
          : item,
      ),
    }
    if (['draft', 'черновик'].includes(next.dendrochronology.status.toLowerCase())) {
      saveLocalDraft(refreshLocalCount(next))
    }
  }

  await requestFirst<unknown>([
    generatedResponse(() =>
      api.dendrochronologyConstructions.dendrochronologyConstructionsUpdate(
        constructionId,
        applicationId,
        {
          samples_count: body.samplesCount,
          cutting_date: String(body.cuttingDate),
          date_correction: String(body.dateCorrection),
        },
      ),
    ),
  ])
}

export async function removeDendrochronologyItem(
  applicationId: number,
  constructionId: number,
): Promise<void> {
  await requestFirst<unknown>([
    generatedResponse(() =>
      api.dendrochronologyConstructions.dendrochronologyConstructionsDelete(
        constructionId,
        applicationId,
      ),
    ),
  ])
}

export async function saveDendrochronologyApplication(
  applicationId: number,
  title: string,
): Promise<void> {
  try {
    await requestFirst<unknown>([
      generatedResponse(() =>
        api.dendrochronologies.dendrochronologiesUpdate(applicationId, {}),
      ),
    ])
  } catch (error) {
    void title
    if (isAuthError(error)) throw error
    const detail = localDetailById(applicationId)
    if (!detail) return
    const next = {
      ...detail,
      dendrochronology: { ...detail.dendrochronology, title },
    }
    if (next.dendrochronology.status === 'draft') saveLocalDraft(next)
  }
}

export async function formDendrochronologyApplication(applicationId: number): Promise<void> {
  await requestFirst<unknown>([
    generatedResponse(() =>
      api.dendrochronologies.formUpdate(applicationId),
    ),
  ])
  const detail = getLocalDraft()
  if (detail?.dendrochronology.dendrochronology_id === applicationId) saveLocalDraft(null)
}

export async function deleteDendrochronologyApplication(applicationId: number): Promise<void> {
  await requestFirst<unknown>([
    generatedResponse(() =>
      api.dendrochronologies.dendrochronologiesDelete(applicationId),
    ),
  ])

  const draft = getLocalDraft()
  if (draft?.dendrochronology.dendrochronology_id === applicationId) {
    saveLocalDraft(null)
  }
}

export async function finishDendrochronologyApplication(
  applicationId: number,
  status: string,
): Promise<void> {
  const localizedStatus =
    status === 'completed' ? 'завершён' : status === 'rejected' ? 'отклонён' : status

  await requestFirst<unknown>([
    generatedResponse(() =>
      api.dendrochronologies.finishUpdate(applicationId, { status: localizedStatus }),
    ),
  ])
}

export function getConstructionTitle(constructionId: number): string {
  return (
    CONSTRUCTIONS_MOCK.find((construction) => construction.id === constructionId)?.title ??
    `Конструкция ${constructionId}`
  )
}
