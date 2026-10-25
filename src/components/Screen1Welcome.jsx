import React from 'react';
import DiyaGraphic from './DiyaGraphic.jsx';
import { Sparkles, ChevronDown, Flame } from 'lucide-react';

export default function Screen1Welcome({ config, onNext }) {
  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 py-8 overflow-hidden">
      {/* Decorative Rangoli Pattern SVG Background Halo */}
      <div className="absolute w-[360px] h-[360px] sm:w-[540px] sm:h-[540px] pointer-events-none opacity-20 animate-spin" style={{ animationDuration: '60s' }}>
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="100" cy="100" r="95" stroke="#f7c948" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="75" stroke="#ff2a85" strokeWidth="1" />
          <circle cx="100" cy="100" r="55" stroke="#ffd43b" strokeWidth="1.5" strokeDasharray="2 3" />
          {[...Array(12)].map((_, i) => (
            <path
              key={i}
              d="M100 10 C108 40 108 60 100 80 C92 60 92 40 100 10 Z"
              stroke="#f7c948"
              strokeWidth="0.8"
              transform={`rotate(${i * 30} 100 100)`}
            />
          ))}
        </svg>
      </div>

      {/* Main Content Container with glass card backdrop */}
      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center space-y-6">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full card-glass border-gold-glow animate-pulse">
          <Sparkles size={14} className="text-[#f7c948]" />
          <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-gold-gradient uppercase">
            {config.welcomeEyebrow || 'YOU’RE INVITED!'}
          </span>
          <Sparkles size={14} className="text-[#f7c948]" />
        </div>

        {/* Central Animated Diya Illustration with Aura */}
        <div className="relative my-2 transform hover:scale-105 transition-transform duration-500">
          <DiyaGraphic size={170} />
          {/* Subtle sparkles floating nearby */}
          <div className="absolute -top-2 left-6 text-xl animate-bounce" style={{ animationDuration: '3s' }}>✨</div>
          <div className="absolute top-8 -right-3 text-xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '1s' }}>🌟</div>
        </div>

        {/* Grand Headline */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-[#ffe082] to-[#f7c948] drop-shadow-[0_4px_30px_rgba(247,201,72,0.4)]">
            {config.welcomeTitle || 'THE DIWALI PARTY'}
          </h1>

          <div className="flex items-center justify-center gap-3">
            <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#ff2a85]" />
            <span className="text-sm font-semibold tracking-widest text-[#ff2a85] uppercase">
              {config.eventTitle || 'DIWALI 2026'}
            </span>
            <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#ff2a85]" />
          </div>
        </div>

        {/* Supporting Text */}
        <p className="text-base sm:text-lg md:text-xl text-purple-100/90 font-normal max-w-lg leading-relaxed italic">
          “{config.welcomeSupporting || 'Lights, laughter, colours & a little chaos. Let’s make this Diwali unforgettable!'}”
        </p>

        {/* Host acknowledgment */}
        <div className="text-xs sm:text-sm font-medium text-[#ffd43b]/90 tracking-wider">
          Hosted with love by <strong className="text-white font-bold">{config.hostedBy || 'Mauj Masti Mandali'}</strong>
        </div>

        {/* Primary CTA Button */}
        <div className="pt-2 w-full sm:w-auto">
          <button
            onClick={onNext}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl gold-button text-gray-950 font-extrabold text-base sm:text-lg tracking-wider uppercase flex items-center justify-center gap-3 group relative overflow-hidden"
          >
            {/* Shimmer sweep effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent transform" />
            <Flame className="text-[#ff6b35] group-hover:scale-125 transition-transform" size={22} />
            <span>{config.welcomeButtonText || 'LET’S CELEBRATE ✨'}</span>
          </button>
        </div>

        {/* "Tap to enter" micro-indicator */}
        <button
          onClick={onNext}
          className="flex flex-col items-center gap-1 text-[11px] text-purple-300/70 hover:text-white pt-4 transition-colors animate-bounce"
        >
          <span>Tap to enter the celebration</span>
          <ChevronDown size={14} />
        </button>
      </div>
    </section>
  );
}
