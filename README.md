# Encore (fe)

FE bán vé sự kiện: **Vite + React 19 (JS/JSX)**, Tailwind v4 + shadcn/ui, TanStack Query v5, zustand, axios, react-hook-form + zod, motion, recharts.
Hợp đồng API/route dùng chung với BE: `../backend/spec-plan/ui-api-contract.md`. Ngôn ngữ hình ảnh: `design-spec.md` (bắt buộc đọc trước khi làm UI).

Mới vào dự án: đọc `../README.md` (chạy cả FE + BE) rồi `docs/HUONG_DAN_FE.md` (dữ liệu đi thế nào, refresh token, cách thêm một trang, form, motion, test). File này là phần tra cứu nhanh.

## Chạy

```bash
npm install
cp .env.example .env.local      # tùy chọn, mặc định đã đúng cho dev
npm run dev                     # http://localhost:3000 (strictPort)
```

| Script | Việc |
|---|---|
| `npm run dev` | Vite dev server, port 3000, proxy `/api`, `/uploads`, `/mock-gateway/payments` → `http://localhost:8080` |
| `npm run build` | Build production ra `dist/` |
| `npm run preview` | Xem bản build ở port 3000 (không có proxy, cần BE cùng origin hoặc `VITE_API_BASE_URL` tuyệt đối) |
| `npm test` | Vitest (watch). Chạy một lần: `npm test -- --run` |
| `npm run lint` | ESLint (flat config, react-hooks + react-refresh) |

Biến môi trường (`.env.example`):

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `VITE_API_BASE_URL` | `/api/v1` | Base URL API. Prod: URL gateway thật, vd `https://api.example.vn/api/v1` |
| `VITE_API_TIMEOUT` | `15000` | Timeout mỗi request (ms) |
| `VITE_RQ_DEVTOOLS` | `false` | `true` = hiện nút React Query devtools khi dev |

### Chạy cùng backend

```bash
cd ../backend/be-view
./mvnw spring-boot:run          # :8080, profile dev (có mock gateway, /dev/seed)
# seed dữ liệu: xem README của be-view (psql -f db/seed-dev.sql)
```

Tài khoản seed, mật khẩu chung `password123`:

| Email | Vai trò |
|---|---|
| `a@example.com`, `b@example.com` | CUSTOMER (có vé, có tin bán lại) |
| `organizer@example.com` | ORGANIZER, BTC **Sunrise Live** |
| `organizer2@example.com` | ORGANIZER, BTC **Saigon Jazz Club** |
| `admin@example.com` | ADMIN |

Thanh toán dev: BE trả `payment.checkoutUrl` = `http://localhost:3000/mock-gateway/checkout/{orderId}` (trang FE giả lập cổng), trang này gọi `POST /mock-gateway/payments/{id}/succeed|fail|expire` rồi BE đưa khách về `/checkout/return?orderId=`.

## Cấu trúc

```text
index.html, vite.config.js, jsconfig.json (@/* → src/*), components.json (shadcn), eslint.config.js
src/
  main.jsx, App.jsx          điểm vào + providers: QueryClient, MotionConfig reducedMotion="user", Tooltip, Router, Toaster
  app/router.jsx             mọi route (contract §6.2), trang tải lazy; app/queryClient.js (không retry lỗi 4xx)
  index.css                  Tailwind v4 @theme: màu, font, bo góc, thang chữ theo design-spec.md
  api/                       cửa duy nhất để gọi BE: mọi nơi import từ "@/api"
    client.js                axios: gắn Bearer, tự refresh token, đổi lỗi thành ApiError
    errors.js                ApiError { status, code, message, traceId, errors }
    params.js                cleanParams: bỏ tham số rỗng trước khi gửi
    services/*.js            một hàm cho mỗi endpoint, trả body BE nguyên shape (không đổi tên field)
    queries/*.js             hook TanStack Query bọc services; keys.js (query key), paging.js (infinite scroll),
                             withAfter.js (cập nhật cache sau mutation)
  stores/auth.js             zustand, lưu phiên đăng nhập vào localStorage "nhip.auth"
  hooks/                     useAuth, useDebounce, useInfiniteSentinel, useDocumentTitle
  lib/
    business.js              hằng số nghiệp vụ khớp cấu hình BE: SERVICE_FEE, RESALE_MIN_PRICE, tierLimit…
    pendingOrder.js          nhớ id đơn đang chờ thanh toán (sessionStorage) khi sang cổng thanh toán
    format.js                tiền VND, ngày giờ theo giờ Việt Nam, số
    image.js                 imageAt(url, width): ảnh Unsplash đúng cỡ cho thẻ
    forms.js                 z, v (schema zod tiếng Việt), applyApiErrors, toPayload
    constants.js             danh mục, thành phố, nhãn trạng thái, thương hiệu
    motion.js                thông số animation (ease, thời lượng, variants)
    utils.js                 cn() gộp className
  components/ui/*            shadcn/ui đã chỉnh theo design-spec (bo góc ≤ 4px, không shadow)
  components/form/*          Field, PasswordField, CityInput, FormSection, FormRootError, SubmitButton
  components/marketplace/*   khối v2: Carousel, SectionTitle, HeroBanner, PosterCard, EventTile, RankedEventCard,
                             FeaturedOrganizerCard, CityTile, GlowWaves (design-spec mục v2)
  components/site/*          khối giao diện dùng chung: Header, CategoryNav, Footer, Container, PageHeader, EventCard, EventGrid,
                             Notice, Disclosure, DebouncedSearch, SearchInput, EmptyState, ErrorState, ConfirmDialog…
  components/motion/*        component animation: Reveal, AnimatedNumber, AnimatedList, PageTransition…
  layouts/                   RootLayout, SiteLayout, AuthLayout (+ authScenes.js: ảnh nền màn auth), OrganizerLayout,
                             guards (RequireAuth…), RouteError
  pages/<khu vực>/           một thư mục cho mỗi khu: home, events, checkout, orders, tickets, resale, organizer…
```

## Quy ước code (đọc trước khi sửa)

Mỗi việc chỉ có **một** cách làm. Muốn làm X thì dùng Y:

| Muốn… | Dùng |
|---|---|
| Đọc dữ liệu từ BE | hook trong `@/api` (`useEvent`, `useInfiniteEvents`, `useMyTickets`…). Không gọi axios trực tiếp. |
| Ghi dữ liệu (tạo/sửa/xóa) | hook mutation trong `@/api` (`useCreateOrder`, `useUpdateProfile`…). Cache tự cập nhật. |
| Danh sách có "tải thêm" | hook infinite + `flattenPages(query.data)` + `<InfiniteSentinel query={query} />`; tổng số: `totalOf(query.data)` |
| Hiện lỗi tải trang | `if (q.isError) return <ErrorState error={q.error} onRetry={q.refetch} />` |
| Làm form | react-hook-form + zod: `z`, `v` từ `@/lib/forms`; ô nhập `<Field>` / `<PasswordField>` từ `@/components/form` |
| Hiện lỗi BE trên form | `applyApiErrors(form, err)` (+ `{ codeFields: { EMAIL_ALREADY_USED: "email" } }` khi cần) và `<FormRootError form={form} />` |
| Báo thành công/thất bại nhanh | `toast.success(...)` / `toast.error(err.message)` (sonner) |
| Thông báo nằm trong trang | `<Notice tone="warning" title="…">` từ `@/components/site` |
| Hiện tiền, ngày giờ, số | `formatVND`, `formatDate`, `formatDateTime`, `formatTimeRange`, `formatNumber` từ `@/lib/format` |
| Hằng số nghiệp vụ (phí, giá tối thiểu…) | `@/lib/business` (không tự viết lại số) |
| Bộ lọc / tìm kiếm | để trên URL (`useSearchParams`); ô tìm kiếm gõ-xong-mới-tìm: `<DebouncedSearch>` |
| Khung trang | `<Container>` + `<PageHeader>`; section: `<SectionHeader>` |
| Animation | thông số `DUR`, `EASE_OUT` và variants (`fadeUp`, `stagger`, `inView`…) trong `@/lib/motion`; component dựng sẵn (`Reveal`, `AnimatedNumber`, `TabIndicator`…) trong `@/components/motion`. Chọn cái nào: `docs/HUONG_DAN_FE.md` mục 7 |
| Biết người dùng là ai | `const { user, isAuthenticated, isOrganizer, logout } = useAuth()` |
| Tiêu đề tab trình duyệt | `useDocumentTitle("Tên trang")` |

**Sắp xếp file trong một khu `pages/<khu vực>/`**

- `<Tên>Page.jsx`: một trang = lấy dữ liệu + bố cục. Đầu file có comment: trang gì, route nào, gọi hook/API nào.
- `components/`: các phần (section) của trang, mỗi phần một file.
- `lib.js`: hàm thuần (không JSX) của khu đó, có test `lib.test.js` bên cạnh.
- `schemas.js`: schema zod của form.
- Test đặt cạnh file được test (`XxxPage.test.jsx`).
- Chỉ đưa thứ gì đó lên `src/components` / `src/lib` khi **hai khu trở lên** cùng dùng.

**Ghi chú thêm**

- Field dữ liệu dùng đúng tên DTO trong contract §3 (không đổi tên).
- Đổi bộ lọc: `setSearchParams(next, { preventScrollReset: true })` để trang không cuộn lên đầu.
- Tạo đơn / mua vé bán lại: mỗi lần bấm tạo một `newIdempotencyKey()` mới và nút bị khóa trong lúc gửi. Request bị gửi lại (vd client gửi lại sau khi refresh token) giữ nguyên key, nên BE trả đúng đơn cũ thay vì tạo đơn thứ hai (`pages/checkout/components/CheckoutForm.jsx`, `pages/resale/components/BuyPanel.jsx`).
- `RequireAuth` chuyển về `/auth/login` với `state.from`; đăng nhập xong quay lại đúng trang. Phiên hết hạn → store bị xóa, có toast, guard tự chuyển về login.
- Hiệu năng: vài component được tách nhỏ / bọc `memo` / dùng `useWatch` để gõ phím không render lại cả trang. Chỗ nào làm vậy đều có comment "vì sao"; giữ nguyên khi sửa.

**Giao diện** (tóm tắt `design-spec.md`). Khung trang, trang chủ và khu tài khoản đã chuyển sang **v2 "marketplace shell"** (header xanh, thanh danh mục đen, nền than chì, thẻ bo 12px, khối trong `@/components/marketplace`): xem mục v2 ở cuối `design-spec.md`. Các gạch đầu dòng dưới đây là v1, còn áp dụng cho trang chưa làm lại:

- Nền tối, divider 1px (`border-border`) thay cho card; bo góc 0-4px, modal 6px; không shadow, không glow. Không gradient, trừ lớp phủ mờ trên ảnh để chữ đè lên dễ đọc (`EventCard`, `ImageWithFallback`…).
- Xanh `text-primary` / `bg-primary` dùng tiết chế: CTA chính, mục đang chọn, giá vé, link, trạng thái thành công.
- Chữ: `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body-lg`, `text-caption`, `text-price`; nhãn chữ hoa nhỏ `eyebrow`; link `link-quiet`, `link-accent`.
- Nút: `<Button>` cao 40px, `size="lg"` 48px cho CTA; `variant="secondary"` viền 1px, `ghost`, `destructive`, `link`.
- Motion nhẹ, không nảy, không parallax. Icon lucide đi kèm chữ. Không dùng em-dash; khoảng giờ dùng `formatTimeRange` ("19:00-22:30").
