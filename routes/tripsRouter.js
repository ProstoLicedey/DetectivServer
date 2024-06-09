const Router = require('express')
const tripsController = require("../controller/tripsController");
const timerController = require("../controller/timerController");
const  router = new Router()

router.get('/forUser/:id', tripsController.getTrips)
router.get('/admin', tripsController.adminGet)
router.post('/', tripsController.create)
router.put('/', tripsController.issedTrue)
router.get('/connect/:userId', tripsController.connect)
router.get('/connectAdmin', tripsController.connectAdmin)

module.exports = router