import React, { useState, useEffect } from 'react';
import { Lock, LogOut, Users, Eye, BarChart3, Activity, MapPin } from 'lucide-react';

interface ActivityEntry {
  city: string;
  timestamp: number;
  regretAmount: number;
  expenseName: string;
}

interface CityCount {
  city: string;
  count: number;
}

export const AdminStats: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard data
  const [liveUsers, setLiveUsers] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [totalDecisions, setTotalDecisions] = useState(0);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [topCities, setTopCities] = useState<CityCount[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Remove visibility hidden set by index.html flash prevention
  useEffect(() => {
    document.documentElement.style.visibility = 'visible';
  }, []);

  // Auth state listener with Firebase availability polling
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let wasLoggedIn = false;
    
    const setupAuthListener = () => {
      // Check if Firebase is available
      if (!window.firebaseOnAuthStateChanged || !window.firebaseAuth) {
        return false; // Not available yet
      }
      
      // Firebase is ready - set up the listener
      unsubscribe = window.firebaseOnAuthStateChanged(
        window.firebaseAuth,
        (firebaseUser: any) => {
          setUser(firebaseUser);
          setAuthLoading(false);
          
          // If user logs out or session expires, redirect to home
          if (!firebaseUser && wasLoggedIn) {
            window.location.href = '/';
          }
          wasLoggedIn = firebaseUser !== null;
        }
      );
      return true; // Successfully set up
    };
    
    // Try to set up immediately
    if (!setupAuthListener()) {
      // Firebase not ready - poll every 100ms until it's available
      pollInterval = setInterval(() => {
        if (setupAuthListener()) {
          clearInterval(pollInterval!);
          pollInterval = null;
        }
      }, 100);
      
      // Safety timeout after 5 seconds
      setTimeout(() => {
        if (pollInterval) {
          clearInterval(pollInterval);
          setAuthLoading(false); // Give up and show login
        }
      }, 5000);
    }

    return () => {
      if (unsubscribe) unsubscribe();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []); // Remove user dependency - only run once on mount

  // Real-time data listeners (only when authenticated)
  useEffect(() => {
    if (!user) return;

    const db = window.firebaseDB;
    const ref = window.firebaseRef;
    const onValue = window.firebaseOnValue;
    const query = window.firebaseQuery;
    const limitToLast = window.firebaseLimitToLast;

    if (!db || !ref || !onValue) return;

    const unsubscribers: (() => void)[] = [];

    // Listen to live users count
    const activeUsersRef = ref(db, 'analytics/active_users');
    unsubscribers.push(
      onValue(activeUsersRef, (snap: any) => {
        const data = snap.val();
        setLiveUsers(data ? Object.keys(data).length : 0);
        setLastUpdated(new Date());
      })
    );

    // Listen to total visits
    const visitsRef = ref(db, 'analytics/total_visits');
    unsubscribers.push(
      onValue(visitsRef, (snap: any) => {
        setTotalVisits(snap.val() || 0);
      })
    );

    // Listen to global decisions (existing node)
    const decisionsRef = ref(db, 'decisionsAnalyzed');
    unsubscribers.push(
      onValue(decisionsRef, (snap: any) => {
        let count = snap.val();
        if (!count || count < 3564) count = 3564;
        setTotalDecisions(count);
      })
    );

    // Listen to activity log (last 20 entries)
    const activityRef = ref(db, 'analytics/activity_log');
    const activityQuery = query(activityRef, limitToLast(20));
    unsubscribers.push(
      onValue(activityQuery, (snap: any) => {
        const data = snap.val();
        if (data) {
          const entries = Object.values(data) as ActivityEntry[];
          // Sort by timestamp descending (newest first)
          entries.sort((a, b) => b.timestamp - a.timestamp);
          setActivityLog(entries);
        } else {
          setActivityLog([]);
        }
      })
    );

    // Listen to cities
    const citiesRef = ref(db, 'analytics/cities');
    unsubscribers.push(
      onValue(citiesRef, (snap: any) => {
        const data = snap.val();
        if (data) {
          const cityArray: CityCount[] = Object.entries(data).map(([city, count]) => ({
            city,
            count: count as number
          }));
          // Sort by count descending, take top 5
          cityArray.sort((a, b) => b.count - a.count);
          setTopCities(cityArray.slice(0, 5));
        } else {
          setTopCities([]);
        }
      })
    );

    return () => {
      unsubscribers.forEach(unsub => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      // Safety check for Firebase availability
      if (!window.firebaseSignIn || !window.firebaseAuth) {
        throw new Error('Authentication service not ready. Please refresh the page.');
      }
      await window.firebaseSignIn(window.firebaseAuth, email, password);
    } catch (error: any) {
      setLoginError(error.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (!window.firebaseSignOut || !window.firebaseAuth) {
        window.location.href = '/';
        return;
      }
      await window.firebaseSignOut(window.firebaseAuth);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/'; // Force redirect on error
    }
  };

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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Loading state - hardcoded dark theme
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  // Login form - hardcoded dark theme
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-8 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-100 mb-2">
              Admin Portal
            </h1>
            <p className="text-gray-400 text-center mb-6 text-sm">
              Enter your credentials to access analytics
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-lg text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-lg text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              {loginError && (
                <div className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard - hardcoded dark theme
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-purple-600 animate-pulse" />
            <h1 className="text-2xl font-bold text-gray-100 tracking-tight">
              ADMIN ANALYTICS
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-[#111111] border border-gray-800 rounded-lg text-gray-400 hover:text-gray-100 hover:border-purple-500/50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Live Users */}
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-400 uppercase tracking-wider">Live Users</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-gray-100 font-mono">
                {formatNumber(liveUsers)}
              </span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>

          {/* Total Visits */}
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-400 uppercase tracking-wider">Page Views</span>
            </div>
            <span className="text-4xl font-bold text-gray-100 font-mono">
              {formatNumber(totalVisits)}
            </span>
          </div>

          {/* Decisions Analyzed */}
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-400 uppercase tracking-wider">Decisions</span>
            </div>
            <span className="text-4xl font-bold text-gray-100 font-mono">
              {formatNumber(totalDecisions)}
            </span>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-black border border-green-900/50 rounded-xl p-6 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-green-500" />
            <span className="text-sm text-green-500 uppercase tracking-wider font-mono">Live Activity</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-auto" />
          </div>
          <div 
            className="font-mono text-sm leading-relaxed max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-transparent"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            {activityLog.length === 0 ? (
              <div className="text-green-700 italic">Waiting for activity...</div>
            ) : (
              activityLog.map((entry, index) => (
                <div
                  key={entry.timestamp + index}
                  className="text-green-400 py-1 border-b border-green-900/30 last:border-0 hover:bg-green-900/10 px-2 -mx-2 transition-colors"
                >
                  {formatActivityEntry(entry)}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-400 uppercase tracking-wider">Top Cities</span>
          </div>
          <div className="space-y-3">
            {topCities.length === 0 ? (
              <div className="text-gray-400 italic text-sm">No city data yet...</div>
            ) : (
              topCities.map((city, index) => (
                <div key={city.city} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm w-6">{index + 1}.</span>
                    <span className="text-gray-100">{city.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-2 bg-purple-500/50 rounded-full"
                      style={{ 
                        width: `${Math.max(20, (city.count / (topCities[0]?.count || 1)) * 100)}px` 
                      }}
                    />
                    <span className="text-gray-400 text-sm font-mono w-12 text-right">
                      {formatNumber(city.count)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-400 text-xs">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
