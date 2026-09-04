# PPG IQAC Monthly Action Plan

A simple web application for PPG College of Arts & Science departments to submit their monthly action plans to IQAC.

## Features

- Department action plan submission
- Multiple event support per submission
- Live preview
- Print support
- Tamil language support
- Draft save/restore via localStorage
- Google Sheets backend storage
- Consolidated Excel generation

## Setup

### Frontend

```bash
npm install
npm run dev
```

### Google Apps Script

See [GOOGLE_APPS_SCRIPT_SETUP.md](GOOGLE_APPS_SCRIPT_SETUP.md) for full setup instructions.

## Deploy to GitHub Pages

1. Push to `main` branch
2. GitHub Actions will automatically build and deploy

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES Modules)
- **Build Tool:** Vite
- **Excel Generation:** SheetJS
- **Backend:** Google Apps Script
- **Storage:** Google Sheets
- **Hosting:** GitHub Pages

## License

Internal use only — PPG College of Arts & Science, IQAC.
