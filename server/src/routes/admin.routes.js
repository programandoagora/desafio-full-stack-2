const express = require('express')

const {
  listUsers,
  updateUserRole,
  createTransactionForUser,
  listTransactions,
} = require('../controllers/admin.controller')

const {
  authMiddleware,
  adminMiddleware,
} = require('../middlewares/auth.middleware')

const router = express.Router()

router.use(authMiddleware)
router.use(adminMiddleware)

router.get('/users', listUsers)
router.patch('/users/:id/role', updateUserRole)
router.post('/users/:id/transactions', createTransactionForUser)
router.get('/transactions', listTransactions)

module.exports = router