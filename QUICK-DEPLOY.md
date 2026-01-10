# ⚡ Quick Deploy - Choose Your Method

## Option 1: Azure CLI (Automated) ⚡

If you have Azure CLI installed:

```bash
./deploy-to-azure.sh
```

The script will:
1. Build the frontend
2. Package everything
3. Deploy to Azure
4. Configure startup command

**Prerequisites:**
- Azure CLI installed: `az --version`
- Logged in: `az login`
- Know your Resource Group and App Service name

---

## Option 2: Azure Portal (Manual) 📋

Follow the step-by-step guide: **DEPLOY-NOW.md**

This is the recommended method if:
- You don't have Azure CLI installed
- You prefer visual interface
- You want more control

---

## Option 3: Check Current Status 🔍

Want to see if Azure CLI is ready?

```bash
# Check if Azure CLI is installed
az --version

# Check if logged in
az login

# List your app services
az webapp list --output table
```

---

## Which Method Should I Use?

- **New to Azure CLI?** → Use Option 2 (Azure Portal)
- **Comfortable with CLI?** → Use Option 1 (Faster)
- **Not sure?** → Use Option 2 (Azure Portal) - it's easier!

---

**I recommend Option 2 (Azure Portal) for simplicity!** 📋


