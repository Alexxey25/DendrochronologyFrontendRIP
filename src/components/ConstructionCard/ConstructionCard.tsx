import { Link } from 'react-router-dom'
import type { FC } from 'react'
import type { Construction } from '../../modules/constructionsApi'
import defaultImage from '../../assets/constructions/default_image.jpg'
import './ConstructionCard.css'

interface Props {
  construction: Construction
}

const ConstructionCard: FC<Props> = ({ construction }) => (
  <div className="construction-card">
    <Link to={`/construction/${construction.id}`} className="card-link">
      <img
        src={construction.image_url || defaultImage}
        className="card-image"
      />
      <div className="card-info">
        <p className="card-title">{construction.title}</p>
        <p className="card-uselife">{construction.use_life}</p>
      </div>
    </Link>
    <div className="card-actions">
      <Link to={`/construction/${construction.id}`} className="btn-add-small btn-detail">
        Подробнее
      </Link>
    </div>
  </div>
)

export default ConstructionCard
