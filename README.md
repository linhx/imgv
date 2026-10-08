# imgv - Trình xem ảnh tốc độ cao (Hỗ trợ ảnh tĩnh & ảnh động)

**imgv** là một công cụ xem ảnh hiện đại, hiệu năng cao viết bằng **Golang**, hỗ trợ tất cả các định dạng ảnh phổ biến (cả tĩnh và động) với giao diện desktop frameless/app-mode mượt mà.

---

## ✨ Điểm nổi bật

1. **Hỗ trợ toàn diện các loại ảnh**:
   - **Ảnh động (Animated)**: GIF, Animated WebP, APNG (Animated PNG), Animated SVG, Animated AVIF.
   - **Ảnh tĩnh (Static)**: JPEG/JPG, PNG, WebP, SVG, BMP, ICO, AVIF, TIFF/TIF (tự động convert hiển thị on-the-fly).
2. **Preview động ngay lập tức**:
   - Khi chọn ảnh, chế độ preview tự động phát ảnh động mượt mà ở đúng tốc độ khung hình gốc.
   - Hỗ trợ nút **Pause / Play** (đóng băng frame hiện tại bằng Canvas hoặc tiếp tục phát) chỉ với 1 phím `Space`.
3. **Menu chuột phải (Context Menu) phong cách Desktop chuyên nghiệp**:
   - Thay thế hoàn toàn menu chuột phải HTML mặc định bằng menu native tối ưu riêng cho xem ảnh.
   - **📂 Mở thư mục chứa file**: Mở File Manager của hệ điều hành và highlight trực tiếp file ảnh.
   - **🚀 Mở bằng ứng dụng mặc định**: Mở file ảnh bằng trình xem ảnh mặc định của OS (Gnome Image Viewer, Gwenview, v.v.).
   - **📋 Copy ảnh vào Clipboard**: Copy trực tiếp dữ liệu ảnh để paste (`Ctrl+V`) vào Photoshop, Discord, Telegram, Figma...
   - **🔗 Copy đường dẫn file**: Copy đường dẫn tuyệt đối nhanh chóng.
   - **⏯️ Tạm dừng / Tiếp tục ảnh động**: Điều khiển phát/dừng ảnh động trực tiếp từ menu.
   - **🔄 Xoay 90° & 🪞 Lật ảnh ngang (Flip)**: Xoay hoặc lật gương ảnh.
   - **🔍 Fit màn hình & 1️⃣ Kích thước thật 100% (1:1)**: Chuyển đổi tỉ lệ xem.
   - **ℹ️ Xem thông tin chi tiết (Properties)**: Hộp thoại hiển thị chi tiết độ phân giải, megapixels, dung lượng, tỉ lệ khung hình, ngày sửa đổi.
   - **🗑️ Xóa file**: Xóa ảnh nhanh có xác nhận an toàn.
4. **Tối ưu siêu tốc cho thư mục khổng lồ (Recursive & Tens of thousands of images)**:
   - **Backend**: Sử dụng `filepath.WalkDir` để quét cây thư mục mà không tốn syscall `stat`, tự động bỏ qua các thư mục rác/mã nguồn (`.git`, `node_modules`, `vendor`, `.cache`...).
   - **Zero I/O Animation Check**: Nhận diện tức thì các định dạng tĩnh (`JPEG`, `BMP`, `TIFF`, `ICO`) mà không cần mở file. Chỉ kiểm tra chunk animation ở các file có thể động (`GIF`, `WebP VP8X`, `APNG`).
   - **Bounded Concurrency & Cache**: Worker pool đa luồng giới hạn tránh cạn kiệt file descriptors của OS, kết hợp bộ nhớ cache RAM cho các lần duyệt lại trong mili-giây.
   - **Frontend Virtual Scrolling**: Dù có 50.000+ ảnh, danh sách bên trái chỉ render ~20 DOM items hiển thị trên màn hình. Trình duyệt cuộn mượt 60/120 FPS, không lag, không tốn RAM.
   - **Filmstrip Windowed Rail**: Thanh thumbnail chỉ tải cửa sổ lân cận ảnh đang chọn, không kéo cả thư mục khổng lồ vào DOM.
4. **CLI trực quan**:
   - Chạy trực tiếp với folder: `imgv .` hoặc `imgv /path/to/folder` hoặc `imgv ~/Pictures`.
   - Hỗ trợ cờ đệ quy `-r` / `--recursive` để quét cả thư mục con (có thể bật/tắt ngay trên UI).
4. **Trải nghiệm Desktop Native**:
   - Tự động mở cửa sổ độc lập (Chromium app-mode không thanh địa chỉ/tabs) hoặc fallback về trình duyệt mặc định.
   - Tự động đóng server khi tắt cửa sổ hoặc bấm `Ctrl+C`.
5. **Bộ công cụ xem ảnh chuyên nghiệp**:
   - Zoom mượt mà bằng con lăn chuột theo vị trí con trỏ chuột (0.05x - 25x).
   - Kéo rê (pan/drag) khi phóng to.
   - Phím tắt `0` để Fit to screen, `1` để xem tỉ lệ 100% (1:1).
   - Xoay ảnh 90° (`R`), Fullscreen (`F`).
   - Copy đường dẫn file (`C`), mở vị trí file trong File Manager (`📂`).
   - Bộ lọc thông minh: Lọc nhanh ảnh động (⚡ Animated), ảnh tĩnh (Static), lọc theo định dạng (GIF, WebP, PNG...), tìm kiếm tức thì theo tên (`/`).

---

## 🚀 Cài đặt & Build

Chương trình được đóng gói thành **1 file nhị phân duy nhất** (single standalone binary) không phụ thuộc file ngoài nhờ Go `embed`:

```bash
cd /mnt/data/Work/mine/3.pets/img-viewer
go build -o imgv main.go
```

Cài đặt vào hệ thống để dùng lệnh `imgv` ở bất cứ đâu:
```bash
sudo mv imgv /usr/local/bin/
# hoặc cài vào user bin:
# mv imgv ~/.local/bin/
```

---

## 💻 Cách sử dụng CLI

Khi bạn gõ lệnh, chương trình sẽ **mở cửa sổ ứng dụng và giải phóng terminal ngay lập tức** (bạn có thể tiếp tục gõ các lệnh khác trong terminal bình thường). Khi bạn đóng cửa sổ xem ảnh, tiến trình ngầm sẽ tự động dọn dẹp và kết thúc.

```bash
# Mở xem TẤT CẢ ảnh đệ quy trong thư mục hiện tại (terminal thoát ngay lập tức)
imgv .

# Mở xem ảnh trong thư mục chỉ định
imgv ~/Pictures
imgv /path/to/my-folder

# Chế độ KHÔNG đệ quy (chỉ quét thư mục cấp 1, bỏ qua thư mục con)
imgv --flat .
# hoặc:
imgv --no-recursive ~/Pictures

# Nếu muốn chạy bám theo terminal để xem log (Foreground mode)
imgv -f .
# hoặc:
imgv --foreground .

# Chạy làm HTTP server không tự mở cửa sổ
imgv -p 8080 --no-open .

# Xem hướng dẫn
imgv --help
```

---

## ⌨️ Phím tắt (Keyboard Shortcuts)

| Phím | Chức năng |
| :--- | :--- |
| `→` / `D` / `J` | Xem ảnh kế tiếp |
| `←` / `A` / `K` | Xem ảnh trước đó |
| `Space` | **Tạm dừng / Tiếp tục phát ảnh động** (Play/Pause) |
| `F` | Bật / tắt chế độ toàn màn hình (Fullscreen) |
| `0` | Fit ảnh vừa với màn hình |
| `1` | Xem kích thước thật 100% (1:1) |
| `+` / `-` | Phóng to / Thu nhỏ |
| `R` | Xoay ảnh 90 độ |
| `C` | Copy đường dẫn tuyệt đối của file |
| `Delete` | Xóa ảnh (có hộp thoại xác nhận) |
| `/` | Focus nhanh vào ô tìm kiếm |
| `?` | Bật bảng trợ giúp phím tắt |
| `Esc` | Thoát fullscreen hoặc đóng modal |
