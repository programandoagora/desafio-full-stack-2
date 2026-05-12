const { Sequelize } = require('sequelize')
require('dotenv').config()

console.log('DB HOST:', process.env.DB_HOST)
console.log('DB NAME:', process.env.DB_NAME)
console.log('DB USER:', process.env.DB_USER)

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
  }
)

module.exports = sequelize