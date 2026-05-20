import { CONSTRUCTIONS_MOCK } from './mock'
import { apiHttp } from '../api/http'
import { resolveMinioConstructionBase } from './apiUrl'
import { shouldUseMockOnly } from '../config/pagesRuntime'

export interface Construction {
  id: number
  title: string
  use_life: string
  description: string
  short_description_en?: string
  image_url: string
  video_url: string
  is_delete: boolean
}

interface ConstructionResponseDto {
  id: number
  construction_title: string
  use_life: string
  description: string
  short_description_en?: string
  image_url: string
  video_url: string
  is_delete: boolean
}

function minioBase(): string {
  return resolveMinioConstructionBase().replace(/\/constructions\/?$/, '')
}

function normalizeMediaUrl(value: string): string {
  if (!value) return ''
  const base = `${minioBase()}/constructions`
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value
  }
  if (value.startsWith('/')) return `${base}${value}`
  return `${base}/${value}`
}

function normalizeConstruction(dto: ConstructionResponseDto): Construction {
  return {
    id: dto.id,
    title: dto.construction_title,
    use_life: dto.use_life,
    description: dto.description,
    short_description_en: dto.short_description_en,
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

export async function fetchConstructions(query = ''): Promise<Construction[]> {
  if (shouldUseMockOnly()) {
    return filterMockConstructions(query)
  }

  try {
    const searchParams = new URLSearchParams()
    if (query.trim()) {
      searchParams.set('query', query.trim())
    }

    const path = `/constructions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const response = await apiHttp.get<ConstructionResponseDto[]>(path)
    return response.data.map(normalizeConstruction).filter((construction) => !construction.is_delete)
  } catch {
    return filterMockConstructions(query)
  }
}

export async function fetchConstructionById(id: number): Promise<Construction | undefined> {
  if (shouldUseMockOnly()) {
    return CONSTRUCTIONS_MOCK.find((construction) => construction.id === id)
  }

  try {
    const response = await apiHttp.get<ConstructionResponseDto>(`/constructions/${id}`)
    return normalizeConstruction(response.data)
  } catch {
    return CONSTRUCTIONS_MOCK.find((construction) => construction.id === id)
  }
}
