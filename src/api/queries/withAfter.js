export const withAfter = (options, after) => ({
  ...options,
  onSuccess: (data, ...rest) => {
    after(data, ...rest);
    return options.onSuccess?.(data, ...rest);
  },
});
