import { useState, useCallback, useEffect } from 'react';

interface ActivityEventData {
  city: string;
  regretAmount: number;
  expenseName: string;
}

export const useAnalytics = () => {
  const [decisionCount, setDecisionCount] = useState(() => {
    // Pick up the latest Firebase count if it arrived before React mounted
    if (typeof window !== 'undefined' && (window as any).latestDecisionCount) {
      return (window as any).latestDecisionCount;
    }
    return 543;
  });

  // Register the local state setter function globally so index.html can use it
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.setGlobalDecisionCount = setDecisionCount;
      // Also sync if Firebase data arrived before this effect ran
      if ((window as any).latestDecisionCount) {
        setDecisionCount((window as any).latestDecisionCount);
      }
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
