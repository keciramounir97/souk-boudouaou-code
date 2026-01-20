# Souk Boudouaou

A marketplace application for poultry and agricultural products in Algeria.

## Overview

This is a full-stack web application with:
- **Frontend**: React + Vite with Tailwind CSS (port 5000)
- **Backend**: Node.js Express API with Prisma ORM (port 3000)
- **Database**: PostgreSQL

## Project Structure

```
├── frontend/           # React + Vite frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── api/        # API client
│   │   ├── context/    # React context providers
│   │   └── hooks/      # Custom React hooks
│   └── vite.config.js  # Vite configuration
├── backend/            # Express.js API
│   ├── controllers/    # Route handlers
│   ├── routes/         # API route definitions
│   ├── middleware/     # Express middleware
│   ├── config/         # Configuration files
│   ├── utils/          # Utility functions
│   └── prisma/         # Prisma schema and migrations
└── replit.md           # This file
```

## Running the Application

The application runs with two workflows:
1. **Frontend** - Vite dev server on port 5000
2. **Backend API** - Express server on port 3000

The frontend proxies API requests to the backend automatically.

## Database

Uses PostgreSQL with Prisma ORM. Main models:
- `User` - User accounts with roles (user, admin, super_admin)
- `Order` - Listings/announcements for products
- `Inquiry` - User inquiries on listings
- `SiteSetting` - Site configuration
- `UserPhoto` - User uploaded photos
- `ClickEvent` - Analytics tracking

## Key Commands

```bash
# Backend
cd backend && npm run dev          # Development with nodemon
cd backend && npm run prisma:push  # Push schema changes to DB
cd backend && npm run prisma:generate  # Regenerate Prisma client

# Frontend
cd frontend && npm run dev         # Development server
cd frontend && npm run build       # Production build
```

## Recent Changes

- Migrated from MySQL to PostgreSQL for Replit compatibility
- Updated backend port from 5000 to 3000 to avoid conflict with frontend
- Configured Vite to allow all hosts for Replit proxy
- Fixed Express 5 compatibility issue with wildcard CORS options
