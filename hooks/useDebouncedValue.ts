import { useState, useEffect, useCallback } from 'react';

export const useDebouncedValue = <T>(externalValue: T, delay: number = 500) => {
  // Initialize with external value - component remount (via key prop) handles expense switching
  const [value, setValue] = useState<T>(externalValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(externalValue);

  const setValueImmediate = useCallback((newValue: T) => {
    setValue(newValue);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [debouncedValue, setValueImmediate, value] as const;
};

// Specialized hook for numeric inputs with min/max validation
export const useDebouncedNumber = (
  initialValue: number, 
  delay: number = 500,
  min?: number,
  max?: number
) => {
  const [debouncedValue, setValueImmediate, currentValue] = useDebouncedValue(initialValue, delay);

  const setValidatedValue = useCallback((newValue: number) => {
    let validatedValue = newValue;
    
    if (min !== undefined) {
      validatedValue = Math.max(min, validatedValue);
    }
    if (max !== undefined) {
      validatedValue = Math.min(max, validatedValue);
    }
    
    setValueImmediate(validatedValue);
  }, [min, max, setValueImmediate]);

  return [debouncedValue, setValidatedValue, currentValue] as const;
};
