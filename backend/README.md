# Backend - Assessment Management System

Node.js/Express backend with JWT authentication and configuration-driven PDF generation.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 📁 Structure

```
src/
├── config/           # Configuration files
├── controllers/      # API controllers
├── middleware/       # Auth & error handling
├── routes/          # API routes
├── services/        # Business logic
└── templates/       # PDF templates
```

## 🔧 Key Files

- `src/config/assessment-config.js` - **Core configuration**
- `src/services/pdfService.js` - **PDF generation**
- `data/data.js` - Sample data

## ⚙️ Environment

Copy `.env` and update:
- `JWT_SECRET` - Your secret key
- `PORT` - Server port (default: 5000)
