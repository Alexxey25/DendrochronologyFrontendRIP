import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
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
import defaultImage from '../../assets/constructions/default_image.jpg'
import defaultVideo from '../../assets/constructions/defaultVideo.mp4'
import './ConstructionPage.css'

export default function ConstructionPage() {
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((state) => state.user)
  const { cart, detail } = useAppSelector((state) => state.dendrochronology)
  const isBusy = useAppSelector(
    (state) => state.dendrochronology.applicationMutationLoading,
  )
  const [construction, setConstruction] = useState<Construction | undefined>()
  const [isLoading, setIsLoading] = useState(true)

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
    if (!isAuthenticated || !cart.hasDraft || !cart.id) return
    const loadedId = detail?.dendrochronology?.dendrochronology_id
    if (loadedId !== cart.id) {
      void dispatch(fetchDendrochronologyDetail(cart.id))
    }
  }, [isAuthenticated, cart.hasDraft, cart.id, detail?.dendrochronology?.dendrochronology_id, dispatch])

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
          <video
            autoPlay
            muted
            loop
            playsInline
            className="product-video"
            poster={construction.image_url || defaultImage}
          >
            <source src={construction.video_url || defaultVideo} type="video/mp4" />
          </video>
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
