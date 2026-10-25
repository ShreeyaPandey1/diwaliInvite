import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, ArrowLeft, Loader2, AlertCircle, Heart, User, Phone, Users, Utensils, MessageSquare, Palette } from 'lucide-react';
import { submitRsvp, updateRsvp } from '../utils/api.js';

export default function Screen4Rsvp({
  config,
  formData,
  setFormData,
  selectedColour,
  setSelectedColour,
  onSuccess,
  onBack,
  editToken
}) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showColourSelectorModal, setShowColourSelectorModal] = useState(false);

  const colours = config.colours || [];

  const handleStatusChange = (status) => {
    setFormData((prev) => ({
      ...prev,
      rsvpStatus: status,
    }));
    setErrorMsg('');
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation
    if (!formData.fullName || !formData.fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!formData.rsvpStatus) {
      setErrorMsg('Please select your RSVP status (Yes, No, or Maybe).');
      return;
    }

    if (config.isMobileRequired && (!formData.mobileNumber || !formData.mobileNumber.trim())) {
      setErrorMsg('Please provide your mobile number.');
      return;
    }

    if (config.isColourRequired && formData.rsvpStatus === 'yes' && !selectedColour) {
      setErrorMsg('Please select your outfit colour from the colour picker.');
      return;
    }

    setSubmitting(true);

    const payload = {
      fullName: formData.fullName.trim(),
      mobileNumber: formData.mobileNumber ? formData.mobileNumber.trim() : '',
      rsvpStatus: formData.rsvpStatus,
      guestCount: formData.rsvpStatus === 'yes' ? (parseInt(formData.guestCount) || 1) : 0,
      outfitColourId: selectedColour?.id || '',
      outfitColourName: selectedColour?.name || '',
      outfitColourHex: selectedColour?.hex || '',
      dietaryPreference: formData.dietaryPreference || 'None',
      hostMessage: formData.hostMessage ? formData.hostMessage.trim() : ''
    };

    try {
      let result;
      if (editToken) {
        result = await updateRsvp(editToken, payload);
      } else {
        result = await submitRsvp(payload);
      }
      onSuccess(result.rsvp || result);
    } catch (err) {
      console.error('RSVP submission error:', err);
      setErrorMsg(err.message || 'Failed to submit your RSVP. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full card-glass border border-purple-500/30 text-xs font-semibold text-pink-300 uppercase tracking-widest">
          <Sparkles size={12} className="text-[#f7c948]" />
          <span>Screen Four • RSVP</span>
          <Sparkles size={12} className="text-[#f7c948]" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-black font-display text-gold-gradient tracking-tight">
          {config.rsvpHeading || 'SO, ARE YOU COMING?'}
        </h2>

        <p className="text-sm sm:text-base text-purple-200/90 italic">
          “{config.rsvpSupporting || 'Your presence is the real sparkle. Let us know if we can count you in!'}”
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        {/* Step 1: RSVP Status 3 Big Clickable Cards */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 text-center">
            Select Your RSVP Status <span className="text-[#ff2a85]">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Option 1: Yes */}
            <button
              type="button"
              onClick={() => handleStatusChange('yes')}
              className={`p-4 rounded-2xl text-center transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center gap-1.5 ${
                formData.rsvpStatus === 'yes'
                  ? 'bg-gradient-to-b from-[#7b2cbf] to-[#2d0f4d] border-2 border-[#f7c948] shadow-lg shadow-[#7b2cbf]/50 scale-[1.02]'
                  : 'card-glass-interactive border border-white/10 hover:border-purple-400/40'
              }`}
            >
              <span className="text-2xl">🎉</span>
              <span className="text-sm font-bold text-white tracking-wide">
                YES! COUNT ME IN!
              </span>
              <span className="text-[11px] text-pink-200/70">
                Ready to dance & celebrate!
              </span>
              {formData.rsvpStatus === 'yes' && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#f7c948] text-black flex items-center justify-center shadow">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </button>

            {/* Option 2: No */}
            <button
              type="button"
              onClick={() => handleStatusChange('no')}
              className={`p-4 rounded-2xl text-center transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center gap-1.5 ${
                formData.rsvpStatus === 'no'
                  ? 'bg-gradient-to-b from-[#4d1627] to-[#260b13] border-2 border-[#ff4d6d] shadow-lg shadow-[#ff4d6d]/40 scale-[1.02]'
                  : 'card-glass-interactive border border-white/10 hover:border-pink-400/40'
              }`}
            >
              <span className="text-2xl">💌</span>
              <span className="text-sm font-bold text-white tracking-wide">
                SORRY, CAN’T MAKE IT
              </span>
              <span className="text-[11px] text-purple-200/70">
                Sending warm festive love!
              </span>
              {formData.rsvpStatus === 'no' && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#ff4d6d] text-white flex items-center justify-center shadow">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </button>

            {/* Option 3: Maybe */}
            <button
              type="button"
              onClick={() => handleStatusChange('maybe')}
              className={`p-4 rounded-2xl text-center transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center gap-1.5 ${
                formData.rsvpStatus === 'maybe'
                  ? 'bg-gradient-to-b from-[#3d2c00] to-[#1f1700] border-2 border-[#ffd43b] shadow-lg shadow-[#ffd43b]/40 scale-[1.02]'
                  : 'card-glass-interactive border border-white/10 hover:border-amber-400/40'
              }`}
            >
              <span className="text-2xl">✨</span>
              <span className="text-sm font-bold text-white tracking-wide">
                I’LL CONFIRM LATER
              </span>
              <span className="text-[11px] text-amber-200/70">
                Checking schedule first
              </span>
              {formData.rsvpStatus === 'maybe' && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#ffd43b] text-black flex items-center justify-center shadow">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Input Fields Container */}
        <div className="card-glass rounded-3xl p-5 sm:p-7 space-y-4 border border-white/10">
          {/* Full Name (Required for all) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-1.5 flex items-center gap-1.5">
              <User size={13} className="text-[#f7c948]" />
              <span>Full Name <span className="text-[#ff2a85]">*</span></span>
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="e.g. Ananya Sharma"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-purple-500/30 text-white placeholder-purple-400/40 focus:outline-none focus:border-[#f7c948] focus:ring-1 focus:ring-[#f7c948] transition-all text-sm"
            />
          </div>

          {/* Mobile Number (Optional or Required based on host config) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone size={13} className="text-[#06d6a0]" />
                <span>Mobile Number {config.isMobileRequired && <span className="text-[#ff2a85]">*</span>}</span>
              </span>
              <span className="text-[10px] text-purple-400 font-normal">
                {config.isMobileRequired ? 'Required for updates' : 'Optional (for event updates)'}
              </span>
            </label>
            <input
              type="tel"
              value={formData.mobileNumber}
              onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-purple-500/30 text-white placeholder-purple-400/40 focus:outline-none focus:border-[#06d6a0] focus:ring-1 focus:ring-[#06d6a0] transition-all text-sm font-mono"
            />
          </div>

          {/* If YES: show Guest Count, Outfit Colour pill, Dietary */}
          {formData.rsvpStatus === 'yes' && (
            <>
              {/* Guest Count */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Users size={13} className="text-[#ff7a1a]" />
                    <span>Number of Guests (Including you) <span className="text-[#ff2a85]">*</span></span>
                  </span>
                  <span className="text-xs font-bold text-[#f7c948]">
                    {formData.guestCount} {formData.guestCount === 1 ? 'Person' : 'People'}
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleInputChange('guestCount', num)}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        formData.guestCount === num
                          ? 'bg-gradient-to-r from-[#f7c948] to-[#ff7a1a] text-black shadow-md'
                          : 'bg-black/30 border border-white/10 text-purple-200 hover:border-purple-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pre-populated Outfit Colour with change button */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Palette size={13} className="text-[#ff2a85]" />
                    <span>Your Chosen Outfit Colour</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowColourSelectorModal(true)}
                    className="text-[11px] text-[#f7c948] hover:underline font-semibold"
                  >
                    Change shade
                  </button>
                </label>

                {selectedColour ? (
                  <div
                    onClick={() => setShowColourSelectorModal(true)}
                    className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-purple-500/30 cursor-pointer hover:border-[#f7c948] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg shadow-sm border border-white/30"
                        style={{ backgroundColor: selectedColour.hex }}
                      />
                      <div>
                        <div className="text-sm font-bold text-white">
                          {selectedColour.name}
                        </div>
                        <div className="text-[11px] text-purple-300/80">
                          {selectedColour.message || 'Ready to shine in this shade!'}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-purple-300 font-mono">
                      {selectedColour.hex}
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowColourSelectorModal(true)}
                    className="w-full py-3 px-4 rounded-xl border border-dashed border-purple-400/40 text-xs text-purple-300 hover:text-white hover:border-[#f7c948] transition-all flex items-center justify-center gap-2"
                  >
                    <Palette size={14} className="text-[#f7c948]" />
                    <span>Select an outfit colour from the 9 options</span>
                  </button>
                )}
              </div>

              {/* Dietary Preferences */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-1.5 flex items-center gap-1.5">
                  <Utensils size={13} className="text-[#06d6a0]" />
                  <span>Dietary Preferences</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['Vegetarian', 'Non-Vegetarian', 'Jain', 'Vegan', 'No Preference'].map((diet) => (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => handleInputChange('dietaryPreference', diet)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                        formData.dietaryPreference === diet
                          ? 'bg-[#06d6a0]/20 border border-[#06d6a0] text-[#06d6a0] shadow-sm'
                          : 'bg-black/30 border border-white/10 text-purple-200 hover:border-purple-400/40'
                      }`}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Message for Host (All responses) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-1.5 flex items-center gap-1.5">
              <MessageSquare size={13} className="text-pink-400" />
              <span>A Message for the Host (Optional)</span>
            </label>
            <textarea
              rows={3}
              value={formData.hostMessage}
              onChange={(e) => handleInputChange('hostMessage', e.target.value)}
              placeholder="Send festive wishes, song requests, or notes to Mauj Masti Mandali..."
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-purple-500/30 text-white placeholder-purple-400/40 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all text-sm resize-none"
            />
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-950/70 border border-red-500/60 text-red-200 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in duration-200">
            <AlertCircle size={18} className="text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Navigation & Submit CTA */}
        <div className="w-full flex items-center justify-between pt-4 border-t border-purple-900/40">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-purple-300 hover:text-white hover:bg-white/5 flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft size={16} />
            <span>Outfits</span>
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 rounded-xl gold-button text-gray-950 font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>SAVING RSVP...</span>
              </>
            ) : (
              <>
                <span>{editToken ? 'UPDATE MY RSVP' : 'SUBMIT RSVP ✨'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Colour Selector Popup Modal (if they want to switch colour right from RSVP) */}
      {showColourSelectorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="card-glass border-gold-glow rounded-3xl p-6 max-w-lg w-full space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold font-display text-white">Choose Your Outfit Shade</h3>
              <button
                type="button"
                onClick={() => setShowColourSelectorModal(false)}
                className="text-xs text-purple-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {colours.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedColour(c);
                    setShowColourSelectorModal(false);
                  }}
                  className={`p-2.5 rounded-xl flex flex-col items-center gap-1.5 border transition-all ${
                    selectedColour?.id === c.id
                      ? 'border-[#f7c948] bg-white/10 ring-2 ring-[#f7c948]'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-lg shadow border border-white/20"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[11px] font-bold text-white text-center leading-tight">
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
