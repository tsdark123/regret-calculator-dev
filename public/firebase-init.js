import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction, push, set, remove, onDisconnect, query, limitToLast, orderByChild } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDdnKgoq03cbiiDzXdyUppPbaRzdarsS1A",
  authDomain: "regretcalculator-93baa.firebaseapp.com",
  databaseURL: "https://regretcalculator-93baa-default-rtdb.firebaseio.com",
  projectId: "regretcalculator-93baa",
  storageBucket: "regretcalculator-93baa.firebasestorage.app",
  messagingSenderId: "120485266617",
  appId: "1:120485266617:web:e8ed6a8dca6eae1bf44768"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const counterRef = ref(database, 'decisionsAnalyzed');

// Expose Firebase for React components
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

// 1. Function to update the counter display in real-time
console.log('[Firebase] Setting up onValue listener for decisionsAnalyzed...');
onValue(counterRef, (snapshot) => {
  let count = snapshot.val();
  console.log('[Firebase] onValue fired. Raw count from DB:', count);
  // Enforce minimum floor of 3564 even if DB has lower (e.g. 546)
  if (!count || count < 3564) {
    count = 3564;
  }

  // Always store latest count on window so React can pick it up on mount
  window.latestDecisionCount = count;
  console.log('[Firebase] latestDecisionCount set to:', count, '| setGlobalDecisionCount available:', !!window.setGlobalDecisionCount);

  // Update the React state via the global setter if available
  if (window.setGlobalDecisionCount) {
    window.setGlobalDecisionCount(count);
  }
}, (error) => {
  console.error('[Firebase] onValue ERROR - this is why the counter is stuck:', error.message);
});

// 2. Make the increment function globally accessible for App.tsx to call
window.incrementCounter = function() {
  runTransaction(counterRef, (currentCount) => {
    // If doesn't exist or is too low, jump to baseline + 1
    if (!currentCount || currentCount < 3564) {
      return 3565;
    }
    return currentCount + 1;
  });
};

// 3. Global function to log activity events
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
