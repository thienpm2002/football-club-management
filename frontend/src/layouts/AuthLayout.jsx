import { Link, Outlet } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  CircleDot,
  Images,
  ShieldCheck,
  Users,
} from 'lucide-react'

const benefits = [
  {
    icon: CalendarDays,
    text: 'Xem lịch tập luyện, thi đấu giao hữu cuối tuần và sự kiện sinh hoạt mới nhất.',
  },
  {
    icon: Images,
    text: 'Chia sẻ hình ảnh, video highlight trận đấu và bình luận gắn kết cùng đồng đội.',
  },
  {
    icon: Users,
    text: 'Không gian sinh hoạt minh bạch, lành mạnh và văn minh vì niềm đam mê bóng đá sân cỏ.',
  },
]

function ClubBrand({ compact = false }) {
  return (
    <div className={`flex items-center gap-3.5 ${compact ? 'flex-col text-center gap-2' : ''}`}>
      <div
        className={`flex shrink-0 items-center justify-center rounded-full bg-[#004c22] text-white shadow-sm ring-4 ring-[#e8f5e9] ${
          compact ? 'h-12 w-12' : 'h-12 w-12'
        }`}
      >
        <CircleDot size={compact ? 25 : 27} strokeWidth={2} />
      </div>

      <div>
        <span className="block text-[18px] font-bold leading-tight tracking-tight text-[#0b1c30]">
          CLB Bóng Đá Phú Mỹ
        </span>
        <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-wider text-[#717970]">
          Cộng Đồng Bóng Đá Nghiệp Dư
        </span>
      </div>
    </div>
  )
}

function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9ff] font-sans text-[#0b1c30] antialiased selection:bg-[#e8f5e9] selection:text-[#004c22]">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-7xl items-center px-4 py-6 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="group inline-flex items-center gap-2.5 text-[14px] font-semibold text-[#404940] transition-colors hover:text-[#004c22]"
        >
          <ArrowLeft
            size={18}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          <span>Quay về trang chủ</span>
        </Link>
      </header>

      {/* Main authentication area */}
      <main className="mx-auto flex w-full max-w-5xl flex-1  items-start justify-center px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Desktop branding panel */}
          <section className="hidden flex-col justify-between py-2 lg:col-span-5 lg:flex">
            <div className="space-y-6">
              <ClubBrand />

              <div className="space-y-3 pt-4">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#a5d6a7]/60 bg-[#e8f5e9] px-3 py-1 text-[12px] font-semibold tracking-wide text-[#004c22]">
                  <ShieldCheck size={15} />
                  <span>HỆ THỐNG NỘI BỘ THÀNH VIÊN</span>
                </div>

                <h1 className="text-3xl font-extrabold leading-[1.2] tracking-tight text-[#0b1c30] sm:text-4xl">
                  Kết nối cùng cộng đồng bóng đá!
                </h1>

                <p className="pt-1 text-[15px] leading-relaxed text-[#404940]">
                  Đồng hành cùng câu lạc bộ, chia sẻ đam mê và cập nhật những hoạt động
                  bóng đá mới nhất.
                </p>
              </div>

              <div className="space-y-3.5 border-t border-[#cbdbf5]/50 pt-6">
                {benefits.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8f5e9] text-[#004c22]">
                      <Icon size={15} />
                    </div>
                    <p className="text-[14px] leading-normal text-[#404940]">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2 pt-4 text-[13px] text-[#717970]">
              <ShieldCheck size={16} className="text-[#004c22]" />
              <span>Bảo mật thông tin &amp; quản trị nội bộ chuẩn mực</span>
            </div>
          </section>

          {/* Page content */}
          <section className="mx-auto w-full max-w-md lg:col-span-7 lg:max-w-none">
            {/* Mobile branding */}
            <div className="mb-6 flex flex-col items-center text-center lg:hidden">
              <ClubBrand compact />
            </div>

            <Outlet />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-7xl px-4 py-6 text-center sm:px-6 lg:px-8">
        <p className="text-[12px] text-[#717970]">
          © CLB Bóng Đá Phú Mỹ. Bản quyền thuộc cộng đồng thành viên.
        </p>
      </footer>
    </div>
  )
}

export default AuthLayout
