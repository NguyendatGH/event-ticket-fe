import { useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";

/**
 * Chặn rời trang khi form còn thay đổi chưa lưu, ở 2 tầng:
 *   - Điều hướng trong app (bấm link, Back): useBlocker của react-router → trang hiện hộp xác nhận
 *     khi `blocker.state === "blocked"` (gọi blocker.proceed() để đi tiếp, blocker.reset() để ở lại).
 *   - Đóng tab / F5: sự kiện "beforeunload" → trình duyệt tự hỏi (không tùy biến được nội dung).
 * Chỉ đổi query (?step=) thì không chặn: cùng pathname = vẫn ở trình sửa.
 *
 * `allowNextNavigation()`: gọi ngay trước navigate() khi chính trang chủ động rời đi sau khi lưu xong
 * (form lúc đó có thể vẫn "dirty" vì reset chưa kịp áp dụng).
 */
export function useUnsavedChangesGuard(isDirty) {
  const allowNav = useRef(false);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => !allowNav.current && isDirty && currentLocation.pathname !== nextLocation.pathname);

  useEffect(() => {
    if (!isDirty) return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const allowNextNavigation = () => {
    allowNav.current = true;
  };

  return { blocker, allowNextNavigation };
}
