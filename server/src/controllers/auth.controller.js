const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')

const User = require('../models/User')
const Transaction = require('../models/Transaction')


function validateCpf(cpf) {
  const cleanCpf = String(cpf).replace(/\D/g, '')

  if (cleanCpf.length !== 11) {
    return false
  }

  if (/^(\d)\1+$/.test(cleanCpf)) {
    return false
  }

  let sum = 0

  for (let i = 0; i < 9; i++) {
    sum += Number(cleanCpf.charAt(i)) * (10 - i)
  }

  let remainder = (sum * 10) % 11

  if (remainder === 10 || remainder === 11) {
    remainder = 0
  }

  if (remainder !== Number(cleanCpf.charAt(9))) {
    return false
  }

  sum = 0

  for (let i = 0; i < 10; i++) {
    sum += Number(cleanCpf.charAt(i)) * (11 - i)
  }

  remainder = (sum * 10) % 11

  if (remainder === 10 || remainder === 11) {
    remainder = 0
  }

  return remainder === Number(cleanCpf.charAt(10))
}

async function register(req, res) {
  try {
    const { name, cpf, email, password } = req.body

    if (!name || !cpf || !email || !password) {
      return res.status(400).json({
        message: 'Name, CPF, email e senha são necessários.',
      })
    }

    const cleanCpf = String(cpf).replace(/\D/g, '')
    
    if (!validateCpf(cleanCpf)) {
      return res.status(400).json({
        message: 'CPF inválido.',
      })
    }

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
        message: 'CPF já existente.',
      })
    }

    const userAlreadyExists = await User.findOne({
      where: { email },
    })

    if (userAlreadyExists) {
      return res.status(409).json({
        message: 'Usuário já existente.',
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
      message: 'Usuário criado com sucesso!',
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
        message: 'Email e senha necessário.',
      })
    }

    const user = await User.findOne({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({
        message: 'Email e ou Senha inválido..',
      })
    }

    const passwordIsValid = await bcrypt.compare(password, user.passwordHash)

    if (!passwordIsValid) {
      return res.status(401).json({
        message: 'Email e ou Senha inválido..',
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