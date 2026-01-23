import React, { useEffect } from 'react';

/**
 * Invisible component that tracks:
 * 1. Live presence using .info/connected and onDisconnect()
 * 2. Page view counter (total_visits)
 * 3. User's city from IP API (cached for activity logging)
 */
export const AnalyticsTracker: React.FC = () => {
  useEffect(() => {
    const db = window.firebaseDB;
    const ref = window.firebaseRef;
    const onValue = window.firebaseOnValue;
    const runTransaction = window.firebaseRunTransaction;
    const push = window.firebasePush;
    const set = window.firebaseSet;
    const remove = window.firebaseRemove;
    const onDisconnect = window.firebaseOnDisconnect;

    if (!db || !ref) return;

    let userRef: any = null;
    let unsubscribe: (() => void) | null = null;

    // 1. Increment total_visits on mount
    const visitsRef = ref(db, 'analytics/total_visits');
    runTransaction(visitsRef, (current: number | null) => (current || 0) + 1);

    // 2. Track live presence
    const connectedRef = ref(db, '.info/connected');
    const activeUsersRef = ref(db, 'analytics/active_users');
    userRef = push(activeUsersRef);

    unsubscribe = onValue(connectedRef, (snap: any) => {
      if (snap.val() === true) {
        set(userRef, true);
        onDisconnect(userRef).remove();
      }
    });

    // 3. Fetch and cache city for activity logging + increment city counter
    fetch('http://ip-api.com/json/?fields=city')
      .then(res => res.json())
      .then(data => {
        if (data.city) {
          window.userCity = data.city; // Cache for handleAnalyze
          const cityRef = ref(db, `analytics/cities/${data.city}`);
          runTransaction(cityRef, (current: number | null) => (current || 0) + 1);
        }
      })
      .catch(() => {
        window.userCity = 'Unknown';
      });

    return () => {
      if (userRef) {
        remove(userRef);
      }
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  return null; // Invisible component
};
