const express = require('express')
const multer = require('multer')

const {
  listUsers,
  updateUserRole,
  updateUserPassword,
  createTransactionForUser,
  listTransactions,
  importTransactions,
  deleteTransaction,
} = require('../controllers/admin.controller')

const {
  authMiddleware,
  adminMiddleware,
} = require('../middlewares/auth.middleware')

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
})

router.use(authMiddleware)
router.use(adminMiddleware)

router.get('/users', listUsers)
router.patch('/users/:id/role', updateUserRole)
router.patch('/users/:id/password', updateUserPassword)
router.post('/users/:id/transactions', createTransactionForUser)

router.post('/transactions/import', upload.single('file'), importTransactions)
router.get('/transactions', listTransactions)
router.delete('/transactions/:id', deleteTransaction)

module.exports = router