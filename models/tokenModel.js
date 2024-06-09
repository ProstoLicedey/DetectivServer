const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const User = require('./usersModel');

const Token = sequelize.define('token', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    refreshToken: { type: DataTypes.STRING, allowNull: false },
    deviceInfo: { type: DataTypes.STRING },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        }
    }
});

User.hasOne(Token, { onDelete: 'CASCADE' });
Token.belongsTo(User);

module.exports = Token;
