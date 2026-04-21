import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { FC } from 'react'
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs'
import { ROUTES, ROUTE_LABELS } from '../../Routes'
import HeaderApp from '../../components/HeaderApp/HeaderApp'
import { CONSTRUCTIONS_MOCK } from '../../modules/mock'
import type { Construction } from '../../modules/constructionsApi'
import defaultImage from '../../assets/constructions/default_image.jpg'
import defaultVideo from '../../assets/constructions/defaultVideo.mp4'
import './ConstructionPage.css'

const ConstructionPage: FC = () => {
  const { id } = useParams()
  const [construction, setConstruction] = useState<Construction | undefined>()

  useEffect(() => {
    if (!id) return
    setConstruction(
      CONSTRUCTIONS_MOCK.find((c) => c.id === Number(id))
    )
  }, [id])

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
      </div>
    </div>
  )
}

export default ConstructionPage
