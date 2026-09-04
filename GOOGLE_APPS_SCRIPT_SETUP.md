# Google Apps Script Setup Guide

## Step-by-Step Instructions

### 1. Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: **PPG IQAC Monthly Action Plan**

### 2. Create Sheets

Create two sheets (tabs) in the spreadsheet:

- **ActionPlanData** — stores all department submissions
- **Configuration** — stores status/controls

### 3. Add Headers to ActionPlanData

Row 1 of ActionPlanData sheet:

| Submission ID | Department | Other Department | Academic Year | Action Plan Month | Semester | S.No | Tentative Date | Name of Event | Resource Person | Venue | Nature / Type | Mode | Beneficiary | Budget | Submitted At |

### 4. Add Headers to Configuration

Row 1 of Configuration sheet:

| Academic Year | Action Plan Month | Status |

### 5. Open Apps Script Editor

1. In the spreadsheet, go to **Extensions → Apps Script**
2. Delete any existing code in `Code.gs`

### 6. Paste Code.gs

Copy the contents of `google-apps-script/Code.gs` into the Apps Script editor.

### 7. Configure Spreadsheet ID (Optional)

If you want to target a specific spreadsheet, set the `SS_ID` variable at the top of `Code.gs`:

```javascript
var SS_ID = 'YOUR_SPREADSHEET_ID_HERE';
```

If left empty, the script will use the active spreadsheet.

**To find your Spreadsheet ID:** Open the spreadsheet URL. The ID is the long string between `/d/` and `/edit`:
```
https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit
```

### 8. Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon next to "Type" and select **Web app**
3. Description: `PPG IQAC Action Plan API`
4. Execute as: **Me**
5. Who has access: **Anyone** (this is required for form submissions)
6. Click **Deploy**
7. Copy the **Web App URL**

### 9. Configure Frontend

Open `src/config.js` and paste the Web App URL:

```javascript
export const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';
```

### 10. Test the Integration

1. Run `npm run dev`
2. Fill in a department action plan
3. Submit the form
4. Check the Google Spreadsheet for the data
5. Try submitting again for the same department — you should get a DUPLICATE error

### 11. IQAC Configuration

To manually close submissions:
1. Open the Google Spreadsheet
2. Go to the **Configuration** sheet
3. In the Status column, type: `CLOSED`

To reopen:
1. Change Status back to: `OPEN`

**Important:** There is NO date-based deadline. The status is controlled manually by IQAC.

### 12. Generating Consolidated Excel

IQAC members can generate the consolidated Excel directly from the Google Sheet:

1. Open the **PPG IQAC Monthly Action Plan** spreadsheet
2. Go to **File → Download → Microsoft Excel (.xlsx)**

Or use the SheetJS-based Excel generation built into the frontend (for authorized IQAC use only).

## Security Notes

- The Google Sheet is private — departments cannot access it
- Departments cannot view other departments' submissions
- All validation happens server-side in Google Apps Script
- Submission IDs are generated server-side to prevent duplicates
- The only public endpoint is the Apps Script Web App URL
