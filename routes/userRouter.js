const Router = require('express')
const  router = new Router()
const  userController = require('../controller/userController')



router.post('/create', userController.create )
router.post('/login', userController.login )
router.post('/logout', userController.logout )
router.delete('/delete/:id', userController.delete)
router.get('/refresh/:deviceId',  userController.refresh)
router.get('/teams',  userController.team)



module.exports = router