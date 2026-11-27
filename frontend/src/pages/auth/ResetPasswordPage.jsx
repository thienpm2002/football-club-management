import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react'

import { resetPasswordSchema } from '@/schemas/auth.schema'

import authService from '@/services/auth.service'

function ResetPasswordPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState(token ? 'form' : 'invalid-token')
  const [submitError, setSubmitError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const password = watch('password', '')

  // Password strength is informational only.
  const strengthScore = [
    password.length >= 8,
    password.length >= 12,
    /[A-Z]/.test(password),
    /[0-9!@#$%^&*(),.?":{}|<>]/.test(password),
  ].filter(Boolean).length

  const strengthLabels = [
    'Chưa đủ mạnh',
    'Yếu',
    'Trung bình',
    'Khá mạnh',
    'Mạnh',
  ]

  async function onSubmit(data) {
    if (!token) {
      setStatus('invalid-token')
      return
    }

    // Clear errors from the previous submission.
    setSubmitError('')
    clearErrors('password')

    try {
      await authService.resetPassword({
        token,
        password: data.password,
      })

      setStatus('success')

      // Remove token from the URL after successful reset.
      setSearchParams({}, { replace: true })
    } catch (error) {
      const apiError = error?.apiError

      switch (apiError?.code) {
        case 'PASSWORD_RESET_TOKEN_EXPIRED':
          setStatus('expired-token')
          return

        case 'INVALID_PASSWORD_RESET_TOKEN':
          setStatus('invalid-token')
          return

        case 'VALIDATION_ERROR': {
          const fieldErrors = apiError.details

          if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
            fieldErrors.forEach((fieldError) => {
              const field = fieldError.field

              if (field === 'newPassword' || field === 'password') {
                setError('password', {
                  type: 'server',
                  message:
                    fieldError.message ||
                    'Mật khẩu không hợp lệ.',
                })
              } else {
                setSubmitError(
                  fieldError.message ||
                    'Dữ liệu gửi lên không hợp lệ.',
                )
              }
            })
          } else {
            setSubmitError(
              apiError.message ||
                'Dữ liệu gửi lên không hợp lệ.',
            )
          }

          return
        }

        default:
          setSubmitError(
            apiError?.message ||
              'Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại sau.',
          )
      }
    }
  }

  const inputClass = (hasError) =>
    `w-full rounded-lg border bg-white px-4 py-3 text-sm text-[#172b20] outline-none transition-colors placeholder:text-gray-400 focus:ring-2 ${
      hasError
        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
        : 'border-gray-200 focus:border-[#004c22] focus:ring-[#004c22]/10'
    }`

  // ========================
  // Success State
  // ========================

  if (status === 'success') {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-9 w-9 text-[#16803d]" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#172b20]">
              Đổi mật khẩu thành công!
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Mật khẩu của bạn đã được cập nhật. Hãy sử dụng mật khẩu mới để
              đăng nhập vào tài khoản.
            </p>
          </div>

          <Link
            to="/login"
            className="mt-7 flex w-full items-center justify-center rounded-lg bg-[#004c22] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#003b1a]"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    )
  }

  // ========================
  // Invalid / Expired Token
  // ========================

  if (status === 'invalid-token' || status === 'expired-token') {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <AlertCircle className="h-9 w-9 text-amber-500" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#172b20]">
              {status === 'expired-token'
                ? 'Liên kết đã hết hạn'
                : 'Liên kết không hợp lệ'}
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              {status === 'expired-token'
                ? 'Liên kết đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu một liên kết mới để tiếp tục.'
                : 'Liên kết đặt lại mật khẩu không hợp lệ, đã được sử dụng hoặc không còn hiệu lực. Vui lòng yêu cầu một liên kết mới.'}
            </p>
          </div>

          <Link
            to="/forgot-password"
            className="mt-7 flex w-full items-center justify-center rounded-lg bg-[#004c22] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#003b1a]"
          >
            Yêu cầu liên kết mới
          </Link>

          <p className="mt-5 text-center text-sm text-gray-500">
            Quay lại{' '}
            <Link
              to="/login"
              className="font-semibold text-[#4059aa] hover:underline"
            >
              đăng nhập
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // ========================
  // Reset Password Form
  // ========================

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
            <LockKeyhole className="h-7 w-7 text-[#004c22]" />
          </div>

          <h1 className="text-2xl font-bold text-[#172b20]">
            Đặt lại mật khẩu
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Tạo mật khẩu mới cho tài khoản của bạn. Hãy chọn mật khẩu mà bạn
            chưa sử dụng trước đây.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* New Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-[#172b20]"
            >
              Mật khẩu mới
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Nhập mật khẩu mới"
                disabled={isSubmitting}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? 'password-error' : 'password-hint'
                }
                className={`${inputClass(!!errors.password)} pr-12`}
                {...register('password')}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isSubmitting}
                aria-label={
                  showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'
                }
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 transition-colors hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {errors.password ? (
              <p id="password-error" className="mt-1.5 text-xs text-red-500">
                {errors.password.message}
              </p>
            ) : (
              <p id="password-hint" className="mt-1.5 text-xs text-gray-400">
                Mật khẩu phải có ít nhất 8 ký tự.
              </p>
            )}

            {/* Password Strength */}
            {password.length > 0 && (
              <div className="mt-3">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className={`h-1.5 flex-1 rounded-full ${
                        strengthScore >= item
                          ? strengthScore <= 1
                            ? 'bg-red-400'
                            : strengthScore === 2
                              ? 'bg-amber-400'
                              : strengthScore === 3
                                ? 'bg-lime-500'
                                : 'bg-green-500'
                          : 'bg-gray-100'
                      }`}
                    />
                  ))}
                </div>

                <p className="mt-1.5 text-right text-xs text-gray-400">
                  {strengthLabels[strengthScore]}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mt-5">
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-semibold text-[#172b20]"
            >
              Xác nhận mật khẩu mới
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu mới"
                disabled={isSubmitting}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword ? 'confirm-password-error' : undefined
                }
                className={`${inputClass(!!errors.confirmPassword)} pr-12`}
                {...register('confirmPassword')}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((prev) => !prev)
                }
                disabled={isSubmitting}
                aria-label={
                  showConfirmPassword
                    ? 'Ẩn mật khẩu xác nhận'
                    : 'Hiển thị mật khẩu xác nhận'
                }
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 transition-colors hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {errors.confirmPassword && (
              <p
                id="confirm-password-error"
                className="mt-1.5 text-xs text-red-500"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* API Error */}
          {submitError && (
            <div
              role="alert"
              className="mt-5 flex gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{submitError}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-[#004c22] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#003b1a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang cập nhật...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Đặt lại mật khẩu
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Bạn nhớ lại mật khẩu rồi?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#4059aa] hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPasswordPage
