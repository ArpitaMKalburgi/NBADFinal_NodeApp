// models/BudgetCapModel.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config');

const BudgetCap = sequelize.define('budgetCap', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  budgetName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  budgetNumber: {
    type: DataTypes.INT,
    allowNull: false,
  },
});

module.exports = BudgetCap;
