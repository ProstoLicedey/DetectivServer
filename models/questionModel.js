const { DataTypes } = require('sequelize');
const sequelize = require('./db');


const Question = sequelize.define('question', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    question: { type: DataTypes.TEXT },
    numberPoints: { type: DataTypes.INTEGER }
});

module.exports = Question;