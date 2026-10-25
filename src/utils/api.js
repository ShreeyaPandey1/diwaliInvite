// Frontend API service
// Supports both Local Express Server and Google Apps Script (Google Sheets) for GitHub Pages

const APPS_SCRIPT_ENDPOINT = (import.meta.env.VITE_RSVP_ENDPOINT || '').trim();
const LOCAL_API_BASE = '/api';

/**
 * Check whether we are running in Google Sheets (Apps Script) mode or Local Express mode
 */
export function isGoogleSheetsMode() {
  return Boolean(APPS_SCRIPT_ENDPOINT && APPS_SCRIPT_ENDPOINT.startsWith('http'));
}

export function getBackendInfo() {
  return {
    mode: isGoogleSheetsMode() ? 'google-sheets' : 'local-express',
    endpoint: isGoogleSheetsMode() ? APPS_SCRIPT_ENDPOINT : LOCAL_API_BASE
  };
}

/**
 * 1. Fetch Event Configuration
 * Tries local API first. On static GitHub Pages hosting where /api is absent,
 * falls back to static public/config.json.
 */
export async function fetchEventConfig() {
  // If running locally with Express
  if (!isGoogleSheetsMode()) {
    try {
      const res = await fetch(`${LOCAL_API_BASE}/config`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      // Local server not running or static build
    }
  }

  // Static hosting fallback (e.g. GitHub Pages)
  try {
    const basePath = import.meta.env.BASE_URL || './';
    const staticUrl = `${basePath.replace(/\/$/, '')}/config.json`;
    const res = await fetch(staticUrl);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Could not load static config.json, using fallback data:', err);
  }

  return null;
}

/**
 * 2. Submit or Update an RSVP
 * - In Google Sheets mode: POSTs directly to Google Apps Script Web App.
 *   Uses 'Content-Type': 'text/plain;charset=utf-8' to avoid CORS preflight (OPTIONS),
 *   follows the Google 302 redirect, and parses the verified JSON response.
 * - In Local Express mode: POSTs to /api/rsvps.
 */
export async function submitRsvp(rsvpData) {
  if (isGoogleSheetsMode()) {
    try {
      // We explicitly avoid 'application/json' header here to prevent CORS preflight OPTIONS,
      // which Google Apps Script Web App does not handle.
      // Google Apps Script reads the raw body from e.postData.contents and redirects (302)
      // to script.googleusercontent.com which returns Access-Control-Allow-Origin: *
      const res = await fetch(APPS_SCRIPT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(rsvpData),
        redirect: 'follow'
      });

      if (!res.ok) {
        throw new Error(`Google Apps Script returned HTTP ${res.status}.`);
      }

      const data = await res.json();
      if (!data || data.success === false) {
        throw new Error(data?.error || 'Google Apps Script failed to record your RSVP.');
      }

      return data;
    } catch (err) {
      console.error('Apps Script RSVP submission error:', err);
      throw new Error(
        err.message || 'Failed to submit RSVP to Google Sheets. Please check your connection and try again.'
      );
    }
  }

  // Local Express Mode
  const res = await fetch(`${LOCAL_API_BASE}/rsvps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rsvpData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit RSVP to local server.');
  }
  return data;
}

/**
 * 3. Verify and retrieve guest's RSVP by secret edit token
 */
export async function fetchRsvpByToken(token) {
  if (isGoogleSheetsMode()) {
    const url = `${APPS_SCRIPT_ENDPOINT}?action=verify&token=${encodeURIComponent(token)}`;
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) {
      throw new Error('Failed to retrieve RSVP from Google Sheets');
    }
    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data;
  }

  // Local Express Mode
  const res = await fetch(`${LOCAL_API_BASE}/rsvps/verify/${token}`);
  if (!res.ok) {
    throw new Error('RSVP record not found on local server');
  }
  return await res.json();
}

/**
 * 4. Update existing RSVP using secret edit token
 */
export async function updateRsvp(token, updateData) {
  if (isGoogleSheetsMode()) {
    // Apps Script handles updates when editToken is provided in payload
    return await submitRsvp({
      ...updateData,
      editToken: token
    });
  }

  // Local Express Mode
  const res = await fetch(`${LOCAL_API_BASE}/rsvps/${token}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update RSVP on local server');
  }
  return data;
}

/**
 * 5. Admin APIs
 */
export async function adminLogin(password) {
  if (isGoogleSheetsMode()) {
    // Validate password by calling Apps Script with adminKey
    const url = `${APPS_SCRIPT_ENDPOINT}?action=adminGetStats&adminKey=${encodeURIComponent(password)}`;
    try {
      const res = await fetch(url, { redirect: 'follow' });
      const data = await res.json();
      if (data && data.success) {
        return password; // Store validated key as token
      }
      throw new Error(data?.error || 'Invalid host passcode for Google Sheets.');
    } catch (err) {
      throw new Error(err.message || 'Incorrect host password or Admin Secret not configured in Apps Script.');
    }
  }

  // Local Express Mode
  const res = await fetch(`${LOCAL_API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Invalid host password');
  }
  return data.token;
}

export async function fetchAdminConfig(token) {
  if (isGoogleSheetsMode()) {
    // In static mode, config comes from static config.json or defaults
    const config = await fetchEventConfig();
    return config || {};
  }

  // Local Express Mode
  const res = await fetch(`${LOCAL_API_BASE}/admin/config`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Unauthorized or session expired');
  return await res.json();
}

export async function updateAdminConfig(token, configData) {
  if (isGoogleSheetsMode()) {
    // On static hosting like GitHub Pages, local files cannot be rewritten by a browser client
    throw new Error(
      'Static Hosting Notice: Live configuration file edits require updating public/config.json in your repository or hosting environment.'
    );
  }

  // Local Express Mode
  const res = await fetch(`${LOCAL_API_BASE}/admin/config`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(configData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update configuration');
  return data.config;
}

export async function fetchAdminRsvps(token) {
  if (isGoogleSheetsMode()) {
    const url = `${APPS_SCRIPT_ENDPOINT}?action=adminGetRsvps&adminKey=${encodeURIComponent(token)}`;
    const res = await fetch(url, { redirect: 'follow' });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch RSVPs from Google Sheets');
    return data.rsvps || [];
  }

  // Local Express Mode
  const res = await fetch(`${LOCAL_API_BASE}/admin/rsvps`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch RSVP list');
  return await res.json();
}

export async function fetchAdminStats(token) {
  if (isGoogleSheetsMode()) {
    const url = `${APPS_SCRIPT_ENDPOINT}?action=adminGetStats&adminKey=${encodeURIComponent(token)}`;
    const res = await fetch(url, { redirect: 'follow' });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch stats from Google Sheets');
    return data.stats;
  }

  // Local Express Mode
  const res = await fetch(`${LOCAL_API_BASE}/admin/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch RSVP stats');
  return await res.json();
}

export async function deleteAdminRsvp(token, id) {
  if (isGoogleSheetsMode()) {
    throw new Error(
      'For Google Sheets backend, please delete or manage rows directly inside your private Google Sheet.'
    );
  }

  // Local Express Mode
  const res = await fetch(`${LOCAL_API_BASE}/admin/rsvps/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete RSVP record');
  return true;
}

export function getCsvExportUrl(token) {
  if (isGoogleSheetsMode()) {
    return null; // Handled directly in Admin Dashboard with CSV generation or Google Sheets export
  }
  return `${LOCAL_API_BASE}/admin/export-csv?token=${encodeURIComponent(token)}`;
}
