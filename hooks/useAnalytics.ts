import { useState, useCallback, useEffect } from 'react';

interface ActivityEventData {
  city: string;
  regretAmount: number;
  expenseName: string;
}

export const useAnalytics = () => {
  const [decisionCount, setDecisionCount] = useState(543);

  // Register the local state setter function globally so index.html can use it
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.setGlobalDecisionCount = setDecisionCount;
    }
  }, []);

  const incrementDecisionCount = useCallback(() => {
    // Increment the Global Counter via Firebase if available
    if (typeof window.incrementCounter === 'function') {
      window.incrementCounter();
    } else {
      // Fallback if firebase isn't loaded
      setDecisionCount(prev => prev + 1);
    }
  }, []);

  const logActivityEvent = useCallback((data: ActivityEventData) => {
    // Log activity event with city, regret amount, and expense name
    if (typeof window.logActivityEvent === 'function') {
      window.logActivityEvent(data);
    }
  }, []);

  return {
    decisionCount,
    incrementDecisionCount,
    logActivityEvent
  };
};
