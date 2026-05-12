const bcrypt = require('bcryptjs')
const User = require('../models/User')

async function register(req, res) {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required.',
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
      email,
      passwordHash,
      role: 'user',
    })

    return res.status(201).json({
      message: 'User created successfully.',
      user: {
        id: user.id,
        name: user.name,
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
}