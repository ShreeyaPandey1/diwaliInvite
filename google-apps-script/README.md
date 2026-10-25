# 🪔 Google Apps Script & Google Sheets Backend Setup

This guide explains how to connect your Diwali Party Invitation website to **Google Sheets** via **Google Apps Script** as a serverless, persistent backend suitable for **GitHub Pages**.

---

## 📋 Architecture Overview

* **Frontend**: React + Vite static website hosted on **GitHub Pages**.
* **Backend API**: Google Apps Script Web App (`Code.gs`).
* **Database**: Private Google Sheet titled `RSVPs`.
* **Security**:
  * Guest RSVP submission writes directly to the sheet via POST.
  * Private guest records, phone numbers, and CSV exports remain private in your Google Sheet, protected by your Google Account authentication.
  * Public users cannot access or scrape private guest records.

---

## 🛠️ Step-by-Step Setup Instructions

### Step 1: Create a Google Spreadsheet
1. Open [Google Sheets](https://sheets.new) in your browser while signed into your Google account.
2. Name the spreadsheet: **`Diwali 2026 Party RSVPs - Mauj Masti Mandali`**.
3. (Optional) Rename the active tab at the bottom to **`RSVPs`** (if you don't, the script will create it automatically).

### Step 2: Open Google Apps Script Editor
1. In the Google Sheets menu, click **Extensions** → **Apps Script**.
2. A new tab will open with the Apps Script code editor.
3. Delete any default code in `Code.gs`.
4. Copy the entire contents of [`google-apps-script/Code.gs`](./Code.gs) and paste it into the editor.
5. Click **Save** (💾 icon) or press `Ctrl + S` / `Cmd + S`.

### Step 3: (Optional) Set Admin Secret for In-App Dashboard
If you want the in-app Admin Dashboard to fetch stats and guest counts from Google Sheets:
1. In the Apps Script editor, click the **Gear icon** (Project Settings) on the left sidebar.
2. Scroll down to **Script Properties**.
3. Click **Add script property**:
   * **Property**: `ADMIN_SECRET`
   * **Value**: `diwali2026` (or your custom password)
4. Click **Save script properties**.

### Step 4: Deploy as a Web App
1. In the top right corner of the Apps Script editor, click the blue **Deploy** button → **New deployment**.
2. Click the gear icon next to "Select type" and select **Web app**.
3. Fill in the deployment settings:
   * **Description**: `Diwali 2026 RSVP Backend v1`
   * **Execute as**: **Me (your-email@gmail.com)**
   * **Who has access**: **Anyone** *(Essential: allows guests without a Google account to submit their RSVP!)*
4. Click **Deploy**.
5. Google will prompt you to **Authorize access**:
   * Click **Review permissions**.
   * Choose your Google account.
   * If a "Google hasn't verified this app" warning appears, click **Advanced** → **Go to Untitled project (unsafe)**.
   * Click **Allow**.
6. Google Apps Script will present you with the **Web app URL**:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
7. Copy this URL!

---

## 🔑 Step 5: Configure in Your Project

In your project root, create a file named `.env` (or set GitHub Repository Secrets):

```bash
VITE_RSVP_ENDPOINT=https://script.google.com/macros/s/YOUR_APPS_SCRIPT_DEPLOYMENT_ID/exec
VITE_BASE_PATH=./
```

> **Note:** Never commit `.env` containing sensitive keys to a public GitHub repository.

---

## 🧪 Step 6: Verify the Connection

You can verify that your Apps Script Web App is running by pasting the Web App URL into your browser:
```
https://script.google.com/macros/s/YOUR_APPS_SCRIPT_DEPLOYMENT_ID/exec
```
You should see a JSON health-check response:
```json
{
  "status": "ok",
  "service": "Diwali 2026 RSVP Backend",
  "backend": "Google Sheets"
}
```

Now, open your invitation website, choose an outfit shade, fill out the RSVP form, and submit. Check your Google Sheet — the guest row will appear immediately with formatted purple-and-gold headers!

---

## 🔒 How the Host Privately Views & Exports Responses

1. **Native Google Security**:
   * Your Google Sheet is protected by Google's multi-factor authentication.
   * Only you (and anyone you explicitly share the Google Sheet with) can see private guest details, phone numbers, and dietary preferences.
2. **Real-Time Collaboration**:
   * Every RSVP appears in the sheet within 1–2 seconds of submission.
   * You can add custom columns (e.g., table numbers, gifts, notes) directly in Google Sheets.
3. **1-Click CSV Export**:
   * In your Google Sheet, click **File** → **Download** → **Comma Separated Values (.csv)**.
4. **Summary & Charts**:
   * You can use Google Sheets native Pivot Tables or formulas (`=COUNTIF(D:D, "YES")`, `=COUNTIF(F:F, "Royal Purple")`) to visualize your party stats in real time.
