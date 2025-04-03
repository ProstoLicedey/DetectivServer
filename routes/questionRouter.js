const express = require('express');
const router = express.Router();
const questionsController = require("../controller/questionsController");
const authMiddleware = require("../middlewares/authMiddleware"); // Подключаем ваш middleware

router.get('/', questionsController.getQuestion);
router.post('/', questionsController.createQuestion);
router.get('/answer/check/:id',  questionsController.checkAnswer);
router.post('/answer/', questionsController.postAnswers);
router.delete('/:id', questionsController.deleteQuestion);

module.exports = router;
