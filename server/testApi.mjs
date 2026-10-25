// Uses global fetch in Node 22
async function testApi() {
  const baseUrl = 'http://localhost:5000';

  console.log('--- Testing API Endpoints ---');

  // 1. Test GET /api/config
  const configRes = await fetch(`${baseUrl}/api/config`);
  console.log('1. /api/config status:', configRes.status);
  const config = await configRes.json();
  console.log('   Event Title:', config.eventTitle);
  console.log('   Colours count:', config.colours.length);
  if (config.colours.length !== 9) throw new Error('Expected 9 colours, got ' + config.colours.length);

  // 2. Test POST /api/rsvps (Submit RSVP)
  const rsvpPayload = {
    fullName: "Rohan Verma",
    mobileNumber: "+91 9988776655",
    rsvpStatus: "yes",
    guestCount: 2,
    outfitColourId: "royal-purple",
    outfitColourName: "Royal Purple",
    outfitColourHex: "#7B2CBF",
    dietaryPreference: "Vegetarian",
    hostMessage: "Super excited to celebrate Diwali with Mauj Masti Mandali!"
  };

  const rsvpRes = await fetch(`${baseUrl}/api/rsvps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rsvpPayload)
  });
  console.log('2. POST /api/rsvps status:', rsvpRes.status);
  const rsvpData = await rsvpRes.json();
  console.log('   Saved RSVP ID:', rsvpData.rsvp?.id);
  console.log('   Edit Token:', rsvpData.rsvp?.editToken);

  if (!rsvpData.rsvp?.editToken) throw new Error('Missing edit token!');

  // 3. Test GET /api/rsvps/verify/:token
  const verifyRes = await fetch(`${baseUrl}/api/rsvps/verify/${rsvpData.rsvp.editToken}`);
  console.log('3. Verify token status:', verifyRes.status);
  const verifiedRsvp = await verifyRes.json();
  console.log('   Verified name:', verifiedRsvp.fullName);
  console.log('   Verified colour:', verifiedRsvp.outfitColourName);

  // 4. Test POST /api/admin/login
  const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'diwali2026' })
  });
  console.log('4. Admin Login status:', loginRes.status);
  const loginData = await loginRes.json();
  console.log('   Admin token received:', !!loginData.token);

  // 5. Test GET /api/admin/stats
  const statsRes = await fetch(`${baseUrl}/api/admin/stats`, {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });
  console.log('5. Admin stats status:', statsRes.status);
  const stats = await statsRes.json();
  console.log('   Total Submissions:', stats.totalSubmissions);
  console.log('   Total Attending Guests:', stats.totalAttendingGuests);
  console.log('   Colour Breakdown:', stats.colourStats.map(c => `${c.name}: ${c.count}`).join(', '));

  // 6. Test GET /api/admin/export-csv
  const csvRes = await fetch(`${baseUrl}/api/admin/export-csv`, {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });
  console.log('6. CSV Export status:', csvRes.status);
  const csvText = await csvRes.text();
  console.log('   CSV rows:', csvText.split('\n').length);

  console.log('✅ ALL BACKEND TESTS PASSED SUCCESSFULLY!');
}

testApi().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
