const budgetCapController = require('./budgetCapController');
const { mockRequest, mockResponse } = require('jest-mock-extended');
const mysql = require('mysql2/promise');

jest.mock('mysql2/promise');

describe('budgetCapController', () => {
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

  describe('addBudgetCap', () => {
    it('should return a 400 status and error message for invalid input', async () => {
      req.body = {};

      await budgetCapController.addBudgetCap(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid input. Please provide valid data.',
      });
    });

    it('should return a 500 status and error message on database error', async () => {
      req.body = {
        budgetName: 'Test Budget',
        budgetNumber: 1000,
        selectedMonth: 1,
      };

      mysql.createPool().execute.mockRejectedValue(new Error('Database error'));

      await budgetCapController.addBudgetCap(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error',
      });
    });

    it('should return a 201 status and success message on successful insert', async () => {
      req.body = {
        budgetName: 'Test Budget',
        budgetNumber: 1000,
        selectedMonth: 1,
      };

      mysql.createPool().execute.mockResolvedValue([[{ insertId: 1 }]]);

      await budgetCapController.addBudgetCap(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Budget capacity added successfully',
        updatedBudgetCap: {
          username: 'testuser',
          budgetName: 'Test Budget',
          budgetNumber: 1000,
          month: 1,
        },
      });
    });

  });

  describe('getBudgetCap', () => {
    it('should return a 500 status and error message on database error', async () => {
      req.params.month = '1';

      mysql.createPool().execute.mockRejectedValue(new Error('Database error'));

      await budgetCapController.getBudgetCap(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error',
      });
    });

    it('should return a 200 status and budget data for the specified month', async () => {
      req.params.month = '1';

      mysql.createPool().execute.mockResolvedValue([
        { budgetname: 'Budget1', budgetnumber: 100 },
        { budgetname: 'Budget2', budgetnumber: 200 },
      ]);

      await budgetCapController.getBudgetCap(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: [
          { budgetname: 'Budget1', budgetnumber: 100 },
          { budgetname: 'Budget2', budgetnumber: 200 },
        ],
      });
    });
  });
});
