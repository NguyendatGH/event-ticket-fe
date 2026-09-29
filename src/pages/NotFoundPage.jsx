// Trang 404, route "*" (mọi đường dẫn không khớp route nào). Không gọi API.

import { NotFoundView } from "@/components/site";

export default function NotFoundPage() {
  return <NotFoundView />;
}
