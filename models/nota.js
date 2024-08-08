const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const Nota = sequelize.define('Nota', {
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: false // Desativa os campos de createdAt e updatedAt
})

// Sincroniza o modelo com o banco de dados
Nota.sync()

module.exports = Nota
