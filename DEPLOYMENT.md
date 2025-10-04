# Deployment Guide for Dashboard App

## Overview
This guide will help you deploy both frontend and backend to Vercel as separate projects.

## Prerequisites
- Vercel account
- GitHub repository (optional but recommended)

## Step 1: Deploy Backend to Vercel

### 1.1 Prepare Backend
- Navigate to `backend/` folder
- Ensure `vercel.json` is present (already created)
- Make sure all environment variables are ready

### 1.2 Deploy Backend
```bash
cd backend
npx vercel
```

### 1.3 Set Environment Variables in Vercel Dashboard
Go to your backend project in Vercel dashboard and add:
- `HOSTAWAY_AUTH_TOKEN`
- `TEABLE_BASE_URL`
- `TEABLE_BEARER_TOKEN`
- `CORS_ORIGIN` (set to your frontend URL after frontend deployment)
- `NODE_ENV=production`

### 1.4 Get Backend URL
After deployment, copy your backend URL (e.g., `https://your-backend.vercel.app`)

## Step 2: Deploy Frontend to Vercel

### 2.1 Update Frontend Environment
- Edit `frontend/.env.production`
- Replace `https://your-backend-url.vercel.app` with your actual backend URL

### 2.2 Deploy Frontend
```bash
cd frontend
npx vercel
```

### 2.3 Set Environment Variables in Vercel Dashboard
Go to your frontend project in Vercel dashboard and add:
- `REACT_APP_API_URL` (your backend URL)

## Step 3: Update CORS Configuration

### 3.1 Update Backend CORS
- Go to your backend Vercel project dashboard
- Update `CORS_ORIGIN` environment variable with your frontend URL
- Redeploy backend

## Step 4: Test Deployment

### 4.1 Test Backend
Visit: `https://your-backend.vercel.app/api/health`

### 4.2 Test Frontend
Visit: `https://your-frontend.vercel.app`

### 4.3 Test Integration
- Go to Revenue page in frontend
- Check if data loads from backend

## Troubleshooting

### Common Issues:
1. **CORS Error**: Update `CORS_ORIGIN` in backend environment variables
2. **API Not Found**: Check `REACT_APP_API_URL` in frontend environment variables
3. **Environment Variables**: Ensure all required variables are set in Vercel dashboard

### Logs:
- Check Vercel function logs in dashboard for backend issues
- Check browser console for frontend issues

## Local Development vs Production

### Local:
- Frontend: `npm start` (port 3000)
- Backend: `node src/server.js` (port 5000)

### Production:
- Frontend: Vercel static hosting
- Backend: Vercel serverless functions

## Environment Variables Summary

### Backend (.env):
```
HOSTAWAY_AUTH_TOKEN=your_token
TEABLE_BASE_URL=your_teable_url
TEABLE_BEARER_TOKEN=your_teable_token
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
```

### Frontend (.env.production):
```
REACT_APP_API_URL=https://your-backend.vercel.app
```
