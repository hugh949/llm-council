# 🔧 How to Set Startup Command in Azure Portal

## Step-by-Step Instructions

### Step 1: Navigate to Your App Service

1. Go to **Azure Portal**: https://portal.azure.com
2. In the top search bar, type your **App Service name** (e.g., `llm-council-app`)
3. Click on your App Service from the results
4. You should now see your App Service overview page

### Step 2: Go to Configuration

1. In the **left sidebar**, look for the **"Settings"** section (usually near the bottom)
2. Under **"Settings"**, click on **"Configuration"**
3. You should now see several tabs: **"Application settings"**, **"General settings"**, etc.

### Step 3: Open General Settings Tab

1. Click on the **"General settings"** tab (next to "Application settings")
2. You'll see a page with various configuration options

### Step 4: Find Startup Command

Scroll down on the **"General settings"** page until you see:

**Look for these sections in order:**
- Stack settings (Python version, etc.)
- Platform settings
- Always On
- HTTP Version
- **Startup Command** ← **This is what you're looking for!**

The **"Startup Command"** field should be a text box/input field.

### Step 5: Enter the Startup Command

1. Click in the **"Startup Command"** text box
2. Type or paste: `startup.sh`
3. **Don't add** any quotes or extra characters, just: `startup.sh`

### Step 6: Save

1. Click the **"Save"** button at the **top** of the page (blue button, top toolbar)
2. You'll see a notification: "Updating application settings..."
3. A popup may appear: **"Save changes?"**
4. Click **"Continue"** or **"Yes"** to confirm

---

## 📸 Visual Guide

### Where to Find It:

```
Azure Portal
└── Your App Service (e.g., llm-council-app)
    └── Left Sidebar
        └── Settings
            └── Configuration ← Click here
                └── General settings tab ← Click here
                    └── Scroll down
                        └── Startup Command ← Enter: startup.sh
```

---

## 🎯 Alternative Navigation Paths

If you can't find "Configuration" in the left sidebar, try these:

### Path 1: Direct Link
1. The URL should look like: `https://portal.azure.com/#@.../resource/subscriptions/.../providers/Microsoft.Web/sites/your-app-name`
2. Add `/configuration` to the end, or just search for "Configuration" in the left sidebar

### Path 2: Via Overview
1. Click **"Overview"** in left sidebar
2. Look for a **"Configuration"** card/tile in the main area
3. Click on it

### Path 3: Search in Portal
1. In the top search bar of Azure Portal (not the resource search)
2. Type: **"App Service Configuration"**
3. Should show your app service configuration

---

## ⚠️ Common Issues

### Issue 1: "I don't see 'Configuration' in the left sidebar"

**Solution:**
- Make sure you're viewing the **App Service** (Web App), not App Service Plan
- The left sidebar should show: Overview, Activity log, Access control, Tags, etc.
- Scroll down in the sidebar to see **"Settings"** section
- "Configuration" is under "Settings"

### Issue 2: "I see Configuration but no 'General settings' tab"

**Solution:**
- Make sure you clicked **"Configuration"** (not "Deployment Center")
- You should see tabs: **Application settings** | **General settings** | **Path mappings** | etc.
- Click the **"General settings"** tab

### Issue 3: "I don't see 'Startup Command' field"

**Solution:**
- Make sure you're on the **"General settings"** tab
- Scroll down - it's usually near the bottom
- Look for fields like:
  - "Always On"
  - "HTTP Version"
  - **"Startup Command"** ← Should be here

### Issue 4: "The field is grayed out / disabled"

**Solution:**
- Make sure your App Service is running (not stopped)
- Try refreshing the page
- Make sure you have proper permissions

---

## ✅ Verification

After saving, verify it worked:

1. The page should show a green notification: "Successfully updated application settings"
2. Refresh the page
3. Go back to **Configuration** → **General settings**
4. Scroll to **"Startup Command"**
5. It should show: `startup.sh`

---

## 🆘 Still Can't Find It?

If you still can't find it, try this:

1. **Take a screenshot** of your Configuration page
2. Or tell me:
   - What tabs do you see in Configuration?
   - What sections do you see in General settings?
   - Are you on a Windows or Linux App Service? (Should be Linux)

---

**That's it! The startup command should be set to `startup.sh`! 🎉**


