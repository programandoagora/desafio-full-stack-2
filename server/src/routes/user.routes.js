const express = require('express')

const {
  getWallet,
  getStatement,
} = require('../controllers/user.controller')

const {
  authMiddleware,
} = require('../middlewares/auth.middleware')

const router = express.Router()

router.use(authMiddleware)

router.get('/wallet', getWallet)
router.get('/statement', getStatement)

module.exports = router