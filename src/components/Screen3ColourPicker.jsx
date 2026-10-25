import React, { useState } from 'react';
import { Check, Sparkles, ArrowRight, ArrowLeft, Shirt, Heart } from 'lucide-react';

export default function Screen3ColourPicker({
  config,
  selectedColour,
  setSelectedColour,
  onNext,
  onBack
}) {
  const colours = config.colours || [];
  const [justSelected, setJustSelected] = useState(null);

  const handleSelectColour = (colour) => {
    setSelectedColour(colour);
    setJustSelected(colour.id);
    setTimeout(() => setJustSelected(null), 800);
  };

  const handleConfirm = () => {
    onNext();
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full card-glass border border-purple-500/30 text-xs font-semibold text-pink-300 uppercase tracking-widest">
          <Shirt size={12} className="text-[#f7c948]" />
          <span>Screen Three • Dress Code</span>
          <Sparkles size={12} className="text-[#f7c948]" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-black font-display text-gold-gradient tracking-tight">
          {config.colourPickerHeading || 'PICK YOUR SHADE. OWN THE NIGHT.'}
        </h2>

        <p className="text-sm sm:text-base text-purple-200/90 italic">
          “{config.colourPickerSupporting || 'Your outfit, your colour, your vibe. Choose your shade and let’s make this Diwali a whole rainbow!'}”
        </p>

        <p className="text-xs text-[#ffd43b] font-medium tracking-wide">
          {config.colourPickerAdditional || 'Nine colours. Endless possibilities. One unforgettable night.'}
        </p>
      </div>

      {/* Dress code advisory pill */}
      <div className="mb-6 card-glass border border-white/10 rounded-2xl px-4 py-2.5 max-w-lg text-center flex items-center justify-center gap-2 text-xs text-purple-200">
        <Sparkles size={14} className="text-[#f7c948] shrink-0" />
        <span>
          {config.dressCodeNote || "Pick one of these nine colours and wear your shade with confidence. Let's make the party extra colourful!"}
        </span>
      </div>

      {/* Nine Outfit Colours Responsive Grid (3x3 on md+, 2-3 on mobile) */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 my-2 max-w-3xl">
        {colours.map((item, idx) => {
          const isSelected = selectedColour?.id === item.id;
          const isIvoryOrGold = item.hex.toLowerCase() === '#fffff0' || item.hex.toLowerCase() === '#d4af37';
          const isLight = ['#fffff0', '#a7c7e7', '#ffd43b', '#f4a6c1', '#d4af37'].includes(item.hex.toLowerCase());

          return (
            <button
              key={item.id || idx}
              onClick={() => handleSelectColour(item)}
              className={`group relative rounded-2xl p-3.5 sm:p-4 text-left transition-all duration-300 transform flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'scale-[1.03] ring-2 ring-white shadow-2xl -translate-y-1'
                  : 'hover:scale-[1.02] hover:-translate-y-0.5'
              }`}
              style={{
                background: isSelected
                  ? `linear-gradient(145deg, rgba(27,13,47,0.9), rgba(45,15,77,0.85))`
                  : `rgba(20, 10, 36, 0.65)`,
                boxShadow: isSelected
                  ? `0 0 25px ${item.hex}88, inset 0 0 15px ${item.hex}33`
                  : 'none',
                border: isSelected
                  ? `2px solid ${item.hex}`
                  : isIvoryOrGold
                  ? '1.5px solid rgba(255, 255, 255, 0.35)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Top Row: Large Tactile Swatch + Checkmark */}
              <div className="flex items-center justify-between gap-2 mb-3">
                {/* Large visual colour circle */}
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-lg relative flex items-center justify-center transition-transform group-hover:scale-105"
                  style={{
                    backgroundColor: item.hex,
                    border: isIvoryOrGold ? '2px solid rgba(100, 100, 100, 0.5)' : '1px solid rgba(255, 255, 255, 0.25)',
                    boxShadow: `0 4px 15px ${item.hex}55`,
                  }}
                >
                  {isSelected && (
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200 ${
                        isLight ? 'bg-black text-white' : 'bg-white text-black'
                      }`}
                    >
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Selected Pill or Order Tag */}
                {isSelected ? (
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-sm"
                    style={{
                      backgroundColor: item.hex,
                      color: isLight ? '#0c071e' : '#ffffff',
                    }}
                  >
                    SELECTED
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-purple-400/60 uppercase">
                    0{idx + 1}
                  </span>
                )}
              </div>

              {/* Bottom Row: Colour Name & Hex Code */}
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-gold-gradient transition-colors">
                  {item.name}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-purple-300/70 font-mono mt-0.5">
                  <span>{item.hex.toUpperCase()}</span>
                  {isSelected && (
                    <Sparkles size={11} className="text-[#f7c948] animate-pulse" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Personalised Shade Vibe Message Card */}
      {selectedColour && (
        <div className="w-full max-w-xl my-4 p-4 rounded-2xl card-glass border border-purple-500/30 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span
              className="w-3 h-3 rounded-full inline-block shadow-sm"
              style={{ backgroundColor: selectedColour.hex }}
            />
            <span className="text-xs uppercase tracking-wider font-bold text-[#f7c948]">
              {selectedColour.name} Selected!
            </span>
          </div>
          <p className="text-sm sm:text-base font-medium text-white italic">
            “{selectedColour.message || `${selectedColour.name} is your power colour! 💜 Let's rock this party!` }”
          </p>
        </div>
      )}

      {/* Confirmation & Navigation CTA */}
      <div className="w-full flex items-center justify-between pt-6 mt-4 border-t border-purple-900/40">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-purple-300 hover:text-white hover:bg-white/5 flex items-center gap-1.5 transition-all"
        >
          <ArrowLeft size={16} />
          <span>Party Details</span>
        </button>

        <button
          onClick={handleConfirm}
          className="px-6 py-3 rounded-xl gold-button text-gray-950 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg"
        >
          <span>CONFIRM MY COLOUR</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
