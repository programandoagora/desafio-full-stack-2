const jwt = require('jsonwebtoken')
const User = require('../models/User')

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        message: 'Token not provided.',
      })
    }

    const [, token] = authHeader.split(' ')

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findByPk(decoded.id)

    if (!user) {
      return res.status(401).json({
        message: 'Invalid token.',
      })
    }

    req.user = user

    return next()
  } catch (error) {
    return res.status(401).json({
      message: 'Unauthorized.',
    })
  }
}

function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Admin access only.',
    })
  }

  return next()
}

module.exports = {
  authMiddleware,
  adminMiddleware,
}