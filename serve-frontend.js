const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'frontend/build')));

// API routes (proxy to your backend)
app.use('/api', (req, res) => {
  // Proxy to your backend server
  const { createProxyMiddleware } = require('http-proxy-middleware');
  const proxy = createProxyMiddleware({
    target: 'http://localhost:5000',
    changeOrigin: true,
  });
  proxy(req, res);
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Frontend server running on port ${port}`);
});
