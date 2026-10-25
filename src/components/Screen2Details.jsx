import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Sparkles, Navigation, Users, ArrowRight, ArrowLeft, Download, ExternalLink } from 'lucide-react';
import CountdownTimer from './CountdownTimer.jsx';
import DiyaGraphic from './DiyaGraphic.jsx';
import { createGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar.js';

export default function Screen2Details({ config, onNext, onBack }) {
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const formattedDateString = () => {
    try {
      if (!config.eventDate) return 'Date TBD';
      const parts = config.eventDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return config.eventDate;
    } catch (e) {
      return config.eventDate;
    }
  };

  const getWeekdayName = () => {
    try {
      if (!config.eventDate) return 'Festive Celebration';
      const parts = config.eventDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', { weekday: 'long' }) + ' Party';
      }
    } catch (e) {}
    return 'Festive Party';
  };

  const handleOpenMaps = () => {
    const url = config.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(config.fullAddress || config.venueName)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleGoogleCalendar = () => {
    const url = createGoogleCalendarUrl({
      title: config.eventTitle,
      description: config.detailsSupporting,
      location: config.fullAddress || config.venueName,
      startDate: config.eventDate,
      startTime: config.startTime
    });
    window.open(url, '_blank');
    setShowCalendarModal(false);
  };

  const handleIcsDownload = () => {
    downloadIcsFile({
      title: config.eventTitle,
      description: config.detailsSupporting,
      location: config.fullAddress || config.venueName,
      startDate: config.eventDate,
      startTime: config.startTime
    });
    setShowCalendarModal(false);
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full card-glass border border-purple-500/30 text-xs font-semibold text-pink-300 uppercase tracking-widest">
          <Sparkles size={12} className="text-[#f7c948]" />
          <span>Screen Two</span>
          <Sparkles size={12} className="text-[#f7c948]" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-black font-display text-gold-gradient tracking-tight">
          {config.detailsHeading || 'LET THE FESTIVITIES BEGIN!'}
        </h2>

        <p className="text-sm sm:text-base text-purple-200/90 italic">
          “{config.detailsSupporting || 'An evening of lights, laughter, good vibes and unforgettable memories awaits.'}”
        </p>
      </div>

      {/* Live Countdown Timer */}
      <CountdownTimer eventDate={config.eventDate} startTime={config.startTime} />

      {/* Event Details Cards Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        {/* Card 1: Party Title & Host */}
        <div className="card-glass-interactive rounded-2xl p-5 border-l-4 border-l-[#ff2a85] relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff2a85] flex items-center gap-1.5">
                <Sparkles size={12} /> EVENT CELEBRATION
              </span>
              <h3 className="text-2xl font-bold font-display text-white">
                {config.eventTitle || 'Diwali 2026'}
              </h3>
              <p className="text-xs text-purple-300/80">
                A night of high energy, festive beats & joyous vibes!
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#ff2a85]/10 border border-[#ff2a85]/30 flex items-center justify-center text-xl">
              🎉
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-purple-300">Hosted By:</span>
            <span className="font-bold text-[#ffd43b] tracking-wide">
              {config.hostedBy || 'Mauj Masti Mandali'}
            </span>
          </div>
        </div>

        {/* Card 2: Date & Sparkle */}
        <div className="card-glass-interactive rounded-2xl p-5 border-l-4 border-l-[#f7c948] relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#f7c948] flex items-center gap-1.5">
                <Calendar size={12} /> DATE OF CELEBRATION
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                {formattedDateString()}
              </h3>
              <p className="text-xs text-purple-300/80">
                Mark your calendars — you won't want to miss a moment!
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#f7c948]/10 border border-[#f7c948]/30 flex items-center justify-center text-xl">
              ✨
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={() => setShowCalendarModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#f7c948] hover:text-white transition-colors"
            >
              <Calendar size={13} />
              <span>Add To Calendar</span>
            </button>
            <span className="text-[11px] text-pink-300 font-medium">{getWeekdayName()}</span>
          </div>
        </div>

        {/* Card 3: Time */}
        <div className="card-glass-interactive rounded-2xl p-5 border-l-4 border-l-[#06d6a0] relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#06d6a0] flex items-center gap-1.5">
                <Clock size={12} /> TIME & SCHEDULE
              </span>
              <h3 className="text-2xl font-bold font-display text-white">
                {config.timeDisplay || `${config.startTime || '1:00 PM'} onwards`}
              </h3>
              <p className="text-xs text-purple-300/80">
                Doors open at 1:00 PM. Festivities, games & dinner till late!
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#06d6a0]/10 border border-[#06d6a0]/30 flex items-center justify-center text-xl">
              ⏰
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-purple-300">Starting Promptly:</span>
            <span className="font-bold text-[#06d6a0]">{config.startTime || '1:00 PM'}</span>
          </div>
        </div>

        {/* Card 4: Venue & Maps */}
        <div className="card-glass-interactive rounded-2xl p-5 border-l-4 border-l-[#ff6b35] relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff6b35] flex items-center gap-1.5">
                <MapPin size={12} /> VENUE & LOCATION
              </span>
              <h3 className="text-2xl font-bold font-display text-white">
                {config.venueName || 'Redora Stays'}
              </h3>
              <p className="text-xs text-purple-300/80 leading-snug">
                {config.fullAddress || 'Redora Stays, Delhi NCR'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#ff6b35]/10 border border-[#ff6b35]/30 flex items-center justify-center">
              <Navigation size={20} className="text-[#ff6b35]" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={handleOpenMaps}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#ff6b35] hover:text-[#ffd43b] transition-colors"
            >
              <Navigation size={13} />
              <span>Open in Google Maps</span>
              <ExternalLink size={11} />
            </button>
            <span className="text-[11px] text-purple-300">Coordinates ready</span>
          </div>
        </div>
      </div>

      {/* Decorative center accent with diya and gold lines */}
      <div className="flex items-center justify-center gap-4 my-3 w-full max-w-md">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#f7c948]/50" />
        <DiyaGraphic size={50} />
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#f7c948]/50" />
      </div>

      {/* Quick Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-center gap-3 my-4">
        <button
          onClick={handleOpenMaps}
          className="px-5 py-2.5 rounded-xl card-glass border border-orange-500/40 text-orange-200 hover:text-white hover:bg-orange-500/20 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-md"
        >
          <Navigation size={16} className="text-orange-400" />
          <span>OPEN IN MAPS</span>
        </button>

        <button
          onClick={() => setShowCalendarModal(true)}
          className="px-5 py-2.5 rounded-xl card-glass border border-amber-500/40 text-amber-200 hover:text-white hover:bg-amber-500/20 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-md"
        >
          <Calendar size={16} className="text-amber-400" />
          <span>ADD TO CALENDAR</span>
        </button>
      </div>

      {/* Navigation Controls */}
      <div className="w-full flex items-center justify-between pt-6 mt-4 border-t border-purple-900/40">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-purple-300 hover:text-white hover:bg-white/5 flex items-center gap-1.5 transition-all"
        >
          <ArrowLeft size={16} />
          <span>Welcome</span>
        </button>

        <button
          onClick={onNext}
          className="px-6 py-3 rounded-xl gold-button text-gray-950 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg"
        >
          <span>CHOOSE OUTFIT COLOUR</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Add To Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="card-glass border-gold-glow rounded-3xl p-6 max-w-sm w-full space-y-4 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-[#f7c948]/20 border border-[#f7c948]/40 mx-auto flex items-center justify-center text-2xl">
              📅
            </div>
            <h3 className="text-xl font-bold font-display text-white">Add To Calendar</h3>
            <p className="text-xs text-purple-200/80">
              Save {config.eventTitle || 'Diwali 2026'} so you get reminded before the fun begins!
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleGoogleCalendar}
                className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <ExternalLink size={15} className="text-[#f7c948]" />
                <span>Google Calendar (Web)</span>
              </button>

              <button
                onClick={handleIcsDownload}
                className="w-full py-3 px-4 rounded-xl bg-purple-900/40 hover:bg-purple-800/40 border border-purple-500/40 text-purple-100 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Download size={15} className="text-pink-400" />
                <span>Apple Calendar / Outlook (.ics)</span>
              </button>
            </div>

            <button
              onClick={() => setShowCalendarModal(false)}
              className="text-xs text-purple-400 hover:text-white pt-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
