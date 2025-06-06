const ApiError = require("../exeptions/apiError");

const Question = require("../models/questionModel");
const Answer = require("../models/answerModel");
const timerService = require("../service/timerService");
const Addresses = require("../models/addressesModel");
const Trips = require("../models/tripsModel");
const FalseTrips = require("../models/falseTripsModel");


class QuestionController {
    async getQuestion(req, res, next) {
        try {
            const question = await Question.findAll({});
            return res.json(question);
        } catch (e) {
            next(e)
        }
    }

    async createQuestion(req, res, next) {
        try {
            let {question, numberPoints} = req.body;

            question = question.trim();

            if (question === undefined || question === null || numberPoints === undefined || numberPoints === null) {
                return next(ApiError.BadRequest("не все поля заполнены"));
            }

            const address = await Question.create({question, numberPoints});

            return res.status(200).json(address);
        } catch (e) {
            next(ApiError.BadRequest(e));
        }
    }


    async postAnswers(req, res, next) {
        try {
            const {answers} = req.body;  // Массив объектов с ответами

            // Проверка, что массив ответов существует и не пустой
            if (!answers || !Array.isArray(answers) || answers.length === 0) {
                return next(ApiError.BadRequest("Не были предоставлены ответы"));
            }

            // Проверяем, существует ли каждый вопрос и обрабатываем ответы
            for (let answer of answers) {
                const {questionId, answerText, userId} = answer;

                // Проверяем, существует ли вопрос с указанным ID
                const question = await Question.findOne({where: {id: questionId}});
                if (!question) {
                    return next(ApiError.BadRequest(`Вопрос с ID ${questionId} не существует`));
                }

                // Создаем новый ответ
                const newAnswer = await Answer.create({
                    questionId,
                    answer: answerText,
                    userId,
                });

            }

            // Отправляем успешный ответ
            return res.status(200).json({message: "Ответы успешно отправлены!"});
        } catch (e) {
            next(ApiError.BadRequest(e.message));  // Передаем строку в качестве сообщения ошибки
        }
    }

    async putAnswers(req, res, next) {
        try {
            const {answers} = req.body;  // Массив объектов с оценками

            if (!answers || !Array.isArray(answers) || answers.length === 0) {
                return next(ApiError.BadRequest("Не были предоставлены данные для обновления"));
            }

            for (let item of answers) {
                const {answerId, pointsAwarded} = item;

                // Проверка существования ответа
                const existingAnswer = await Answer.findOne({where: {id: answerId}});
                if (!existingAnswer) {
                    return next(ApiError.BadRequest(`Ответ с ID ${answerId} не найден`));
                }

                // Обновление оценки
                existingAnswer.pointsAwarded = pointsAwarded;
                await existingAnswer.save();
            }

            return res.status(200).json({message: "Оценки успешно обновлены!"});

        } catch (e) {
            next(ApiError.BadRequest(e.message));
        }
    }

    async deleteAnswers(req, res, next) {
        try {
            const { id } = req.params;

            if (!id) {
                return next(ApiError.BadRequest("Не указан ID ответов для удаления"));
            }

            // Найти все ответы, связанные с переданным ID (например, ID отправки)
            const answersToDelete = await Answer.findAll({ where: { userId: id } });

            if (!answersToDelete || answersToDelete.length === 0) {
                return next(ApiError.BadRequest("Ответы с указанным ID не найдены"));
            }


            await Answer.destroy({ where: { userId: id } });

            return res.status(200).json({ message: "Ответы успешно удалены!" });

        } catch (e) {
            next(ApiError.BadRequest(e.message));
        }
    }

    async getAnswerId(req, res, next) {
        try {
            const {id} = req.params;  // Получаем ID пользователя из параметров запроса

            const answers = await Answer.findAll({
                where: {userId: id},
                include: [
                    {model: Question},
                ],
            });

            return res.json(answers);

        } catch (e) {
            next(ApiError.BadRequest(e.message));
        }
    }

    async checkAnswer(req, res, next) {
        try {
            const {id} = req.params;  // Получаем ID пользователя из параметров запроса

            // Проверяем, есть ли ответы у пользователя
            const answers = await Answer.findAll({
                where: {userId: id},
            });

            // Возвращаем true, если ответы есть, иначе false
            if (answers.length > 0) {
                return res.status(200).json({hasAnswers: true});
            } else {
                return res.status(200).json({hasAnswers: false});
            }
        } catch (e) {
            next(ApiError.BadRequest(e.message));  // Передаем строку в качестве сообщения ошибки
        }
    }

    async deleteQuestion(req, res, next) {
        try {
            const {id} = req.params;
            await Question.destroy({where: {id}});
            return res.json({message: "Вопрос удален"});
        } catch (e) {
            next(ApiError.BadRequest(e));
        }
    }


}


module.exports = new QuestionController()