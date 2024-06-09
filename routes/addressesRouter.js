const Router = require('express')
const  router = new Router()
const addresesController = require("../controller/addresesController");



router.get('/', addresesController.getAddresses )
router.post('/', addresesController.createAddres )
router.delete('/:id', addresesController.deleteAddresses )


module.exports = router