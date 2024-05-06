const budgetController = require('./budgetController');
const { mockRequest, mockResponse } = require('jest-mock-extended');
const mysql = require('mysql2/promise');

jest.mock('mysql2/promise');

describe('budgetController', () => {
  let req;
  let res;

  beforeEach(() => {
    req = mockRequest({
      user: {
        username: 'testuser',
      },
      body: {},
      params: {},
    });

    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllBudgets', () => {
    it('should return a 500 status and error message on database error', async () => {
      mysql.createPool().execute.mockRejectedValue(new Error('Database error'));

      await budgetController.getAllBudgets(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error',
      });
    });

    it('should return a 200 status and no budget data message when there are no budgets', async () => {
      mysql.createPool().execute.mockResolvedValue([]);

      await budgetController.getAllBudgets(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No budget data available.',
      });
    });

    it('should return a 200 status and budget data for all budgets', async () => {
      const mockBudgetData = [
        { budgetname: 'Budget1', budgetnumber: 100 },
        { budgetname: 'Budget2', budgetnumber: 200 },
      ];
      mysql.createPool().execute.mockResolvedValue([mockBudgetData]);

      await budgetController.getAllBudgets(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: mockBudgetData,
      });
    });

  });

  describe('addBudget', () => {
    it('should return a 400 status and error message for missing fields', async () => {
      req.body = {};

      await budgetController.addBudget(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Budget name, budget number, and date are required',
      });
    });

    it('should return a 500 status and error message on database error', async () => {
      req.body = {
        budgetName: 'Test Budget',
        budgetNumber: 1000,
        selectedDate: '2023-01-01',
      };

      mysql.createPool().execute.mockRejectedValue(new Error('Database error'));

      await budgetController.addBudget(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error',
      });
    });

    it('should return a 200 status and success message on successful insert', async () => {
      req.body = {
        budgetName: 'Test Budget',
        budgetNumber: 1000,
        selectedDate: '2023-01-01',
      };

      mysql.createPool().execute.mockResolvedValue([]);

      await budgetController.addBudget(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Budget added successfully',
      });
    });
  });
});
