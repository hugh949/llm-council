# LLM Council

A sophisticated 3-stage LLM deliberation system that helps users refine prompts, gather context, and get comprehensive AI-generated responses through a council of multiple LLMs.

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- OpenRouter API key

### Local Development

1. **Backend:**
   ```bash
   cd backend
   pip install -r ../requirements.txt
   python -m backend.main
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📦 Deployment

This application is designed to run with:
- **Backend:** Azure App Service (Python/FastAPI)
- **Frontend:** Vercel (React/Vite)

### Deployment Guides

- **Complete Deployment:** `DEPLOYMENT-GUIDE.md`
- **Azure Backend Setup:** `DEPLOY-AZURE.md`
- **Environment Variables:** `ENVIRONMENT-VARIABLES.md`
- **Troubleshooting:** `TROUBLESHOOTING.md`

### Quick Deployment Checklist

1. Deploy backend to Azure (see `DEPLOY-AZURE.md`)
2. Deploy frontend to Vercel
3. Set `VITE_API_BASE_URL` in Vercel (pointing to Azure backend)
4. Set `OPENROUTER_API_KEY` in Azure
5. Test and verify

## 🏗️ Architecture

### Frontend (React + Vite)
- **Step 1:** Prompt Engineering - Refine user prompts through conversation
- **Step 2:** Context Engineering - Gather context, documents, and links
- **Step 3:** Council Deliberation - Multi-LLM deliberation with peer review

### Backend (FastAPI + Python)
- RESTful API with SSE streaming support
- SQLite database (PostgreSQL compatible)
- OpenRouter integration for multiple LLM providers

## 📚 Documentation

- `DEPLOYMENT-GUIDE.md` - Complete deployment instructions
- `DEPLOY-AZURE.md` - Detailed Azure deployment guide
- `ENVIRONMENT-VARIABLES.md` - Environment variable reference
- `TROUBLESHOOTING.md` - Common issues and solutions
- `QUALITY-CHECK.md` - Quality assurance checklist

## 🔧 Troubleshooting

Common issues and fixes:
- **405 Error:** Check `VITE_API_BASE_URL` in Vercel (see `FIX-405-ERROR.md`)
- **API Errors:** Verify `OPENROUTER_API_KEY` in Azure
- **Database Issues:** Check Azure Log stream for errors

See `TROUBLESHOOTING.md` for detailed solutions.

## 📄 License

See LICENSE file for details.
