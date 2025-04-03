const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const Question = require('./questionModel');
const User = require('./usersModel');

const Answer = sequelize.define('answer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    answer: { type: DataTypes.TEXT, allowNull: false },
    pointsAwarded: { type: DataTypes.INTEGER, defaultValue: null },
});

Question.hasMany(Answer, { onDelete: 'CASCADE' });
Answer.belongsTo(Question);
User.hasMany(Answer, { onDelete: 'CASCADE' });
Answer.belongsTo(User);

module.exports = Answer;