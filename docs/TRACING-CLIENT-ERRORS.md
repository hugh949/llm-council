# Tracing Client-Side (React) Errors

## What This Error Means

The error you're seeing:
```
jx@.../assets/index-befXa-5f.js:24:15290
fm@  div@unknown:0:0  div@unknown:0:0  fm@  kx@.../assets/index-befXa-5f.js:24:38947
```

- **Where it happens:** In the **browser**, inside the minified React bundle
- **When:** Right after the create-conversation API returns 200 OK; during React re-render
- **Why backend logs don't show it:** The backend only sees HTTP requests. JavaScript errors run entirely in the browser; the server never gets them

## Request Flow Across Services

```
┌─────────────┐     POST /api/conversations      ┌─────────────────────┐
│   Browser   │ ──────────────────────────────►  │  Azure App Service  │
│  (React)    │ ◄──────────────────────────────  │  (FastAPI + static) │
└─────────────┘     200 OK + JSON body           └─────────────────────┘
       │
       │  React receives response, updates state, re-renders
       │  ERROR THROWS HERE (no request sent)
       ▼
  User sees error overlay
```

**Services involved:**
1. **Browser** – runs the React app, executes JS, throws the error
2. **Azure App Service** – serves static files and API; logs show 200 OK
3. **No other services** – backend never sees the JS error

## How to Trace the Error

### 1. Get the Full Error Message (Most Important)

In the browser:
1. Open **DevTools** (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Reproduce the error (click "New Conversation")
4. Find the error entry (red text)
5. Expand it and read the **first line** – it usually says something like:
   - `TypeError: X is not a function`
   - `TypeError: Cannot read property 'Y' of undefined`
   - `X.map is not a function`

That message tells you what went wrong.

### 2. Use Source Maps to See Real Source Location

The app is built with source maps (`.js.map`). To use them:

1. In Chrome DevTools → **Sources** tab
2. Open **Settings** (gear icon) → enable **"Enable JavaScript source maps"**
3. Reproduce the error
4. In the Console, click the stack trace links – they should jump to the original source file and line instead of the minified bundle

### 3. Inspect the API Response

To confirm the create response shape:

1. DevTools → **Network** tab
2. Click "New Conversation"
3. Find the `POST .../api/conversations` request
4. Click it → **Response** tab
5. Check the JSON: does it have `prompt_engineering`, `context_engineering`, `council_deliberation` as objects with `messages` arrays?

### 4. Check What the ErrorBoundary Shows

If our ErrorBoundary catches the error, the UI should show "Something went wrong" and the error message. If you still see a blank screen or React’s red overlay, the error may be thrown before our boundary runs (e.g. during module initialization).

## What to Report When Asking for Help

1. The **full error message** (first line of the console error)
2. The **stack trace** (expanded, with source-mapped locations if available)
3. A snippet of the **create-conversation API response** (from Network tab)
4. Whether the ErrorBoundary fallback appears or the screen is blank
