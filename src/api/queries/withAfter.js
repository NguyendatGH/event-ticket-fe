/**
 * Gắn việc cập nhật cache `after(data, vars, ...)` vào onSuccess của mutation, vẫn gọi onSuccess của trang sau đó.
 *   useMutation(withAfter({ mutationFn, ...options }, after))
 *
 * Vì sao cần: nếu viết { onSuccess: after, ...options } thì khi trang truyền onSuccess riêng
 * (vd hiện toast), onSuccess của trang GHI ĐÈ mất bước cập nhật cache → màn hình hiện dữ liệu cũ.
 * withAfter chạy cả hai: cập nhật cache trước, rồi tới onSuccess của trang.
 */
export const withAfter = (options, after) => ({
  ...options,
  onSuccess: (data, ...rest) => {
    after(data, ...rest);
    return options.onSuccess?.(data, ...rest);
  },
});
