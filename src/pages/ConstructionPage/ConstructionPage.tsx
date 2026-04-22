import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { FC } from 'react'
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs'
import { ROUTES, ROUTE_LABELS } from '../../Routes'
import HeaderApp from '../../components/HeaderApp/HeaderApp'
import { fetchConstructionById } from '../../modules/constructionsApi'
import type { Construction } from '../../modules/constructionsApi'
import defaultImage from '../../assets/constructions/default_image.jpg'
import defaultVideo from '../../assets/constructions/defaultVideo.mp4'
import './ConstructionPage.css'

const ConstructionPage: FC = () => {
  const { id } = useParams()
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

        <div style={{ padding: '24px 0' }}>
          <h2>{construction.title}</h2>
          <p>
            <strong>Срок службы:</strong> {construction.use_life}
          </p>
          <p>{construction.description}</p>
        </div>
      </div>
    </div>
  )
}

export default ConstructionPage
