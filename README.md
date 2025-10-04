# Dashboard 2.0

A modern revenue dashboard built with React and Node.js, deployed on Vercel.

## 🚀 Features

- **Real-time Revenue Tracking**: Shows actual and expected revenue
- **Hostaway Integration**: Fetches data from Hostaway API
- **Auto-posting**: Automatically posts data to Teable
- **Responsive Design**: Modern Material-UI dashboard
- **Serverless Backend**: Deployed on Vercel

## 📊 Current Configuration

- **Actual Revenue**: Rs583K (hardcoded)
- **Expected Revenue**: Dynamic calculation from API
- **Total Revenue**: Rs844K (583K + 261K)
- **Auto-posts to Teable**: Every API call

## 🛠️ Tech Stack

### Frontend
- React 18
- Material-UI
- React Router
- Styled Components

### Backend
- Node.js
- Express.js (for local development)
- Vercel Serverless Functions
- Hostaway API Integration
- Teable API Integration

## 🚀 Deployment

### Backend (Vercel)
```bash
cd backend
npx vercel --prod
```

### Frontend (Vercel)
```bash
cd frontend
npm run build
npx vercel --prod
```

## 🔧 Environment Variables

### Backend (.env)
```
HOSTAWAY_AUTH_TOKEN=Bearer_your_token_here
TEABLE_BASE_URL=https://teable.namuve.com/api/table/tblq9gnsTEbz2IqQQLK/record
TEABLE_BEARER_TOKEN=your_teable_token_here
```

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend-url.vercel.app
```

## 📱 Local Development

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 🌐 Live URLs

- **Backend API**: https://backend-ifwooxn6b-rana-talhas-projects.vercel.app
- **Frontend**: Deploy to get URL
- **Cron Job**: https://backend-ifwooxn6b-rana-talhas-projects.vercel.app/api/cron

## 📋 API Endpoints

- `GET /api/revenue` - Get revenue data
- `GET /api/cron` - Cron job endpoint

## 🔐 Security

- Environment variables are properly configured
- API tokens are secured
- CORS enabled for frontend access

## 📈 Revenue Calculation

1. Fetches reservations from Hostaway API
2. Filters Pakistani listings only
3. Calculates actual vs expected revenue based on check-in status
4. Applies USD to PKR conversion (×279)
5. Auto-posts results to Teable

## 🚀 Vercel Deployment Steps

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

---

Built with ❤️ for revenue tracking and management.
