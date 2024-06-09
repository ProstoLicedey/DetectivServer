const Router = require('express')
const  router = new Router()

const timerRouter = require('./timerRouter')
const tripsRouter = require('./tripsRouter')
const userRouter = require('./userRouter')
const addressesRouter = require('./addressesRouter')


router.use('/timer', timerRouter)
router.use('/trips', tripsRouter)
router.use('/user', userRouter)
router.use('/addresses', addressesRouter)


module.exports = router