import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import HeaderApp from '../../components/HeaderApp/HeaderApp'
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs'
import { ROUTES, ROUTE_LABELS } from '../../Routes'
import { fetchConstructions, type Construction } from '../../modules/constructionsApi'
import { getConstructionTitle } from '../../modules/dendrochronologiesApi'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  deleteDendrochronologyDraft,
  fetchDendrochronologyDetail,
  formDendrochronologyDraft,
  removeConstructionFromDendrochronology,
  saveDendrochronologyDraft,
} from '../../store/slices/dendrochronologySlice'
import defaultImage from '../../assets/constructions/default_image.jpg'
import './DendrochronologyApplicationPage.css'

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Черновик',
    черновик: 'Черновик',
    formed: 'Сформирована',
    сформирован: 'Сформирована',
    сформирована: 'Сформирована',
    completed: 'Завершена',
    завершён: 'Завершена',
    завершен: 'Завершена',
    rejected: 'Отклонена',
    отклонён: 'Отклонена',
    отклонен: 'Отклонена',
    deleted: 'Удалена',
    удалён: 'Удалена',
    удален: 'Удалена',
  }
  return labels[status.toLowerCase()] ?? status
}

function isDraftStatus(status: string | undefined): boolean {
  return ['draft', 'черновик'].includes((status ?? '').toLowerCase())
}

type LineFields = Record<
  number,
  { dateCorrection: string; cuttingDate: string; samplesCount: string }
>

function fieldValue(value: number, emptyWhenZero = true): string {
  if (emptyWhenZero && value === 0) return ''
  return String(value)
}

function parseFieldNumber(value: string | undefined, fallback: number, emptyValue: number): number {
  if (value === undefined) return fallback
  if (value.trim() === '') return emptyValue

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export default function DendrochronologyApplicationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isAuthenticated, login } = useAppSelector((state) => state.user)
  const { detail, detailLoading, detailError, applicationMutationLoading, itemMutationLoading } =
    useAppSelector((state) => state.dendrochronology)
  const [constructions, setConstructions] = useState<Construction[]>([])
  const [lineFields, setLineFields] = useState<LineFields>({})

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.SIGN_IN, { replace: true })
      return
    }
    if (id) void dispatch(fetchDendrochronologyDetail(Number(id)))
  }, [dispatch, id, isAuthenticated, navigate])

  useEffect(() => {
    fetchConstructions()
      .then(setConstructions)
      .catch(() => setConstructions([]))
  }, [])

  const constructionById = useMemo(() => {
    const map = new Map<number, Construction>()
    constructions.forEach((construction) => map.set(construction.id, construction))
    return map
  }, [constructions])

  const app = detail?.dendrochronology
  const isDraft = isDraftStatus(app?.status)
  const isOwnDraft = !app?.creator_login || app.creator_login === login
  const canEditDraft = Boolean(isDraft && isOwnDraft)
  const applicationId = app?.dendrochronology_id

  const sortedItems = useMemo(() => {
    return [...(detail?.items ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  }, [detail?.items])

  useEffect(() => {
    if (!detail) return
    setLineFields(
      Object.fromEntries(
        detail.items.map((item) => [
          item.construction_id,
          {
            dateCorrection: fieldValue(Math.max(0, item.date_correction)),
            cuttingDate: fieldValue(Math.max(0, item.cutting_date)),
            samplesCount: fieldValue(Math.max(1, item.samples_count || item.quantity), false),
          },
        ]),
      ),
    )
  }, [detail])

  const buildYear = useMemo(() => {
    if (app?.build_year && app.build_year > 0) return app.build_year
    const calculatedYears = sortedItems
      .map((item) => {
        const fields = lineFields[item.construction_id]
        const cuttingDate = parseFieldNumber(fields?.cuttingDate, item.cutting_date, 0)
        const correction = parseFieldNumber(fields?.dateCorrection, item.date_correction, 0)
        return cuttingDate > 0 ? cuttingDate + correction : 0
      })
      .filter((year) => year > 0)

    return calculatedYears.length > 0 ? Math.max(...calculatedYears) : 0
  }, [app?.build_year, lineFields, sortedItems])

  const updateLineField = (
    constructionId: number,
    field: 'dateCorrection' | 'cuttingDate' | 'samplesCount',
    value: string,
  ) => {
    setLineFields((prev) => ({
      ...prev,
      [constructionId]: {
        dateCorrection: prev[constructionId]?.dateCorrection ?? '',
        cuttingDate: prev[constructionId]?.cuttingDate ?? '',
        samplesCount: prev[constructionId]?.samplesCount ?? '1',
        [field]: value,
      },
    }))
  }

  const itemsPayload = () =>
    sortedItems.map((item) => {
      const fields = lineFields[item.construction_id]
      return {
        constructionId: item.construction_id,
        itemId: item.item_id,
        dateCorrection: parseFieldNumber(fields?.dateCorrection, item.date_correction, 0),
        cuttingDate: parseFieldNumber(fields?.cuttingDate, item.cutting_date, 0),
        samplesCount: Math.max(
          1,
          parseFieldNumber(fields?.samplesCount, item.samples_count ?? item.quantity, 1),
        ),
      }
    })

  const handleSave = async () => {
    if (!applicationId || !detail || !canEditDraft) return
    try {
      await dispatch(
        saveDendrochronologyDraft({
          applicationId,
          title: 'Датировка деревянных конструкций',
          items: itemsPayload(),
        }),
      ).unwrap()
    } catch {
      void 0
    }
  }

  const handleRemoveConstruction = async (constructionId: number) => {
    if (!applicationId || !canEditDraft) return

    try {
      await dispatch(
        removeConstructionFromDendrochronology({ applicationId, constructionId }),
      ).unwrap()
    } catch (error) {
      window.alert(typeof error === 'string' ? error : 'Не удалось удалить конструкцию')
    }
  }

  const handleSaveConstruction = async (constructionId: number) => {
    if (!applicationId || !detail || !canEditDraft) return
    const item = sortedItems.find((row) => row.construction_id === constructionId)
    if (!item) return

    try {
      const fields = lineFields[constructionId]
      await dispatch(
        saveDendrochronologyDraft({
          applicationId,
          title: 'Датировка деревянных конструкций',
          items: [
            {
              constructionId,
              itemId: item.item_id,
              dateCorrection: parseFieldNumber(fields?.dateCorrection, item.date_correction, 0),
              cuttingDate: parseFieldNumber(fields?.cuttingDate, item.cutting_date, 0),
              samplesCount: Math.max(
                1,
                parseFieldNumber(fields?.samplesCount, item.samples_count ?? item.quantity, 1),
              ),
            },
          ],
        }),
      ).unwrap()
    } catch (error) {
      window.alert(typeof error === 'string' ? error : 'Не удалось сохранить конструкцию')
    }
  }

  const handleForm = async () => {
    if (!applicationId || !canEditDraft) return
    try {
      await handleSave()
      await dispatch(formDendrochronologyDraft(applicationId)).unwrap()
      navigate(ROUTES.DENDROCHRONOLOGIES)
    } catch {
      void 0
    }
  }

  const handleDelete = async () => {
    if (!applicationId || !canEditDraft) return
    try {
      await dispatch(deleteDendrochronologyDraft(applicationId)).unwrap()
      navigate(ROUTES.CONSTRUCTIONS)
    } catch (error) {
      window.alert(typeof error === 'string' ? error : 'Не удалось удалить заявку')
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="application-page">
      <HeaderApp />
      <BreadCrumbs
        crumbs={[
          { label: ROUTE_LABELS.CONSTRUCTIONS, path: ROUTES.CONSTRUCTIONS },
          { label: ROUTE_LABELS.DENDROCHRONOLOGY },
        ]}
      />
      <main className="dendrochronology-content">
        {detailLoading && !detail ? (
          <Spinner animation="border" />
        ) : null}
        {detailError && !detail ? (
          <p className="application-page__error">{detailError}</p>
        ) : null}
        {!detail || !app || !applicationId ? (
          !detailLoading ? <p className="application-page__empty">Заявка не найдена.</p> : null
        ) : (
          <>
            <div className="app_fields app_characteristics">
              <p className="app_name">
                Заявка № {applicationId} — Датировка деревянных конструкций
              </p>
              <div className="date_of_construction app_characteristics">
                <p>
                  Предварительная дата постройки:{' '}
                  <span id="build-date">{buildYear > 0 ? `${buildYear} г.` : '—'}</span>
                </p>
              </div>
              <div className="application-page__meta">
                <span>Статус: {statusLabel(app.status)}</span>
                <span>Конструкций: {sortedItems.length}</span>
                <span>Создатель: {app.creator_login ?? '—'}</span>
              </div>
            </div>

            <div className={`app-table-header${canEditDraft ? ' app-row--editable' : ''}`}>
              <span></span>
              <span>Тип деревянной конструкции</span>
              <span>Use-life</span>
              <span>Поправка на дату</span>
              <span>Дата рубки</span>
              <span>Кол-во ед.</span>
              {canEditDraft ? <span>Действия</span> : null}
            </div>

            {sortedItems.map((item) => {
              const construction = constructionById.get(item.construction_id)
              const fields = lineFields[item.construction_id]
              const removeBusy = Boolean(
                itemMutationLoading[`remove-${item.construction_id}`],
              )
              const saveBusy = applicationMutationLoading
              return (
                <div
                  className={`app-row${canEditDraft ? ' app-row--editable' : ''}`}
                  key={item.construction_id}
                >
                  {construction?.image_url ? (
                    <img
                      src={construction.image_url}
                      className="app-row-image"
                      alt={construction.title}
                    />
                  ) : (
                    <img
                      src={defaultImage}
                      className="app-row-image"
                      alt={construction?.title ?? getConstructionTitle(item.construction_id)}
                    />
                  )}
                  <span>
                    {construction ? (
                      <Link to={`/construction/${construction.id}`}>
                        {construction.title}
                      </Link>
                    ) : (
                      getConstructionTitle(item.construction_id)
                    )}
                  </span>
                  <span>{construction?.use_life ?? '—'}</span>
                  <div className="qty-controls">
                    <input
                      type="number"
                      className="qty-input"
                      name="date_correction"
                      min="0"
                      value={fields?.dateCorrection ?? fieldValue(item.date_correction)}
                      placeholder="Поправка"
                      disabled={!canEditDraft || applicationMutationLoading}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') event.preventDefault()
                      }}
                      onChange={(event) =>
                        updateLineField(
                          item.construction_id,
                          'dateCorrection',
                          event.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="qty-controls">
                    <input
                      type="number"
                      className="qty-input"
                      name="cutting_date"
                      min="0"
                      value={fields?.cuttingDate ?? fieldValue(item.cutting_date)}
                      placeholder="Год рубки"
                      disabled={!canEditDraft || applicationMutationLoading}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') event.preventDefault()
                      }}
                      onChange={(event) =>
                        updateLineField(
                          item.construction_id,
                          'cuttingDate',
                          event.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="qty-controls">
                    <input
                      type="number"
                      className="qty-input"
                      name="samples_count"
                      min="1"
                      value={
                        fields?.samplesCount ??
                        fieldValue(Math.max(1, item.samples_count || item.quantity), false)
                      }
                      disabled={!canEditDraft || applicationMutationLoading}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') event.preventDefault()
                      }}
                      onChange={(event) =>
                        updateLineField(
                          item.construction_id,
                          'samplesCount',
                          event.target.value,
                        )
                      }
                    />
                  </div>
                  {canEditDraft ? (
                    <div className="app-row-actions">
                      <button
                        type="button"
                        className="btn-row-save"
                        disabled={saveBusy || removeBusy}
                        onClick={() => void handleSaveConstruction(item.construction_id)}
                      >
                        {saveBusy ? 'Сохранение...' : 'Сохранить'}
                      </button>
                      <button
                        type="button"
                        className="btn-row-delete"
                        disabled={removeBusy || applicationMutationLoading}
                        onClick={() => void handleRemoveConstruction(item.construction_id)}
                      >
                        {removeBusy ? 'Удаление...' : 'Удалить'}
                      </button>
                    </div>
                  ) : null}
                </div>
              )
            })}

            {canEditDraft ? (
              <div className="app-actions">
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    void handleForm()
                  }}
                >
                  <input type="hidden" name="dendrochronology_id" value={applicationId} />
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={applicationMutationLoading || sortedItems.length === 0}
                  >
                    Сформировать заявку
                  </button>
                </form>
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    void handleDelete()
                  }}
                >
                  <input type="hidden" name="dendrochronology_id" value={applicationId} />
                  <button
                    type="submit"
                    className="btn-delete"
                    disabled={applicationMutationLoading}
                  >
                    Удалить заявку
                  </button>
                </form>
              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  )
}
