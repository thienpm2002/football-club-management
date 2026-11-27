import axios from 'axios'
import { setupInterceptors } from './interceptors'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  withCredentials: true,

  // CSRF cookie/header theo backend contract
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  withXSRFToken: true,

  headers: {
    Accept: 'application/json',
  },
})

setupInterceptors(api)

export default api