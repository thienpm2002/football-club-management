import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CircleCheck,
  Link2Off,
  LoaderCircle,
  MailCheck,
  ShieldCheck,
} from 'lucide-react'

import authService from '@/services/auth.service'
import useAuthStore from '@/stores/auth.store'

const VERIFY_STATUS = {
  CONFIRM: 'confirm',
  LOADING: 'loading',
  SUCCESS: 'success',
  EXPIRED: 'expired',
  INVALID: 'invalid',
  ALREADY_VERIFIED: 'already_verified',
  ACCOUNT_DISABLED: 'account_disabled',
  ERROR: 'error',
}

function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('token')

  const [status, setStatus] = useState(VERIFY_STATUS.CONFIRM)

  async function handleVerifyEmail() {
    if (status !== VERIFY_STATUS.CONFIRM) return

    setStatus(VERIFY_STATUS.LOADING)

    try {
      const res = await authService.verifyEmail(token)

      useAuthStore.getState().setAuth(
        res.data.user,
        res.data.accessToken,
      )

      setStatus(VERIFY_STATUS.SUCCESS)
    } catch (error) {
      const apiError = error.apiError

      switch (apiError?.code) {
        case 'EMAIL_ALREADY_VERIFIED':
          setStatus(VERIFY_STATUS.ALREADY_VERIFIED)
          break

        case 'EMAIL_VERIFICATION_TOKEN_EXPIRED':
          setStatus(VERIFY_STATUS.EXPIRED)
          break

        case 'INVALID_EMAIL_VERIFICATION_TOKEN':
          setStatus(VERIFY_STATUS.INVALID)
          break

        case 'ACCOUNT_DISABLED':
          setStatus(VERIFY_STATUS.ACCOUNT_DISABLED)
          break  

        default:
          setStatus(VERIFY_STATUS.ERROR)
      }
    }
  }

  // Tự động chuyển về trang chủ sau khi xác thực thành công.
  useEffect(() => {
    if (status !== VERIFY_STATUS.SUCCESS) return

    const timeoutId = setTimeout(() => {
      navigate('/', { replace: true })
    }, 2500)

    return () => clearTimeout(timeoutId)
  }, [status, navigate])

  // Không có token thì không cần hiển thị trang xác thực.
  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="mx-auto w-full max-w-130">
      <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-xl sm:p-10">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[#166534]/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-[#4059aa]/10 blur-xl" />

        {/* Initial confirmation */}
        {status === VERIFY_STATUS.CONFIRM && (
          <div className="animate-fadeIn flex flex-col items-center text-center">
            <div className="my-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#adf3b8]/40 text-[#004c22] shadow-sm">
              <MailCheck size={36} />
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#0b1c30]">
              Xác thực email của bạn
            </h1>

            <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-[#404940]">
              Nhấn nút bên dưới để hoàn tất xác thực địa chỉ email và kích hoạt
              tài khoản CLB.
            </p>

            <div className="mt-6 w-full rounded-xl border border-[#c0c9be]/30 bg-[#eff4ff] p-4">
              <div className="flex items-center justify-center gap-2 text-[13px] leading-relaxed text-[#404940]">
                <ShieldCheck size={17} className="shrink-0 text-[#004c22]" />
                Liên kết xác thực được gửi riêng cho tài khoản của bạn.
              </div>
            </div>

            <button
              type="button"
              onClick={handleVerifyEmail}
              className="mt-6 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#166534] px-4 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-[#004c22] active:scale-[0.99]"
            >
              <ShieldCheck size={19} />
              Xác thực email
            </button>
          </div>
        )}

        {/* Loading */}
        {status === VERIFY_STATUS.LOADING && (
          <div className="animate-fadeIn flex flex-col items-center text-center">
            <div className="my-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#adf3b8]/30">
              <LoaderCircle size={40} className="animate-spin text-[#004c22]" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#0b1c30]">
              Đang xác thực email...
            </h1>

            <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-[#404940]">
              Vui lòng giữ kết nối trong giây lát, hệ thống đang xử lý và kích
              hoạt tài khoản của bạn.
            </p>

            <button
              type="button"
              disabled
              className="mt-6 flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-[#166534]/70 text-[14px] font-semibold text-white opacity-80"
            >
              <LoaderCircle size={19} className="animate-spin" />
              Đang xác thực email...
            </button>
          </div>
        )}

        {/* Success */}
        {status === VERIFY_STATUS.SUCCESS && (
          <div className="animate-fadeIn flex flex-col items-center text-center">
            <div className="my-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#adf3b8] text-[#004c22] shadow-sm">
              <CheckCircle2 size={36} />
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#0b1c30]">
              Xác thực email thành công!
            </h1>

            <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-[#404940]">
              Tài khoản của bạn đã được kích hoạt. Bạn đã được đăng nhập và có
              thể bắt đầu sử dụng hệ thống.
            </p>

            <div className="mt-6 mb-2 flex items-center justify-center gap-2 text-[13px] font-semibold text-[#004c22]">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#166534]" />
              Đang chuyển đến trang chủ...
            </div>

            <Link
              to="/"
              replace
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#004c22] px-4 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-[#166534]"
            >
              Vào trang chủ
              <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {/* Expired token */}
        {status === VERIFY_STATUS.EXPIRED && (
          <div className="animate-fadeIn flex flex-col items-center text-center">
            <div className="my-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#ffdad6] text-[#ba1a1a] shadow-sm">
              <Link2Off size={34} />
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#0b1c30]">
              Liên kết xác thực đã hết hạn
            </h1>

            <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-[#404940]">
              Liên kết kích hoạt này không còn hiệu lực. Bạn cần yêu cầu gửi một
              liên kết xác thực mới để kích hoạt tài khoản.
            </p>

            <div className="mt-6 w-full rounded-lg bg-[#eff4ff] p-4 text-left text-[13px] leading-relaxed text-[#404940]">
              Vui lòng quay lại trang đăng ký hoặc đăng nhập để tiếp tục. Chúng
              ta sẽ bổ sung chức năng gửi lại liên kết xác thực tại đây khi tích
              hợp API.
            </div>

            <Link
              to="/login"
              className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-[#004c22] px-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#166534]"
            >
              Quay lại trang đăng nhập
            </Link>

            <Link
              to="/register"
              className="mt-3 text-[14px] font-semibold text-[#4059aa] transition-colors hover:text-[#264191]"
            >
              Quay lại trang đăng ký
            </Link>
          </div>
        )}

        {/* Invalid token */}
        {status === VERIFY_STATUS.INVALID && (
          <div className="animate-fadeIn flex flex-col items-center text-center">
            <div className="my-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#ffdad6] text-[#ba1a1a] shadow-sm">
              <Link2Off size={34} />
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#0b1c30]">
              Liên kết không hợp lệ
            </h1>

            <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-[#404940]">
              Không thể xác thực tài khoản bằng liên kết này. Vui lòng kiểm tra
              lại đường dẫn trong email hoặc yêu cầu hỗ trợ.
            </p>

            <Link
              to="/login"
              className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-[#004c22] px-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#166534]"
            >
              Quay lại trang đăng nhập
            </Link>
          </div>
        )}

        {/* Already verified */}
        {status === VERIFY_STATUS.ALREADY_VERIFIED && (
          <div className="animate-fadeIn flex flex-col items-center text-center">
            <div className="my-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#dce1ff] text-[#264191] shadow-sm">
              <CircleCheck size={36} />
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#0b1c30]">
              Tài khoản đã được xác thực
            </h1>

            <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-[#404940]">
              Email này đã hoàn tất bước kích hoạt trước đó. Bạn không cần xác
              thực lại và có thể tiến hành đăng nhập.
            </p>

            <Link
              to="/login"
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#004c22] px-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#166534]"
            >
              Đến trang đăng nhập
              <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {/* Account disabled */}
        {status === VERIFY_STATUS.ACCOUNT_DISABLED && (
          <div className="animate-fadeIn flex flex-col items-center text-center">
            <div className="my-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#ffdad6] text-[#ba1a1a] shadow-sm">
              <AlertCircle size={36} />
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#0b1c30]">
              Tài khoản đã bị vô hiệu hóa
            </h1>

            <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-[#404940]">
              Tài khoản của bạn hiện không thể được kích hoạt do đã bị vô hiệu hóa.
              Vui lòng liên hệ quản lý câu lạc bộ để được hỗ trợ.
            </p>

            <div className="mt-6 w-full rounded-lg bg-[#eff4ff] p-4 text-left text-[13px] leading-relaxed text-[#404940]">
              Việc xác thực email không thể hoàn tất khi tài khoản đang ở trạng thái
              bị vô hiệu hóa.
            </div>

            <Link
              to="/login"
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#004c22] px-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#166534]"
            >
              Quay lại trang đăng nhập
              <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {/* General error */}
        {status === VERIFY_STATUS.ERROR && (
          <div className="animate-fadeIn flex flex-col items-center text-center">
            <div className="my-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#ffdad6] text-[#ba1a1a] shadow-sm">
              <AlertCircle size={36} />
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#0b1c30]">
              Không thể xác thực email
            </h1>

            <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-[#404940]">
              Đã xảy ra lỗi trong quá trình xác thực tài khoản. Vui lòng kiểm tra
              kết nối mạng và thử lại sau.
            </p>

            <div className="mt-6 w-full rounded-lg bg-[#eff4ff] p-4 text-left text-[13px] leading-relaxed text-[#404940]">
              Nếu sự cố vẫn tiếp diễn, vui lòng quay lại trang đăng nhập hoặc
              liên hệ quản lý câu lạc bộ để được hỗ trợ.
            </div>

            <Link
              to="/login"
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#004c22] px-4 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-[#166534]"
            >
              Quay lại trang đăng nhập
              <ArrowRight size={18} />
            </Link>

            <button
              type="button"
              onClick={() => setStatus(VERIFY_STATUS.CONFIRM)}
              className="mt-3 cursor-pointer text-[14px] font-semibold text-[#4059aa] transition-colors hover:text-[#264191]"
            >
              Thử xác thực lại
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyEmailPage
