import useAuthStore from '@/stores/auth.store'

let refreshPromise = null
let csrfPromise = null

function getCookie(name) {
  if (typeof document === 'undefined') {
    return null
  }

  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`))

  return cookie
    ? decodeURIComponent(cookie.split('=').slice(1).join('='))
    : null
}

function isAuthEndpoint(url = '') {
  return [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/logout',
    '/auth/verify-email',
    '/auth/resend-verification',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/csrf',
  ].some((endpoint) => url.includes(endpoint))
}

async function ensureCsrf(api) {
  if (getCookie('XSRF-TOKEN')) {
    return
  }

  if (!csrfPromise) {
    csrfPromise = api
      .get('/auth/csrf')
      .finally(() => {
        csrfPromise = null
      })
  }

  await csrfPromise
}

async function refreshAccessToken(api) {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/auth/refresh')
      .then((response) => {
        
        const accessToken = response?.data?.accessToken

        if (!accessToken) {
          throw new Error(
            'Refresh response does not contain accessToken',
          )
        }

        useAuthStore.getState().setAccessToken(accessToken)

        return accessToken
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

export function setupInterceptors(api) {
  // Request interceptor
  api.interceptors.request.use(async (config) => {
    const method = (config.method ?? 'get').toUpperCase()
    const url = config.url ?? ''

    const requiresCsrf =
      method === 'POST' &&
      (url.includes('/auth/refresh') ||
        url.includes('/auth/logout'))

    if (requiresCsrf) {
      await ensureCsrf(api)
    }

    const accessToken = useAuthStore.getState().accessToken

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  })

  // Response interceptor
  api.interceptors.response.use(
    // Success response
    (response) => response.data,

    // Error response
    async (error) => {
      const responseData = error.response?.data

      // Chuẩn hóa lỗi theo cấu trúc Backend
      error.apiError = {
        status: error.response?.status ?? null,
        code: responseData?.errorCode ?? null,
        message:
          responseData?.message ??
          error.message ??
          'Đã xảy ra lỗi. Vui lòng thử lại.',
        details: responseData?.errors ?? null,
      }

      const originalRequest = error.config
      const status = error.response?.status

      // Chỉ refresh khi gặp 401 từ endpoint không thuộc Auth
      if (
        status !== 401 ||
        !originalRequest ||
        originalRequest._retry ||
        isAuthEndpoint(originalRequest.url)
      ) {
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        const accessToken = await refreshAccessToken(api)

        originalRequest.headers.Authorization =
          `Bearer ${accessToken}`

        // Gửi lại request ban đầu
        return api(originalRequest)
      } catch (refreshError) {
        useAuthStore.getState().clearAuth()

        return Promise.reject(refreshError)
      }
    },
  )
}
