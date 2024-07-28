export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  wait: number,
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout
  const debouncedFn = (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn(...args)
    }, wait)
  }
  debouncedFn.cancel = () => clearTimeout(timeout)
  return debouncedFn as T & { cancel: () => void }
}
