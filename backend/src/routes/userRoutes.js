const express = require('express');
const router = express.Router();

// Sample user route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'User routes working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;