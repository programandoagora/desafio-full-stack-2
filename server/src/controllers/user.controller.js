const { Op } = require('sequelize')
const Transaction = require('../models/Transaction')

async function getWallet(req, res) {
  try {
    const totalPoints = await Transaction.sum('pointsValue', {
      where: {
        userId: req.user.id,
        status: 'approved',
      },
    })

    return res.json({
      totalPoints: Number(totalPoints || 0),
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error.',
      error: error.message,
    })
  }
}

async function getStatement(req, res) {
  try {
    const {
      status,
      startDate,
      endDate,
      page = 1,
    } = req.query

    const limit = 30
    const offset = (Number(page) - 1) * limit

    const where = {
      userId: req.user.id,
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (startDate || endDate) {
      where.transactionDate = {}

      if (startDate) {
        where.transactionDate[Op.gte] = startDate
      }

      if (endDate) {
        where.transactionDate[Op.lte] = endDate
      }
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      order: [['transactionDate', 'DESC']],
      limit,
      offset,
    })

    return res.json({
      transactions: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit,
        totalPages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error.',
      error: error.message,
    })
  }
}

module.exports = {
  getWallet,
  getStatement,
}