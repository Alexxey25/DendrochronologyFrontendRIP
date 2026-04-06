import ConstructionCard from '../ConstructionCard/ConstructionCard'
import type { Construction } from '../../modules/constructionsApi'
import './ConstructionsList.css'

export default function ConstructionsList({ constructions }: { constructions: Construction[] }) {
  return (
    <div className="cards-grid">
      {constructions.map((construction) => (
        <ConstructionCard key={construction.id} construction={construction} />
      ))}
    </div>
  )
}
