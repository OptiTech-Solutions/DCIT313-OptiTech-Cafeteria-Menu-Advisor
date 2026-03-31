# Cafeteria Menu Advisor — Frontend

DCIT 313 Artificial Intelligence · Group Project · March 2026

## Tech Stack
- React 18 + Vite
- Tailwind CSS v3
- DM Serif Display + DM Sans (Google Fonts)

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node)

### 1. Install dependencies
```bash
npm install
```

### 2. Start the dev server
```bash
npm run dev
```

Then open **http://localhost:5173** in your browser.

### 3. Build for production
```bash
npm run build
```

---

## Project Structure

```
cafeteria-menu-advisor/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ProfileForm.jsx   # Name / age / weight / allergies screen
│   │   ├── StepWizard.jsx    # 5-step preference wizard
│   │   └── Results.jsx       # Meal recommendation cards
│   ├── data/
│   │   └── meals.js          # Meal DB, step config, colour maps
│   ├── utils/
│   │   └── inference.js      # JS mirror of Prolog production rules
│   ├── App.jsx               # Root – orchestrates all three phases
│   ├── main.jsx              # React entry point
│   └── index.css             # Tailwind directives + custom animations
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Connecting to the Flask/Prolog Backend

When your backend is ready, replace the `runInference` call in `src/App.jsx` with a fetch:

```js
const res  = await fetch('http://localhost:5000/api/recommend', {
  method:  'POST',
  headers: { 'Content-Type': 'application/json' },
  body:    JSON.stringify(newPrefs),
});
const data = await res.json();
setResults(data.meals);
```
