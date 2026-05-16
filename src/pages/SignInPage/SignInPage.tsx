import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import { ROUTES } from '../../Routes'
import { signIn } from '../../modules/authApi'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { loginSucceeded } from '../../store/slices/userSlice'
import { apiErrorMessage } from '../../store/utils/apiError'
import './SignInPage.css'

export default function SignInPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)
  const [form, setForm] = useState({ login: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) navigate(ROUTES.CONSTRUCTIONS, { replace: true })
  }, [isAuthenticated, navigate])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.login.trim() || !form.password) return
    setLoading(true)
    setError(null)

    try {
      const result = await signIn({ login: form.login.trim(), password: form.password })
      dispatch(
        loginSucceeded({
          login: result.login,
          token: result.token,
          isModerator: result.is_moderator,
        }),
      )
      navigate(ROUTES.CONSTRUCTIONS, { replace: true })
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page auth-page--responsive">
      <div className="auth-page__panel">
        <h1 className="auth-page__title">Вход</h1>
        {error ? <div className="auth-page__error">{error}</div> : null}
        <form className="auth-page__form" onSubmit={handleSubmit}>
          <label className="auth-page__label" htmlFor="signin-login">
            Логин
          </label>
          <input
            id="signin-login"
            className="auth-page__input"
            type="text"
            value={form.login}
            onChange={(event) => setForm({ ...form, login: event.target.value })}
            disabled={loading}
            autoComplete="username"
            required
          />
          <label className="auth-page__label" htmlFor="signin-password">
            Пароль
          </label>
          <input
            id="signin-password"
            className="auth-page__input"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            disabled={loading}
            autoComplete="current-password"
            required
          />
          <button className="auth-page__submit" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="auth-page__spinner" />
                Вход...
              </>
            ) : (
              'Войти'
            )}
          </button>
        </form>
        <p className="auth-page__footer">
          Нет аккаунта? <Link to={ROUTES.SIGN_UP}>Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  )
}
