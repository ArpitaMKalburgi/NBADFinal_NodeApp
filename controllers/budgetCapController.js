// budgetCapController.js
const compression = require('compression');
const mysql = require('mysql2/promise');
const config = require('../config');

const pool = mysql.createPool(config.mysql);

const budgetCapController = {
  addBudgetCap: async (req, res) => {
    try {
      const username = req.user.username;
      const { budgetName, budgetNumber, selectedMonth } = req.body;

      if (!username || !budgetName || budgetNumber === undefined || isNaN(budgetNumber) || !selectedMonth) {
        console.error('Invalid input. Please provide valid data.');
        return res.status(400).json({ message: 'Invalid input. Please provide valid data.' });
      }

      const [result] = await pool.execute(
        'INSERT INTO budgetcap (username, budgetname, budgetnumber, month) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE budgetnumber = ?',
        [username, budgetName, budgetNumber, selectedMonth, budgetNumber]
      );

      if (result) {
        const updatedBudgetCap = {
          username,
          budgetName,
          budgetNumber,
          month: selectedMonth,
        };

        if (result.insertId !== undefined) {
          res.status(201).json({ message: 'Budget capacity added successfully', updatedBudgetCap });
        } else if (result.affectedRows > 0) {

          res.status(200).json({ message: 'Budget capacity updated successfully', updatedBudgetCap });
        } else {

          res.status(200).json({ message: 'No changes were made to the budget capacity.' });
        }
      } else {
        console.error('Failed to add/update budget capacity. Database error:', result);
        res.status(500).json({ message: 'Failed to add/update budget capacity.' });
      }
    } catch (error) {
      console.error('Error in addBudgetCap:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  getBudgetCap: async (req, res) => {
    try {
      const username = req.user.username;
      const { month } = req.params;

      let query;
      let queryParams = [username];

      if (month) {
        queryParams.push(parseInt(month, 10));
        query = 'SELECT budgetname, SUM(budgetnumber) as budgetnumber FROM budgetcap WHERE username = ? AND month = ? GROUP BY budgetname ORDER BY budgetname ASC';
      } else {
        query = 'SELECT budgetname, SUM(budgetnumber) as budgetnumber FROM budgetcap WHERE username = ? GROUP BY budgetname ORDER BY budgetname ASC';
      }

      const [budgets] = await pool.execute(query, queryParams);
      res.status(200).json({ data: budgets });
    } catch (error) {
      console.error('Error in getBudgetCap:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
};

module.exports = budgetCapController;
