// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(fn: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: number | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      window.clearTimeout(timeout);
      timeout = null;
    }

    timeout = window.setTimeout(() => {
      fn(...args);
    }, wait);
  }
}
