import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import { ROUTES } from '../../Routes'
import { signIn, signUp } from '../../modules/authApi'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { loginSucceeded } from '../../store/slices/userSlice'
import { apiErrorMessage } from '../../store/utils/apiError'
import '../SignInPage/SignInPage.css'

export default function SignUpPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)
  const [form, setForm] = useState({
    login: '',
    password: '',
    passwordRepeat: '',
    isModerator: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) navigate(ROUTES.CONSTRUCTIONS, { replace: true })
  }, [isAuthenticated, navigate])

  const mismatch = Boolean(form.passwordRepeat && form.password !== form.passwordRepeat)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (mismatch || !form.login.trim() || !form.password) return
    setLoading(true)
    setError(null)

    try {
      const registerResult = await signUp({
        login: form.login.trim(),
        password: form.password,
        is_moderator: form.isModerator,
      })
      const loginResult = await signIn({ login: form.login.trim(), password: form.password })
      dispatch(
        loginSucceeded({
          login: loginResult.login || registerResult.login,
          token: loginResult.token || registerResult.token,
          isModerator: loginResult.is_moderator ?? registerResult.is_moderator,
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
    <div className="auth-page">
      <div className="auth-page__panel">
        <h1 className="auth-page__title">Регистрация</h1>
        {error ? <div className="auth-page__error">{error}</div> : null}
        {mismatch ? <div className="auth-page__error">Пароли не совпадают</div> : null}
        <form className="auth-page__form" onSubmit={handleSubmit}>
          <label className="auth-page__label" htmlFor="signup-login">
            Логин
          </label>
          <input
            id="signup-login"
            className="auth-page__input"
            type="text"
            value={form.login}
            onChange={(event) => setForm({ ...form, login: event.target.value })}
            disabled={loading}
            autoComplete="username"
            required
          />
          <label className="auth-page__label" htmlFor="signup-password">
            Пароль
          </label>
          <input
            id="signup-password"
            className="auth-page__input"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            disabled={loading}
            autoComplete="new-password"
            required
          />
          <label className="auth-page__label" htmlFor="signup-repeat">
            Повтор пароля
          </label>
          <input
            id="signup-repeat"
            className="auth-page__input"
            type="password"
            value={form.passwordRepeat}
            onChange={(event) => setForm({ ...form, passwordRepeat: event.target.value })}
            disabled={loading}
            autoComplete="new-password"
            required
          />
          <label className="auth-page__label">
            <input
              type="checkbox"
              checked={form.isModerator}
              onChange={(event) => setForm({ ...form, isModerator: event.target.checked })}
              disabled={loading}
            />{' '}
            Зарегистрироваться как модератор
          </label>
          <button
            className="auth-page__submit"
            type="submit"
            disabled={loading || mismatch}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="auth-page__spinner" />
                Создание...
              </>
            ) : (
              'Зарегистрироваться'
            )}
          </button>
        </form>
        <p className="auth-page__footer">
          Уже есть аккаунт? <Link to={ROUTES.SIGN_IN}>Войти</Link>
        </p>
      </div>
    </div>
  )
}
