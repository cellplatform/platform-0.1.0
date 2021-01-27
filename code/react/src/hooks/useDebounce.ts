import { useState, useEffect } from 'react';

/**
 * Provides a debounce for state updates.
 * Use in conjunction with [useState], for example:
 *
 *      const [foo, setFoo] = useState<number>(0);
 *      const fooDebounced = useDebounce(foo, 300);
 *
 * Source:
 *    https://dev.to/gabe_ragland/debouncing-with-react-hooks-jci
 *
 */
export function useDebounce<T>(value: T, msecs: number, onChanged?: (value: T) => void) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const change = () => {
      const isChanged = value !== debouncedValue;
      if (isChanged) {
        setDebouncedValue(value);
        if (onChanged) onChanged(value);
      }
    };
    const timeout = setTimeout(change, msecs);
    return () => clearTimeout(timeout);
  }, [value]); // eslint-disable-line

  return debouncedValue;
}
