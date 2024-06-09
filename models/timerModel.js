const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Timer = sequelize.define('timer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    timeFinish: { type: DataTypes.DATE }
});

module.exports = Timer;
