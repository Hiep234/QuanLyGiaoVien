# HỆ THỐNG TÍNH TIỀN DạY - HƯỚNG DẪN SỬ DỤNG

## Tổng quan
Hệ thống tính tiền dạy được thiết kế để tự động tính toán tiền dạy cho giáo viên dựa trên công thức:

**Tiền_dạy_mỗi_lớp = số_tiết_quy_đổi × hệ_số_giáo_viên × tiền_dạy_một_tiết**

Trong đó:
- **Số_tiết_quy_đổi = Số tiết thực tế × (hệ_số_học_phần + hệ_số_lớp)**

## Các chức năng chính

### UC3.1: Thiết lập định mức tiền theo tiết
- **Mục đích**: Quản lý giá tiền cho một tiết chuẩn
- **Tính năng**:
  - Thêm/sửa/xóa định mức tiền
  - Kích hoạt định mức (chỉ có 1 định mức hoạt động tại 1 thời điểm)
  - Lưu trữ lịch sử các định mức

### UC3.2: Thiết lập hệ số giáo viên (theo bằng cấp)
- **Mục đích**: Định nghĩa hệ số tính lương dựa trên trình độ học vấn
- **Tích hợp**: Sử dụng danh sách bằng cấp từ hệ thống quản lý giáo viên
- **Hệ số đề xuất**:
  - Đại học: 1.3
  - Thạc sỹ: 1.5
  - Tiến sỹ: 1.7
  - Phó giáo sư: 2.0
  - Giáo sư: 2.5

### UC3.3: Thiết lập hệ số lớp
- **Mục đích**: Định nghĩa hệ số dựa trên số lượng sinh viên
- **Hệ số mặc định**:
  - Dưới 20 SV: -0.3
  - 20-29 SV: -0.2
  - 30-39 SV: -0.1
  - 40-49 SV: 0
  - 50-59 SV: 0.1
  - 60-69 SV: 0.2
  - 70-79 SV: 0.3
  - 80+ SV: 0.4

### UC3.4: Tính tiền dạy cho một giáo viên trong một kì
- **Mục đích**: Tính toán tổng tiền dạy cho giáo viên
- **Thông tin hiển thị**:
  - Tổng số lớp phụ trách
  - Tổng số tiết thực tế
  - Tổng số tiết quy đổi
  - Tổng tiền dạy
  - Bảng chi tiết từng lớp

## Hướng dẫn sử dụng

### 1. Thiết lập định mức tiền
1. Vào menu "Tính tiền dạy" → "Định mức tiền/tiết"
2. Click "Thêm định mức"
3. Nhập tên định mức và số tiền
4. Kích hoạt định mức mong muốn

### 2. Cấu hình hệ số giáo viên
1. Vào menu "Tính tiền dạy" → "Hệ số giáo viên"
2. Click "Thêm hệ số"
3. Chọn bằng cấp từ dropdown (dữ liệu từ hệ thống quản lý giáo viên)
4. Nhập hệ số tương ứng

### 3. Cấu hình hệ số lớp
1. Vào menu "Tính tiền dạy" → "Hệ số lớp"
2. Thiết lập khoảng số sinh viên và hệ số tương ứng
3. Đảm bảo không có khoảng trống

### 4. Tính tiền dạy
1. Vào menu "Tính tiền dạy" → "Tính tiền dạy"
2. Chọn kì học
3. Chọn giáo viên
4. Click "Tính tiền dạy"
5. Xem kết quả chi tiết

## Công thức tính toán chi tiết

### Ví dụ tính toán:
- **Học phần**: Lập trình Java (45 tiết, hệ số 1.2)
- **Lớp**: 35 sinh viên (hệ số -0.1)
- **Giáo viên**: Thạc sỹ (hệ số 1.5)
- **Định mức**: 50,000 VNĐ/tiết

**Tính toán**:
1. Số tiết quy đổi = 45 × (1.2 + (-0.1)) = 45 × 1.1 = 49.5 tiết
2. Tiền dạy = 49.5 × 1.5 × 50,000 = 3,712,500 VNĐ

## API Endpoints

### Salary Rates
- `GET /api/salary/rates` - Lấy danh sách định mức
- `POST /api/salary/rates` - Tạo định mức mới
- `PUT /api/salary/rates/:id` - Cập nhật định mức
- `PUT /api/salary/rates/:id/activate` - Kích hoạt định mức
- `DELETE /api/salary/rates/:id` - Xóa định mức

### Teacher Coefficients
- `GET /api/salary/teacher-coefficients` - Lấy hệ số giáo viên
- `POST /api/salary/teacher-coefficients` - Tạo hệ số mới
- `PUT /api/salary/teacher-coefficients/:id` - Cập nhật hệ số
- `DELETE /api/salary/teacher-coefficients/:id` - Xóa hệ số

### Class Coefficients
- `GET /api/salary/class-coefficients` - Lấy hệ số lớp
- `POST /api/salary/class-coefficients` - Tạo hệ số mới
- `PUT /api/salary/class-coefficients/:id` - Cập nhật hệ số
- `DELETE /api/salary/class-coefficients/:id` - Xóa hệ số

### Salary Calculation
- `POST /api/salary/calculate` - Tính tiền dạy
- `GET /api/salary/teachers/:semesterId` - Lấy danh sách GV trong kì

## Models cơ sở dữ liệu

### SalaryRate
```javascript
{
  name: String,           // Tên định mức
  ratePerPeriod: Number,  // Tiền/tiết
  description: String,    // Mô tả
  isActive: Boolean,      // Trạng thái kích hoạt
  createdDate: Date,      // Ngày tạo
  updatedDate: Date       // Ngày cập nhật
}
```

### TeacherCoefficient
```javascript
{
  degreeId: ObjectId,     // Liên kết với bảng Degree
  coefficient: Number,    // Hệ số
  description: String,    // Mô tả
  isActive: Boolean,      // Trạng thái
  createdDate: Date,      // Ngày tạo
  updatedDate: Date       // Ngày cập nhật
}
```

### ClassCoefficient
```javascript
{
  minStudents: Number,    // Số SV tối thiểu
  maxStudents: Number,    // Số SV tối đa
  coefficient: Number,    // Hệ số
  description: String,    // Mô tả
  isActive: Boolean,      // Trạng thái
  createdDate: Date,      // Ngày tạo
  updatedDate: Date       // Ngày cập nhật
}
```

## Lưu ý quan trọng

1. **Tích hợp dữ liệu**: Hệ thống tự động lấy danh sách bằng cấp từ quản lý giáo viên
2. **Khoảng sinh viên**: Không được có khoảng trống trong hệ số lớp
3. **Định mức active**: Chỉ có 1 định mức được kích hoạt tại 1 thời điểm
4. **Phân công giáo viên**: Giáo viên phải được phân công lớp trước khi tính tiền
5. **Dữ liệu đầy đủ**: Đảm bảo có đủ học phần, lớp, phân công để tính toán chính xác
6. **Hệ số giáo viên**: Mỗi bằng cấp chỉ có 1 hệ số duy nhất 