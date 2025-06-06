const express = require('express');
const router = express.Router();
const questionsController = require("../controller/questionsController");
const authMiddleware = require("../middlewares/authMiddleware"); // Подключаем ваш middleware

router.get('/', questionsController.getQuestion);
router.post('/', questionsController.createQuestion);
router.get('/answer/:id',  questionsController.getAnswerId);
router.get('/answer/check/:id',  questionsController.checkAnswer);
router.post('/answer/', questionsController.postAnswers);
router.put('/answer/', questionsController.putAnswers);
router.delete('/answer/:id', questionsController.deleteAnswers);
router.delete('/:id', questionsController.deleteQuestion);

module.exports = router;
