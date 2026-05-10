// Простой API-клиент для админки. Хранит JWT в localStorage.
const TOKEN_KEY = 'maxima.adminToken'

export function getToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (typeof window === 'undefined') return
  if (token) window.localStorage.setItem(TOKEN_KEY, token)
  else window.localStorage.removeItem(TOKEN_KEY)
}

async function request(method, path, body, options = {}) {
  const headers = { ...(options.headers || {}) }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let payload = body
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const res = await fetch(path, { method, headers, body: payload })
  let data = null
  try {
    data = await res.json()
  } catch {
    /* пустой ответ */
  }
  if (!res.ok) {
    const message = data?.error || `HTTP ${res.status}`
    if (res.status === 401) setToken(null)
    throw new Error(message)
  }
  return data
}

export const api = {
  login: (password) => request('POST', '/api/login', { password }),
  me: () => request('GET', '/api/me'),
  getContent: () => request('GET', '/api/content'),
  saveContent: (content) => request('PUT', '/api/content', content),
  resetContent: () => request('POST', '/api/content/reset'),
  upload: async (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return request('POST', '/api/upload', fd)
  },
}
