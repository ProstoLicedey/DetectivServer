const Router = require('express')
const  router = new Router()

const timerRouter = require('./timerRouter')
const tripsRouter = require('./tripsRouter')
const userRouter = require('./userRouter')
const addressesRouter = require('./addressesRouter')
const questionRouter = require('./questionRouter')


router.use('/timer', timerRouter)
router.use('/trips', tripsRouter)
router.use('/user', userRouter)
router.use('/addresses', addressesRouter)
router.use('/questions', questionRouter)


module.exports = router