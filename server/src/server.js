const express = require('express')
const cors = require('cors')
require('dotenv').config()

const { sequelize } = require('./models')
const authRoutes = require('./routes/auth.routes')
const adminRoutes = require('./routes/admin.routes')
const userRoutes = require('./routes/user.routes')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  return res.json({
    message: 'PointFlow API is running',
  })
})

app.use('/auth', authRoutes)
app.use('/admin', adminRoutes)
app.use('/user', userRoutes)

const PORT = process.env.PORT || 3001

sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully')

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Unable to connect to database:', error)
  })