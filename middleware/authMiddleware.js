const jwt = require('jsonwebtoken');
const { refreshAccessToken } = require('../token/token');
const { SECRET_KEY } = require('../config');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    console.log('No token, authorization denied');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const tokenParts = authHeader.split(' ');

  if (tokenParts.length !== 2) {
    console.log('Malformed token, authorization denied');
    return res.status(401).json({ message: 'Malformed token, authorization denied' });
  }

  const token = tokenParts[1];
  console.log('Extracted token:', token);
  console.log('tokenParts:', tokenParts); 

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log('Decoded token:', decoded);

    if (decoded.exp < Date.now() / 1000) {
      console.log('Token expired, attempting to refresh...');
      try {
        const newToken = await refreshAccessToken(token);
        console.log('Refreshed token:', newToken);
        req.token = newToken;
        req.user = jwt.verify(newToken, SECRET_KEY);
        next();
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        return res.status(403).json({ message: 'Forbidden - Token refresh failed' });
      }
    } else {
      console.log('Token is valid');
      req.user = decoded;
      next();
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = { authenticateToken };
