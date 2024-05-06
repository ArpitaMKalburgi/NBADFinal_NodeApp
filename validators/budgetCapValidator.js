// validators/budgetCapValidator.js
const validateBudgetCapInput = ({ username, budgetName, budgetNumber }) => {
    const errors = [];
  
    if (!username) {
      errors.push('Username is required');
    }
  
    if (!budgetName) {
      errors.push('Budget name is required');
    }
  
    if (!budgetNumber || isNaN(budgetNumber)) {
      errors.push('Budget number must be a valid number');
    }
  
    return errors;
  };
  
  module.exports = { validateBudgetCapInput };
  