const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')

const User = require('../models/User')
const Transaction = require('../models/Transaction')

async function register(req, res) {
  try {
    const { name, cpf, email, password } = req.body

    if (!name || !cpf || !email || !password) {
      return res.status(400).json({
        message: 'Name, CPF, email and password are required.',
      })
    }

    const cleanCpf = String(cpf).replace(/\D/g, '')

    const cpfAlreadyExists = await User.findOne({
      where: {
        [Op.or]: [
          { cpf },
          { cpf: cleanCpf },
        ],
      },
    })

    if (cpfAlreadyExists) {
      return res.status(409).json({
        message: 'CPF already exists.',
      })
    }

    const userAlreadyExists = await User.findOne({
      where: { email },
    })

    if (userAlreadyExists) {
      return res.status(409).json({
        message: 'User already exists.',
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      cpf: cleanCpf,
      email,
      passwordHash,
      role: 'user',
    })

    await Transaction.update(
      {
        userId: user.id,
      },
      {
        where: {
          userId: null,
          [Op.or]: [
            { cpf },
            { cpf: cleanCpf },
          ],
        },
      },
    )

    return res.status(201).json({
      message: 'User created successfully.',
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

async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      })
    }

    const user = await User.findOne({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      })
    }

    const passwordIsValid = await bcrypt.compare(password, user.passwordHash)

    if (!passwordIsValid) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      })
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
      },
    )

    return res.json({
      message: 'Login successful.',
      token,
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

module.exports = {
  register,
  login,
}