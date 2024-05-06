const jwt = require('jsonwebtoken');
const { authenticateToken } = require('./authenticateToken');
const { refreshAccessToken } = require('../token/token');
const { SECRET_KEY } = require('../config');
const { mockRequest, mockResponse, mockNext } = require('jest-mock-extended');

jest.mock('jsonwebtoken');
jest.mock('../token/token');
jest.mock('../config');

describe('authenticateToken', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = mockRequest({
      header: jest.fn(),
    });
    res = mockResponse();
    next = mockNext();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a 401 status and error message for missing token', async () => {
    req.header.mockReturnValue(undefined);

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No token, authorization denied',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return a 401 status and error message for malformed token', async () => {
    req.header.mockReturnValue('Bearer invalidtoken');

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Malformed token, authorization denied',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return a 401 status and error message for expired token with failed refresh', async () => {
    const expiredToken = 'Bearer expiredtoken';
    req.header.mockReturnValue(expiredToken);

    jwt.verify.mockImplementation(() => {
      throw new Error('Token expired');
    });

    refreshAccessToken.mockRejectedValue(new Error('Refresh failed'));

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden - Token refresh failed',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should successfully refresh and validate a token', async () => {
    const validToken = 'Bearer validtoken';
    req.header.mockReturnValue(validToken);

    const decodedToken = { username: 'testuser', exp: Date.now() / 1000 + 3600 };
    jwt.verify.mockReturnValue(decodedToken);

    const refreshedToken = 'refreshedtoken';
    refreshAccessToken.mockResolvedValue(refreshedToken);

    await authenticateToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('validtoken', SECRET_KEY);
    expect(jwt.verify).toHaveBeenCalledWith('refreshedtoken', SECRET_KEY);
    expect(refreshAccessToken).toHaveBeenCalledWith('validtoken');
    expect(req.token).toBe('refreshedtoken');
    expect(req.user).toEqual(decodedToken);
    expect(next).toHaveBeenCalled();
  });

  it('should successfully validate a non-expired token', async () => {
    const validToken = 'Bearer validtoken';
    req.header.mockReturnValue(validToken);

    const decodedToken = { username: 'testuser', exp: Date.now() / 1000 + 3600 };
    jwt.verify.mockReturnValue(decodedToken);

    await authenticateToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('validtoken', SECRET_KEY);
    expect(req.user).toEqual(decodedToken);
    expect(next).toHaveBeenCalled();
  });

  it('should return a 401 status and error message for an invalid token', async () => {
    const invalidToken = 'Bearer invalidtoken';
    req.header.mockReturnValue(invalidToken);

    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token is not valid',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
