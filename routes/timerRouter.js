const Router = require('express')
const  router = new Router()
const  timerController = require('../controller/timerController')
const tripsController = require("../controller/tripsController");

router.get('/', timerController.getTimer )
router.get('/connect', timerController.connect)
router.post('/', timerController.createTimer )
router.delete('/', timerController.deleteTimer )



module.exports = router