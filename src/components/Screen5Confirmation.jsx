import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Calendar, RotateCcw, Share2, Check, Navigation, Heart, ArrowLeft, ExternalLink } from 'lucide-react';
import DiyaGraphic from './DiyaGraphic.jsx';
import { createGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar.js';

export default function Screen5Confirmation({
  config,
  savedRsvp,
  onEditRsvp,
  onResetToWelcome
}) {
  const [copiedLink, setCopiedLink] = useState(false);

  // Trigger high-energy confetti explosion on mount
  useEffect(() => {
    if (savedRsvp?.rsvpStatus === 'yes') {
      const duration = 3.5 * 1000;
      const end = Date.now() + duration;

      const colors = ['#f7c948', '#ff2a85', '#ff7a1a', '#06d6a0', '#7b2cbf'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [savedRsvp?.rsvpStatus]);

  const isYes = savedRsvp?.rsvpStatus === 'yes';
  const isNo = savedRsvp?.rsvpStatus === 'no';
  const isMaybe = savedRsvp?.rsvpStatus === 'maybe';

  const handleShareLink = () => {
    const editUrl = `${window.location.origin}?edit=${savedRsvp?.editToken || ''}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(editUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleCalendar = () => {
    const url = createGoogleCalendarUrl({
      title: config.eventTitle,
      description: config.detailsSupporting,
      location: config.fullAddress || config.venueName,
      startDate: config.eventDate,
      startTime: config.startTime
    });
    window.open(url, '_blank');
  };

  const handleMaps = () => {
    const url = config.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(config.fullAddress || config.venueName)}`;
    window.open(url, '_blank');
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto text-center">
      {/* Central Diya Graphic */}
      <div className="mb-4">
        <DiyaGraphic size={140} />
      </div>

      {/* Dynamic Celebration Card */}
      <div className="w-full card-glass border-gold-glow rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Shimmer top border */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#f7c948] to-transparent" />

        {/* Dynamic Heading based on status */}
        <div className="space-y-3">
          {isYes && (
            <>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f7c948]/20 border border-[#f7c948]/50 text-xs font-bold text-[#f7c948] uppercase tracking-widest">
                <Sparkles size={13} /> CONFIRMED ATTENDING
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-gold-gradient tracking-tight">
                {config.confirmationYesHeading || 'IT’S A YES! LET’S MAKE SOME DIWALI MAGIC!'}
              </h2>
              <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed italic">
                “{config.confirmationYesSubtext || 'Your spot is noted! Bring your best outfit, your best energy and your festive spirit. This night is going to sparkle!'}”
              </p>
            </>
          )}

          {isNo && (
            <>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff4d6d]/20 border border-[#ff4d6d]/50 text-xs font-bold text-[#ff4d6d] uppercase tracking-widest">
                <Heart size={13} /> RESPONSE SAVED
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-white tracking-tight">
                {config.confirmationNoHeading || 'WE’LL MISS YOU! 💌'}
              </h2>
              <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed italic">
                “{config.confirmationNoSubtext || 'Sending you lots of light, love and festive wishes this Diwali. Hopefully, we celebrate together soon!'}”
              </p>
            </>
          )}

          {isMaybe && (
            <>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd43b]/20 border border-[#ffd43b]/50 text-xs font-bold text-[#ffd43b] uppercase tracking-widest">
                <Sparkles size={13} /> RESPONSE NOTED
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-gold-gradient tracking-tight">
                {config.confirmationMaybeHeading || 'WE HOPE YOU CAN MAKE IT! ✨'}
              </h2>
              <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed italic">
                “{config.confirmationMaybeSubtext || 'Take your time. We hope to celebrate with you soon. You can update your response whenever you’re ready.'}”
              </p>
            </>
          )}
        </div>

        {/* Guest Summary Pill */}
        <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/20 text-left space-y-2">
          <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
            <span className="text-purple-300">Guest Name:</span>
            <span className="font-bold text-white text-sm">{savedRsvp?.fullName}</span>
          </div>

          {isYes && (
            <>
              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                <span className="text-purple-300">Total Guests:</span>
                <span className="font-bold text-[#f7c948]">
                  {savedRsvp?.guestCount || 1} Person
                </span>
              </div>

              {savedRsvp?.outfitColourName && (
                <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                  <span className="text-purple-300">Chosen Outfit Shade:</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block shadow border border-white/30"
                      style={{ backgroundColor: savedRsvp.outfitColourHex }}
                    />
                    <span className="font-bold text-white">
                      {savedRsvp.outfitColourName}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-purple-300">Host:</span>
            <span className="font-medium text-[#ffd43b]">{config.hostedBy || 'Mauj Masti Mandali'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Add to Calendar (for Yes) */}
          {isYes && (
            <button
              onClick={handleCalendar}
              className="w-full py-3.5 px-4 rounded-xl gold-button text-gray-950 font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
            >
              <Calendar size={18} />
              <span>ADD EVENT TO CALENDAR</span>
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Change RSVP button */}
            <button
              onClick={onEditRsvp}
              className="w-full py-3 px-4 rounded-xl card-glass border border-purple-400/40 text-purple-200 hover:text-white hover:bg-white/5 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw size={15} />
              <span>CHANGE MY RSVP</span>
            </button>

            {/* Open in Maps */}
            <button
              onClick={handleMaps}
              className="w-full py-3 px-4 rounded-xl card-glass border border-orange-500/40 text-orange-200 hover:text-white hover:bg-orange-500/10 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Navigation size={15} />
              <span>VENUE DIRECTIONS</span>
            </button>
          </div>

          {/* Copy private edit link */}
          <button
            onClick={handleShareLink}
            className="w-full py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 text-xs text-purple-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
          >
            {copiedLink ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
            <span>{copiedLink ? 'Private Edit Link Copied!' : 'Copy Private Link to Edit Later'}</span>
          </button>
        </div>

        {/* Return to invitation */}
        <div className="pt-2 border-t border-white/10">
          <button
            onClick={onResetToWelcome}
            className="text-xs text-purple-300 hover:text-[#f7c948] transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={13} />
            <span>BACK TO INVITATION</span>
          </button>
        </div>
      </div>
    </section>
  );
}
