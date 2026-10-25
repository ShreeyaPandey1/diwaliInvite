/**
 * 🪔 Diwali 2026 — Google Apps Script Backend for Google Sheets
 * 
 * Persistent RSVP storage for Diwali Party Invitation (Mauj Masti Mandali @ Redora Stays).
 * Designed for deployment as a Web App with access set to "Anyone".
 */

// Configuration
var SHEET_NAME = 'RSVPs';
var HEADERS = [
  'ID',
  'Timestamp',
  'Full Name',
  'RSVP Status',
  'Guest Count',
  'Outfit Colour',
  'Outfit Colour Hex',
  'Mobile Number',
  'Dietary Preference',
  'Host Message',
  'Edit Token',
  'Last Updated'
];

/**
 * Handle HTTP POST requests (Guest RSVP submission & updates)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 15 seconds for concurrent writes to finish safely
  try {
    lock.waitLock(15000);
  } catch (lockError) {
    return jsonResponse({
      success: false,
      error: 'Server is busy processing another RSVP. Please try again in a few seconds.'
    });
  }

  try {
    var data = parsePayload(e);
    if (!data) {
      return jsonResponse({ success: false, error: 'No payload data provided.' });
    }

    var fullName = (data.fullName || '').toString().trim();
    var rsvpStatus = (data.rsvpStatus || '').toString().trim().toLowerCase();

    if (!fullName) {
      return jsonResponse({ success: false, error: 'Full name is required.' });
    }
    if (!rsvpStatus || ['yes', 'no', 'maybe'].indexOf(rsvpStatus) === -1) {
      return jsonResponse({ success: false, error: 'Valid RSVP status (yes/no/maybe) is required.' });
    }

    var sheet = getOrCreateSheet();
    var rows = sheet.getDataRange().getValues();
    var nowIso = new Date().toISOString();

    var editToken = data.editToken || generateToken(16);
    var id = data.id || ('rsvp_' + new Date().getTime() + '_' + Math.random().toString(36).substring(2, 7));
    var guestCount = rsvpStatus === 'yes' ? (parseInt(data.guestCount, 10) || 1) : 0;
    var mobile = (data.mobileNumber || '').toString().trim();
    var outfitName = (data.outfitColourName || '').toString().trim();
    var outfitHex = (data.outfitColourHex || '').toString().trim();
    var dietary = (data.dietaryPreference || 'None').toString().trim();
    var message = (data.hostMessage || '').toString().trim();

    // Check if an existing row matches editToken, mobile, or normalized full name
    var existingRowIndex = -1;
    var normalizedName = fullName.toLowerCase();

    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      var rowId = (row[0] || '').toString();
      var rowName = (row[2] || '').toString().trim().toLowerCase();
      var rowPhone = (row[7] || '').toString().trim();
      var rowToken = (row[10] || '').toString();

      // Priority 1: Match by secret editToken
      if (data.editToken && rowToken === data.editToken) {
        existingRowIndex = i + 1; // 1-indexed for Sheet API
        id = rowId;
        break;
      }
      // Priority 2: Match by non-empty phone number
      if (mobile && rowPhone && mobile === rowPhone) {
        existingRowIndex = i + 1;
        id = rowId;
        editToken = rowToken || editToken;
        break;
      }
      // Priority 3: Match by identical guest full name
      if (rowName === normalizedName) {
        existingRowIndex = i + 1;
        id = rowId;
        editToken = rowToken || editToken;
        break;
      }
    }

    var rowValues = [
      id,
      existingRowIndex > 0 ? rows[existingRowIndex - 1][1] : nowIso, // Preserve original timestamp
      fullName,
      rsvpStatus.toUpperCase(),
      guestCount,
      outfitName,
      outfitHex,
      mobile,
      dietary,
      message,
      editToken,
      nowIso
    ];

    var isUpdate = false;
    if (existingRowIndex > 0) {
      sheet.getRange(existingRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
      isUpdate = true;
    } else {
      sheet.appendRow(rowValues);
    }

    return jsonResponse({
      success: true,
      isUpdate: isUpdate,
      rsvp: {
        id: id,
        fullName: fullName,
        rsvpStatus: rsvpStatus,
        guestCount: guestCount,
        outfitColourName: outfitName,
        outfitColourHex: outfitHex,
        editToken: editToken
      }
    });

  } catch (err) {
    return jsonResponse({
      success: false,
      error: 'Failed to record RSVP in Google Sheet: ' + err.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Handle HTTP GET requests
 * Supports:
 * - Health check
 * - Guest verification by editToken (retrieves only their own RSVP)
 * - Protected admin queries (requires adminKey)
 */
function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var action = params.action || 'health';

    // 1. Health check
    if (action === 'health') {
      return jsonResponse({
        status: 'ok',
        service: 'Diwali 2026 RSVP Backend',
        backend: 'Google Sheets',
        timestamp: new Date().toISOString()
      });
    }

    // 2. Guest retrieves their own RSVP via private editToken
    if (action === 'verify') {
      var token = params.token;
      if (!token) {
        return jsonResponse({ error: 'Token parameter is required' });
      }

      var sheet = getOrCreateSheet();
      var rows = sheet.getDataRange().getValues();

      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        if (row[10] && row[10].toString() === token) {
          return jsonResponse({
            id: row[0],
            createdAt: row[1],
            fullName: row[2],
            rsvpStatus: (row[3] || '').toString().toLowerCase(),
            guestCount: parseInt(row[4], 10) || 0,
            outfitColourName: row[5],
            outfitColourHex: row[6],
            mobileNumber: row[7],
            dietaryPreference: row[8],
            hostMessage: row[9],
            editToken: row[10],
            updatedAt: row[11]
          });
        }
      }

      return jsonResponse({ error: 'RSVP not found for the provided token' });
    }

    // 3. Admin endpoints (STRICTLY PROTECTED - requires adminKey)
    if (action === 'adminGetRsvps' || action === 'adminGetStats') {
      if (!isAuthorizedAdmin(params.adminKey)) {
        return jsonResponse({
          error: 'Unauthorized: Valid host adminKey is required to view private guest records.'
        });
      }

      var adminSheet = getOrCreateSheet();
      var adminRows = adminSheet.getDataRange().getValues();
      var rsvpsList = [];

      for (var j = 1; j < adminRows.length; j++) {
        var r = adminRows[j];
        if (!r[0]) continue;
        rsvpsList.push({
          id: r[0],
          createdAt: r[1],
          fullName: r[2],
          rsvpStatus: (r[3] || '').toString().toLowerCase(),
          guestCount: parseInt(r[4], 10) || 0,
          outfitColourName: r[5],
          outfitColourHex: r[6],
          mobileNumber: r[7],
          dietaryPreference: r[8],
          hostMessage: r[9],
          editToken: r[10],
          updatedAt: r[11]
        });
      }

      if (action === 'adminGetRsvps') {
        return jsonResponse({ success: true, rsvps: rsvpsList });
      }

      // Compute stats
      var totalSubmissions = rsvpsList.length;
      var totalAttending = 0;
      var totalYes = 0;
      var totalNo = 0;
      var totalMaybe = 0;
      var colourCounts = {};

      for (var k = 0; k < rsvpsList.length; k++) {
        var item = rsvpsList[k];
        if (item.rsvpStatus === 'yes') {
          totalYes++;
          totalAttending += (item.guestCount || 1);
        } else if (item.rsvpStatus === 'no') {
          totalNo++;
        } else if (item.rsvpStatus === 'maybe') {
          totalMaybe++;
        }

        if (item.outfitColourName) {
          colourCounts[item.outfitColourName] = (colourCounts[item.outfitColourName] || 0) + 1;
        }
      }

      return jsonResponse({
        success: true,
        stats: {
          totalSubmissions: totalSubmissions,
          totalAttendingGuests: totalAttending,
          totalYes: totalYes,
          totalNo: totalNo,
          totalMaybe: totalMaybe,
          colourCounts: colourCounts
        }
      });
    }

    return jsonResponse({ error: 'Unknown action: ' + action });

  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

/**
 * Check if the provided adminKey matches the configured script secret
 */
function isAuthorizedAdmin(providedKey) {
  if (!providedKey) return false;
  var scriptProperties = PropertiesService.getScriptProperties();
  var configuredSecret = scriptProperties.getProperty('ADMIN_SECRET') || 'diwali2026';
  return providedKey === configuredSecret;
}

/**
 * Safely parse incoming payload from POST request
 */
function parsePayload(e) {
  if (!e) return null;
  // 1. If JSON was sent in postData.contents
  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (parseErr) {
      // Fallback if URL-encoded inside postData
    }
  }
  // 2. If form parameters were sent
  if (e.parameter && Object.keys(e.parameter).length > 0) {
    return e.parameter;
  }
  return null;
}

/**
 * Return JSON response with correct MIME type
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Get or initialize the RSVPs sheet with formatted header row
 */
function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Check if headers exist
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    // Format header row
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#2D0F4D'); // Deep festive purple
    headerRange.setFontColor('#F7C948'); // Gold text
    headerRange.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);

    // Auto-fit column widths
    for (var i = 1; i <= HEADERS.length; i++) {
      sheet.autoResizeColumn(i);
    }
  }

  return sheet;
}

/**
 * Generate random alphanumeric token
 */
function generateToken(len) {
  var chars = 'abcdef0123456789';
  var token = '';
  for (var i = 0; i < len; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
