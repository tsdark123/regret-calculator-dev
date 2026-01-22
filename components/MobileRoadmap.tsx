import React, { useState } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  Lock, 
  ChevronDown,
  Rocket,
  Users,
  Smartphone,
  BarChart3,
  Brain
} from 'lucide-react';

// Mobile-friendly timeline roadmap (replaces chat UI on mobile)
export const MobileRoadmap: React.FC = () => {
  const [expandedItem, setExpandedItem] = useState<string | null>('v1');

  const updates = [
    {
      id: 'v1',
      version: '1.0.0',
      title: 'Genesis Update',
      status: 'released',
      date: 'Deployed',
      icon: Zap,
      features: [
        'V1 Regret Algorithm',
        'Market Data Hooks',
        'Compound Engine',
        'Latency -40%',
        'Dark Mode'
      ]
    },
    {
      id: 'v2',
      version: '2.0.0',
      title: 'The Social Compound',
      status: 'locked',
      date: 'Coming Soon',
      icon: Users,
      features: [
        'Leaderboards',
        'User Profiles',
        'Regret Sharing',
        'Community Stats'
      ]
    },
    {
      id: 'v3',
      version: '3.0.0',
      title: 'Automated Reality',
      status: 'locked',
      date: 'Future',
      icon: Brain,
      features: [
        'Bank Integration',
        'AI Suggestions',
        'Mobile App',
        'Push Notifications'
      ]
    }
  ];

  return (
    <div className="w-full min-h-full px-4 pt-2 pb-24">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-full mb-3">
          <Rocket className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span className="text-xs font-semibold text-[var(--primary)] uppercase tracking-wider">Roadmap</span>
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-main)] mb-2">Update Timeline</h1>
        <p className="text-sm text-[var(--text-muted)]">Track our progress and upcoming features</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--primary)] via-[var(--border)] to-[var(--border)]" />

        {/* Timeline items */}
        <div className="space-y-4">
          {updates.map((update, index) => {
            const Icon = update.icon;
            const isExpanded = expandedItem === update.id;
            const isLocked = update.status === 'locked';

            return (
              <div key={update.id} className="relative pl-14">
                {/* Timeline dot */}
                <div className={`absolute left-4 top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isLocked 
                    ? 'bg-[var(--bg-card)] border-[var(--border)]' 
                    : 'bg-[var(--primary)] border-[var(--primary)]'
                }`}>
                  {isLocked ? (
                    <Lock className="w-2.5 h-2.5 text-[var(--text-muted)]" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  )}
                </div>

                {/* Card */}
                <button
                  onClick={() => !isLocked && setExpandedItem(isExpanded ? null : update.id)}
                  disabled={isLocked}
                  className={`w-full text-left bg-[var(--bg-card)] border rounded-2xl overflow-hidden transition-all ${
                    isLocked 
                      ? 'border-[var(--border)] opacity-60' 
                      : isExpanded 
                        ? 'border-[var(--primary)] shadow-lg shadow-[var(--primary)]/10' 
                        : 'border-[var(--border)] active:scale-[0.98]'
                  }`}
                >
                  {/* Card header */}
                  <div className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isLocked 
                        ? 'bg-[var(--bg-hover)]' 
                        : 'bg-gradient-to-br from-[var(--primary)] to-purple-800'
                    }`}>
                      <Icon className={`w-5 h-5 ${isLocked ? 'text-[var(--text-muted)]' : 'text-white'}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono text-[var(--primary)] bg-[var(--primary)]/10 px-1.5 py-0.5 rounded">
                          v{update.version}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                          {update.date}
                        </span>
                      </div>
                      <h3 className="font-bold text-[var(--text-main)] text-sm truncate">{update.title}</h3>
                    </div>

                    {!isLocked && (
                      <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    )}
                  </div>

                  {/* Expanded content */}
                  {isExpanded && !isLocked && (
                    <div className="px-4 pb-4 pt-0 border-t border-[var(--border)]">
                      <ul className="space-y-2 mt-3">
                        {update.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom spacing for mobile nav */}
      <div className="h-8" />
    </div>
  );
};