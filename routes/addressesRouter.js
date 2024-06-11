const express = require('express');
const router = express.Router();
const addresesController = require("../controller/addresesController");
const authMiddleware = require("../middlewares/authMiddleware"); // Подключаем ваш middleware


//router.use(authMiddleware);

router.get('/',  addresesController.getAddresses);
router.post('/', addresesController.createAddres);
router.delete('/:id', addresesController.deleteAddresses);

module.exports = router;
