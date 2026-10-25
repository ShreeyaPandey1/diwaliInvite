import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Screen1Welcome from './components/Screen1Welcome.jsx';
import Screen2Details from './components/Screen2Details.jsx';
import Screen3ColourPicker from './components/Screen3ColourPicker.jsx';
import Screen4Rsvp from './components/Screen4Rsvp.jsx';
import Screen5Confirmation from './components/Screen5Confirmation.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import FireworksCanvas from './components/FireworksCanvas.jsx';
import FloatingPetals from './components/FloatingPetals.jsx';
import { fetchEventConfig, fetchRsvpByToken } from './utils/api.js';

// Default initial config while fetching from API
const initialConfigFallback = {
  eventTitle: "Diwali 2026",
  welcomeEyebrow: "YOU’RE INVITED!",
  welcomeTitle: "THE DIWALI PARTY",
  welcomeSupporting: "Lights, laughter, colours & a little chaos. Let’s make this Diwali unforgettable!",
  welcomeButtonText: "LET’S CELEBRATE ✨",
  detailsHeading: "LET THE FESTIVITIES BEGIN!",
  detailsSupporting: "An evening of lights, laughter, good vibes and unforgettable memories awaits.",
  eventDate: "2026-11-05",
  startTime: "1:00 PM",
  timeDisplay: "1:00 PM onwards",
  venueName: "Redora Stays",
  fullAddress: "Redora Stays, Delhi NCR (Coordinates: 28.726938, 77.094055)",
  mapUrl: "https://maps.google.com/?q=28.726938,77.094055",
  hostedBy: "Mauj Masti Mandali",
  colourPickerHeading: "PICK YOUR SHADE. OWN THE NIGHT.",
  colourPickerSupporting: "Your outfit, your colour, your vibe. Choose your shade and let’s make this Diwali a whole rainbow!",
  colourPickerAdditional: "Nine colours. Endless possibilities. One unforgettable night.",
  dressCodeNote: "Pick one of these nine colours and wear your shade with confidence. Let's make the party extra colourful!",
  rsvpHeading: "SO, ARE YOU COMING?",
  rsvpSupporting: "Your presence is the real sparkle. Let us know if we can count you in!",
  confirmationYesHeading: "IT’S A YES! LET’S MAKE SOME DIWALI MAGIC!",
  confirmationYesSubtext: "Your spot is noted! Bring your best outfit, your best energy and your festive spirit. This night is going to sparkle!",
  confirmationNoHeading: "WE’LL MISS YOU! 💌",
  confirmationNoSubtext: "Sending you lots of light, love and festive wishes this Diwali. Hopefully, we celebrate together soon!",
  confirmationMaybeHeading: "WE HOPE YOU CAN MAKE IT! ✨",
  confirmationMaybeSubtext: "Take your time. We hope to celebrate with you soon. You can update your response whenever you’re ready.",
  colours: [
    { id: "royal-purple", name: "Royal Purple", hex: "#7B2CBF", message: "Purple is your power colour! 💜 Regal, royal, and ready to slay!", order: 1 },
    { id: "soft-ivory", name: "Soft Ivory", hex: "#FFFFF0", message: "Ivory exudes pure elegance & timeless festive grace! 🤍✨", order: 2 },
    { id: "blush-pink", name: "Blush Pink", hex: "#F4A6C1", message: "Blush Pink brings the sweetest festive charm & glow! 🌸", order: 3 },
    { id: "hot-pink", name: "Hot Pink", hex: "#FF1493", message: "Hot Pink is high drama, full energy & pure Bollywood! 💖🔥", order: 4 },
    { id: "powder-blue", name: "Powder Blue", hex: "#A7C7E7", message: "Powder Blue is cool, dreamy, and aesthetic royalty! 🩵❄️", order: 5 },
    { id: "emerald-green", name: "Emerald Green", hex: "#008F69", message: "Emerald Green brings rich prosperity & queen vibes! 💚🌿", order: 6 },
    { id: "sunshine-yellow", name: "Sunshine Yellow", hex: "#FFD43B", message: "Sunshine Yellow brings festive radiance & pure joy! 💛☀️", order: 7 },
    { id: "tangerine-orange", name: "Tangerine Orange", hex: "#FF7A1A", message: "Tangerine Orange brings electric energy and firecracker warmth! 🧡🎇", order: 8 },
    { id: "champagne-gold", name: "Champagne Gold", hex: "#D4AF37", message: "Champagne Gold sparkles with pure luxury and starlight! 🌟✨", order: 9 }
  ]
};

export default function App() {
  const [config, setConfig] = useState(initialConfigFallback);
  const [currentScreen, setCurrentScreen] = useState(1);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [editToken, setEditToken] = useState(null);

  // Form State
  const [selectedColour, setSelectedColour] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    rsvpStatus: 'yes',
    guestCount: 1,
    dietaryPreference: 'Vegetarian',
    hostMessage: ''
  });

  const [savedRsvp, setSavedRsvp] = useState(null);

  // Load config on mount
  useEffect(() => {
    async function init() {
      const liveConfig = await fetchEventConfig();
      if (liveConfig) {
        setConfig(liveConfig);
        // Default select first colour if none selected yet
        if (!selectedColour && liveConfig.colours && liveConfig.colours.length > 0) {
          setSelectedColour(liveConfig.colours[0]);
        }
      } else {
        setSelectedColour(initialConfigFallback.colours[0]);
      }

      // Check if user has an edit token in URL query
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('edit');
      if (token) {
        try {
          const existingRsvp = await fetchRsvpByToken(token);
          if (existingRsvp) {
            setEditToken(token);
            setFormData({
              fullName: existingRsvp.fullName || '',
              mobileNumber: existingRsvp.mobileNumber || '',
              rsvpStatus: existingRsvp.rsvpStatus || 'yes',
              guestCount: existingRsvp.guestCount || 1,
              dietaryPreference: existingRsvp.dietaryPreference || 'None',
              hostMessage: existingRsvp.hostMessage || ''
            });

            if (existingRsvp.outfitColourId && liveConfig?.colours) {
              const matchedCol = liveConfig.colours.find(c => c.id === existingRsvp.outfitColourId);
              if (matchedCol) setSelectedColour(matchedCol);
            }
            // Navigate straight to RSVP screen to let them edit
            setCurrentScreen(4);
          }
        } catch (e) {
          console.warn('Could not load existing RSVP for editing:', e);
        }
      }
    }

    init();
  }, []);

  const handleRsvpSuccess = (rsvpResult) => {
    setSavedRsvp(rsvpResult);
    setCurrentScreen(5); // Advance to Celebration Screen
  };

  const handleEditRsvp = () => {
    setCurrentScreen(4);
  };

  const handleResetToWelcome = () => {
    setCurrentScreen(1);
  };

  return (
    <div className="min-h-screen bg-diwali-radial text-white flex flex-col relative selection:bg-[#ff2a85] selection:text-white">
      {/* Background Interactive Fireworks */}
      <FireworksCanvas active={true} density={currentScreen === 5 ? 'high' : 'normal'} />

      {/* Floating Marigold Petals & Gold Sparkles */}
      <FloatingPetals count={currentScreen === 1 || currentScreen === 5 ? 24 : 14} />

      {/* Top Navigation & Sound Bar */}
      <Navbar
        currentScreen={currentScreen}
        setScreen={setCurrentScreen}
        config={config}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Screen Content Router */}
      <main className="flex-1 relative z-10">
        {currentScreen === 1 && (
          <Screen1Welcome
            config={config}
            onNext={() => setCurrentScreen(2)}
          />
        )}

        {currentScreen === 2 && (
          <Screen2Details
            config={config}
            onNext={() => setCurrentScreen(3)}
            onBack={() => setCurrentScreen(1)}
          />
        )}

        {currentScreen === 3 && (
          <Screen3ColourPicker
            config={config}
            selectedColour={selectedColour}
            setSelectedColour={setSelectedColour}
            onNext={() => setCurrentScreen(4)}
            onBack={() => setCurrentScreen(2)}
          />
        )}

        {currentScreen === 4 && (
          <Screen4Rsvp
            config={config}
            formData={formData}
            setFormData={setFormData}
            selectedColour={selectedColour}
            setSelectedColour={setSelectedColour}
            onSuccess={handleRsvpSuccess}
            onBack={() => setCurrentScreen(3)}
            editToken={editToken}
          />
        )}

        {currentScreen === 5 && (
          <Screen5Confirmation
            config={config}
            savedRsvp={savedRsvp}
            onEditRsvp={handleEditRsvp}
            onResetToWelcome={handleResetToWelcome}
          />
        )}
      </main>

      {/* Admin Dashboard Modal */}
      {isAdminOpen && (
        <AdminDashboard
          onClose={() => setIsAdminOpen(false)}
          onConfigUpdated={(newCfg) => setConfig(newCfg)}
        />
      )}

      {/* Footer */}
      <footer className="relative z-10 py-4 px-4 text-center border-t border-purple-900/30 text-[11px] text-purple-300/60">
        <p>
          🪔 {config.eventTitle || 'Diwali 2026'} • Hosted by{' '}
          <span className="text-[#ffd43b] font-semibold">{config.hostedBy || 'Mauj Masti Mandali'}</span>
        </p>
      </footer>
    </div>
  );
}
