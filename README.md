# Naukri Auto Resume Upload

Automated resume upload to Naukri running every hour (9 AM - 9 PM) via GitHub Actions.

## ⏰ Schedule
- **Every hour from 9 AM to 9 PM** (12 times per day)
- Runs automatically in GitHub cloud

## 📋 Setup Instructions

### Step 1: Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Create a **new private repository** named `naukri-auto-upload`
3. Upload these files:
   - `.github/workflows/upload.yml`
   - `upload-resume.js`
   - `package.json`
   - `PratikResumeOct25.pdf`

### Step 2: Add Secrets
1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add:
   - **Name:** `NAUKRI_COOKIES`
   - **Value:** Export cookies from your browser (Cookie-Editor extension → Export → Copy JSON)

### Step 3: Enable Actions
1. Go to Actions tab in your repository
2. Enable workflows if prompted

### Step 4: Test Manually
1. Click "Actions" → "Naukri Resume Upload" → "Run workflow" → "Run workflow"

---

## 🔄 How It Works

```
9 AM → GitHub Action triggers
        ↓
    Downloads code
        ↓
    Installs Playwright
        ↓
    Loads cookies from secrets
        ↓
    Opens browser (headless)
        ↓
    Navigates to Naukri
        ↓
    Uploads resume
        ↓
    Closes browser
        ↓
    Notification sent
```

---

## 🔑 Cookie Refresh (Important!)

Cookies expire every ~2 weeks. When they expire:
1. Export fresh cookies from Arc browser (Cookie-Editor → Export)
2. Go to GitHub repo → Settings → Secrets → NAUKRI_COOKIES
3. Update with new cookies

**I'll remind you every 2 weeks!**

---

## 📁 Files

| File | Purpose |
|------|---------|
| `.github/workflows/upload.yml` | GitHub Actions workflow |
| `upload-resume.js` | Playwright script |
| `package.json` | Dependencies |
| `PratikResumeOct25.pdf` | Your resume |

---

## ⚠️ Notes

- Resume is committed to GitHub (private repo = only you can see)
- Runs in cloud, not on your computer
- If GitHub is down, it won't run
- Notification via GitHub email after each run

---

## 🚀 To Modify Schedule

Edit `.github/workflows/upload.yml`:

```yaml
schedule:
  - cron: '0 9-21 * * *'  # Every hour 9 AM - 9 PM
```

For different times, use [crontab.guru](https://crontab.guru)
