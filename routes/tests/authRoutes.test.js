const request = require('supertest');
const express = require('express');
const authRoutes = require('./authRoutes');
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

jest.mock('../controllers/authController');
jest.mock('../middleware/authMiddleware');

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/logingin', () => {
    it('should call authController.login', async () => {
      const reqBody = { /* your request body data here */ };
      const expectedResponse = { /* your expected response data here */ };

      authController.login.mockResolvedValue(expectedResponse);

      const response = await request(app).post('/auth/logingin').send(reqBody);

      expect(authController.login).toHaveBeenCalledWith(reqBody);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResponse);
    });
  });

  describe('POST /auth/registering', () => {
    it('should call authController.register', async () => {
      const reqBody = { /* your request body data here */ };
      const expectedResponse = { /* your expected response data here */ };

      authController.register.mockResolvedValue(expectedResponse);

      const response = await request(app).post('/auth/registering').send(reqBody);

      expect(authController.register).toHaveBeenCalledWith(reqBody);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResponse);
    });
  });


  describe('GET /auth/refreshAccessToken', () => {
    it('should call authController.refreshAccessToken', async () => {
      const expectedResponse = { /* your expected response data here */ };

      authController.refreshAccessToken.mockResolvedValue(expectedResponse);

      const response = await request(app).get('/auth/refreshAccessToken');

      expect(authController.refreshAccessToken).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResponse);
    });
  });


  describe('GET /auth/protected', () => {
    it('should call authenticateToken middleware and return user data', async () => {
      const user = { /* your user data here */ };
      const expectedResponse = { message: 'Protected Route', user };

      authenticateToken.mockImplementation((req, res, next) => {
        req.user = user;
        next();
      });

      const response = await request(app).get('/auth/protected');

      expect(authenticateToken).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResponse);
    });

    it('should return a 401 status when authenticateToken middleware fails', async () => {
      const expectedResponse = { message: 'Token is not valid' };

      authenticateToken.mockImplementation((req, res, next) => {
        const err = new Error('Token is not valid');
        next(err);
      });

      const response = await request(app).get('/auth/protected');

      expect(authenticateToken).toHaveBeenCalled();
      expect(response.status).toBe(401);
      expect(response.body).toEqual(expectedResponse);
    });
  });
});
