import { Link } from 'react-router-dom'
import type { ClipSearchConstruction } from '../../modules/constructionClip'
import defaultImage from '../../assets/constructions/default_image.jpg'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addConstructionToDendrochronology } from '../../store/slices/dendrochronologySlice'
import './ConstructionCard.css'

interface Props {
  construction: ClipSearchConstruction
}

export default function ConstructionCard({ construction }: Props) {
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((state) => state.user)
  const isBusy = useAppSelector(
    (state) => state.dendrochronology.applicationMutationLoading,
  )

  const handleAdd = () => {
    if (!isAuthenticated || isBusy) return
    void dispatch(addConstructionToDendrochronology(construction.id))
  }

  return (
    <div className="construction-card">
      <Link to={`/construction/${construction.id}`} className="card-link">
        <img
          src={construction.image_url || defaultImage}
          className="card-image"
          alt={construction.title}
        />
        <div className="card-info">
          <p className="card-title">{construction.title}</p>
          <p className="card-uselife">{construction.use_life}</p>
          <p className="card-description">{construction.description}</p>
          {construction.similarityScore !== null && (
            <p className="card-similarity">
              Сходство: {(construction.similarityScore * 100).toFixed(1)}%
            </p>
          )}
        </div>
      </Link>
      <div className="card-actions">
        <Link to={`/construction/${construction.id}`} className="btn-add-small btn-detail">
          Подробнее
        </Link>
        <button
          type="button"
          className="btn-add-small"
          onClick={handleAdd}
          disabled={!isAuthenticated || isBusy}
          title={
            isAuthenticated
              ? 'Добавить в черновик заявки'
              : 'Войдите, чтобы создать заявку'
          }
        >
          {isBusy ? 'Добавление...' : 'Добавить'}
        </button>
      </div>
    </div>
  )
}
