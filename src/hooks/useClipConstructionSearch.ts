import { useEffect, useMemo, useRef, useState } from 'react'
import type { Construction } from '../modules/constructionsApi'
import {
  buildClipSearchConstruction,
  CLIP_SEARCH_THRESHOLD_DEFAULT,
  CLIP_SEARCH_TOP_K_DEFAULT,
  type ClipSearchConstruction,
} from '../modules/constructionClip'
import { cosineSimilarity, normalizeCosineSimilarity } from '../modules/math'

type EmbeddingsById = Record<number, number[]>

type WorkerOutgoingMessage =
  | { type: 'ready' }
  | { type: 'text_embeddings_ready'; data: EmbeddingsById }
  | { type: 'image_embedding_ready'; data: number[] }
  | { type: 'error'; data: string }

export function useClipConstructionSearch(constructions: Construction[]) {
  const workerRef = useRef<Worker | null>(null)
  const previewUrlRef = useRef<string | null>(null)

  const [isModelReady, setIsModelReady] = useState(false)
  const [modelError, setModelError] = useState<string | null>(null)
  const [isIndexing, setIsIndexing] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [imageEmbedding, setImageEmbedding] = useState<number[] | null>(null)
  const [textEmbeddings, setTextEmbeddings] = useState<EmbeddingsById>({})
  const [threshold, setThreshold] = useState(CLIP_SEARCH_THRESHOLD_DEFAULT)
  const [topK, setTopK] = useState(CLIP_SEARCH_TOP_K_DEFAULT)

  const clipItems = useMemo(
    () => constructions.map((construction) => buildClipSearchConstruction(construction)),
    [constructions]
  )
  // инициализация и получение текстовых векторов
  useEffect(() => {
    const worker = new Worker(new URL('../workers/clipSearch.worker.ts', import.meta.url), {
      type: 'module',
    })

    workerRef.current = worker

    worker.onmessage = (event: MessageEvent<WorkerOutgoingMessage>) => {
      const message = event.data

      switch (message.type) {
        case 'ready':
          setModelError(null)
          setIsModelReady(true)
          break
        case 'text_embeddings_ready':
          setTextEmbeddings(message.data)
          setIsIndexing(false)
          break
        case 'image_embedding_ready':
          setImageEmbedding(message.data)
          setIsSearching(false)
          break
        case 'error':
          console.error('[CLIP]', message.data)
          setModelError(message.data)
          setIsSearching(false)
          setIsIndexing(false)
          break
      }
    }

    worker.onerror = (event) => {
      const detail = event.message || 'CLIP worker crashed'
      console.error('[CLIP]', detail, event)
      setModelError(detail)
      setIsSearching(false)
      setIsIndexing(false)
    }

    worker.postMessage({ type: 'init' })

    return () => {
      worker.terminate()
      workerRef.current = null

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])
  // логика индексации и сортировки
  useEffect(() => {
    if (!workerRef.current || clipItems.length === 0) {
      setTextEmbeddings({})
      setIsIndexing(false)
      return
    }

    setIsIndexing(true)
    workerRef.current.postMessage({
      type: 'index_text',
      data: clipItems.map((item) => ({
        id: item.id,
        clipDescriptionEn: item.clipDescriptionEn,
      })),
    })
  }, [clipItems])

  useEffect(() => {
    if (clipItems.length > 0 && topK > clipItems.length) {
      setTopK(clipItems.length)
    }
  }, [clipItems.length, topK])

  const visibleConstructions = useMemo<ClipSearchConstruction[]>(() => {
    if (!imageEmbedding) {
      return clipItems
    }

    return clipItems
      .map((item) => {
        const embedding = textEmbeddings[item.id]
        const similarityScore = embedding
          ? normalizeCosineSimilarity(cosineSimilarity(imageEmbedding, embedding))
          : 0

        return {
          ...item,
          similarityScore,
        }
      })
      .filter((item) => item.similarityScore !== null && item.similarityScore >= threshold)
      .sort((left, right) => (right.similarityScore ?? 0) - (left.similarityScore ?? 0))
      .slice(0, topK)
  }, [clipItems, imageEmbedding, textEmbeddings, threshold, topK])

  const bestSimilarityScore = useMemo(() => {
    if (!imageEmbedding || visibleConstructions.length > 0) {
      return visibleConstructions[0]?.similarityScore ?? null
    }

    const rankedScores = clipItems
      .map((item) => {
        const embedding = textEmbeddings[item.id]
        return embedding ? normalizeCosineSimilarity(cosineSimilarity(imageEmbedding, embedding)) : 0
      })
      .sort((left, right) => right - left)

    return rankedScores[0] ?? null
  }, [clipItems, imageEmbedding, textEmbeddings, visibleConstructions])

  function searchByImage(file: File) {
    if (!workerRef.current) {
      return
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }

    const nextPreviewUrl = URL.createObjectURL(file)
    previewUrlRef.current = nextPreviewUrl
    setSelectedImageUrl(nextPreviewUrl)
    setIsSearching(true)

    workerRef.current.postMessage({
      type: 'search_image',
      data: file,
    })
  }

  function resetImageSearch() {
    setImageEmbedding(null)
    setIsSearching(false)

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }

    setSelectedImageUrl(null)
  }

  return {
    visibleConstructions,
    selectedImageUrl,
    imageSearchActive: imageEmbedding !== null,
    isModelReady,
    modelError,
    isIndexing,
    isSearching,
    bestSimilarityScore,
    threshold,
    setThreshold,
    topK,
    setTopK,
    searchByImage,
    resetImageSearch,
  }
}
