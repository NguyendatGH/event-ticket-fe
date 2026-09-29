// Mỗi màn auth một ảnh sự kiện + chú thích (ảnh Unsplash, cùng bộ ảnh với seed BE).

const unsplash = (id, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const AUTH_SCENES = {
  login: {
    src: unsplash("1470229722913-7c0e2dbbafd3"),
    alt: "Đám đông giơ tay trước sân khấu trong một đêm nhạc",
    label: "Sắp diễn ra",
    title: "The Lumière Tour",
    meta: ["24.10.2026", "Sân vận động Mỹ Đình, Hà Nội"],
  },
  register: {
    src: unsplash("1501386761578-eac5c94b800a"),
    alt: "Sân khấu lễ hội âm nhạc với ánh sáng và khán giả",
    label: "Mở bán",
    title: "Saigon Sound Festival",
    meta: ["07.11.2026", "Công viên Lê Văn Tám, TP.HCM"],
  },
  organizer: {
    src: unsplash("1516450360452-9312f5e86fc7"),
    alt: "Lễ hội âm nhạc với ánh đèn sân khấu về đêm",
    label: "Dành cho nhà tổ chức",
    title: "Bán vé cho sự kiện của bạn",
    meta: ["Tạo sự kiện, mở bán, theo dõi doanh thu", "Một bảng điều khiển duy nhất"],
  },
  forgot: {
    src: unsplash("1459749411175-04bf5292ceea"),
    alt: "Ca sĩ trên sân khấu dưới ánh đèn",
    label: "Đang bán",
    title: "Đêm Nhạc Trịnh",
    meta: ["31.10.2026", "Nhà hát Lớn, Hà Nội"],
  },
  reset: {
    src: unsplash("1514525253161-7a46d19cd819"),
    alt: "Khán giả giơ tay trong ánh sáng sân khấu",
    label: "Sắp diễn ra",
    title: "Indie Night Vol. 12",
    meta: ["15.11.2026", "Yoko Café, TP.HCM"],
  },
};

export const AUTH_ROUTES = {
  "/auth/login": { scene: "login", prompt: "Chưa có tài khoản?", action: ["Đăng ký", "/auth/register"] },
  "/auth/register": { scene: "register", prompt: "Đã có tài khoản?", action: ["Đăng nhập", "/auth/login"] },
  "/auth/register-organizer": { scene: "organizer", prompt: "Đã có tài khoản?", action: ["Đăng nhập", "/auth/login"] },
  "/auth/forgot-password": { scene: "forgot", prompt: "Nhớ mật khẩu?", action: ["Đăng nhập", "/auth/login"] },
  "/auth/reset-password": { scene: "reset", prompt: "Nhớ mật khẩu?", action: ["Đăng nhập", "/auth/login"] },
};
