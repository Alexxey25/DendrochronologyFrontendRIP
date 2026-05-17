import ConstructionCard from '../ConstructionCard/ConstructionCard'
import type { ClipSearchConstruction } from '../../modules/constructionClip'
import './ConstructionsList.css'

export default function ConstructionsList({
  constructions,
}: {
  constructions: ClipSearchConstruction[]
}) {
  return (
    <div className="cards-grid">
      {constructions.map((construction) => (
        <ConstructionCard key={construction.id} construction={construction} />
      ))}
    </div>
  )
}
