import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory admin session tokens
const validAdminTokens = new Set(['admin-session-' + Date.now()]);

// Middleware to check admin auth
function requireAdmin(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '') || req.headers['x-admin-token'];
  const queryToken = req.query.token;

  if ((token && validAdminTokens.has(token)) || (queryToken && validAdminTokens.has(queryToken))) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Invalid or expired admin credentials' });
}

// 1. PUBLIC: Get current event config (strips out admin password)
app.get('/api/config', (req, res) => {
  try {
    const config = db.getConfig();
    const { adminPassword, ...publicConfig } = config;
    res.json(publicConfig);
  } catch (err) {
    console.error('Error fetching config:', err);
    res.status(500).json({ error: 'Failed to load configuration' });
  }
});

// 2. PUBLIC: Submit an RSVP
app.post('/api/rsvps', (req, res) => {
  try {
    const { fullName, mobileNumber, rsvpStatus, guestCount, outfitColourId, outfitColourName, outfitColourHex, dietaryPreference, hostMessage } = req.body;
    
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    if (!rsvpStatus || !['yes', 'no', 'maybe'].includes(rsvpStatus)) {
      return res.status(400).json({ error: 'Valid RSVP status (yes/no/maybe) is required' });
    }

    const config = db.getConfig();
    if (config.isMobileRequired && (!mobileNumber || !mobileNumber.trim())) {
      return res.status(400).json({ error: 'Mobile number is required by event host' });
    }
    if (config.isColourRequired && rsvpStatus === 'yes' && !outfitColourId) {
      return res.status(400).json({ error: 'Please choose an outfit colour' });
    }

    const result = db.createRsvp({
      fullName,
      mobileNumber,
      rsvpStatus,
      guestCount: rsvpStatus === 'yes' ? (parseInt(guestCount) || 1) : 0,
      outfitColourId,
      outfitColourName,
      outfitColourHex,
      dietaryPreference,
      hostMessage
    });

    res.status(201).json({
      success: true,
      isUpdate: result.isUpdate,
      rsvp: {
        id: result.rsvp.id,
        fullName: result.rsvp.fullName,
        rsvpStatus: result.rsvp.rsvpStatus,
        guestCount: result.rsvp.guestCount,
        outfitColourName: result.rsvp.outfitColourName,
        editToken: result.rsvp.editToken
      }
    });
  } catch (err) {
    console.error('Error creating RSVP:', err);
    res.status(500).json({ error: 'Internal server error while saving RSVP' });
  }
});

// 3. PUBLIC: Verify and fetch RSVP by secret edit token
app.get('/api/rsvps/verify/:token', (req, res) => {
  try {
    const rsvp = db.getRsvpByToken(req.params.token);
    if (!rsvp) {
      return res.status(404).json({ error: 'RSVP not found or link has expired' });
    }
    res.json(rsvp);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching RSVP details' });
  }
});

// 4. PUBLIC: Update existing RSVP using secret edit token
app.put('/api/rsvps/:token', (req, res) => {
  try {
    const { token } = req.params;
    const updated = db.updateRsvp(token, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'RSVP not found to update' });
    }
    res.json({
      success: true,
      rsvp: updated
    });
  } catch (err) {
    res.status(500).json({ error: 'Error updating RSVP' });
  }
});

// 5. ADMIN: Login
app.post('/api/admin/login', (req, res) => {
  try {
    const { password } = req.body;
    const config = db.getConfig();
    const expectedPassword = config.adminPassword || 'diwali2026';

    if (password === expectedPassword) {
      const token = 'admin_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      validAdminTokens.add(token);
      return res.json({ success: true, token });
    }

    return res.status(401).json({ error: 'Incorrect host password' });
  } catch (err) {
    res.status(500).json({ error: 'Login verification failed' });
  }
});

// 6. ADMIN: Get full event config (including settings)
app.get('/api/admin/config', requireAdmin, (req, res) => {
  try {
    const config = db.getConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

// 7. ADMIN: Update event config
app.put('/api/admin/config', requireAdmin, (req, res) => {
  try {
    const updated = db.updateConfig(req.body);
    res.json({ success: true, config: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// 8. ADMIN: Get all RSVPs list
app.get('/api/admin/rsvps', requireAdmin, (req, res) => {
  try {
    const rsvps = db.getAllRsvps();
    res.json(rsvps);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve RSVPs' });
  }
});

// 9. ADMIN: Get summary stats & colour counts
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  try {
    const stats = db.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute stats' });
  }
});

// 10. ADMIN: Delete RSVP
app.delete('/api/admin/rsvps/:id', requireAdmin, (req, res) => {
  try {
    const deleted = db.deleteRsvp(req.params.id);
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'RSVP not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete RSVP' });
  }
});

// 11. ADMIN: Export CSV of all guests
app.get('/api/admin/export-csv', requireAdmin, (req, res) => {
  try {
    const list = db.getAllRsvps();
    const headers = [
      'ID',
      'Full Name',
      'Mobile Number',
      'RSVP Status',
      'Guests Count',
      'Outfit Colour',
      'Dietary Preference',
      'Host Message',
      'Created At',
      'Last Updated'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = list.map(r => [
      escapeCsv(r.id),
      escapeCsv(r.fullName),
      escapeCsv(r.mobileNumber || ''),
      escapeCsv(r.rsvpStatus?.toUpperCase()),
      escapeCsv(r.guestCount),
      escapeCsv(r.outfitColourName || ''),
      escapeCsv(r.dietaryPreference || ''),
      escapeCsv(r.hostMessage || ''),
      escapeCsv(r.createdAt),
      escapeCsv(r.updatedAt)
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="diwali_2026_guests.csv"');
    res.send(csvContent);
  } catch (err) {
    console.error('CSV export error:', err);
    res.status(500).send('Error generating CSV export');
  }
});

// Serve frontend in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Catch-all route to serve SPA
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  const indexHtml = path.join(distPath, 'index.html');
  res.sendFile(indexHtml);
});

app.listen(PORT, () => {
  console.log(`🪔 Diwali Invite Backend running on http://localhost:${PORT}`);
});
