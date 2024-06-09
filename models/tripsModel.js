const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const User = require('./usersModel');
const Addresses = require('./addressesModel');

const Trips = sequelize.define('trips', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    issued: { type: DataTypes.BOOLEAN, defaultValue: false }
});

User.hasMany(Trips, { onDelete: 'CASCADE' });
Trips.belongsTo(User);
Addresses.hasMany(Trips, { onDelete: 'CASCADE' });
Trips.belongsTo(Addresses);

module.exports = Trips;
