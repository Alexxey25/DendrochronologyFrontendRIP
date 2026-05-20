import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { Form } from 'react-bootstrap'
import Header from '../../components/Header/Header'
import ConstructionsList from '../../components/ConstructionsList/ConstructionsList'
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs'
import { ROUTE_LABELS } from '../../Routes'
import { fetchConstructions } from '../../modules/constructionsApi'
import type { Construction } from '../../modules/constructionsApi'
import {
  CLIP_SEARCH_THRESHOLD_MAX,
  CLIP_SEARCH_THRESHOLD_MIN,
} from '../../modules/constructionClip'
import { useClipConstructionSearch } from '../../hooks/useClipConstructionSearch'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchDendrochronologyCart } from '../../store/slices/dendrochronologySlice'
import {
  clearServicesFilter,
  setServicesFilterQuery,
} from '../../store/slices/servicesFilterSlice'
import cartIcon from '../../assets/cart_icon.png'
import './ConstructionsPage.css'

export default function ConstructionsPage() {
  const dispatch = useAppDispatch()
  const appliedQuery = useAppSelector((state) => state.servicesFilter.appliedQuery)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [searchDraft, setSearchDraft] = useState(appliedQuery)
  const [constructions, setConstructions] = useState<Construction[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const { cart, cartLoading } = useAppSelector((state) => state.dendrochronology)
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)
  const {
    visibleConstructions,
    selectedImageUrl,
    imageSearchActive,
    isModelReady,
    modelError,
    isSearching,
    bestSimilarityScore,
    threshold,
    setThreshold,
    topK,
    setTopK,
    searchByImage,
    resetImageSearch,
  } = useClipConstructionSearch(constructions)

  useEffect(() => {
    setSearchDraft(appliedQuery)
  }, [appliedQuery])

  const searchSuggestions = useMemo(() => {
    const q = searchDraft.trim().toLowerCase()
    const pool = q
      ? constructions.filter((c) => c.title.toLowerCase().includes(q))
      : constructions
    const titles = pool.slice(0, 20).map((c) => c.title)
    return [...new Set(titles)]
  }, [constructions, searchDraft])

  const handleCatalogReset = () => {
    dispatch(clearServicesFilter())
    setSearchDraft('')
    resetImageSearch()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSearch = () => {
    dispatch(setServicesFilterQuery(searchDraft))
  }

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    searchByImage(file)
  }

  const handleResetImageSearch = () => {
    resetImageSearch()

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  useEffect(() => {
    let isCancelled = false

    async function loadConstructions() {
      setSearchLoading(true)

      const constructionsResult = await fetchConstructions(appliedQuery)

      if (isCancelled) return

      setConstructions(constructionsResult)
      setSearchLoading(false)
    }

    void loadConstructions()

    return () => {
      isCancelled = true
    }
  }, [appliedQuery])

  useEffect(() => {
    void dispatch(fetchDendrochronologyCart())
  }, [dispatch, isAuthenticated])

  const topKUpperBound =
    constructions.length > 0 ? constructions.length : Math.max(topK, 1)

  return (
    <div className="mainpage">
      <Header
        searchQuery={searchDraft}
        onQueryChange={setSearchDraft}
        onSearch={handleSearch}
        searchLoading={searchLoading}
        onCatalogReset={handleCatalogReset}
        searchSuggestions={searchSuggestions}
      />
      <BreadCrumbs crumbs={[{ label: ROUTE_LABELS.CONSTRUCTIONS }]} />
      <section className="clip-search-panel">
        <div className="clip-search-panel__header">
          <p className="clip-search-panel__title">AI поиск конструкций</p>
          <p className="clip-search-panel__subtitle">Загрузите фото, чтобы найти похожие конструкции.</p>
          {modelError ? (
            <p className="clip-search-panel__status clip-search-panel__status--error" role="alert">
              Модель CLIP не загрузилась: {modelError}
            </p>
          ) : null}
        </div>

        <div className="clip-search-panel__body">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="clip-search-panel__file-input"
            onChange={handleImageUpload}
          />

          <div className="clip-search-panel__preview">
            {selectedImageUrl ? (
              <img src={selectedImageUrl} alt="Search query" className="clip-search-panel__image" />
            ) : (
              <div className="clip-search-panel__placeholder">Изображение не выбрано</div>
            )}
          </div>

          <div className="clip-search-panel__controls">
            <div className="clip-search-panel__buttons">
              <button
                type="button"
                className="clip-search-panel__btn clip-search-panel__btn--primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={!isModelReady || isSearching}
              >
                {isSearching ? 'Поиск…' : 'Загрузить фото'}
              </button>
              <button
                type="button"
                className="clip-search-panel__btn clip-search-panel__btn--outline"
                onClick={handleResetImageSearch}
                disabled={!imageSearchActive && !selectedImageUrl}
              >
                Сбросить
              </button>
            </div>

            <Form.Group className="clip-search-panel__field">
              <Form.Label>Threshold: {threshold.toFixed(2)}</Form.Label>
              <Form.Range
                min={CLIP_SEARCH_THRESHOLD_MIN}
                max={CLIP_SEARCH_THRESHOLD_MAX}
                step={0.01}
                value={threshold}
                onChange={(event) => setThreshold(Number(event.target.value))}
              />
            </Form.Group>

            <Form.Group className="clip-search-panel__field">
              <Form.Label>TopK (1–{topKUpperBound})</Form.Label>
              <Form.Control
                type="number"
                min={1}
                max={topKUpperBound}
                step={1}
                inputMode="numeric"
                value={topK}
                disabled={constructions.length === 0}
                onChange={(event) => {
                  const parsed = Number.parseInt(event.target.value, 10)
                  if (Number.isNaN(parsed)) {
                    return
                  }
                  setTopK(Math.min(Math.max(1, parsed), topKUpperBound))
                }}
              />
            </Form.Group>
          </div>
        </div>
      </section>

      {visibleConstructions.length > 0 ? (
        <ConstructionsList constructions={visibleConstructions} />
      ) : (
        <p className="no-results">
          {imageSearchActive
            ? `No similar cards found for threshold ${threshold.toFixed(2)}.${
                bestSimilarityScore !== null
                  ? ` Best current match scored ${bestSimilarityScore.toFixed(2)}.`
                  : ''
              }`
            : searchLoading
              ? 'Загрузка…'
              : `По запросу «${appliedQuery}» конструкции не найдены`}
        </p>
      )}

      {cart.hasDraft && cart.id ? (
        <Link className="cart-badge" to={`/dendrochronology/${cart.id}`}>
          <img src={cartIcon} className="cart-icon" alt="заявка" />
          <span className="cart-count">{cart.constructionsCount}</span>
        </Link>
      ) : (
        <div
          className="cart-badge cart-inactive"
          title={
            cartLoading
              ? 'Проверяем черновик заявки'
              : 'Черновик появится после добавления конструкции'
          }
        >
          <img src={cartIcon} className="cart-icon" alt="заявка" />
          <span className="cart-count">0</span>
        </div>
      )}
    </div>
  )
}
