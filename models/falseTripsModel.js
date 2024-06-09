const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const Addresses = require("./addressesModel");
const Trips = require("./tripsModel");

const FalseTrips = sequelize.define('falseTrips', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    district: { type: DataTypes.STRING },
    number: { type: DataTypes.STRING },
    tripId: {
        type: DataTypes.INTEGER,
        references: {
            model: Trips,
            key: 'id'
        }
    },
});

Trips.hasMany(FalseTrips, { onDelete: 'CASCADE' });
FalseTrips.belongsTo(Trips);


module.exports = FalseTrips;
