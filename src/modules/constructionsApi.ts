import { CONSTRUCTIONS_MOCK } from './mock'

export interface Construction {
  id: number
  title: string
  use_life: string
  description: string
  image_url: string
  video_url: string
  is_delete: boolean
}

interface ConstructionResponseDto {
  id: number
  construction_title: string
  use_life: string
  description: string
  image_url: string
  video_url: string
  is_delete: boolean
}

interface CartResponseDto {
  dendrochronology_id: number
  constructions_count: number
}

interface EmptyCartResponseDto {
  status: 'no_draft'
  constructions_count: number
}

const API_BASE_URL = '/api'
const MINIO_PREVIEW_BASE_URL = 'http://localhost:9090/constructions'
const EMPTY_CART = {
  constructionsCount: 0,
} as const

function normalizeMediaUrl(value: string): string {
  if (!value) return ''
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  if (value.startsWith('/')) return `${MINIO_PREVIEW_BASE_URL}${value}`
  return `${MINIO_PREVIEW_BASE_URL}/${value}`
}

function normalizeConstruction(dto: ConstructionResponseDto): Construction {
  return {
    id: dto.id,
    title: dto.construction_title,
    use_life: dto.use_life,
    description: dto.description,
    image_url: normalizeMediaUrl(dto.image_url),
    video_url: normalizeMediaUrl(dto.video_url),
    is_delete: dto.is_delete,
  }
}

function filterMockConstructions(query: string): Construction[] {
  const normalizedQuery = query.trim().toLowerCase()

  return CONSTRUCTIONS_MOCK.filter((construction) => {
    if (construction.is_delete) return false
    if (!normalizedQuery) return true
    return construction.title.toLowerCase().includes(normalizedQuery)
  })
}

async function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>
}

export async function fetchConstructions(query = ''): Promise<Construction[]> {
  try {
    const searchParams = new URLSearchParams()
    if (query.trim()) {
      searchParams.set('query', query.trim())
    }

    const url = `${API_BASE_URL}/constructions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status} for constructions list`)
    }

    const data = await parseJson<ConstructionResponseDto[]>(response)
    return data.map(normalizeConstruction).filter((construction) => !construction.is_delete)
  } catch {
    return filterMockConstructions(query)
  }
}

export async function fetchConstructionById(id: number): Promise<Construction | undefined> {
  try {
    const response = await fetch(`${API_BASE_URL}/constructions/${id}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status} for construction ${id}`)
    }

    const data = await parseJson<ConstructionResponseDto>(response)
    return normalizeConstruction(data)
  } catch {
    return CONSTRUCTIONS_MOCK.find((construction) => construction.id === id)
  }
}

export async function fetchCartInfo(): Promise<{ constructionsCount: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/dendrochronologies/cart`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    })

    if (response.status === 401) {
      return EMPTY_CART
    }

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status} for cart info`)
    }

    const data = await parseJson<CartResponseDto | EmptyCartResponseDto>(response)
    if ('status' in data && data.status === 'no_draft') {
      return EMPTY_CART
    }

    const cart = data as CartResponseDto
    return {
      constructionsCount: cart.constructions_count,
    }
  } catch {
    return EMPTY_CART
  }
}
