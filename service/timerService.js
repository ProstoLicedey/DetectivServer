const jwt = require('jsonwebtoken')
const Token = require('../models/tokenModel')
const ApiError = require("../exeptions/apiError");
const Timer = require("../models/timerModel");

class timerService{
    async checkTime() {

        const timer = await Timer.findOne({
            order: [['createdAt', 'DESC']],
        });

        if (timer) {
            const currentTime = new Date();
            const timeFinish = new Date(timer.timeFinish);

            if (timeFinish <= currentTime) {
                console.log('Сейчас поездки совершать нельзя!')
                throw ApiError.BadRequest('Сейчас поездки совершать нельзя');
            }
        } else {
            console.log('Сейчас поездки совершать нельзя!')
            throw ApiError.BadRequest('Сейчас поездки совершать нельзя');
        }
        return
    }


}
module.exports = new timerService();
