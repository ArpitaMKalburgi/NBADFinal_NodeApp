const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const authService = require('./token/token'); 
const config = require('../config');

const SECRET_KEY = 'arpita';
const REFRESH_SECRET_KEY = 'arpita_refresh'; 
const saltRounds = 10;

const pool = mysql.createPool(config.mysql);

const authController = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      const [users] = await pool.execute('SELECT * FROM users WHERE `Username` = ?', [username]);

      if (users.length === 0) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const user = users[0];

      const passwordMatch = await bcrypt.compare(password, user.Password);

      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const token = jwt.sign({ id: user.id, username: user.Username }, SECRET_KEY, { expiresIn: '10m' });

      const refreshToken = jwt.sign({ id: user.id, username: user.Username }, REFRESH_SECRET_KEY, { expiresIn: '5m' });
      res.json({ token, refreshToken });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  refreshAccessToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      const newAccessToken = authService.verifyRefreshToken(refreshToken);
  
      res.json({ accessToken: newAccessToken });
    } catch (error) {
      console.error('Token refresh error:', error);
  
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Refresh token has expired' });
      }
  
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
  },

  register: async (req, res) => {
    try {
      const { username, password, fullName } = req.body;

      const [existingUsers] = await pool.execute('SELECT * FROM users WHERE `Username` = ?', [username]);

      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      await pool.execute('INSERT INTO users (`Fullname`, `Username`, `Password`) VALUES (?, ?, ?)', [fullName, username, hashedPassword]);
      res.json({ message: 'Registration successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
};
const refreshAccessToken = async () => {
  try {
    const newToken = await authService.refreshAccessToken();
    setToken(newToken);
    localStorage.setItem('token', newToken);
    console.log('Access token refreshed successfully. New token:', newToken);
    return newToken;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    logout();
  }
};


module.exports = authController;
