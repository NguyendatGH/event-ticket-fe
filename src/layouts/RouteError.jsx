// errorElement của router; bắt cả lỗi tải chunk lazy sau khi deploy bản mới.

import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Container, ErrorState } from "@/components/site";
import { normalizeError } from "@/api";

export default function RouteError() {
  const error = useRouteError();
  const chunkFailed = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    String(error?.message || "")
  );

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <Container className="py-24">
        <ErrorState title="Không tìm thấy trang" error={{ message: "Đường dẫn không tồn tại hoặc đã bị gỡ." }} />
        <div className="flex justify-center">
          <Button asChild variant="secondary">
            <Link to="/">Về trang chủ</Link>
          </Button>
        </div>
      </Container>
    );
  }

  const apiError = chunkFailed
    ? { message: "Ứng dụng vừa được cập nhật. Tải lại trang để tiếp tục." }
    : normalizeError(error);

  if (import.meta.env.DEV) console.error(error);

  return (
    <Container className="py-24">
      <ErrorState title="Trang gặp sự cố" error={apiError} onRetry={() => window.location.reload()} />
      <div className="flex justify-center">
        <Link to="/" className="text-sm link-quiet">
          Về trang chủ
        </Link>
      </div>
    </Container>
  );
}
