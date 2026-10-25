# 🪔 Diwali 2026 — Premium Animated & Interactive Invitation Website

A luxury, Gen-Z festive Diwali party invitation web application built for **Mauj Masti Mandali** celebrating at **Redora Stays**.

---

## ✨ Features Overview

### 🌟 Screen 1: The Grand Welcome
- Full-screen opening experience with dark midnight plum and gold accents.
- Central layered SVG Diya with dynamic flickering flame physics.
- Real-time HTML5 Canvas particle fireworks and floating marigold petals.
- Rotating Rangoli background aura and glowing festive typography.
- Tap to enter / "LET'S CELEBRATE ✨" animated reveal.

### 📅 Screen 2: The Party Details
- **Live Countdown Timer**: Real-time days, hours, minutes, and seconds till celebration.
- Event cards with glassmorphism and gold neon borders:
  - **Party Name**: Diwali 2026
  - **Hosted By**: Mauj Masti Mandali
  - **Date**: Thursday, November 5, 2026
  - **Time**: 1:00 PM onwards
  - **Venue**: Redora Stays
  - **Address**: Redora Stays, Delhi NCR (Coordinates: 28.726938, 77.094055)
- **Working Map Button**: Opens exact Google Maps coordinates (`https://maps.google.com/?q=28.726938,77.094055`).
- **Working Calendar Integration**: 
  - One-click Google Calendar web link.
  - Apple Calendar / Outlook `.ics` file download.

### 👗 Screen 3: The Outfit Colour Picker (9 Shades)
- Responsive grid (3x3 on desktop, 2-3 columns on mobile).
- Exactly 9 curated Diwali shades with contrast borders for Soft Ivory and Champagne Gold:
  1. **Royal Purple** — `#7B2CBF`
  2. **Soft Ivory** — `#FFFFF0`
  3. **Blush Pink** — `#F4A6C1`
  4. **Hot Pink** — `#FF1493`
  5. **Powder Blue** — `#A7C7E7`
  6. **Emerald Green** — `#008F69`
  7. **Sunshine Yellow** — `#FFD43B`
  8. **Tangerine Orange** — `#FF7A1A`
  9. **Champagne Gold** — `#D4AF37`
- Dynamic compliment and vibe quote for each chosen colour.
- Selected state persists into the RSVP form and confirmation screen.

### 💌 Screen 4: The RSVP Experience
- Three interactive status cards:
  - **YES! COUNT ME IN! 🎉**
  - **SORRY, CAN'T MAKE IT 💌**
  - **I'LL CONFIRM LATER ✨**
- Dynamic form fields:
  - Full Name (required)
  - Mobile Number (optional / host configurable)
  - Number of Guests (1–5+ stepper for attending guests)
  - Selected Outfit Colour (pre-populated with quick-change modal)
  - Dietary Preferences (Vegetarian, Non-Vegetarian, Jain, Vegan, No Preference)
  - Message for the Host (personal note to Mauj Masti Mandali)
- Persistent database submission with secret edit token generated for future updates.

### 🎆 Screen 5: The Celebration & Confirmation
- Dynamic celebratory screen based on response:
  - **YES**: High-energy confetti shower, personalized badge with guest name & chosen shade, calendar download, directions.
  - **NO**: Heartfelt warm Diwali wishes and option to reconsider.
  - **MAYBE**: Reassurance and private link to update anytime.
- Working "Change My RSVP" and "Back to Invitation" buttons.

### 🛡️ Host Admin Dashboard
- Protected with password authentication (Default: `diwali2026`).
- **Tab 1: Guest List & RSVPs**:
  - Live KPI cards: Total Submissions, Total Attending Guests, Declined, Maybe.
  - Outfit Colour Distribution chart across all 9 shades.
  - Search by guest name or phone.
  - Filter by status and outfit colour.
  - Delete / manage guest records.
  - **1-Click CSV Export**: Download full attendee spreadsheet.
- **Tab 2: Party Details Configuration**:
  - Live editable event title, date, time, venue, address, maps URL, host name, dress code note, headlines, and confirmation messages.
  - Field requirement toggles.
- **Tab 3: 9 Outfit Colours Editor**:
  - Edit names, hex codes, custom compliments, and order. All changes sync live without redeploying.

---

## 🚀 Running the Application

### 1. Start the Production Fullstack Server
```bash
npm start
```
The server will start at:
```
http://localhost:5000
```
Open `http://localhost:5000` in any web or mobile browser.

### 2. Development Mode (with hot-reload)
```bash
npm run dev
```
Runs the Vite dev server at `http://localhost:5173`.

---

## 🔑 Host Admin Access
Click the **Shield icon** in the top navigation bar or navigate to the invitation and click the admin button.
- **Admin Password**: `diwali2026`

All updates are persistently saved to `data/config.json` and `data/rsvps.json`.
