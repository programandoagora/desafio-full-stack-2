const User = require('../models/User')
const Transaction = require('../models/Transaction')

async function listUsers(req, res) {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'cpf', 'email', 'role', 'createdAt'],
      order: [['name', 'ASC']],
    })

    return res.json(users)
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error.',
      error: error.message,
    })
  }
}

async function updateUserRole(req, res) {
  try {
    const { id } = req.params
    const { role } = req.body

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role.',
      })
    }

    const user = await User.findByPk(id)

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      })
    }

    if (user.role === 'admin' && role === 'user') {
      const adminCount = await User.count({
        where: { role: 'admin' },
      })

      if (adminCount <= 1) {
        return res.status(400).json({
          message: 'The system must have at least one admin user.',
        })
      }
    }

    user.role = role
    await user.save()

    return res.json({
      message: 'User role updated successfully.',
      user: {
        id: user.id,
        name: user.name,
        cpf: user.cpf,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error.',
      error: error.message,
    })
  }
}

async function createTransactionForUser(req, res) {
  try {
    const { id } = req.params

    const {
      description,
      productName,
      transactionDate,
      pointsValue,
      amount,
      status,
    } = req.body

    const user = await User.findByPk(id)

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      })
    }

    if (!description || !transactionDate || !pointsValue || !amount || !status) {
      return res.status(400).json({
        message: 'All transaction fields are required.',
      })
    }

    const transaction = await Transaction.create({
      userId: user.id,
      cpf: user.cpf,
      description,
      productName,
      transactionDate,
      pointsValue,
      amount,
      status,
    })

    return res.status(201).json({
      message: 'Transaction created successfully.',
      transaction,
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error.',
      error: error.message,
    })
  }
}

async function listTransactions(req, res) {
  try {
    const transactions = await Transaction.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'cpf', 'email'],
        },
      ],
      order: [['transactionDate', 'DESC']],
    })

    return res.json(transactions)
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error.',
      error: error.message,
    })
  }
}

module.exports = {
  listUsers,
  updateUserRole,
  createTransactionForUser,
  listTransactions,
}