const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
  },

  importBatchId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'import_batch_id',
  },

  cpf: {
    type: DataTypes.STRING(14),
    allowNull: false,
  },

  description: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },


  transactionDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'transaction_date',
  },

  pointsValue: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'points_value',
  },

  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },

  status: {
    type: DataTypes.ENUM('approved', 'rejected', 'pending'),
    allowNull: false,
    defaultValue: 'pending',
  },
}, {
  tableName: 'transactions',
  underscored: true,
})

module.exports = Transaction