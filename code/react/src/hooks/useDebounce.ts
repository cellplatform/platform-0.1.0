import { useState, useEffect } from 'react';

/**
 * Source:
 *    https://dev.to/gabe_ragland/debouncing-with-react-hooks-jci
 */
export function useDebounce<T>(value: T, delay: number, onChanged?: (value: T) => void) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const change = () => {
      const isChanged = value !== debouncedValue;
      if (isChanged) {
        setDebouncedValue(value);
        if (onChanged) onChanged(value);
      }
    };
    const timeout = setTimeout(change, delay);
    return () => clearTimeout(timeout);
  }, [value]); // eslint-disable-line

  return debouncedValue;
}
