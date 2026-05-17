import { CONSTRUCTIONS_MOCK } from './mock'
import { apiHttp } from '../api/http'
import { minioConstructionBaseUrl } from '../config/backendConstants'

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

const MINIO_PREVIEW_BASE_URL = minioConstructionBaseUrl

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
  try {
    const searchParams = new URLSearchParams()
    if (query.trim()) {
      searchParams.set('query', query.trim())
    }

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : ''
    const response = await apiHttp.get<ConstructionResponseDto[]>(`constructions${qs}`)
    const data = response.data
    return data.map(normalizeConstruction).filter((construction) => !construction.is_delete)
  } catch {
    return filterMockConstructions(query)
  }
}

export async function fetchConstructionById(id: number): Promise<Construction | undefined> {
  try {
    const response = await apiHttp.get<ConstructionResponseDto>(`constructions/${id}`)
    const data = response.data
    return normalizeConstruction(data)
  } catch {
    return CONSTRUCTIONS_MOCK.find((construction) => construction.id === id)
  }
}