import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { defaultEventConfig } from './defaultData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const RSVPS_FILE = path.join(DATA_DIR, 'rsvps.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Atomic file writer
function writeJsonAtomic(filePath, data) {
  const tempPath = `${filePath}.${Date.now()}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, filePath);
}

// Read JSON safely
function readJsonSafe(filePath, fallback) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

// Initialize config if not existing
if (!fs.existsSync(CONFIG_FILE)) {
  writeJsonAtomic(CONFIG_FILE, defaultEventConfig);
}

// Initialize rsvps if not existing
if (!fs.existsSync(RSVPS_FILE)) {
  writeJsonAtomic(RSVPS_FILE, []);
}

export const db = {
  getConfig() {
    return readJsonSafe(CONFIG_FILE, defaultEventConfig);
  },

  updateConfig(newConfig) {
    const current = this.getConfig();
    const updated = {
      ...current,
      ...newConfig,
      updatedAt: new Date().toISOString()
    };
    writeJsonAtomic(CONFIG_FILE, updated);
    return updated;
  },

  getAllRsvps() {
    return readJsonSafe(RSVPS_FILE, []);
  },

  getRsvpById(id) {
    const list = this.getAllRsvps();
    return list.find(r => r.id === id) || null;
  },

  getRsvpByToken(token) {
    if (!token) return null;
    const list = this.getAllRsvps();
    return list.find(r => r.editToken === token) || null;
  },

  createRsvp(data) {
    const list = this.getAllRsvps();

    // Check for duplicate based on phone (if provided) or exact normalized name
    const normalizedName = data.fullName.trim().toLowerCase();
    const normalizedPhone = (data.mobileNumber || '').trim();

    const existingIndex = list.findIndex(r => {
      if (normalizedPhone && r.mobileNumber && r.mobileNumber.trim() === normalizedPhone) {
        return true;
      }
      return r.fullName.trim().toLowerCase() === normalizedName;
    });

    const now = new Date().toISOString();
    const editToken = crypto.randomBytes(16).toString('hex');

    if (existingIndex >= 0) {
      // Update existing record rather than duplicate
      const existing = list[existingIndex];
      const updated = {
        ...existing,
        ...data,
        guestCount: data.rsvpStatus === 'yes' ? (parseInt(data.guestCount) || 1) : 0,
        updatedAt: now
      };
      list[existingIndex] = updated;
      writeJsonAtomic(RSVPS_FILE, list);
      return { rsvp: updated, isUpdate: true };
    }

    const newRsvp = {
      id: 'rsvp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      fullName: data.fullName.trim(),
      mobileNumber: (data.mobileNumber || '').trim(),
      rsvpStatus: data.rsvpStatus, // 'yes', 'no', 'maybe'
      guestCount: data.rsvpStatus === 'yes' ? (parseInt(data.guestCount) || 1) : 0,
      outfitColourId: data.outfitColourId || '',
      outfitColourName: data.outfitColourName || '',
      outfitColourHex: data.outfitColourHex || '',
      dietaryPreference: data.dietaryPreference || 'None',
      hostMessage: (data.hostMessage || '').trim(),
      editToken,
      createdAt: now,
      updatedAt: now
    };

    list.unshift(newRsvp);
    writeJsonAtomic(RSVPS_FILE, list);
    return { rsvp: newRsvp, isUpdate: false };
  },

  updateRsvp(token, data) {
    const list = this.getAllRsvps();
    const index = list.findIndex(r => r.editToken === token);
    if (index === -1) {
      return null;
    }

    const current = list[index];
    const now = new Date().toISOString();
    const updated = {
      ...current,
      fullName: data.fullName ? data.fullName.trim() : current.fullName,
      mobileNumber: data.mobileNumber !== undefined ? data.mobileNumber.trim() : current.mobileNumber,
      rsvpStatus: data.rsvpStatus || current.rsvpStatus,
      guestCount: data.rsvpStatus === 'yes' 
        ? (data.guestCount ? parseInt(data.guestCount) : (current.guestCount || 1))
        : 0,
      outfitColourId: data.outfitColourId !== undefined ? data.outfitColourId : current.outfitColourId,
      outfitColourName: data.outfitColourName !== undefined ? data.outfitColourName : current.outfitColourName,
      outfitColourHex: data.outfitColourHex !== undefined ? data.outfitColourHex : current.outfitColourHex,
      dietaryPreference: data.dietaryPreference !== undefined ? data.dietaryPreference : current.dietaryPreference,
      hostMessage: data.hostMessage !== undefined ? data.hostMessage.trim() : current.hostMessage,
      updatedAt: now
    };

    list[index] = updated;
    writeJsonAtomic(RSVPS_FILE, list);
    return updated;
  },

  deleteRsvp(id) {
    const list = this.getAllRsvps();
    const filtered = list.filter(r => r.id !== id);
    if (filtered.length !== list.length) {
      writeJsonAtomic(RSVPS_FILE, filtered);
      return true;
    }
    return false;
  },

  getStats() {
    const list = this.getAllRsvps();
    const config = this.getConfig();
    
    let totalSubmissions = list.length;
    let totalAttendingGuests = 0;
    let totalYes = 0;
    let totalNo = 0;
    let totalMaybe = 0;

    const colourMap = {};
    (config.colours || []).forEach(c => {
      colourMap[c.id] = {
        id: c.id,
        name: c.name,
        hex: c.hex,
        count: 0
      };
    });

    list.forEach(r => {
      if (r.rsvpStatus === 'yes') {
        totalYes++;
        totalAttendingGuests += (r.guestCount || 1);
        if (r.outfitColourId && colourMap[r.outfitColourId]) {
          colourMap[r.outfitColourId].count++;
        }
      } else if (r.rsvpStatus === 'no') {
        totalNo++;
      } else if (r.rsvpStatus === 'maybe') {
        totalMaybe++;
        if (r.outfitColourId && colourMap[r.outfitColourId]) {
          colourMap[r.outfitColourId].count++;
        }
      }
    });

    return {
      totalSubmissions,
      totalAttendingGuests,
      totalYes,
      totalNo,
      totalMaybe,
      colourStats: Object.values(colourMap)
    };
  }
};
