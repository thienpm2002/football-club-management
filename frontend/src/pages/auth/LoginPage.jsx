import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  Mail,
} from 'lucide-react'

import { loginSchema } from '@/schemas/auth.schema'
import authService from '@/services/auth.service'
import useAuthStore from '@/stores/auth.store'

function LoginPage() {

  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const [isResendingVerification, setIsResendingVerification] = useState(false)
  const [resendError, setResendError] = useState('')
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function handleValidationError(details) {
    if (!Array.isArray(details) || details.length === 0) {
      setError('root.server', {
        type: 'server',
        message: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
      })
      return
    }

    const allowedFields = [
      'email',
      'password',
    ]

    let hasFieldError = false

    for (const detail of details) {
      const { field, message } = detail

      if (allowedFields.includes(field) && message) {
        setError(field, {
          type: 'server',
          message,
        })

        hasFieldError = true
      }
    }

    if (!hasFieldError) {
      setError('root.server', {
        type: 'server',
        message: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
      })
    }
  }

  async function onSubmit(data) {
    // TODO: Integrate login API later.
    try {
      const payload = {
        email: data.email,
        password: data.password,
      }

      const res = await authService.login(payload)

      useAuthStore.getState().setAuth(
        res.data.user,
        res.data.accessToken,
      )

      setUnverifiedEmail('')
      setResendError('')

      navigate('/')

    } catch (error) {
      const apiError = error.apiError

      switch (apiError?.code) {
        case 'INVALID_CREDENTIALS':
          setError('root.server', {
            type: 'server',
            message: 'Email hoặc mật khẩu không chính xác.',
        })
        break

        case 'VALIDATION_ERROR':
          handleValidationError(apiError.details)
        break

        case 'TOO_MANY_REQUESTS':
          setError('root.server', {
            type: 'server',
            message:
              apiError.message ||
              'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
        })
        break

        case 'EMAIL_NOT_VERIFIED':
          setUnverifiedEmail(data.email)
          setError('root.server', {
            type: 'server',
            message: 'Tài khoản chưa được xác thực email.',
          })
        break

        case 'ACCOUNT_DISABLED':
          setError('root.server', {
            type: 'server',
            message: apiError.message || 'Tài khoản của bạn hiện không thể đăng nhập.',
          })
        break

        default:
          setError('root.server', {
            type: 'server',
            message:
              apiError?.message ||
              'Đăng nhập thất bại. Vui lòng thử lại sau.',
        })
      }
    }
  }

  async function handleResendVerification() {
    if (!unverifiedEmail || isResendingVerification) return

    setIsResendingVerification(true)
    setResendError('')

    try {
      await authService.resendVerificationEmail(unverifiedEmail)

      const deadline = Date.now() + 60 * 1000

      sessionStorage.setItem(
        'check-email-cooldown',
        String(deadline),
      )

      navigate('/check-email', {
        state: {
          email: unverifiedEmail,
          verificationTokenExpiresIn: 1800,
          resendCooldownSeconds: 60,
        },
      })
    } catch (error) {
      setResendError(
        error.apiError?.message ||
          'Không thể gửi email xác thực. Vui lòng thử lại sau.',
      )
    } finally {
      setIsResendingVerification(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md lg:max-w-none">
      <div className="rounded-xl border border-[#cbdbf5]/60 bg-white p-7 shadow-[0_4px_20px_-2px_rgba(11,28,48,0.05),0_2px_6px_-1px_rgba(11,28,48,0.02)] transition-all sm:p-10">
        {/* Card header */}
        <div className="mb-7">
          <h2 className="text-2xl font-bold tracking-tight text-[#0b1c30] sm:text-[26px]">
            Đăng nhập
          </h2>

          <p className="mt-1.5 text-[14px] leading-normal text-[#404940]">
            Chào mừng bạn quay trở lại với CLB Bóng Đá Phú Mỹ.
          </p>
        </div>

        {/* Server error */}
        {errors.root?.server && (
          <p
            role="alert"
            className="rounded-lg bg-[#ffdad6]/60 p-3 text-[13px] font-medium text-[#ba1a1a]"
          >
            {errors.root.server.message}
          </p>
        )}

        {unverifiedEmail && (
          <div className="mt-4 rounded-lg bg-[#eff4ff] p-4">
            <p className="text-[14px] font-semibold text-[#0b1c30]">
              Email của bạn chưa được xác thực
            </p>

            <p className="mt-1 text-[13px] leading-relaxed text-[#404940]">
              Bạn cần xác thực email trước khi đăng nhập. Chúng tôi có thể
              gửi lại liên kết xác thực đến địa chỉ email của bạn.
            </p>

            {resendError && (
              <p className="mt-2 text-[13px] text-[#ba1a1a]">
                {resendError}
              </p>
            )}

            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResendingVerification}
              className="mt-3 inline-flex cursor-pointer items-center gap-2 text-[14px] font-semibold text-[#4059aa] transition-colors hover:text-[#264191] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isResendingVerification
                ? 'Đang gửi email xác thực...'
                : 'Gửi email xác thực'}
            </button>
          </div>
        )}

        {/* Login form */}
        <form
          className="space-y-5"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-[13px] font-semibold text-[#0b1c30]"
            >
              Email
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#717970]">
                <Mail size={18} />
              </div>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Nhập địa chỉ email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
                className={`block w-full rounded-lg border bg-white py-2.5 pr-4 pl-10 text-[14px] text-[#0b1c30] transition-all outline-none placeholder:text-[#717970]/70 focus:ring-2 focus:ring-[#004c22]/20 ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-[#cbdbf5] focus:border-[#004c22]'
                }`}
              />
            </div>

            {errors.email && (
              <p
                id="email-error"
                className="mt-1.5 text-xs text-red-600"
                role="alert"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-[13px] font-semibold text-[#0b1c30]"
            >
              Mật khẩu
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#717970]">
                <LockKeyhole size={18} />
              </div>

              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Nhập mật khẩu"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? 'password-error' : undefined
                }
                {...register('password')}
                className={`block w-full rounded-lg bg-white py-2.5 pr-11 pl-10 font-sans text-[14px] text-[#0b1c30] transition-all outline-none placeholder:text-[#717970]/70 focus:ring-2 focus:ring-[#004c22]/20 ${
                  errors.password
                    ? 'border border-red-500 focus:border-red-500'
                    : 'border border-[#cbdbf5] focus:border-[#004c22]'
                }`}
              />

              <button
                type="button"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3.5 text-[#717970] transition-colors hover:text-[#0b1c30]"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {errors.password && (
              <p
                id="password-error"
                className="mt-1.5 text-xs text-red-600"
                role="alert"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Forgot password */}
          <div className="flex justify-end pt-0.5">
            <Link
              to="/forgot-password"
              className="text-[13px] font-medium text-[#004c22] transition-colors hover:text-[#166534] hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Login button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#004c22] px-4 py-2.5 text-[15px] font-semibold text-white shadow-[0_2px_4px_0_rgba(0,76,34,0.12)] transition-all duration-150 hover:bg-[#166534] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span>{isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}</span>
              {!isSubmitting && <LogIn size={18} />}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#cbdbf5]/70" />
          </div>

          <div className="relative flex justify-center text-[12px] uppercase">
            <span className="whitespace-nowrap bg-white px-3 font-medium tracking-wide text-[#717970]">
              Hoặc tiếp tục với
            </span>
          </div>
        </div>

        {/* Google login */}
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-[#cbdbf5] bg-white px-4 py-2.5 text-[14px] font-semibold text-[#0b1c30] shadow-sm transition-all duration-150 hover:border-[#bfc9bd] hover:bg-[#f8f9ff] focus:ring-2 focus:ring-[#cbdbf5] focus:outline-none"
        >
          <svg
            className="h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>

          <span className="whitespace-nowrap">Tiếp tục với Google</span>
        </button>

        {/* Register link */}
        <div className="mt-7 border-t border-[#cbdbf5]/50 pt-5 text-center">
          <p className="text-[13px] text-[#404940]">
            Chưa có tài khoản?
            <Link
              to="/register"
              className="ml-1 font-semibold text-[#004c22] transition-colors hover:text-[#166534] hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
