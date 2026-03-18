# PSC Tracker — Offline PWA

Kerala PSC MCQ Exam Performance Tracker. Installable as an app on Android, works fully offline.

---

## Install on Android (No App Store Needed)

1. Open Chrome on your Android phone
2. Go to `https://YOUR_GITHUB_USERNAME.github.io/psc-tracker`
3. Tap the **three-dot menu (⋮)** → **"Add to Home screen"**
4. Tap **Add** → the app icon appears on your home screen
5. Open it like any app — works offline from now on

---

## Features

- Multiple syllabi — DLP 2025 pre-loaded, add your own
- Subject-wise correct/wrong entry → auto mark calculation (1 right, −1/3 wrong)
- Topic frequency tracker per paper → cumulative heatmap
- Guesswork split: 50:50 vs Wild Guess with net marks & accuracy
- OMR answer sheet (100 bubbles, A/B/C/D)
- PDF upload & inline viewer per paper
- Full analytics: score trend, weak/strong subjects, strategy verdict
- All data stored locally on your device (localStorage)
- Works fully offline after first load

---

## Deploy to GitHub Pages (One-time setup)

### From Android (GitHub Actions — recommended)

1. Create repo `psc-tracker` on github.com
2. Upload all files maintaining folder structure:
   ```
   .github/workflows/deploy.yml
   public/index.html
   public/manifest.json
   public/service-worker.js
   public/icons/  (all 8 PNG files)
   src/App.jsx
   src/index.js
   src/index.css
   src/serviceWorkerRegistration.js
   package.json
   README.md
   ```
3. Edit `package.json` — replace `YOUR_GITHUB_USERNAME` with your GitHub username
4. Go to repo **Settings → Pages → Source → gh-pages branch** → Save
5. GitHub automatically builds and deploys (check the **Actions** tab — takes ~2 min)
6. Your app is live at `https://YOUR_GITHUB_USERNAME.github.io/psc-tracker`

### From a PC

```bash
npm install
npm run deploy
```

---

## Offline Behaviour

| Situation | What happens |
|---|---|
| First visit (online) | App loads, all assets cached by service worker |
| Subsequent visits (online) | Loads from cache instantly, checks for updates in background |
| No internet | Loads fully from cache, all features work |
| New version deployed | Prompts you to reload for update |
| Data | Always in localStorage on your device |

---

## Marking Scheme

PSC DLP: 1 mark correct, −1/3 wrong, 100 questions. Configurable per syllabus.
