const express = require('express')
const multer = require('multer')

const upload = multer({
  storage: multer.memoryStorage(),
})

const {
  listUsers,
  updateUserRole,
  createTransactionForUser,
  listTransactions,
  updateUserPassword,
  importTransactions,
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
router.post('/transactions/import', upload.single('file'), importTransactions)
router.get('/transactions', listTransactions)
router.patch('/users/:id/password', updateUserPassword)


module.exports = router