const Sequelize = require('sequelize')
const conf    = require('../config.js').db_conn


const sequelize = new Sequelize(conf.database, conf.user, conf.password, {
  host: conf.host,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

})

module.exports = {
    'sequelize' : sequelize,
    'Sequelize' : Sequelize
}