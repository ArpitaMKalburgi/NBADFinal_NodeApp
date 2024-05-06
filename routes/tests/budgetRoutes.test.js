const request = require('supertest');
const express = require('express');
const budgetRoutes = require('./budgetRoutes');
const budgetController = require('../controllers/budgetController');
const budgetCapController = require('../controllers/budgetCapController');
const authMiddleware = require('../middleware/authMiddleware');

const app = express();
app.use(express.json());
app.use('/budget', budgetRoutes);

jest.mock('../controllers/budgetController');
jest.mock('../controllers/budgetCapController');
jest.mock('../middleware/authMiddleware');

describe('Budget Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test the '/budget/getAllBudgets' route
  describe('GET /budget/getAllBudgets/:month?', () => {
    it('should call budgetController.getAllBudgets with the provided month', async () => {
      const month = '01'; // Replace with your desired month value
      const expectedResponse = { /* your expected response data here */ };

      budgetController.getAllBudgets.mockResolvedValue(expectedResponse);

      const response = await request(app).get(`/budget/getAllBudgets/${month}`);

      expect(budgetController.getAllBudgets).toHaveBeenCalledWith(expect.anything(), response, month);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResponse);
    });

    it('should call budgetController.getAllBudgets without the month when not provided', async () => {
      const expectedResponse = { /* your expected response data here */ };

      budgetController.getAllBudgets.mockResolvedValue(expectedResponse);

      const response = await request(app).get('/budget/getAllBudgets');

      expect(budgetController.getAllBudgets).toHaveBeenCalledWith(expect.anything(), response, undefined);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResponse);
    });
  });

  // Test the '/budget' route for adding a new budget
  describe('POST /budget', () => {
    it('should call budgetController.addBudget with the provided request body', async () => {
      const reqBody = { /* your request body data here */ };
      const expectedResponse = { /* your expected response data here */ };

      budgetController.addBudget.mockResolvedValue(expectedResponse);

      const response = await request(app).post('/budget').send(reqBody);

      expect(budgetController.addBudget).toHaveBeenCalledWith(expect.anything(), response);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResponse);
    });
  });

  // Test the '/budget/capacity' route for adding a new budget capacity
  describe('POST /budget/capacity', () => {
    it('should call budgetCapController.addBudgetCap with the provided request body', async () => {
      const reqBody = { /* your request body data here */ };
      const expectedResponse = { /* your expected response data here */ };

      budgetCapController.addBudgetCap.mockResolvedValue(expectedResponse);

      const response = await request(app).post('/budget/capacity').send(reqBody);

      expect(budgetCapController.addBudgetCap).toHaveBeenCalledWith(expect.anything(), response);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(expectedResponse);
    });
  });

  // Test the '/budget/capacity' route for getting budget capacity
  describe('GET /budget/capacity', () => {
    it('should call budgetCapController.getBudgetCap without the month when not provided', async () => {
      const expectedResponse = { /* your expected response data here */ };

      budgetCapController.getBudgetCap.mockResolvedValue(expectedResponse);

      const response = await request(app).get('/budget/capacity');

      expect(budgetCapController.getBudgetCap).toHaveBeenCalledWith(expect.anything(), response, undefined);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResponse);
    });

    it('should call budgetCapController.getBudgetCap with the provided month', async () => {
      const month = '01'; // Replace with your desired month value
      const expectedResponse = { /* your expected response data here */ };

      budgetCapController.getBudgetCap.mockResolvedValue(expectedResponse);

      const response = await request(app).get(`/budget/capacity/${month}`);

      expect(budgetCapController.getBudgetCap).toHaveBeenCalledWith(expect.anything(), response, month);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResponse);
    });
  });
});
