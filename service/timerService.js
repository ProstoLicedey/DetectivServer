const jwt = require('jsonwebtoken')
const Token = require('../models/tokenModel')
const ApiError = require("../exeptions/apiError");
const Timer = require("../models/timerModel");

class timerService{
    async checkTime() {
        try {
            // Запрос для поиска последней записи с использованием индекса
            const timer = await Timer.findOne({
                order: [['createdAt', 'DESC']],
            });

            if (!timer) {
                console.log('Сейчас поездки совершать нельзя!');
                throw ApiError.BadRequest('Сейчас поездки совершать нельзя');
            }

            const currentTime = new Date();
            const timeFinish = new Date(timer.timeFinish);

            if (timeFinish <= currentTime) {
                console.log('Сейчас поездки совершать нельзя!');
                throw ApiError.BadRequest('Сейчас поездки совершать нельзя');
            }

            return;
        } catch (e) {
            // Логирование ошибки и выброс исключения
            console.error('Ошибка при проверке времени:', e);
            throw e;
        }
    }
}
module.exports = new timerService();
