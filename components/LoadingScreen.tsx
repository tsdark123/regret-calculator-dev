import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-main)]/90 backdrop-blur-sm perspective-container">

      {/* 3D Cube */}
      <div className="relative w-20 h-20 flex items-center justify-center preserve-3d">

        <div className="relative w-full h-full preserve-3d animate-cube-spin">

          {/* Internal Core */}
          <div className="absolute inset-0 m-auto w-6 h-6 bg-white rounded-full blur-md shadow-[0_0_40px_rgba(255,255,255,0.8)] animate-pulse-fast" />

          {/* Front */}
          <div className="side-wrapper cube-front">
            <div className="face bg-cyan-500/10 border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]" />
          </div>
          {/* Back */}
          <div className="side-wrapper cube-back">
            <div className="face bg-cyan-500/10 border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]" />
          </div>
          {/* Right */}
          <div className="side-wrapper cube-right">
            <div className="face bg-purple-500/10 border-2 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
          </div>
          {/* Left */}
          <div className="side-wrapper cube-left">
            <div className="face bg-purple-500/10 border-2 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
          </div>
          {/* Top */}
          <div className="side-wrapper cube-top">
            <div className="face bg-indigo-500/10 border-2 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]" />
          </div>
          {/* Bottom */}
          <div className="side-wrapper cube-bottom">
            <div className="face bg-indigo-500/10 border-2 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]" />
          </div>
        </div>

        {/* Floor Shadow */}
        <div className="absolute -bottom-16 w-20 h-6 bg-black/40 blur-xl rounded-[100%] animate-shadow-breathe" />
      </div>

      <div className="mt-16 text-center space-y-2 animate-fade-in-up">
        <p className="text-sm font-bold text-[var(--text-main)] tracking-widest uppercase">Calculating Opportunity Cost</p>
        <p className="text-xs text-[var(--text-muted)]">Compounding your decisions...</p>
      </div>
    </div>
  );
};