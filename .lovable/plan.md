

## Updated Plan: Admin Portal with Live Activity Feed

### Overview

Build a private admin dashboard at `/admin-stats` with Firebase Authentication, displaying real-time analytics including a **Live Activity Feed** showing individual user analyses in a terminal-style console. The feed replaces the previously planned global regret dollar counter.

---

### Architecture

```text
                       ┌─────────────────────────────────────────────────┐
                       │              Firebase RTDB                      │
                       ├─────────────────────────────────────────────────┤
                       │  /decisionsAnalyzed (existing - READ ONLY)      │
                       │  /analytics                                     │
                       │    ├─ /active_users/{pushId}: true              │
                       │    ├─ /total_visits: number                     │
                       │    ├─ /cities/{cityName}: number                │
                       │    └─ /activity_log/{pushId}:                   │ ← NEW
                       │         ├─ city: "Poughkeepsie"                 │
                       │         ├─ timestamp: 1706025300000             │
                       │         ├─ regretAmount: 31400                  │
                       │         └─ expenseName: "Starbucks"             │
                       └─────────────────────────────────────────────────┘
```

---

### Database Structure (Final)

```text
Firebase Realtime Database:
├── decisionsAnalyzed: 3654          # (existing - READ ONLY)
└── analytics/                        # (new parent node)
    ├── active_users/
    │   ├── -NxyzABC123: true        # Auto-removed on disconnect
    │   └── -NxyzDEF456: true
    ├── total_visits: 1847           # Incremented on each page load
    ├── cities/
    │   ├── "New York": 342
    │   └── "Los Angeles": 218
    └── activity_log/                 # NEW: Individual analysis events
        ├── -NxyzGHI789:
        │   ├── city: "Poughkeepsie"
        │   ├── timestamp: 1706025300000
        │   ├── regretAmount: 31400
        │   └── expenseName: "Starbucks"
        └── -NxyzJKL012:
            ├── city: "New York"
            ├── timestamp: 1706025350000
            ├── regretAmount: 87200
            └── expenseName: "Netflix"
```

---

### Step 1: Update Firebase Initialization

**File: `index.html`**

Add Firebase Auth imports, additional database methods, and a new global function for logging activity:

```javascript
// Add Auth import
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Add additional database methods  
import { push, set, remove, onDisconnect, query, limitToLast, orderByChild } 
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const auth = getAuth(app);

// Expose for React components
window.firebaseDB = database;
window.firebaseAuth = auth;
window.firebaseRef = ref;
window.firebaseOnValue = onValue;
window.firebaseRunTransaction = runTransaction;
window.firebasePush = push;
window.firebaseSet = set;
window.firebaseRemove = remove;
window.firebaseOnDisconnect = onDisconnect;
window.firebaseQuery = query;
window.firebaseLimitToLast = limitToLast;
window.firebaseOrderByChild = orderByChild;
window.firebaseSignIn = signInWithEmailAndPassword;
window.firebaseSignOut = signOut;
window.firebaseOnAuthStateChanged = onAuthStateChanged;

// NEW: Global function to log activity events
window.logActivityEvent = function(data) {
  const activityRef = ref(database, 'analytics/activity_log');
  const newEntryRef = push(activityRef);
  set(newEntryRef, {
    city: data.city || 'Unknown',
    timestamp: Date.now(),
    regretAmount: Math.round(data.regretAmount),
    expenseName: data.expenseName || 'Expense'
  });
};
```

---

### Step 2: Extend Window Type Declarations

**File: `App.tsx`**

Add TypeScript declarations for all new Firebase globals:

```typescript
declare global {
  interface Window {
    setGlobalDecisionCount?: React.Dispatch<React.SetStateAction<number>>;
    incrementCounter?: () => void;
    logActivityEvent?: (data: { city: string; regretAmount: number; expenseName: string }) => void;
    userCity?: string; // Cached city from AnalyticsTracker
    firebaseDB?: any;
    firebaseAuth?: any;
    firebaseRef?: any;
    firebaseOnValue?: any;
    firebaseRunTransaction?: any;
    firebasePush?: any;
    firebaseSet?: any;
    firebaseRemove?: any;
    firebaseOnDisconnect?: any;
    firebaseQuery?: any;
    firebaseLimitToLast?: any;
    firebaseOrderByChild?: any;
    firebaseSignIn?: any;
    firebaseSignOut?: any;
    firebaseOnAuthStateChanged?: any;
  }
}
```

---

### Step 3: Create Analytics Tracker Component

**File: `components/AnalyticsTracker.tsx`** (NEW)

An invisible component that:
1. Tracks live presence using `.info/connected` and `onDisconnect()`
2. Increments page view counter
3. Fetches and caches user's city from IP API for later use

```typescript
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

    // 1. Increment total_visits on mount
    const visitsRef = ref(db, 'analytics/total_visits');
    runTransaction(visitsRef, (current: number | null) => (current || 0) + 1);

    // 2. Track live presence
    const connectedRef = ref(db, '.info/connected');
    const activeUsersRef = ref(db, 'analytics/active_users');
    const userRef = push(activeUsersRef);
    
    const unsubscribe = onValue(connectedRef, (snap: any) => {
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
      remove(userRef);
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  return null; // Invisible component
};
```

---

### Step 4: Update handleAnalyze to Log Activity

**File: `App.tsx`**

Modify `handleAnalyze` to push an activity log entry after calculation:

```typescript
const handleAnalyze = () => {
  // 1. Increment the Global Counter via Firebase if available
  if (typeof window.incrementCounter === 'function') {
    window.incrementCounter();
  } else {
    setDecisionCount(prev => prev + 1);
  }
  
  setIsLoading(true);
  setTimeout(() => {
    const calculated = calculateResults(expenses, assumptions);
    setResults(calculated);
    setResultsKey(prev => prev + 1);
    setIsLoading(false);
    setViewMode('results');
    
    // 2. NEW: Log activity event with city, regret amount, and first expense name
    if (typeof window.logActivityEvent === 'function') {
      const firstExpenseName = expenses[0]?.name || 'Expense';
      window.logActivityEvent({
        city: window.userCity || 'Unknown',
        regretAmount: calculated.potentialValueUnlocked,
        expenseName: firstExpenseName
      });
    }
    
    if (inputSectionRef.current) {
      inputSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 2000);
};
```

---

### Step 5: Create Admin Stats Component

**File: `components/AdminStats.tsx`** (NEW)

A self-contained component with:
- Firebase Auth state management with auto-redirect on logout
- Login form (Email/Password)
- Real-time dashboard with Live Activity Feed

**Key Features:**

1. **Auto-Redirect on Logout:**
```typescript
useEffect(() => {
  const unsubscribe = window.firebaseOnAuthStateChanged(
    window.firebaseAuth,
    (user: any) => {
      setUser(user);
      setAuthLoading(false);
      if (!user && !authLoading) {
        window.location.href = '/';
      }
    }
  );
  return () => unsubscribe();
}, []);
```

2. **Live Activity Feed Listener:**
```typescript
// Listen to last 20 activity log entries in real-time
const activityRef = window.firebaseRef(db, 'analytics/activity_log');
const activityQuery = window.firebaseQuery(
  activityRef,
  window.firebaseLimitToLast(20)
);

window.firebaseOnValue(activityQuery, (snap: any) => {
  const data = snap.val();
  if (data) {
    const entries = Object.values(data) as ActivityEntry[];
    // Sort by timestamp descending (newest first)
    entries.sort((a, b) => b.timestamp - a.timestamp);
    setActivityLog(entries);
  }
});
```

3. **Activity Log Entry Formatting:**
```typescript
const formatActivityEntry = (entry: ActivityEntry) => {
  const date = new Date(entry.timestamp);
  const time = date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
  const regret = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(entry.regretAmount);
  
  return `[${time}] User in ${entry.city} analyzed '${entry.expenseName}' (${regret} regret)`;
};
```

---

### Admin Dashboard UI Design

```text
┌─────────────────────────────────────────────────────────────────────────┐
│  ◉ ADMIN ANALYTICS                                        [Logout]     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐        │
│  │ LIVE USERS       │ │ PAGE VIEWS       │ │ DECISIONS        │        │
│  │    ◉ 12          │ │    1,847         │ │    3,654         │        │
│  │   (pulsing)      │ │   (all time)     │ │   (analyzed)     │        │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘        │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  LIVE ACTIVITY                                    (green text)  │   │
│  │  ─────────────────────────────────────────────────────────────  │   │
│  │  [17:42] User in San Francisco analyzed 'Coffee' ($12,400...)  │   │
│  │  [17:38] User in New York analyzed 'Netflix' ($87,200 regret)  │   │
│  │  [17:35] User in Poughkeepsie analyzed 'Starbucks' ($31,400..) │   │
│  │  [17:31] User in Chicago analyzed 'Gym' ($45,600 regret)       │   │
│  │  [17:28] User in Austin analyzed 'Subscription' ($8,900 reg..) │   │
│  │  ...scrollable...                                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  TOP CITIES                                                      │   │
│  │  1. New York ························· 342                      │   │
│  │  2. Los Angeles ······················ 218                      │   │
│  │  3. Chicago ·························· 156                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Last updated: Just now                                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

**Live Activity Terminal Styling:**
- Black background with subtle border glow
- Green monospace "hacker" font (`font-family: 'Courier New', monospace`)
- Color: `#22c55e` (Tailwind green-500)
- Scrollable container with max-height
- Newest entries at top
- Subtle scan-line effect (optional CSS)

---

### Step 6: Add Path-Based Routing in App.tsx

**File: `App.tsx`**

Add URL-based routing and mount the analytics tracker:

```typescript
import { AdminStats } from './components/AdminStats';
import { AnalyticsTracker } from './components/AnalyticsTracker';

const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

useEffect(() => {
  const handlePopState = () => setCurrentPath(window.location.pathname);
  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, []);

// At the start of render, check for admin route
if (currentPath === '/admin-stats') {
  return <AdminStats />;
}

// For main app, mount the invisible tracker
return (
  <>
    <AnalyticsTracker />
    <div className={...}>
      {/* existing content */}
    </div>
  </>
);
```

---

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `components/AdminStats.tsx` | Create | Auth-protected admin dashboard with activity feed |
| `components/AnalyticsTracker.tsx` | Create | Invisible presence/visit/city tracker |
| `index.html` | Modify | Add Firebase Auth + expose globals + activity logger |
| `App.tsx` | Modify | Add routing, mount tracker, log activity on analyze |

---

### Security Notes

- The `/admin-stats` route is protected by Firebase Auth login
- Only authenticated users can view the dashboard
- Auto-redirect to `/` on logout or session expiry
- The `activity_log` node is written by the client but only displayed on admin page
- **Recommended Firebase Rules** (to set manually in Firebase Console):
```json
{
  "rules": {
    "decisionsAnalyzed": {
      ".read": true,
      ".write": true
    },
    "analytics": {
      ".write": true,
      ".read": "auth != null"
    }
  }
}
```
This ensures only authenticated users can read from `analytics/`, while writes are still allowed for tracking.

---

### Technical Notes

- Activity log uses Firebase `push()` for unique keys with automatic ordering
- `limitToLast(20)` ensures only the 20 most recent entries are fetched
- City is cached in `window.userCity` during page load for use in `handleAnalyze`
- IP API (ip-api.com) is free, no API key required, provides city-level accuracy
- Timestamps stored as Unix milliseconds for easy sorting and formatting

