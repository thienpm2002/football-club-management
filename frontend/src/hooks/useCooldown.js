import { useEffect, useState } from 'react'

// Bước 1: Tính số giây cooldown còn lại dựa trên deadline đã lưu.
//
// sessionStorage lưu deadline dưới dạng chuỗi timestamp (milliseconds).
// Ví dụ: deadline = 1795670000000
function getRemainingSeconds(storageKey) {
  // Đọc deadline từ sessionStorage và chuyển chuỗi thành Number.
  const deadline = Number(sessionStorage.getItem(storageKey))

  // Nếu không có deadline hoặc dữ liệu không hợp lệ,
  // xem như cooldown đã kết thúc.
  if (!deadline || Number.isNaN(deadline)) {
    return 0
  }

  // Tính thời gian còn lại:
  // deadline - thời điểm hiện tại = milliseconds còn lại.
  // Chia 1000 để chuyển milliseconds thành seconds.
  // Math.ceil() làm tròn lên để tránh countdown kết thúc sớm.
  // Math.max(0, ...) đảm bảo kết quả không âm.
  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
}

function useCooldown(storageKey, durationSeconds = 60) {
  // Bước 2: Khởi tạo state bằng thời gian cooldown còn lại.
  //
  // Dùng function initializer để chỉ đọc sessionStorage
  // trong lần khởi tạo state đầu tiên của component.
  //
  // Nếu người dùng refresh trang mà deadline vẫn còn,
  // countdown sẽ được khôi phục thay vì bắt đầu lại từ đầu.
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    getRemainingSeconds(storageKey),
  )

  // Bước 3: Xác định có đang trong thời gian cooldown không.
  //
  // Đây là giá trị được tính từ state, không cần tạo thêm state riêng.
  const isCoolingDown = remainingSeconds > 0

  // Bước 4: Đồng bộ countdown với sessionStorage
  // và tạo interval để cập nhật mỗi giây.
  useEffect(() => {
    // Nếu cooldown đã kết thúc:
    if (!isCoolingDown) {
      // Xóa deadline cũ để tránh dữ liệu hết hạn còn lưu lại.
      sessionStorage.removeItem(storageKey)
      return
    }

    // Nếu vẫn đang cooldown, bắt đầu cập nhật mỗi giây.
    const intervalId = setInterval(() => {
      // Không đơn giản giảm state đi 1,
      // mà tính lại dựa trên deadline thực tế.
      //
      // Cách này tránh countdown bị sai lệch
      // khi tab trình duyệt chạy chậm hoặc bị tạm dừng.
      const remaining = getRemainingSeconds(storageKey)

      // Cập nhật state để React render lại giao diện.
      setRemainingSeconds(remaining)

      // Khi hết thời gian, dừng interval.
      if (remaining <= 0) {
        clearInterval(intervalId)
      }
    }, 1000)

    // Cleanup:
    // React gọi hàm này khi effect chạy lại
    // hoặc component bị unmount.
    //
    // Việc clear interval giúp tránh tạo nhiều interval
    // cùng chạy và tránh rò rỉ tài nguyên.
    return () => clearInterval(intervalId)
  }, [isCoolingDown, storageKey])

  // Bước 5: Bắt đầu một khoảng cooldown mới.
  function startCooldown() {
    // Tính thời điểm cooldown kết thúc.
    //
    // Date.now() trả về timestamp milliseconds.
    // durationSeconds * 1000 chuyển số giây thành milliseconds.
    const deadline = Date.now() + durationSeconds * 1000

    // Lưu deadline vào sessionStorage dưới dạng chuỗi.
    //
    // Không lưu remainingSeconds vì nó thay đổi mỗi giây.
    // Lưu deadline giúp tính lại chính xác khi refresh trang.
    sessionStorage.setItem(storageKey, String(deadline))

    // Cập nhật state để giao diện bắt đầu countdown ngay.
    setRemainingSeconds(durationSeconds)
  }

  // Bước 6: Trả dữ liệu và hàm điều khiển cho component sử dụng.
  return {
    remainingSeconds, // Số giây còn lại
    isCoolingDown,    // Có đang cooldown hay không
    startCooldown,    // Hàm bắt đầu cooldown
  }
}

export default useCooldown
