// Gắn bước cập nhật cache vào onSuccess mà không ghi đè onSuccess của trang.

export const withAfter = (options, after) => ({
  ...options,
  onSuccess: (data, ...rest) => {
    after(data, ...rest);
    return options.onSuccess?.(data, ...rest);
  },
});
