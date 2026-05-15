import { apiHttp } from '../api/http'

export interface AuthCredentials {
  login: string
  password: string
}

export interface RegisterPayload extends AuthCredentials {
  is_moderator?: boolean
}

export interface AuthResult {
  login: string
  token?: string
  is_moderator?: boolean
}

function normalizeAuthResult(data: unknown, fallbackLogin: string): AuthResult {
  if (!data || typeof data !== 'object') {
    return { login: fallbackLogin }
  }

  const value = data as Record<string, unknown>
  return {
    login: typeof value.login === 'string' ? value.login : fallbackLogin,
    token: typeof value.token === 'string' ? value.token : undefined,
    is_moderator:
      typeof value.is_moderator === 'boolean' ? value.is_moderator : undefined,
  }
}

export async function signIn(credentials: AuthCredentials): Promise<AuthResult> {
  const response = await apiHttp.post('/users/signin', credentials)
  return normalizeAuthResult(response.data, credentials.login)
}

export async function signUp(payload: RegisterPayload): Promise<AuthResult> {
  const response = await apiHttp.post('/users/signup', payload)
  return normalizeAuthResult(response.data, payload.login)
}

export async function signOut(): Promise<void> {
  try {
    await apiHttp.post('/users/signout')
  } finally {
    localStorage.removeItem('token')
  }
}
