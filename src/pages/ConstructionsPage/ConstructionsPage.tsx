import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Button, Form } from 'react-bootstrap'
import Header from '../../components/Header/Header'
import ConstructionsList from '../../components/ConstructionsList/ConstructionsList'
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs'
import { ROUTE_LABELS } from '../../Routes'
import { fetchCartInfo, fetchConstructions } from '../../modules/constructionsApi'
import type { Construction } from '../../modules/constructionsApi'
import {
  CLIP_SEARCH_THRESHOLD_MAX,
  CLIP_SEARCH_THRESHOLD_MIN,
} from '../../modules/constructionClip'
import { useClipConstructionSearch } from '../../hooks/useClipConstructionSearch'
import cartIcon from '../../assets/cart_icon.png'
import './ConstructionsPage.css'

export default function ConstructionsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [constructions, setConstructions] = useState<Construction[]>([])
  const [cartCount, setCartCount] = useState(0)
  const [searchLoading, setSearchLoading] = useState(false)
  const {
    visibleConstructions,
    selectedImageUrl,
    imageSearchActive,
    isModelReady,
    isIndexing,
    isSearching,
    bestSimilarityScore,
    threshold,
    setThreshold,
    topK,
    setTopK,
    searchByImage,
    resetImageSearch,
  } = useClipConstructionSearch(constructions)

  const handleSearch = () => {
    setAppliedQuery(searchValue.trim())
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

      const [constructionsResult, cartResult] = await Promise.all([
        fetchConstructions(appliedQuery),
        fetchCartInfo(),
      ])

      if (isCancelled) return

      setConstructions(constructionsResult)
      setCartCount(cartResult.constructionsCount)
      setSearchLoading(false)
    }

    void loadConstructions()

    return () => {
      isCancelled = true
    }
  }, [appliedQuery])

  return (
    <div className="mainpage">
      <Header
        searchQuery={searchValue}
        onQueryChange={setSearchValue}
        onSearch={handleSearch}
        searchLoading={searchLoading}
      />
      <BreadCrumbs crumbs={[{ label: ROUTE_LABELS.CONSTRUCTIONS }]} />
      <section className="clip-search-panel">
        <div className="clip-search-panel__header">
          <p className="clip-search-panel__title">AI поиск конструкций</p>
          <p className="clip-search-panel__subtitle">Загрузите фото, чтобы найти похожие конструкции.</p>
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
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!isModelReady || isIndexing || isSearching}
              >
                {isSearching ? 'Searching...' : 'Загрузить изображение'}
              </Button>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={handleResetImageSearch}
                disabled={!imageSearchActive && !selectedImageUrl}
              >
                Сбросить
              </Button>
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
              <Form.Label>TopK</Form.Label>
              <Form.Select
                value={topK}
                onChange={(event) => setTopK(Number(event.target.value))}
              >
                {Array.from({ length: Math.max(constructions.length, 1) }, (_, index) => index + 1).map(
                  (value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  )
                )}
              </Form.Select>
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
            : `По запросу «${appliedQuery}» конструкции не найдены`}
        </p>
      )}

      <div className={`cart-badge${cartCount > 0 ? '' : ' cart-inactive'}`}>
        <img src={cartIcon} className="cart-icon" alt="корзина" />
        <span className="cart-count">{cartCount}</span>
      </div>
    </div>
  )
}
