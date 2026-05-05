import type { Construction } from './constructionsApi'
import { CONSTRUCTIONS_MOCK } from './mock'

export const CLIP_MODEL_ID = 'Xenova/clip-vit-base-patch32'
export const CLIP_SEARCH_THRESHOLD_DEFAULT = 0.58
export const CLIP_SEARCH_TOP_K_DEFAULT = 4
export const CLIP_SEARCH_THRESHOLD_MIN = 0.4
export const CLIP_SEARCH_THRESHOLD_MAX = 0.9

const FALLBACK_CLIP_DESCRIPTION =
  'Traditional timber heritage element documented for visual search and comparison.'

export interface ClipSearchConstruction extends Construction {
  clipDescriptionEn: string
  similarityScore: number | null
}

export function getClipDescriptionEn(
  construction: Pick<Construction, 'id' | 'short_description_en'>
): string {
  const apiDescription = construction.short_description_en?.trim()
  if (apiDescription) return apiDescription

  const mockDescription = CONSTRUCTIONS_MOCK.find(
    (item) => item.id === construction.id
  )?.short_description_en?.trim()

  return mockDescription || FALLBACK_CLIP_DESCRIPTION
}

export function buildClipSearchConstruction(construction: Construction): ClipSearchConstruction {
  return {
    ...construction,
    clipDescriptionEn: getClipDescriptionEn(construction),
    similarityScore: null,
  }
}
