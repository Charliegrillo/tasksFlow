import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SESSION_NAME = 'session'
const SESSION_MAX_AGE_REMEMBER = 60 * 60 * 24 * 30 // 30 days
const SESSION_MAX_AGE_DEFAULT = 60 * 60 * 24 // 1 day

function getSecretKey() {
  const key = process.env.SESSION_SECRET
  if (!key) throw new Error('SESSION_SECRET environment variable is not set')
  return new TextEncoder().encode(key)
}

export type SessionPayload = {
  userId: number
  expiresAt: Date
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecretKey())
}

export async function decrypt(session: string | undefined) {
  if (!session) return null
  try {
    const { payload } = await jwtVerify(session, getSecretKey(), { algorithms: ['HS256'] })
    return payload as { userId: number }
  } catch {
    return null
  }
}

export async function createSession(userId: number, remember = false) {
  const maxAge = remember ? SESSION_MAX_AGE_REMEMBER : SESSION_MAX_AGE_DEFAULT
  const expiresAt = new Date(Date.now() + maxAge * 1000)
  const session = await encrypt({ userId, expiresAt })
  const cookieStore = await cookies()
  cookieStore.set(SESSION_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_NAME)
}

export async function getSession(): Promise<{ userId: number } | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_NAME)?.value
  return decrypt(session)
}
