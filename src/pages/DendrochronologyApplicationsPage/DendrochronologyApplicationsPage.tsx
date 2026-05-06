import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Spinner, Table } from 'react-bootstrap'
import HeaderApp from '../../components/HeaderApp/HeaderApp'
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs'
import { ROUTES, ROUTE_LABELS } from '../../Routes'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  fetchDendrochronologyList,
  finishDendrochronology,
  setApplicationFilters,
} from '../../store/slices/dendrochronologySlice'
import './DendrochronologyApplicationsPage.css'

function statusLabel(status: string | undefined): string {
  const labels: Record<string, string> = {
    draft: 'Черновик',
    черновик: 'Черновик',
    formed: 'Сформирована',
    сформирован: 'Сформирована',
    сформирована: 'Сформирована',
    completed: 'Завершена',
    завершён: 'Завершена',
    завершен: 'Завершена',
    завершена: 'Завершена',
    rejected: 'Отклонена',
    отклонён: 'Отклонена',
    отклонен: 'Отклонена',
    отклонена: 'Отклонена',
    deleted: 'Удалена',
    удалён: 'Удалена',
    удален: 'Удалена',
    удалена: 'Удалена',
  }
  return status ? labels[status.toLowerCase()] ?? status : '—'
}

function isFormedStatus(status: string | undefined): boolean {
  if (!status) return false
  return ['formed', 'сформирован', 'сформирована'].includes(status.toLowerCase())
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('ru-RU')
}

export default function DendrochronologyApplicationsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, isModerator } = useAppSelector((state) => state.user)
  const { list, listLoading, listError, filters, itemMutationLoading } = useAppSelector(
    (state) => state.dendrochronology,
  )
  const [draftFilters, setDraftFilters] = useState(filters)

  useEffect(() => {
    setDraftFilters(filters)
  }, [filters])

  const load = useCallback(() => {
    void dispatch(fetchDendrochronologyList(undefined))
  }, [dispatch])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.SIGN_IN, { replace: true })
      return
    }
    load()
    const intervalId = window.setInterval(load, 4000)
    return () => window.clearInterval(intervalId)
  }, [isAuthenticated, load, navigate])

  const visibleApplications = useMemo(() => {
    if (!isModerator) return list.filter((row) => row.status !== 'deleted')
    const creator = filters.creatorLogin.trim().toLowerCase()
    if (!creator) return list
    return list.filter((row) => (row.creator_login ?? '').toLowerCase().includes(creator))
  }, [filters.creatorLogin, isModerator, list])

  const handleApplyFilters = () => {
    dispatch(setApplicationFilters(draftFilters))
    void dispatch(fetchDendrochronologyList(draftFilters))
  }

  const handleFinish = (applicationId: number, status: 'completed' | 'rejected') => {
    void dispatch(finishDendrochronology({ applicationId, status }))
  }

  if (!isAuthenticated) return null

  return (
    <div className="applications-page">
      <HeaderApp />
      <BreadCrumbs
        crumbs={[
          { label: ROUTE_LABELS.CONSTRUCTIONS, path: ROUTES.CONSTRUCTIONS },
          { label: ROUTE_LABELS.DENDROCHRONOLOGIES },
        ]}
      />
      <main className="applications-page__inner">
        <h1 className="applications-page__heading">
          {isModerator ? 'Заявки модератора' : 'Мои заявки'}
        </h1>

        {isModerator ? (
          <section className="applications-page__filters">
            <div className="applications-page__filter-row">
              <Form.Group>
                <Form.Label>С даты</Form.Label>
                <Form.Control
                  type="date"
                  value={draftFilters.fromDate}
                  onChange={(event) =>
                    setDraftFilters({ ...draftFilters, fromDate: event.target.value })
                  }
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>По дату</Form.Label>
                <Form.Control
                  type="date"
                  value={draftFilters.toDate}
                  onChange={(event) =>
                    setDraftFilters({ ...draftFilters, toDate: event.target.value })
                  }
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Статус</Form.Label>
                <Form.Select
                  value={draftFilters.status}
                  onChange={(event) =>
                    setDraftFilters({ ...draftFilters, status: event.target.value })
                  }
                >
                  <option value="">Все</option>
                  <option value="черновик">Черновик</option>
                  <option value="сформирован">Сформирована</option>
                  <option value="завершён">Завершена</option>
                  <option value="отклонён">Отклонена</option>
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label>Создатель</Form.Label>
                <Form.Control
                  value={draftFilters.creatorLogin}
                  onChange={(event) =>
                    setDraftFilters({ ...draftFilters, creatorLogin: event.target.value })
                  }
                />
              </Form.Group>
            </div>
            <button
              className="applications-page__apply-btn"
              type="button"
              onClick={handleApplyFilters}
            >
              Применить фильтры
            </button>
          </section>
        ) : null}

        {listError ? <div className="applications-page__error">{listError}</div> : null}
        {listLoading && visibleApplications.length === 0 ? (
          <Spinner animation="border" />
        ) : null}

        <div className="applications-page__table-wrap">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Статус</th>
                {isModerator ? <th>Создатель</th> : null}
                <th>Создана</th>
                <th>Формирование</th>
                {isModerator ? <th>Завершение</th> : null}
                {isModerator ? <th>Модератор</th> : null}
                {isModerator ? <th>Действия</th> : null}
              </tr>
            </thead>
            <tbody>
              {visibleApplications.map((row) => {
                const finishKey = `finish-${row.dendrochronology_id}`
                const finishBusy = Boolean(itemMutationLoading[finishKey])
                return (
                  <tr key={row.dendrochronology_id}>
                    <td>
                      <button
                        type="button"
                        className="applications-page__linkish"
                        onClick={() => navigate(`/dendrochronology/${row.dendrochronology_id}`)}
                      >
                        {row.dendrochronology_id}
                      </button>
                    </td>
                    <td>{row.title ?? '—'}</td>
                    <td>{statusLabel(row.status)}</td>
                    {isModerator ? <td>{row.creator_login ?? '—'}</td> : null}
                    <td>{formatDate(row.created_at)}</td>
                    <td>{formatDate(row.forming_date)}</td>
                    {isModerator ? <td>{formatDate(row.finish_date)}</td> : null}
                    {isModerator ? <td>{row.moderator_login ?? '—'}</td> : null}
                    {isModerator ? (
                      <td>
                        {isFormedStatus(row.status) ? (
                          <div className="applications-page__actions">
                            <button
                              type="button"
                              className="applications-page__status-btn applications-page__status-btn--complete"
                              disabled={finishBusy}
                              onClick={() => handleFinish(row.dendrochronology_id, 'completed')}
                            >
                              Завершить
                            </button>
                            <button
                              type="button"
                              className="applications-page__status-btn applications-page__status-btn--reject"
                              disabled={finishBusy}
                              onClick={() => handleFinish(row.dendrochronology_id, 'rejected')}
                            >
                              Отклонить
                            </button>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                    ) : null}
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </div>
        {!listLoading && visibleApplications.length === 0 ? (
          <p className="applications-page__empty">Нет заявок по текущим фильтрам.</p>
        ) : null}
      </main>
    </div>
  )
}
