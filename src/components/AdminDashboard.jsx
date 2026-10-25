import React, { useState, useEffect } from 'react';
import {
  Shield, Key, Save, Download, Trash2, Search, Filter, RefreshCw,
  Sparkles, Check, AlertCircle, X, Users, UserCheck, UserX, Clock,
  Palette, Calendar, MapPin, Settings, ChevronRight, ExternalLink, FileSpreadsheet, Lock
} from 'lucide-react';
import {
  adminLogin,
  fetchAdminConfig,
  updateAdminConfig,
  fetchAdminRsvps,
  fetchAdminStats,
  deleteAdminRsvp,
  getCsvExportUrl,
  isGoogleSheetsMode,
  getBackendInfo
} from '../utils/api.js';

export default function AdminDashboard({ onClose, onConfigUpdated }) {
  const [token, setToken] = useState(localStorage.getItem('diwali_admin_token') || '');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Admin Data
  const [activeTab, setActiveTab] = useState('rsvps'); // 'rsvps', 'config', 'colours'
  const [config, setConfig] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [stats, setStats] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [actionError, setActionError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [colourFilter, setColourFilter] = useState('all');

  const backendInfo = getBackendInfo();
  const isSheets = isGoogleSheetsMode();

  useEffect(() => {
    if (token) {
      loadAdminData(token);
    }
  }, [token]);

  const loadAdminData = async (authToken) => {
    setLoading(true);
    setActionError('');
    try {
      const [cfg, rsvpList, st] = await Promise.all([
        fetchAdminConfig(authToken),
        fetchAdminRsvps(authToken),
        fetchAdminStats(authToken)
      ]);
      setConfig(cfg);
      setRsvps(rsvpList || []);
      setStats(st);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      localStorage.removeItem('diwali_admin_token');
      setToken('');
      setLoginError(err.message || 'Session expired or unauthorized. Please re-enter the host password.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      const authToken = await adminLogin(password);
      localStorage.setItem('diwali_admin_token', authToken);
      setToken(authToken);
      await loadAdminData(authToken);
    } catch (err) {
      setLoginError(err.message || 'Incorrect host password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('diwali_admin_token');
    setToken('');
    setConfig(null);
    setRsvps([]);
    setStats(null);
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (!config) return;
    setLoading(true);
    setActionError('');
    try {
      const updated = await updateAdminConfig(token, config);
      setConfig(updated);
      if (onConfigUpdated) onConfigUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setActionError(err.message || 'Failed to save configuration updates');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRsvp = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the RSVP for "${name}"?`)) {
      return;
    }
    try {
      await deleteAdminRsvp(token, id);
      await loadAdminData(token);
    } catch (err) {
      alert(err.message || 'Failed to delete RSVP');
    }
  };

  const handleColourChange = (index, field, value) => {
    const updatedColours = [...(config.colours || [])];
    updatedColours[index] = {
      ...updatedColours[index],
      [field]: value
    };
    setConfig(prev => ({
      ...prev,
      colours: updatedColours
    }));
  };

  // 1-Click CSV Export (works in both Google Sheets and Local Express modes)
  const handleExportCsv = () => {
    if (!rsvps || rsvps.length === 0) {
      alert('No RSVPs to export yet.');
      return;
    }

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

    const rows = rsvps.map(r => [
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
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'diwali_2026_guests.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered RSVPs
  const filteredRsvps = rsvps.filter(r => {
    if (statusFilter !== 'all' && r.rsvpStatus !== statusFilter) return false;
    if (colourFilter !== 'all' && r.outfitColourId !== colourFilter && r.outfitColourName !== colourFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = (r.fullName || '').toLowerCase().includes(query);
      const phoneMatch = (r.mobileNumber || '').toLowerCase().includes(query);
      return nameMatch || phoneMatch;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c071e]/95 backdrop-blur-xl flex flex-col">
      {/* Top Navbar */}
      <div className="border-b border-purple-900/40 px-4 py-3 bg-black/40 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#f7c948]/20 border border-[#f7c948]/40 text-[#f7c948]">
            <Shield size={18} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white font-display flex items-center gap-2">
              <span>HOST ADMIN DASHBOARD</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                isSheets ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-purple-900/60 text-purple-300'
              }`}>
                {isSheets ? 'Google Sheets Backend' : 'Local Express Mode'}
              </span>
            </h2>
            <p className="text-[11px] text-purple-300/70">
              Manage party details, 9 outfit shades & private RSVP guest records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {token && (
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-300 hover:bg-red-950/40"
            >
              Log Out
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-white/10 text-purple-300 hover:text-white hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        {/* If Not Authenticated: Security Passcode Modal */}
        {!token ? (
          <div className="max-w-md mx-auto my-16 card-glass border-gold-glow rounded-3xl p-6 sm:p-8 space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7b2cbf] to-[#ff2a85] mx-auto flex items-center justify-center text-white shadow-lg">
              <Key size={26} />
            </div>

            <div>
              <h3 className="text-xl font-bold font-display text-white">Host Security Passcode</h3>
              <p className="text-xs text-purple-200/80 mt-1">
                Enter your host admin passcode to access party settings and private guest data.
              </p>
              <div className="mt-2 text-[11px] text-[#f7c948] bg-black/40 p-2 rounded-xl border border-white/10 font-mono text-left space-y-1">
                <div>Backend: <strong>{isSheets ? 'Google Sheets (Apps Script)' : 'Local Express'}</strong></div>
                {isSheets ? (
                  <div className="text-purple-300">Requires <code>ADMIN_SECRET</code> matching your Apps Script property.</div>
                ) : (
                  <div>Default Local Password: <strong>diwali2026</strong></div>
                )}
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter host password..."
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-purple-500/40 text-white placeholder-purple-400/40 focus:outline-none focus:border-[#f7c948] text-sm text-center tracking-widest"
                />
              </div>

              {loginError && (
                <div className="text-xs text-red-400 bg-red-950/60 p-2.5 rounded-xl border border-red-500/40">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl gold-button text-gray-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw size={15} className="animate-spin" /> : <Shield size={15} />}
                <span>UNLOCK DASHBOARD</span>
              </button>
            </form>

            {/* Direct Google Sheets Private Access Note */}
            {isSheets && (
              <div className="pt-2 border-t border-white/10 text-[11px] text-purple-300/80 text-left space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <Lock size={12} className="text-[#06d6a0]" />
                  <span>Google Sheets Security Guarantee</span>
                </div>
                <p>
                  On GitHub Pages, guest records are stored directly inside your private Google Spreadsheet.
                  Only your Google account has access to the spreadsheet itself, keeping guest contact details 100% private.
                </p>
                <a
                  href="https://sheets.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#f7c948] hover:underline font-semibold"
                >
                  <span>Open Google Sheets</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            )}
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="space-y-6">
            {/* Mode Banner & Info */}
            {isSheets && (
              <div className="card-glass border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-emerald-200">
                  <FileSpreadsheet size={18} className="text-[#06d6a0] shrink-0" />
                  <div>
                    <span className="font-bold text-white">Connected to Google Sheets:</span> Guest RSVPs are securely written to your private Google Sheet in real time.
                  </div>
                </div>
                <a
                  href="https://sheets.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-1.5 transition-all shrink-0"
                >
                  <ExternalLink size={13} />
                  <span>Open Spreadsheet in Google</span>
                </a>
              </div>
            )}

            {/* Top Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-900/40 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('rsvps')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                    activeTab === 'rsvps'
                      ? 'bg-gradient-to-r from-[#ff2a85] to-[#7b2cbf] text-white shadow-md'
                      : 'text-purple-300 hover:text-white card-glass'
                  }`}
                >
                  <Users size={16} />
                  <span>Guest List & RSVPs ({rsvps.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('config')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                    activeTab === 'config'
                      ? 'bg-gradient-to-r from-[#ff2a85] to-[#7b2cbf] text-white shadow-md'
                      : 'text-purple-300 hover:text-white card-glass'
                  }`}
                >
                  <Settings size={16} />
                  <span>Party Details</span>
                </button>

                <button
                  onClick={() => setActiveTab('colours')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                    activeTab === 'colours'
                      ? 'bg-gradient-to-r from-[#ff2a85] to-[#7b2cbf] text-white shadow-md'
                      : 'text-purple-300 hover:text-white card-glass'
                  }`}
                >
                  <Palette size={16} />
                  <span>9 Outfit Colours</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadAdminData(token)}
                  title="Refresh data"
                  className="p-2 rounded-xl border border-white/10 hover:border-purple-400 text-purple-300 hover:text-white"
                >
                  <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                </button>

                <button
                  onClick={handleExportCsv}
                  className="px-3.5 py-2 rounded-xl card-glass border border-[#06d6a0]/40 text-[#06d6a0] hover:bg-[#06d6a0]/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Download size={14} />
                  <span>EXPORT CSV</span>
                </button>
              </div>
            </div>

            {/* TAB 1: RSVPS AND GUEST MANAGEMENT */}
            {activeTab === 'rsvps' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Analytics KPI Cards */}
                {stats && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="card-glass rounded-2xl p-4 border border-purple-500/20">
                      <div className="flex items-center justify-between text-purple-300 text-xs font-semibold">
                        <span>TOTAL RSVPS</span>
                        <Users size={16} className="text-[#f7c948]" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                        {stats.totalSubmissions}
                      </div>
                      <div className="text-[10px] text-purple-400 mt-0.5">Unique Responses</div>
                    </div>

                    <div className="card-glass rounded-2xl p-4 border border-[#06d6a0]/30 bg-[#06d6a0]/5">
                      <div className="flex items-center justify-between text-[#06d6a0] text-xs font-semibold">
                        <span>ATTENDING</span>
                        <UserCheck size={16} className="text-[#06d6a0]" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-[#06d6a0] mt-1">
                        {stats.totalAttendingGuests}
                      </div>
                      <div className="text-[10px] text-purple-300 mt-0.5">
                        {stats.totalYes} RSVPs (incl. guests)
                      </div>
                    </div>

                    <div className="card-glass rounded-2xl p-4 border border-[#ff4d6d]/30 bg-[#ff4d6d]/5">
                      <div className="flex items-center justify-between text-[#ff4d6d] text-xs font-semibold">
                        <span>DECLINED</span>
                        <UserX size={16} className="text-[#ff4d6d]" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-[#ff4d6d] mt-1">
                        {stats.totalNo}
                      </div>
                      <div className="text-[10px] text-purple-400 mt-0.5">Can't make it</div>
                    </div>

                    <div className="card-glass rounded-2xl p-4 border border-[#ffd43b]/30 bg-[#ffd43b]/5">
                      <div className="flex items-center justify-between text-[#ffd43b] text-xs font-semibold">
                        <span>MAYBE</span>
                        <Clock size={16} className="text-[#ffd43b]" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-[#ffd43b] mt-1">
                        {stats.totalMaybe}
                      </div>
                      <div className="text-[10px] text-purple-400 mt-0.5">Tentative</div>
                    </div>
                  </div>
                )}

                {/* Outfit Colour Breakdown */}
                <div className="card-glass rounded-2xl p-4 border border-purple-500/20 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-200 flex items-center gap-1.5">
                    <Palette size={14} className="text-[#f7c948]" />
                    <span>Guest Outfit Colour Distribution (9 Shades)</span>
                  </h3>

                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                    {config?.colours?.map((c) => {
                      // Get count from stats.colourStats (array) or stats.colourCounts (object)
                      let count = 0;
                      if (stats?.colourStats && Array.isArray(stats.colourStats)) {
                        const found = stats.colourStats.find(item => item.id === c.id || item.name === c.name);
                        if (found) count = found.count;
                      } else if (stats?.colourCounts && typeof stats.colourCounts === 'object') {
                        count = stats.colourCounts[c.name] || stats.colourCounts[c.id] || 0;
                      }

                      return (
                        <div
                          key={c.id}
                          className="p-2 rounded-xl bg-black/40 border border-white/10 text-center flex flex-col items-center gap-1"
                        >
                          <div
                            className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="text-[10px] font-bold text-white truncate max-w-full">
                            {c.name}
                          </span>
                          <span className="text-xs font-extrabold text-[#f7c948]">
                            {count} {count === 1 ? 'guest' : 'guests'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search size={15} className="absolute left-3.5 top-3 text-purple-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search guests by name or mobile..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/40 border border-purple-500/30 text-white placeholder-purple-400/40 text-xs focus:outline-none focus:border-[#f7c948]"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2.5 rounded-xl bg-black/40 border border-purple-500/30 text-white text-xs focus:outline-none"
                    >
                      <option value="all">All Statuses</option>
                      <option value="yes">Attending (Yes)</option>
                      <option value="no">Declined (No)</option>
                      <option value="maybe">Undecided (Maybe)</option>
                    </select>

                    {/* Colour Filter */}
                    <select
                      value={colourFilter}
                      onChange={(e) => setColourFilter(e.target.value)}
                      className="px-3 py-2.5 rounded-xl bg-black/40 border border-purple-500/30 text-white text-xs focus:outline-none"
                    >
                      <option value="all">All Colours</option>
                      {config?.colours?.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Guest List Table */}
                <div className="card-glass rounded-2xl border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-purple-200">
                      <thead className="bg-black/50 text-[11px] uppercase tracking-wider text-purple-300 border-b border-white/10">
                        <tr>
                          <th className="p-3.5">Guest</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5">Guests</th>
                          <th className="p-3.5">Outfit Shade</th>
                          <th className="p-3.5">Diet</th>
                          <th className="p-3.5">Message</th>
                          <th className="p-3.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredRsvps.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-purple-400">
                              {rsvps.length === 0 ? 'No RSVPs recorded yet.' : 'No RSVPs match your filters.'}
                            </td>
                          </tr>
                        ) : (
                          filteredRsvps.map((r) => (
                            <tr key={r.id} className="hover:bg-white/[0.03] transition-colors">
                              <td className="p-3.5 font-bold text-white">
                                <div>{r.fullName}</div>
                                {r.mobileNumber && (
                                  <div className="text-[10px] text-purple-400 font-mono">
                                    {r.mobileNumber}
                                  </div>
                                )}
                              </td>
                              <td className="p-3.5">
                                {r.rsvpStatus?.toLowerCase() === 'yes' && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                                    YES 🎉
                                  </span>
                                )}
                                {r.rsvpStatus?.toLowerCase() === 'no' && (
                                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold">
                                    NO 💌
                                  </span>
                                )}
                                {r.rsvpStatus?.toLowerCase() === 'maybe' && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                                    MAYBE ✨
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5 font-mono">
                                {r.rsvpStatus?.toLowerCase() === 'yes' ? (r.guestCount || 1) : '-'}
                              </td>
                              <td className="p-3.5">
                                {r.outfitColourName ? (
                                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/40 border border-white/10">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full"
                                      style={{ backgroundColor: r.outfitColourHex || '#f7c948' }}
                                    />
                                    <span className="text-[11px] font-medium text-white">
                                      {r.outfitColourName}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-purple-400/60">-</span>
                                )}
                              </td>
                              <td className="p-3.5 text-purple-300">
                                {r.dietaryPreference || 'None'}
                              </td>
                              <td className="p-3.5 text-[11px] max-w-[180px] truncate text-purple-300">
                                {r.hostMessage || '-'}
                              </td>
                              <td className="p-3.5 text-right">
                                {!isSheets ? (
                                  <button
                                    onClick={() => handleDeleteRsvp(r.id, r.fullName)}
                                    className="p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300"
                                    title="Delete RSVP"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-purple-400 font-mono">Synced</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PARTY DETAILS CONFIGURATION */}
            {activeTab === 'config' && config && (
              <form onSubmit={handleSaveConfig} className="space-y-6 animate-in fade-in duration-200">
                {isSheets && (
                  <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-xs text-purple-200">
                    <span className="font-bold text-[#f7c948]">Static Hosting Notice:</span> On GitHub Pages, event details are loaded from <code>public/config.json</code>. You can preview changes here, or update <code>public/config.json</code> in your repository for permanent updates.
                  </div>
                )}

                <div className="card-glass rounded-2xl p-5 border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#f7c948] flex items-center gap-2">
                    <Sparkles size={14} />
                    <span>General Event Information</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1">Party Name</label>
                      <input
                        type="text"
                        value={config.eventTitle || ''}
                        onChange={(e) => setConfig({ ...config, eventTitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1">Hosted By</label>
                      <input
                        type="text"
                        value={config.hostedBy || ''}
                        onChange={(e) => setConfig({ ...config, hostedBy: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1">Event Date (YYYY-MM-DD)</label>
                      <input
                        type="date"
                        value={config.eventDate || ''}
                        onChange={(e) => setConfig({ ...config, eventDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1">Start Time Display</label>
                      <input
                        type="text"
                        value={config.timeDisplay || ''}
                        onChange={(e) => setConfig({ ...config, timeDisplay: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1">Venue Name</label>
                      <input
                        type="text"
                        value={config.venueName || ''}
                        onChange={(e) => setConfig({ ...config, venueName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1">Full Venue Address</label>
                      <input
                        type="text"
                        value={config.fullAddress || ''}
                        onChange={(e) => setConfig({ ...config, fullAddress: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-white text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-purple-200 mb-1">Google Maps URL</label>
                      <input
                        type="url"
                        value={config.mapUrl || ''}
                        onChange={(e) => setConfig({ ...config, mapUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Welcome & Copy Settings */}
                <div className="card-glass rounded-2xl p-5 border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#ff2a85] flex items-center gap-2">
                    <Sparkles size={14} />
                    <span>Headlines & Copy</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1">Welcome Eyebrow</label>
                      <input
                        type="text"
                        value={config.welcomeEyebrow || ''}
                        onChange={(e) => setConfig({ ...config, welcomeEyebrow: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1">Welcome Title</label>
                      <input
                        type="text"
                        value={config.welcomeTitle || ''}
                        onChange={(e) => setConfig({ ...config, welcomeTitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-white text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-purple-200 mb-1">Welcome Supporting Text</label>
                      <textarea
                        rows={2}
                        value={config.welcomeSupporting || ''}
                        onChange={(e) => setConfig({ ...config, welcomeSupporting: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-white text-xs resize-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-purple-200 mb-1">Dress Code Advisory Note</label>
                      <input
                        type="text"
                        value={config.dressCodeNote || ''}
                        onChange={(e) => setConfig({ ...config, dressCodeNote: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* RSVP Form Configuration & Requirement Toggles */}
                <div className="card-glass rounded-2xl p-5 border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#06d6a0] flex items-center gap-2">
                    <Settings size={14} />
                    <span>RSVP Form Rules</span>
                  </h3>

                  <div className="flex flex-wrap gap-6 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.isColourRequired || false}
                        onChange={(e) => setConfig({ ...config, isColourRequired: e.target.checked })}
                        className="w-4 h-4 rounded text-[#f7c948]"
                      />
                      <span className="text-white">Require outfit colour before RSVP</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.isMobileRequired || false}
                        onChange={(e) => setConfig({ ...config, isMobileRequired: e.target.checked })}
                        className="w-4 h-4 rounded text-[#f7c948]"
                      />
                      <span className="text-white">Require mobile number</span>
                    </label>
                  </div>
                </div>

                {saveSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                    <Check size={16} />
                    <span>Party details saved and synced!</span>
                  </div>
                )}

                {actionError && (
                  <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs">
                    {actionError}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl gold-button text-gray-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
                  >
                    <Save size={15} />
                    <span>SAVE EVENT DETAILS</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: ALL 9 OUTFIT COLOURS EDITOR */}
            {activeTab === 'colours' && config && (
              <form onSubmit={handleSaveConfig} className="space-y-6 animate-in fade-in duration-200">
                <div className="card-glass rounded-2xl p-5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-gold-gradient flex items-center gap-2">
                        <Palette size={14} />
                        <span>Manage All Nine Outfit Colours</span>
                      </h3>
                      <p className="text-xs text-purple-300/80 mt-0.5">
                        Customize names, hex codes, custom compliments & vibe messages for each shade.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {config.colours?.map((col, idx) => (
                      <div
                        key={col.id || idx}
                        className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5 relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono text-purple-400 uppercase">
                            Colour #{idx + 1}
                          </span>
                          <div
                            className="w-6 h-6 rounded-lg shadow border border-white/30"
                            style={{ backgroundColor: col.hex }}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-purple-300 mb-1">
                            Colour Name
                          </label>
                          <input
                            type="text"
                            value={col.name || ''}
                            onChange={(e) => handleColourChange(idx, 'name', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-purple-500/30 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-purple-300 mb-1">
                            Hex Code
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={col.hex || '#000000'}
                              onChange={(e) => handleColourChange(idx, 'hex', e.target.value)}
                              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                            />
                            <input
                              type="text"
                              value={col.hex || ''}
                              onChange={(e) => handleColourChange(idx, 'hex', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-purple-500/30 text-white text-xs font-mono uppercase"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-purple-300 mb-1">
                            Vibe Message / Compliment
                          </label>
                          <textarea
                            rows={2}
                            value={col.message || ''}
                            onChange={(e) => handleColourChange(idx, 'message', e.target.value)}
                            className="w-full px-2.5 py-1 rounded-lg bg-black/50 border border-purple-500/30 text-white text-[11px] resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {saveSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                    <Check size={16} />
                    <span>Nine outfit colours successfully updated!</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl gold-button text-gray-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
                  >
                    <Save size={15} />
                    <span>SAVE COLOUR PALETTE</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
