import React, { useEffect } from 'react';

/**
 * Generate a unique device fingerprint based on browser/device characteristics
 */
const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let canvasHash = '';
  
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
    canvasHash = canvas.toDataURL().slice(-50);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
    canvasHash
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return 'user_' + Math.abs(hash).toString(36);
};

/**
 * Invisible component that tracks:
 * 1. Live presence using device fingerprint (unique per device/browser)
 * 2. Page view counter (total_visits)
 * 3. User's city from IP API (cached for activity logging)
 */
export const AnalyticsTracker: React.FC = () => {
  useEffect(() => {
    const db = window.firebaseDB;
    const ref = window.firebaseRef;
    const onValue = window.firebaseOnValue;
    const runTransaction = window.firebaseRunTransaction;
    const set = window.firebaseSet;
    const remove = window.firebaseRemove;
    const onDisconnect = window.firebaseOnDisconnect;

    if (!db || !ref) return;

    let userRef: any = null;
    let unsubscribe: (() => void) | null = null;

    // 1. Increment total_visits only once per session (not every tab/reload)
    const sessionKey = 'analytics_session_tracked';
    const sessionTracked = sessionStorage.getItem(sessionKey);
    
    if (!sessionTracked) {
      const visitsRef = ref(db, 'analytics/total_visits');
      runTransaction(visitsRef, (current: number | null) => (current || 0) + 1);
      sessionStorage.setItem(sessionKey, 'true');
    }

    // 2. Track live presence using device fingerprint
    const deviceId = generateDeviceFingerprint();
    const connectedRef = ref(db, '.info/connected');
    const activeUsersRef = ref(db, `analytics/active_users/${deviceId}`);
    userRef = activeUsersRef;

    unsubscribe = onValue(connectedRef, (snap: any) => {
      if (snap.val() === true) {
        set(userRef, {
          online: true,
          lastSeen: Date.now()
        });
        onDisconnect(userRef).remove();
      }
    });

    // 3. Fetch and cache city for activity logging + increment city counter (once per session)
    const fetchCity = async () => {
      try {
        // Check if city was already tracked this session
        const cityCachedKey = 'analytics_city_cached';
        const cachedCity = sessionStorage.getItem(cityCachedKey);
        
        if (cachedCity) {
          // Use cached city without incrementing counter
          window.userCity = cachedCity;
          return;
        }
        
        // Try primary API (ipapi.co)
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('Primary API failed');
        
        const data = await response.json();
        
        // Validate the response
        if (data && data.city && typeof data.city === 'string' && data.city.trim() !== '') {
          const cityName = data.city.trim();
          window.userCity = cityName;
          sessionStorage.setItem(cityCachedKey, cityName);
          
          // Only increment city counter once per session
          const cityRef = ref(db, `analytics/cities/${cityName}`);
          runTransaction(cityRef, (current: number | null) => (current || 0) + 1);
          return;
        }
        
        throw new Error('Invalid city data');
      } catch (error) {
        // Fallback to secondary API (ip-api.com)
        try {
          const fallbackResponse = await fetch('http://ip-api.com/json/');
          const fallbackData = await fallbackResponse.json();
          
          if (fallbackData && fallbackData.city && typeof fallbackData.city === 'string' && fallbackData.city.trim() !== '') {
            const cityName = fallbackData.city.trim();
            window.userCity = cityName;
            sessionStorage.setItem('analytics_city_cached', cityName);
            
            // Only increment city counter once per session
            const cityRef = ref(db, `analytics/cities/${cityName}`);
            runTransaction(cityRef, (current: number | null) => (current || 0) + 1);
            return;
          }
        } catch (fallbackError) {
          console.warn('City detection failed:', fallbackError);
        }
        
        // Final fallback
        window.userCity = 'Unknown';
        sessionStorage.setItem('analytics_city_cached', 'Unknown');
      }
    };
    
    fetchCity();

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
