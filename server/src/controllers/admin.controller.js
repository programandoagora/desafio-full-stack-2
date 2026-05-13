const User = require('../models/User')
const Transaction = require('../models/Transaction')
const bcrypt = require('bcryptjs')
const xlsx = require('xlsx')
const { Op } = require('sequelize')
const sequelize = require('../config/database')

async function listUsers(req, res) {
  try {
    const page = Number(req.query.page) || 1
    const limit = 30
    const offset = (page - 1) * limit

    const { count, rows } = await User.findAndCountAll({
      attributes: ['id', 'name', 'cpf', 'email', 'role', 'createdAt'],
      order: [['name', 'ASC']],
      limit,
      offset,
    })

    return res.json({
      users: rows,
      pagination: {
        total: count,
        page,
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
    const {
      showAll,
      cpf,
      product,
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount,
    } = req.query

    const page = Number(req.query.page) || 1
    const limit = 30
    const offset = (page - 1) * limit

    const where = {}

    if (showAll !== 'true') {
      where.userId = {
        [Op.ne]: null,
      }
    }

    if (cpf) {
      const cleanCpf = String(cpf).replace(/\D/g, '')

      where[Op.and] = [
        sequelize.where(
          sequelize.fn(
            'REPLACE',
            sequelize.fn(
              'REPLACE',
              sequelize.fn(
                'REPLACE',
                sequelize.col('cpf'),
                '.',
                '',
              ),
              '-',
              '',
            ),
            ' ',
            '',
          ),
          {
            [Op.like]: `%${cleanCpf}%`,
          },
        ),
      ]
    }

    if (product) {
      where.description = {
        [Op.like]: `%${product}%`,
      }
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

    if (minAmount || maxAmount) {
      where.amount = {}

      if (minAmount) {
        where.amount[Op.gte] = Number(minAmount)
      }

      if (maxAmount) {
        where.amount[Op.lte] = Number(maxAmount)
      }
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'cpf', 'email'],
          required: false,
        },
      ],
      order: [['transactionDate', 'DESC']],
      limit,
      offset,
    })

    return res.json({
      transactions: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      message: 'Internal server error.',
      error: error.message,
    })
  }
}

async function updateUserPassword(req, res) {
  try {
    const { id } = req.params
    const { password } = req.body

    if (!password) {
      return res.status(400).json({
        message: 'Password is required.',
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must contain at least 6 characters.',
      })
    }

    const user = await User.findByPk(id)

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    user.passwordHash = passwordHash

    await user.save()

    return res.json({
      message: 'Password updated successfully.',
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error.',
      error: error.message,
    })
  }
}

function normalizeCpf(cpf) {
  if (!cpf) return ''

  return String(cpf)
    .replace(/\D/g, '')
}

function formatCpf(cpf) {
  const cleanCpf = normalizeCpf(cpf)

  if (cleanCpf.length !== 11) {
    return cpf
  }

  return cleanCpf.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    '$1.$2.$3-$4',
  )
}

function normalizeStatus(status) {
  const value = String(status || '').trim().toLowerCase()

  if (value === 'aprovado') return 'approved'
  if (value === 'reprovado') return 'rejected'
  if (value === 'em avaliação') return 'pending'
  if (value === 'em avaliacao') return 'pending'

  return 'pending'
}

function normalizeBrazilianNumber(value) {
  if (value === null || value === undefined || value === '') {
    return 0
  }

  if (typeof value === 'number') {
    return value
  }

  return Number(
    String(value)
      .replace(/\./g, '')
      .replace(',', '.'),
  )
}

function normalizeExcelDate(value) {
  if (!value) return null

  if (value instanceof Date) {
    return value.toISOString().split('T')[0]
  }

  if (typeof value === 'number') {
    const parsedDate = xlsx.SSF.parse_date_code(value)

    if (!parsedDate) return null

    const year = parsedDate.y
    const month = String(parsedDate.m).padStart(2, '0')
    const day = String(parsedDate.d).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  const dateValue = String(value).trim()

  if (dateValue.includes('-')) {
    const parts = dateValue.split('-')

    if (parts[0].length === 4) {
      return dateValue
    }

    const [day, month, year] = parts

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  if (dateValue.includes('/')) {
    const [day, month, year] = dateValue.split('/')

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  return null
}

function getRowValue(row, possibleNames) {
  const keys = Object.keys(row)

  const foundKey = keys.find((key) =>
    possibleNames.some(
      (name) => key.trim().toLowerCase() === name.trim().toLowerCase(),
    ),
  )

  return foundKey ? row[foundKey] : null
}

async function importTransactions(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Excel file is required.',
      })
    }

    const workbook = xlsx.read(req.file.buffer, {
      type: 'buffer',
      cellDates: true,
    })

    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]

    const rows = xlsx.utils.sheet_to_json(sheet, {
      defval: '',
    })

    if (!rows.length) {
      return res.status(400).json({
        message: 'The spreadsheet is empty.',
      })
    }

    let importedRows = 0
    let failedRows = 0
    const errors = []

    for (const [index, row] of rows.entries()) {
      try {
        const cpfValue = getRowValue(row, ['CPF'])
        const description = getRowValue(row, [
          'Descrição da transação',
          'Descricao da transacao',
          'Descrição',
          'Descricao',
        ])
        const transactionDateValue = getRowValue(row, [
          'Data da transação',
          'Data da transacao',
          'Data',
        ])
        const pointsValue = getRowValue(row, [
          'Valor em pontos',
          'Pontos',
        ])
        const amount = getRowValue(row, [
          'Valor',
        ])
        const status = getRowValue(row, [
          'Status',
        ])

        const cleanCpf = normalizeCpf(cpfValue)
        const formattedCpf = formatCpf(cleanCpf)
        const transactionDate = normalizeExcelDate(transactionDateValue)

        if (!cleanCpf || !description || !transactionDate) {
          failedRows++

          errors.push({
            row: index + 2,
            message: 'CPF, description and transaction date are required.',
          })

          continue
        }

        const user = await User.findOne({
          where: {
            [Op.or]: [
              { cpf: cleanCpf },
              { cpf: formattedCpf },
            ],
          },
        })

        await Transaction.create({
          userId: user ? user.id : null,
          cpf: formattedCpf,
          description,
          transactionDate,
          pointsValue: normalizeBrazilianNumber(pointsValue),
          amount: normalizeBrazilianNumber(amount),
          status: normalizeStatus(status),
        })

        importedRows++
      } catch (error) {
        failedRows++

        errors.push({
          row: index + 2,
          message: error.message,
        })
      }
    }

    return res.status(201).json({
      message: 'Transactions imported successfully.',
      totalRows: rows.length,
      importedRows,
      failedRows,
      errors,
    })
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
  updateUserPassword,
  importTransactions,
}