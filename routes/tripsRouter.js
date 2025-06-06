const Router = require('express')
const tripsController = require("../controller/tripsController");
const timerController = require("../controller/timerController");
const router = new Router()

router.post('/', tripsController.create)
router.get('/forUser/:id', tripsController.getTrips)
router.get('/admin', tripsController.adminGet)
router.put('/', tripsController.issedTrue)
router.get('/connect/:userId', tripsController.connect)
router.get('/connectAdmin', tripsController.connectAdmin)

module.exports = router

// FalseTrips.afterCreate(async (falseTrip , options )=> {
//     await Trips.update(
//         { issued: true },
//         {where: { id: falseTrip.tripId }}
//     );
//         });

// async function createStoredProcedure() {
//     await sequelize.query(`
//         CREATE OR REPLACE FUNCTION get_users_with_trips()
//         RETURNS TABLE(user_id INTEGER, login TEXT, trips_count INTEGER) AS
//         $$
//         BEGIN
//         RETURN QUERY
//         SELECT u.id, u.login, COUNT(t.id)
//         FROM users u
//         LEFT JOIN trips t ON u.id = t.userId
//         GROUP BY u.id, u.login;
//         END;
//         $$ $$ LANGUAGE plpgsql;
//         `);
// }

// const usersWithTrips = await sequelize.query("SELECT * FROM_get_users_with_trips()",  {
//     type: sequelize.QueryTypes.SELECT
// });