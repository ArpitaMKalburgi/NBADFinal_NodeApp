const mysql = require('mysql2/promise');
const config = require('../config');

//const pool = config.mysql;
const pool = mysql.createPool(config.mysql);

const budgetController = {
  getAllBudgets: async (req, res) => {
    try {
      console.log('Inside getAllBudgets function'); 

      const username = req.user.username;
      const { month } = req.params;

      let query;
      let queryParams = [username];

      query = 'SELECT budgetname, SUM(budgetnumber) as budgetnumber FROM budget WHERE username = ?';
      if (month) {
        queryParams.push(parseInt(month, 10));
        query += ' AND MONTH(date) = ?';
      }
      query += ' GROUP BY budgetname ORDER BY budgetname ASC';

      const [budgets] = await pool.execute(query, queryParams);

      if (!budgets || !budgets.length) {
        return res.status(200).json({ message: 'No budget data available.' });
      }
      res.status(200).json({ data: budgets });
    } catch (error) {
      console.error('Error in getAllBudgets:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  addBudget: async (req, res) => {
    try {
      const { budgetName, budgetNumber, selectedDate } = req.body;
      const username = req.user.username;

      if (!budgetName || !budgetNumber || !selectedDate) {
        return res.status(400).json({ message: 'Budget name, budget number, and date are required' });
      }

      const currentDate = new Date(selectedDate).toISOString().slice(0, 19).replace('T', ' ');

      await pool.execute(
        'INSERT INTO budget (username, budgetname, budgetnumber, date) VALUES (?, ?, ?, ?)',
        [username, budgetName, budgetNumber, currentDate]
      );

  
      res.json({ message: 'Budget added successfully' });
    } catch (error) {
      console.error('Error in addBudget:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
};

module.exports = budgetController;
