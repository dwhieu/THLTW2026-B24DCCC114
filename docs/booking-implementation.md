# Tài liệu triển khai bài “Đặt lịch hẹn + Quản lý” (chi tiết)

Tài liệu này mô tả **cách mình đã triển khai** ứng dụng đặt lịch hẹn trong repo hiện tại (Ant Design Pro + Umi 3), bao gồm **các bước thực hiện**, **thư viện/tech sử dụng**, **rule nghiệp vụ**, và **cách chạy kiểm tra**.

> Mục tiêu của bài: xây dựng ứng dụng đặt lịch cho dịch vụ (cắt tóc/spa/khám bệnh/sửa chữa…) và quản lý theo nhân viên, thời gian, trạng thái + đánh giá + thống kê báo cáo. **Mỗi phần là 1 trang trên menu**.

---

## 1) Bối cảnh repo & các ràng buộc kỹ thuật

Repo đang dùng:

- **Umi 3** (cơ chế routing qua `config/routes.ts`, model qua `src/models/*.ts` và hook `useModel()`)
- **Ant Design 4.21** (API `Modal` dùng prop `visible`, `Tabs` dùng `Tabs.TabPane`; không dùng `open` hay `items` như antd v5)
- TypeScript bật strict (`tsconfig.json` có `strict: true`, `noUnusedLocals: true`, `noImplicitReturns: true`)

Vì yêu cầu bài là chức năng UI + quản lý lịch, và repo hiện tại không có backend cho module này, mình triển khai theo hướng:

- **Không cần backend**: lưu dữ liệu bằng **`localStorage`**.
- Toàn bộ logic nghiệp vụ đặt lịch/kiểm tra trùng/giới hạn/ngày/khung giờ làm việc nằm ở **model** (để nhiều trang dùng chung).

---

## 2) Thiết kế module (tổng quan kiến trúc)

### 2.1. Tách thành 4 trang đúng yêu cầu menu

Mình tạo 4 trang tương ứng 4 chức năng:

1. **Nhân viên & Dịch vụ**: CRUD nhân viên + dịch vụ
2. **Lịch hẹn**: đặt lịch + cập nhật trạng thái + chống trùng
3. **Đánh giá**: đánh giá sau hoàn thành + phản hồi + điểm trung bình nhân viên
4. **Thống kê & báo cáo**: thống kê số lịch theo ngày/tháng + doanh thu theo dịch vụ/nhân viên

### 2.2. Dữ liệu & nghiệp vụ gom vào một model dùng chung

Model nằm ở: `src/models/booking.ts`

- Cung cấp state: `employees`, `services`, `appointments`, `reviews`
- Cung cấp action: CRUD nhân viên/dịch vụ, tạo lịch hẹn, cập nhật status, tạo đánh giá, phản hồi đánh giá
- Dùng `localStorage` để persist (đọc/ghi)

Lý do:

- Các trang phụ thuộc chung vào dữ liệu đặt lịch.
- Gom rule nghiệp vụ vào model để UI chỉ gọi action; dễ maintain.

---

## 3) Danh sách file đã tạo / sửa

### File mới

- `src/models/booking.ts`: model + types + rule nghiệp vụ + seed dữ liệu mẫu
- `src/pages/DatLich/NhanVienDichVu/index.tsx`: trang quản lý nhân viên & dịch vụ
- `src/pages/DatLich/LichHen/index.tsx`: trang đặt lịch + cập nhật trạng thái
- `src/pages/DatLich/DanhGia/index.tsx`: trang đánh giá + phản hồi + điểm trung bình
- `src/pages/DatLich/BaoCao/index.tsx`: trang thống kê & báo cáo
- `docs/booking-implementation.md`: tài liệu này

### File sửa (wiring + fix TypeScript)

- `config/routes.ts`: thêm 4 route mới vào menu

Ngoài ra mình đã sửa một số lỗi TypeScript **đã tồn tại trước đó** để `npm run tsc` pass (vì repo bật `noUnusedLocals/noImplicitReturns`):

- `src/components/Loading/index.tsx`
- `src/components/OneSignalBounder/index.tsx`
- `src/models/tienich/caidat.ts`
- `src/pages/RandomUser/index.tsx`
- `src/pages/TodoList/TodoItem.tsx`

Các sửa này nhằm **không đổi hành vi chính**, chỉ để build/typecheck không bị chặn.

---

## 4) Chi tiết triển khai model `booking` (src/models/booking.ts)

### 4.1. Types dữ liệu

Model định nghĩa các type chính:

- `Employee`: nhân viên
  - `dailyLimit`: giới hạn khách/ngày
  - `workingHours`: lịch làm việc theo thứ (`dayOfWeek` 0..6) + `start/end` dạng `HH:mm`
- `Service`: dịch vụ
  - `price`: giá
  - `durationMinutes`: thời lượng thực hiện
- `Appointment`: lịch hẹn
  - `date`: `YYYY-MM-DD`
  - `startTime/endTime`: `HH:mm`
  - `status`: `pending | confirmed | completed | cancelled`
- `Review`: đánh giá
  - gắn với `appointmentId`
  - `rating` 1..5
  - `staffReply` (phản hồi của nhân viên)

### 4.2. Persist bằng localStorage

Sử dụng key namespace rõ ràng:

- `booking:employees`
- `booking:services`
- `booking:appointments`
- `booking:reviews`

Luồng init:

1. `init()` đọc các key từ localStorage
2. Nếu chưa có nhân viên/dịch vụ thì **seed mẫu** (2 nhân viên + 3 dịch vụ)
3. `persist()` ghi lại để đảm bảo lần sau vào có dữ liệu

### 4.3. Rule nghiệp vụ đặt lịch (chống trùng + limit + lịch làm)

Khi gọi `createAppointment(payload)`:

1. Validate bắt buộc: tên khách, serviceId, staffId, date, startTime
2. Tính `endTime = startTime + durationMinutes` của dịch vụ
3. Check nhân viên có làm việc trong ngày đó (theo `dayOfWeek`)
4. Check khung giờ hẹn phải nằm trong `[work.start, work.end]`
5. Lọc các lịch của nhân viên cùng ngày và **không bị cancelled**
6. Check `dailyLimit`: số lịch active trong ngày không vượt `staff.dailyLimit`
7. Check trùng giờ: dùng overlap interval

Overlap dùng điều kiện:

- Hai khoảng [aStart, aEnd) và [bStart, bEnd) trùng khi: `aStart < bEnd && bStart < aEnd`

### 4.4. Rule nghiệp vụ đánh giá

`createReview(payload)` chỉ cho phép khi:

- Appointment tồn tại
- Appointment có status `completed`
- Appointment chưa có review trước đó

---

## 5) Chi tiết 4 trang UI

### 5.1. Trang 1: Nhân viên & Dịch vụ

File: `src/pages/DatLich/NhanVienDichVu/index.tsx`

UI chính:

- Tabs 2 tab (Antd v4):
  - Tab Nhân viên: Table + Modal thêm/sửa
  - Tab Dịch vụ: Table + Modal thêm/sửa

Nhân viên:

- Form input: tên, dailyLimit, ngày làm việc, khung giờ làm (TimePicker.RangePicker)
- Lưu: `upsertEmployee()`
- Xóa: `deleteEmployee()` (lịch hẹn/đánh giá giữ lại như lịch sử)

Dịch vụ:

- Form input: tên, giá, thời lượng (phút)
- Lưu: `upsertService()`
- Xóa: `deleteService()`

Lưu ý Antd v4:

- `Modal` dùng `visible={...}`
- `Tabs` dùng `<Tabs.TabPane ...>` thay vì prop `items`

### 5.2. Trang 2: Lịch hẹn

File: `src/pages/DatLich/LichHen/index.tsx`

UI chính:

- Form inline đặt lịch:
  - Tên khách, SĐT (tuỳ chọn)
  - Dịch vụ (Select)
  - Nhân viên (Select)
  - Ngày (DatePicker)
  - Giờ bắt đầu (TimePicker)
  - Ghi chú
- Khi chọn dịch vụ + giờ, hiển thị preview “giờ kết thúc dự kiến”

Bảng lịch hẹn:

- Hiển thị ngày, giờ, dịch vụ, nhân viên, khách hàng, trạng thái
- Cho đổi trạng thái bằng Select gọi `updateAppointmentStatus()`

Rule chống trùng/limit/khung giờ được enforce ở model, UI chỉ hiển thị lỗi bằng `message.error()`.

### 5.3. Trang 3: Đánh giá

File: `src/pages/DatLich/DanhGia/index.tsx`

UI chính:

- Bảng “điểm trung bình theo nhân viên” dựa trên `staffAverageRatings`
- Bảng “lịch hoàn thành chưa đánh giá”: lấy các appointment `completed` nhưng chưa có review
- Bảng “danh sách đánh giá”: hiển thị rating, comment, staffReply

Modal:

- Modal “Đánh giá”: Rate + comment → `createReview()`
- Modal “Phản hồi”: TextArea → `replyReview()`

### 5.4. Trang 4: Thống kê & báo cáo

File: `src/pages/DatLich/BaoCao/index.tsx`

UI chính:

- RangePicker chọn khoảng thời gian
- Chỉ tính appointment status `completed`

Báo cáo:

- Số lượng lịch theo **ngày**
- Số lượng lịch theo **tháng**
- Doanh thu theo **dịch vụ**: tổng = count \* price
- Doanh thu theo **nhân viên**: tổng = cộng price theo appointment

---

## 6) Wiring route/menu

File: `config/routes.ts`

Thêm 4 route (mỗi route là 1 menu item):

- `/nhan-vien-dich-vu` → `./DatLich/NhanVienDichVu`
- `/lich-hen` → `./DatLich/LichHen`
- `/danh-gia` → `./DatLich/DanhGia`
- `/bao-cao` → `./DatLich/BaoCao`

Icon dùng string icon name theo plugin icon của Ant Design Pro.

---

## 7) Các lệnh chạy & kiểm tra

Chạy dev:

- `npm run start` (hoặc `npm run start:dev`)

Typecheck:

- `npm run tsc`

Build:

- `npm run build`

---

## 8) Dữ liệu demo / reset dữ liệu

Seed mặc định (lần đầu vào nếu localStorage trống):

- 2 nhân viên, 3 dịch vụ

Reset dữ liệu module đặt lịch:

- Xóa các key `booking:*` trong localStorage hoặc mở DevTools và chạy:
  - `localStorage.removeItem('booking:employees')`
  - `localStorage.removeItem('booking:services')`
  - `localStorage.removeItem('booking:appointments')`
  - `localStorage.removeItem('booking:reviews')`

---

## 9) Ghi chú về sửa lỗi TypeScript ngoài phạm vi module

Trong quá trình validate bằng `npm run tsc`, repo có sẵn một số lỗi strict TS (unused locals/implicit any/no implicit return). Mình đã sửa tối thiểu để typecheck pass.

Nếu bạn muốn giữ nguyên các file demo (RandomUser/TodoList/OneSignalBounder) và không cần `tsc` pass, có thể revert các thay đổi đó bằng git (nhưng khi đó `npm run tsc` sẽ fail lại).

---

## 10) Hướng mở rộng (nếu cần)

Một số nâng cấp thường gặp:

- Lọc danh sách nhân viên rảnh theo ngày/giờ/dịch vụ ngay trên form đặt lịch
- Cho phép cấu hình nhiều khung giờ/ngày (hiện tại UI thiết kế đơn giản: 1 khung giờ áp cho nhiều ngày)
- Thêm quản lý khách hàng (CRM đơn giản)
- Đồng bộ backend thật (REST API) thay vì localStorage
