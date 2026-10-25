// Calendar utilities for Google Calendar and iCal (.ics) export

export function createGoogleCalendarUrl({ title, description, location, startDate, startTime }) {
  // Parse date and time (e.g. 2026-11-08 and 1:00 PM)
  const dt = new Date(`${startDate}T13:00:00`);
  // Default duration 7 hours
  const endDt = new Date(dt.getTime() + 7 * 60 * 60 * 1000);

  const formatGoogleDate = (d) => {
    return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const startIso = formatGoogleDate(dt);
  const endIso = formatGoogleDate(endDt);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title || "Diwali 2026 Party",
    dates: `${startIso}/${endIso}`,
    details: `${description || "Lights, laughter & celebrations!"}\nHosted with love by Mauj Masti Mandali.`,
    location: location || "Redora Stays"
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsFile({ title, description, location, startDate, startTime }) {
  const dt = new Date(`${startDate}T13:00:00`);
  const endDt = new Date(dt.getTime() + 7 * 60 * 60 * 1000);

  const formatIcsDate = (d) => {
    return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const now = formatIcsDate(new Date());
  const startIso = formatIcsDate(dt);
  const endIso = formatIcsDate(endDt);

  const icsData = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Diwali Invite//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:diwali-party-${Date.now()}@diwaliinvite.local`,
    `DTSTAMP:${now}`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `SUMMARY:${title || "Diwali 2026 Party"}`,
    `DESCRIPTION:${(description || "Diwali Celebration").replace(/\n/g, "\\n")}`,
    `LOCATION:${location || "Redora Stays"}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${(title || "diwali_party").toLowerCase().replace(/\s+/g, "_")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
