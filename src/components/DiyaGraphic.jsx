import React from 'react';

export default function DiyaGraphic({ size = 160, className = "" }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`} style={{ width: size, height: size }}>
      {/* Outer ambient glow halo */}
      <div 
        className="absolute rounded-full pointer-events-none animate-pulse-glow"
        style={{
          width: size * 1.3,
          height: size * 1.3,
          background: 'radial-gradient(circle, rgba(255,158,0,0.35) 0%, rgba(255,42,133,0.15) 50%, transparent 75%)',
          filter: 'blur(16px)'
        }}
      />

      <svg
        viewBox="0 0 200 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
      >
        <defs>
          {/* Flame Gradient */}
          <radialGradient id="flameInner" cx="50%" cy="80%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fff3b0" />
            <stop offset="65%" stopColor="#ff9e00" />
            <stop offset="100%" stopColor="#ff2a85" stopOpacity="0.8" />
          </radialGradient>

          {/* Diya Clay/Brass Metallic Gradient */}
          <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe082" />
            <stop offset="30%" stopColor="#d4af37" />
            <stop offset="70%" stopColor="#aa7c11" />
            <stop offset="100%" stopColor="#573e04" />
          </linearGradient>

          {/* Diya Rim Gradient */}
          <linearGradient id="rimGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#f7c948" />
            <stop offset="50%" stopColor="#fff4cc" />
            <stop offset="100%" stopColor="#f7c948" />
          </linearGradient>

          {/* Oil Reservoir Glow */}
          <radialGradient id="oilGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff9e00" stopOpacity="0.9" />
            <stop offset="80%" stopColor="#b34700" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3d1400" stopOpacity="0.9" />
          </radialGradient>
        </defs>

        {/* Ambient base shadow */}
        <ellipse cx="100" cy="142" rx="70" ry="12" fill="rgba(0,0,0,0.4)" />

        {/* Base stand */}
        <path
          d="M75 130 C75 142 125 142 125 130 Z"
          fill="url(#brassGrad)"
          stroke="#ffe082"
          strokeWidth="1.2"
        />

        {/* Diya Main Body Bowl */}
        <path
          d="M30 92 C35 136 165 136 170 92 C145 106 55 106 30 92 Z"
          fill="url(#brassGrad)"
          stroke="#ffe082"
          strokeWidth="1.5"
        />

        {/* Traditional filigree dots on bowl */}
        <circle cx="65" cy="115" r="3" fill="#ffe082" />
        <circle cx="82" cy="120" r="3.5" fill="#ffe082" />
        <circle cx="100" cy="122" r="4" fill="#ffffff" />
        <circle cx="118" cy="120" r="3.5" fill="#ffe082" />
        <circle cx="135" cy="115" r="3" fill="#ffe082" />

        {/* Diya Rim / Opening */}
        <ellipse
          cx="100"
          cy="92"
          rx="70"
          ry="18"
          fill="url(#oilGlow)"
          stroke="url(#rimGrad)"
          strokeWidth="2.5"
        />

        {/* Glowing Oil Level */}
        <ellipse cx="100" cy="94" rx="55" ry="12" fill="url(#oilGlow)" />

        {/* Cotton Wick (Batti) */}
        <path
          d="M96 95 C98 84 102 74 100 68"
          stroke="#551a00"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M98 72 C99 69 101 67 100 65"
          stroke="#ffe082"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Flickering Animated Flame */}
        <g className="animate-flicker origin-bottom" style={{ transformOrigin: '100px 75px' }}>
          {/* Flame outer halo */}
          <path
            d="M100 15 C82 45 80 68 100 76 C120 68 118 45 100 15 Z"
            fill="url(#flameInner)"
            filter="drop-shadow(0 0 10px #ff7a1a)"
          />

          {/* Flame inner bright core */}
          <path
            d="M100 35 C88 52 90 68 100 74 C110 68 112 52 100 35 Z"
            fill="#ffffff"
            opacity="0.9"
            filter="drop-shadow(0 0 6px #fff3b0)"
          />
        </g>
      </svg>
    </div>
  );
}
