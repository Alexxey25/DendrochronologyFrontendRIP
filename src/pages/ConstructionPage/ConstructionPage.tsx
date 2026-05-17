import { useParams, Link } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs'
import { ROUTES, ROUTE_LABELS } from '../../Routes'
import HeaderApp from '../../components/HeaderApp/HeaderApp'
import { fetchConstructionById } from '../../modules/constructionsApi'
import type { Construction } from '../../modules/constructionsApi'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  addConstructionToDendrochronology,
  fetchDendrochronologyDetail,
} from '../../store/slices/dendrochronologySlice'
import { useSeamlessVideoLoop } from '../../hooks/useSeamlessVideoLoop'
import defaultImage from '../../assets/constructions/default_image.jpg'
import './ConstructionPage.css'

function fallbackVideoUrl(): string {
  const path = '/media/defaultVideo.mp4'
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`
  }
  return path
}

export default function ConstructionPage() {
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((state) => state.user)
  const { cart, detail } = useAppSelector((state) => state.dendrochronology)
  const detailLoading = useAppSelector((state) => state.dendrochronology.detailLoading)
  const isBusy = useAppSelector(
    (state) => state.dendrochronology.applicationMutationLoading,
  )
  const [construction, setConstruction] = useState<Construction | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [videoSrc, setVideoSrc] = useState('')
  const [hidePoster, setHidePoster] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const detailFetchOnceForCartRef = useRef<number | null>(null)

  const primaryVideoSrc = useMemo(() => {
    if (!construction) return ''
    return construction.video_url.trim() || fallbackVideoUrl()
  }, [construction])

  useEffect(() => {
    setHidePoster(false)
    setVideoSrc(primaryVideoSrc)
  }, [primaryVideoSrc])

  useSeamlessVideoLoop(videoRef, videoSrc)

  useEffect(() => {
    if (!id) return

    let isCancelled = false

    async function loadConstruction() {
      setIsLoading(true)

      const result = await fetchConstructionById(Number(id))
      if (isCancelled) return

      setConstruction(result)
      setIsLoading(false)
    }

    void loadConstruction()

    return () => {
      isCancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!isAuthenticated || !cart.hasDraft || !cart.id) {
      detailFetchOnceForCartRef.current = null
      return
    }

    const loadedId = detail?.dendrochronology?.dendrochronology_id
    if (loadedId === cart.id) {
      detailFetchOnceForCartRef.current = null
      return
    }

    if (detailLoading) return
    if (detailFetchOnceForCartRef.current === cart.id) return

    detailFetchOnceForCartRef.current = cart.id
    void dispatch(fetchDendrochronologyDetail(cart.id))
  }, [
    isAuthenticated,
    cart.hasDraft,
    cart.id,
    detail?.dendrochronology?.dendrochronology_id,
    detailLoading,
    dispatch,
  ])

  const isAlreadyInDraft =
    Boolean(
      construction &&
        cart.hasDraft &&
        cart.id &&
        detail?.dendrochronology?.dendrochronology_id === cart.id &&
        detail.items.some((item) => item.construction_id === construction.id),
    )

  const handleAdd = () => {
    if (!construction || !isAuthenticated || isBusy) return
    void dispatch(addConstructionToDendrochronology(construction.id))
  }

  const handleVideoError = () => {
    const fallback = fallbackVideoUrl()
    if (videoSrc !== fallback) {
      setVideoSrc(fallback)
    }
  }

  if (isLoading) {
    return (
      <div className="productpage">
        <HeaderApp />
        <div className="product-card">
          <p style={{ color: '#999' }}>Загрузка конструкции...</p>
        </div>
      </div>
    )
  }

  if (!construction) {
    return (
      <div className="productpage">
        <HeaderApp />
        <div className="product-card">
          <p style={{ color: '#999' }}>Конструкция не найдена</p>
          <Link to={ROUTES.CONSTRUCTIONS} className="btn-back">
            Вернуться к каталогу
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="productpage">
      <HeaderApp />
      <BreadCrumbs
        crumbs={[
          { label: ROUTE_LABELS.CONSTRUCTIONS, path: ROUTES.CONSTRUCTIONS },
          { label: construction.title },
        ]}
      />

      <div className="product-card">
        <div className="product-media-wrap">
          {videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              muted
              playsInline
              preload="auto"
              className="product-video"
              poster={
                hidePoster ? undefined : construction.image_url || defaultImage
              }
              onPlaying={() => setHidePoster(true)}
              onError={handleVideoError}
            />
          ) : null}
        </div>

        <div className="product-actions">
          {!isAlreadyInDraft ? (
            <button
              type="button"
              className="product-add-btn"
              onClick={handleAdd}
              disabled={!isAuthenticated || isBusy}
              title={
                isAuthenticated
                  ? 'Добавить в черновик заявки'
                  : 'Войдите, чтобы создать заявку'
              }
            >
              {isBusy ? 'Добавление...' : 'Добавить в заявку'}
            </button>
          ) : (
            <p className="product-in-draft-note">Уже в черновике заявки</p>
          )}
        </div>
      </div>
    </div>
  )
}
