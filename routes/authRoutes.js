// authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');
const token = require('../token/token');

router.post('/logingin', authController.login);
router.post('/registering', authController.register);
router.get('/refreshAccessToken', authController.refreshAccessToken);

router.get('/protected', (req, res, next) => {
  authenticateToken(req, res, next, (err) => {
    if (err) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    res.json({ message: 'Protected Route', user: req.user });
  });
});

module.exports = router;
