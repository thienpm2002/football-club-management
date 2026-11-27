import { useState } from 'react'
import { Link, useLocation, Navigate } from 'react-router-dom'
import {
  AtSign,
  Check,
  Forward,
  Info,
  MailCheck,
  RefreshCw,
  X,
  XCircle,
} from 'lucide-react'

import useCooldown from '@/hooks/useCooldown'
import authService from '@/services/auth.service'

function CheckEmailPage() {
  const location = useLocation()
  const email = location.state?.email || ''
  const verificationTokenExpiresIn = location.state?.verificationTokenExpiresIn ?? 1800
  const verificationExpiresInMinutes = Math.ceil(verificationTokenExpiresIn / 60)
  const resendCooldownSeconds = location.state?.resendCooldownSeconds ?? 60

  const [feedback, setFeedback] = useState(null)
  const [isResending, setIsResending] = useState(false)

  const {
    remainingSeconds: cooldownSeconds,
    isCoolingDown,
    startCooldown,
  } = useCooldown('check-email-cooldown', resendCooldownSeconds)

  async function handleResendEmail() {
    if (!email || cooldownSeconds > 0 || isResending) return

    setIsResending(true)
    setFeedback(null)

    try {
      await authService.resendVerificationEmail(email)
      
      setFeedback({ type: 'success' })
      startCooldown()
    } catch (error) {
      setFeedback({ type: 'error' })
    } finally {
      setIsResending(false)
    }
  }

  function closeFeedback() {
    setFeedback(null)
  }

  if (!email) {
    return <Navigate to="/register" replace />
  }

  return (
    <div className="mx-auto w-full max-w-130">
      <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-xl sm:p-10">
        {/* Decorative top bar */}
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-linear-to-r from-[#004c22] via-[#166534] to-[#4059aa]" />

        {/* Success feedback */}
        {feedback?.type === 'success' && (
          <div className="animate-fadeIn mb-6 flex items-start gap-2 rounded-lg bg-[#eff4ff] p-4">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#adf3b8]">
              <Check size={17} className="text-[#004c22]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-[#004c22]">
                Đã gửi lại email xác thực thành công!
              </p>

              <p className="mt-0.5 text-[13px] leading-relaxed text-[#404940]">
                Vui lòng kiểm tra cả thư mục{' '}
                <span className="font-semibold text-[#0b1c30]">
                  Spam / Rác
                </span>{' '}
                nếu bạn không tìm thấy email trong hộp thư đến.
              </p>
            </div>

            <button
              type="button"
              onClick={closeFeedback}
              aria-label="Đóng thông báo"
              className="shrink-0 cursor-pointer p-1 text-[#404940] transition-colors hover:text-[#0b1c30]"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Error feedback */}
        {feedback?.type === 'error' && (
          <div className="animate-fadeIn mb-6 flex items-start gap-2 rounded-lg bg-[#ffdad6]/60 p-4">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ffdad6]">
              <XCircle size={17} className="text-[#ba1a1a]" />
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
              aria-label="Đóng thông báo lỗi"
              className="shrink-0 cursor-pointer p-1 text-[#404940] transition-colors hover:text-[#0b1c30]"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Main icon */}
        <div className="my-2 flex items-center justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#eff4ff] shadow-sm">
            <svg
              className="absolute inset-0 h-full w-full text-[#adf3b8] opacity-70"
              fill="none"
              viewBox="0 0 80 80"
              aria-hidden="true"
            >
              <circle
                cx="40"
                cy="40"
                r="38"
                stroke="currentColor"
                strokeDasharray="4 4"
                strokeWidth="2"
              />
            </svg>

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#adf3b8] shadow-inner">
              <MailCheck size={32} className="text-[#004c22]" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="mt-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[#0b1c30] sm:text-[28px]">
            Kiểm tra hộp thư của bạn
          </h1>

          <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-[#404940]">
            Chúng tôi đã gửi liên kết kích hoạt tài khoản hội viên tới địa chỉ
            email đăng ký:
          </p>
        </div>

        {/* Registered email */}
        <div className="my-6 flex justify-center">
          <div className="flex max-w-full items-center gap-2 rounded-lg bg-[#eff4ff] px-4 py-2.5 shadow-sm">
            <AtSign size={20} className="shrink-0 text-[#004c22]" />

            <span className="truncate text-[15px] font-bold text-[#004c22]">
              {email}
            </span>
          </div>
        </div>

        {/* Instruction */}
        <div className="mb-6 flex items-start gap-2 rounded-lg bg-[#e5eeff] p-4 text-left">
          <Info
            size={22}
            className="mt-0.5 shrink-0 text-[#004c22]"
          />

          <div className="space-y-1">
            <p className="text-[13px] leading-relaxed text-[#0b1c30]">
              Vui lòng mở hộp thư và nhấn vào liên kết xác nhận để kích hoạt tài
              khoản của bạn.
            </p>

            {verificationExpiresInMinutes > 0 && (
              <p className="text-[13px] font-medium leading-relaxed text-[#004c22]">
                Liên kết xác thực sẽ hết hạn sau{' '}
                {verificationExpiresInMinutes} phút.
              </p>
            )}
          </div>
        </div>

        {/* Resend action */}
        <div>
          {isCoolingDown ? (
            <button
              type="button"
              disabled
              className="flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-[#dfe9fa] text-[14px] font-semibold text-[#404940] opacity-90"
            >
              <RefreshCw size={19} className="animate-spin text-[#004c22]" />
              Gửi lại sau {cooldownSeconds} giây
            </button>
          ) : (
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={!email || isResending}
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#004c22] text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-[#166534] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isResending ? (
                <>
                  <RefreshCw size={19} className="animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Forward size={20} />
                  Gửi lại email xác thực
                </>
              )}
            </button>
          )}
        </div>

        {/* Back to login */}
        <div className="-mx-6 -mb-6 mt-8 flex flex-col items-center gap-4 bg-[#eff4ff] px-6 pt-5 pb-6 sm:-mx-10 sm:-mb-10 sm:px-10 sm:pb-8">
          <Link
            to="/login"
            className="group inline-flex items-center gap-2 text-[14px] font-semibold text-[#4059aa] transition-colors hover:text-[#264191]"
          >
            <Forward
              size={18}
              className="rotate-180 transition-transform group-hover:-translate-x-1"
            />
            Quay lại trang Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CheckEmailPage
