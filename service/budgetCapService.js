// service/budgetCapService.js
const mysql = require('mysql2/promise');
const config = require('../config');

const pool = config.mysql;

const handleAddBudgetCapacity = async (data) => {
  try {
    console.log('handleAddBudgetCapacity Token:', data.token);
    const apiUrl = 'http://localhost:5000/api/budgets/capacity';

    data.username = data.username;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`,
      },
      body: JSON.stringify(data),
    });

    console.log('Request Headers:', response.headers);
    console.log('Request Payload:', JSON.stringify(data));

    if (response.ok) {
      const responseData = await response.json();
      console.log('Budget capacity added successfully:', responseData);
   
      return responseData; 
    } else {
      console.error('Failed to add budget capacity:', response.statusText);

      const errorData = await response.json();
      console.error('Error Data:', errorData);

      throw new Error('Failed to add budget capacity'); 
    }
  } catch (error) {
    console.error('Error adding budget capacity:', error.message);
    throw error; 
  }
};


module.exports = budgetCapService;