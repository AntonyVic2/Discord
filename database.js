const { Sequelize } = require('sequelize')

// Cria uma instância do Sequelize para SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
})

// Testa a conexão
sequelize.authenticate()
  .then(() => console.log('Conectado ao banco de dados SQLite.'))
  .catch(err => console.error('Não foi possível conectar ao banco de dados:', err))

module.exports = sequelize
