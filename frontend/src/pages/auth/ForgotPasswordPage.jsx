import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  KeyRound,
  LoaderCircle,
  Mail,
  RefreshCw,
  Send,
  X,
} from 'lucide-react'

import { forgotPasswordSchema } from '@/schemas/auth.schema'

import useCooldown from '@/hooks/useCooldown'

import authService from '@/services/auth.service'

function ForgotPasswordPage() {
  const [status, setStatus] = useState(() =>
    sessionStorage.getItem('forgot-password-email') ? 'submitted' : 'form',
  )

  const [submittedEmail, setSubmittedEmail] = useState(
    () => sessionStorage.getItem('forgot-password-email') || '',
  )

  const [feedback, setFeedback] = useState(null)
  const [isResending, setIsResending] = useState(false)

  const {
    remainingSeconds: cooldownSeconds,
    isCoolingDown,
    startCooldown,
  } = useCooldown('forgot-password-cooldown', 60)

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  function handleChangeEmail() {
    sessionStorage.removeItem('forgot-password-email')

    setSubmittedEmail('')
    setFeedback(null)
    setStatus('form')

    reset({ email: '' })
  }

  async function onSubmit(data) {
    try {
      
      await authService.forgotPassword(data.email)

      const email = data.email.trim()

      setSubmittedEmail(email)
      sessionStorage.setItem('forgot-password-email', email)

      startCooldown()
      setFeedback(null)
      setStatus('submitted')
    } catch (error) {
      setError('root.server', {
        type: 'server',
        message: 'Không thể gửi yêu cầu lúc này. Vui lòng thử lại sau.',
      })
    }
  }

  async function handleResend() {
    if (isCoolingDown || isResending) return

    setIsResending(true)
    setFeedback(null)

    try {
      
      await authService.forgotPassword(submittedEmail)

      startCooldown()
      setStatus('submitted')
    } catch (error) {
      setFeedback('error')
      setStatus('resend-failure')
    } finally {
      setIsResending(false)
    }
  }

  function closeFeedback() {
    setFeedback(null)
  }

  return (
    <div className="mx-auto w-full max-w-130">
      <div className="relative overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="h-1.5 w-full bg-linear-to-r from-[#004c22] via-[#166534] to-[#4059aa]" />

        <div className="p-6 sm:p-10">
          {/* FORM */}
          {status === 'form' && (
            <div className="animate-fadeIn">
              <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#adf3b8]/40 text-[#004c22] shadow-sm">
                <KeyRound size={32} />

                <span className="absolute right-0 bottom-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#004c22] text-white shadow">
                  <Mail size={12} />
                </span>
              </div>

              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-[#0b1c30] sm:text-[28px]">
                  Quên mật khẩu?
                </h1>

                <p className="mt-2 text-[14px] leading-relaxed text-[#404940]">
                  Nhập địa chỉ email tài khoản của bạn để nhận liên kết đặt lại
                  mật khẩu.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col gap-4"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-[14px] font-semibold text-[#0b1c30]"
                  >
                    Email tài khoản <span className="text-[#ba1a1a">*</span>
                  </label>

                  <div className="relative">
                    <Mail
                      size={19}
                      className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#404940]"
                    />

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Nhập địa chỉ email của bạn"
                      aria-invalid={!!errors.email}
                      {...register('email')}
                      className={`h-11 w-full rounded-lg border-0 bg-[#eff4ff] pr-4 pl-11 text-[14px] text-[#0b1c30] outline-none transition-all placeholder:text-[#404940]/60 focus:bg-white focus:ring-2 ${
                        errors.email
                          ? 'ring-2 ring-[#ba1a1a]'
                          : 'focus:ring-[#004c22]'
                      }`}
                    />
                  </div>

                  {errors.email && (
                    <p className="mt-1.5 flex items-center gap-1 text-[13px] text-[#ba1a1a]">
                      <AlertCircle size={15} />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {errors.root?.server && (
                  <div
                    role="alert"
                    className="rounded-lg bg-[#ffdad6]/60 p-3 text-[13px] font-medium text-[#ba1a1a]"
                  >
                    {errors.root.server.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#004c22] px-4 text-[14px] font-semibold text-white shadow-md transition-colors hover:bg-[#166534] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle size={19} className="animate-spin" />
                      Đang gửi yêu cầu...
                    </>
                  ) : (
                    <>
                      Gửi liên kết đặt lại mật khẩu
                      <Send size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 flex justify-center border-t border-[#c0c9be]/30 pt-5">
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-2 py-1 text-[14px] font-semibold text-[#4059aa] transition-colors hover:text-[#264191]"
                >
                  <ArrowLeft
                    size={18}
                    className="transition-transform group-hover:-translate-x-1"
                  />
                  Quay lại Đăng nhập
                </Link>
              </div>
            </div>
          )}

          {/* REQUEST SUBMITTED / RESEND FAILURE */}
          {(status === 'submitted' || status === 'resend-failure') && (
            <div className="animate-fadeIn">
              {feedback === 'error' && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-2 rounded-lg bg-[#ffdad6]/60 p-4"
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ffdad6]">
                    <AlertCircle size={17} className="text-[#ba1a1a]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold text-[#93000a]">
                      Không thể gửi email lúc này
                    </p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-[#404940]">
                      Vui lòng thử lại sau.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeFeedback}
                    aria-label="Đóng thông báo"
                    className="shrink-0 cursor-pointer p-1 text-[#404940] hover:text-[#0b1c30]"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#adf3b8]/40 text-[#004c22] shadow-sm">
                <Mail size={32} />

                <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#004c22] text-white shadow">
                  <Check size={15} />
                </span>
              </div>

              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-[#0b1c30] sm:text-[28px]">
                  Kiểm tra hộp thư của bạn
                </h1>

                <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full bg-[#dfe9fa] px-3 py-1.5">
                  <Mail size={16} className="shrink-0 text-[#404940]" />
                  <span className="truncate text-[13px] font-semibold text-[#0b1c30]">
                    {submittedEmail}
                  </span>
                </div>
              </div>

              <div className="mb-6 rounded-xl bg-[#eff4ff] p-4 text-center">
                <p className="text-[14px] leading-relaxed text-[#404940]">
                  Nếu email khớp với tài khoản trong hệ thống, hướng dẫn đặt
                  lại mật khẩu sẽ được gửi đến hộp thư trong giây lát.
                </p>
              </div>

              {isCoolingDown ? (
                <button
                  type="button"
                  disabled
                  className="flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-[#dfe9fa] text-[14px] font-semibold text-[#404940] opacity-90"
                >
                  <RefreshCw size={18} className="animate-spin text-[#004c22]" />
                  Gửi lại sau {cooldownSeconds} giây
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#eff4ff] text-[14px] font-semibold text-[#004c22] transition-colors hover:bg-[#dfe9fa] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isResending ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Đang gửi...
                    </>
                  ) : status === 'resend-failure' ? (
                    <>
                      <RefreshCw size={18} />
                      Thử lại ngay
                    </>
                  ) : (
                    <>
                      <RefreshCw size={18} />
                      Gửi lại email
                    </>
                  )}
                </button>
              )}

              <p className="mt-3 text-center text-[12px] leading-relaxed text-[#404940]/80">
                Chưa nhận được thư? Hãy kiểm tra cả thư mục Spam / Rác.
              </p>

              {!isCoolingDown && (
                <button
                    type="button"
                    onClick={handleChangeEmail}
                    className="mt-3 w-full cursor-pointer text-center text-[13px] font-semibold text-[#4059aa] transition-colors hover:text-[#264191]"
                >
                    Dùng email khác
                </button>
              )}

              <div className="mt-8 flex justify-center border-t border-[#c0c9be]/30 pt-5">
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-2 py-1 text-[14px] font-semibold text-[#4059aa] transition-colors hover:text-[#264191]"
                >
                  <ArrowLeft
                    size={18}
                    className="transition-transform group-hover:-translate-x-1"
                  />
                  Quay lại Đăng nhập
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
