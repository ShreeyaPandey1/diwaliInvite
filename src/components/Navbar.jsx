import React, { useState } from 'react';
import { Volume2, VolumeX, Share2, Shield, Check, Sparkles } from 'lucide-react';
import { toggleFestiveMusic } from '../utils/audio.js';

export default function Navbar({ currentScreen, setScreen, config, onOpenAdmin }) {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleMusicToggle = () => {
    toggleFestiveMusic((state) => {
      setIsPlayingMusic(state);
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: `${config.eventTitle || 'Diwali 2026'} | You're Invited! ✨`,
      text: `Join us for ${config.eventTitle || 'Diwali 2026'} at ${config.venueName || 'Redora Stays'}. Choose your outfit colour and RSVP!`,
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or unsupported
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.origin);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (e) {
        // clipboard fail
      }
    }
  };

  const screenNames = [
    { id: 1, label: 'Welcome' },
    { id: 2, label: 'Details' },
    { id: 3, label: 'Outfits' },
    { id: 4, label: 'RSVP' },
    { id: 5, label: 'Celebration' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-3 py-2.5 sm:px-6 backdrop-blur-xl bg-[#0c071e]/75 border-b border-purple-900/30 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <button
          onClick={() => setScreen(1)}
          className="flex items-center gap-2 text-left group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff2a85] to-[#f7c948] p-[1.5px] flex items-center justify-center shadow-lg shadow-[#ff2a85]/30 group-hover:scale-105 transition-transform">
            <span className="text-sm">🪔</span>
          </div>
          <div>
            <div className="text-xs font-bold tracking-widest text-[#f7c948] uppercase leading-tight font-display">
              {config.eventTitle || 'Diwali 2026'}
            </div>
            <div className="text-[10px] text-pink-300/80 font-medium">
              Mauj Masti Mandali
            </div>
          </div>
        </button>

        {/* Step dots for screens 1-5 */}
        <nav className="hidden sm:flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-purple-500/20">
          {screenNames.map((step) => {
            const isActive = currentScreen === step.id;
            const isCompleted = currentScreen > step.id;

            return (
              <button
                key={step.id}
                onClick={() => setScreen(step.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ff2a85] to-[#7b2cbf] text-white shadow-md shadow-[#ff2a85]/40 scale-105'
                    : isCompleted
                    ? 'text-[#f7c948] hover:text-white'
                    : 'text-purple-300/60 hover:text-purple-200'
                }`}
              >
                <span>{step.id}</span>
                <span>{step.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action icons: Music, Share, Admin */}
        <div className="flex items-center gap-2">
          {/* Ambient Music button */}
          <button
            onClick={handleMusicToggle}
            aria-label="Toggle festive ambient music"
            title={isPlayingMusic ? "Mute festive music" : "Play festive ambient music"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              isPlayingMusic
                ? 'bg-[#f7c948]/20 border-[#f7c948] text-[#f7c948] shadow-lg shadow-[#f7c948]/20 animate-pulse'
                : 'bg-white/5 border-white/10 text-purple-200 hover:border-purple-400/50'
            }`}
          >
            {isPlayingMusic ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span className="hidden md:inline">{isPlayingMusic ? 'Music On' : 'Music'}</span>
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            aria-label="Share invitation"
            title="Share this invitation link"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-purple-200 hover:border-[#ff2a85]/50 hover:text-white transition-all"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
            <span className="hidden md:inline">{copied ? 'Link Copied!' : 'Share'}</span>
          </button>

          {/* Admin Lock Button */}
          <button
            onClick={onOpenAdmin}
            aria-label="Host admin settings"
            title="Host Admin Dashboard"
            className="p-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 hover:text-[#f7c948] hover:border-[#f7c948]/60 transition-all"
          >
            <Shield size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
