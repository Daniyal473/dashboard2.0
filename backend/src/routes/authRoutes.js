const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

// Middleware to log all authentication requests
const logAuthRequest = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`🔐 [${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
};

router.use(logAuthRequest);

// User Login Route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    console.log(`🔑 Login attempt for user: ${username}`);

    // Authenticate user
    const result = await authService.authenticateUser(username, password);

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

// Password Reset Route
router.post('/reset-password', async (req, res) => {
  try {
    const { username, newPassword, verifyPassword } = req.body;

    // Validate input
    if (!username || !newPassword || !verifyPassword) {
      return res.status(400).json({
        success: false,
        message: 'Username, new password, and verify password are required'
      });
    }

    console.log(`🔄 Password reset attempt for user: ${username}`);

    // Reset password
    const result = await authService.resetPassword(username, newPassword, verifyPassword);

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Password reset error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Admin Password Verification Route
router.post('/admin/verify', async (req, res) => {
  try {
    const { adminPassword } = req.body;

    if (!adminPassword) {
      return res.status(400).json({
        success: false,
        message: 'Admin password is required'
      });
    }

    console.log('🔐 Admin password verification attempt');

    const isValid = await authService.verifyAdminPassword(adminPassword);

    if (isValid) {
      res.status(200).json({
        success: true,
        message: 'Admin access granted'
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid admin password'
      });
    }
  } catch (error) {
    console.error('❌ Admin verification error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create User Route (Admin only)
router.post('/admin/create-user', async (req, res) => {
  try {
    const { adminPassword, username, password, role } = req.body;

    console.log('👤 Admin creating user:', username);

    // Validate input
    if (!adminPassword || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Admin password, username, and password are required'
      });
    }

    // Validate role if provided
    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "user" or "admin"'
      });
    }

    // Verify admin password
    if (!(await authService.verifyAdminPassword(adminPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin password'
      });
    }

    console.log(`👤 Admin creating user: ${username}`);

    // Create user
    const result = await authService.createUser(username, password, role || 'user');

    res.status(201).json(result);
  } catch (error) {
    console.error('❌ Create user error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete User Route (Admin only)
router.delete('/admin/delete-user', async (req, res) => {
  try {
    const { adminPassword, username } = req.body;

    // Validate input
    if (!adminPassword || !username) {
      return res.status(400).json({
        success: false,
        message: 'Admin password and username are required'
      });
    }

    // Verify admin password
    if (!(await authService.verifyAdminPassword(adminPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin password'
      });
    }

    console.log(`🗑️ Admin deleting user: ${username}`);

    // Delete user
    const result = await authService.deleteUser(username);

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Delete user error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get All Users Route (Admin only)
router.get('/admin/users', async (req, res) => {
  try {
    const { adminPassword } = req.query;

    if (!adminPassword) {
      return res.status(400).json({
        success: false,
        message: 'Admin password is required'
      });
    }

    // Verify admin password
    if (!(await authService.verifyAdminPassword(adminPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin password'
      });
    }

    console.log('📋 Admin requesting all users');

    // Get all users
    const result = await authService.getAllUsers();

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Get users error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update User Password Route (Admin only)
router.post('/admin/update-password', async (req, res) => {
  try {
    const { adminPassword, username, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!adminPassword || !username || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Admin password, username, new password, and confirm password are required'
      });
    }

    // Verify admin password
    if (!(await authService.verifyAdminPassword(adminPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin password'
      });
    }

    console.log(`🔄 Admin updating password for user: ${username}`);

    // Update password using existing reset functionality
    const result = await authService.resetPassword(username, newPassword, confirmPassword);

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Admin password update error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get Password Reset History Route (Admin only)
router.get('/admin/password-history', async (req, res) => {
  try {
    const { adminPassword } = req.query;

    if (!adminPassword) {
      return res.status(400).json({
        success: false,
        message: 'Admin password is required'
      });
    }

    // Verify admin password
    if (!(await authService.verifyAdminPassword(adminPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin password'
      });
    }

    console.log('📋 Admin requesting password reset history');
    console.log('🔗 Reset Password Table URL:', process.env.RESET_PASSWORD_TABLE_URL);

    // Get password reset history
    const result = await authService.getPasswordResetHistory();

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Get password history error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Token Verification Route
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const decoded = authService.verifyToken(token);

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: decoded
    });
  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Update User Role Route (Admin only)
router.put('/admin/update-role', async (req, res) => {
  try {
    const { adminPassword, username, role } = req.body;

    // Validate input
    if (!adminPassword || !username || !role) {
      return res.status(400).json({
        success: false,
        message: 'Admin password, username, and role are required'
      });
    }

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "user" or "admin"'
      });
    }

    // Verify admin password
    if (!(await authService.verifyAdminPassword(adminPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin password'
      });
    }

    console.log(`🔄 Admin updating role for user: ${username} -> ${role}`);

    // Update user role
    const result = await authService.updateUserRole(username, role);

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Update role error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Health check for authentication service
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
