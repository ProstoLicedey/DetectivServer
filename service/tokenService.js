const jwt = require('jsonwebtoken')
const Token = require('../models/tokenModel')
const ApiError = require("../exeptions/apiError");

class TokenService{
    generateTokens(payload){
        const  accessToken = jwt.sign(payload, process.env.ACCESS_SECRET_KEY, {expiresIn: '50m'})
        const  refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET_KEY, {expiresIn: '10d'})
        return{
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token){
        try{
            const  userData = jwt.verify(token, process.env.ACCESS_SECRET_KEY)
            return userData
        }catch (e){
            return null
        }
    }

    validateRefreshToken(token){
        try{
            const  userData = jwt.verify(token, process.env.REFRESH_SECRET_KEY)
            return userData
        }catch (e){
            return null
        }
    }

    async saveToken(userId, refreshToken, deviceId){
        let tokenData = await Token.findOne({ where: { userId } });
        if (tokenData) {
            // Проверяем, соответствует ли идентификатор устройства сохраненному
            if (tokenData.deviceInfo !== deviceId) {
                const token = await Token.create({ refreshToken, userId, deviceInfo: deviceId });
                return refreshToken;
            } else {
                tokenData.refreshToken = refreshToken;
                await tokenData.save();
                return refreshToken;
            }
        } else {
            // Если токен не найден, создаем новый токен и сохраняем идентификатор устройства
            const token = await Token.create({ refreshToken, userId, deviceInfo: deviceId });
            return refreshToken;
        }
    }


    async removeToken(refreshToken){
        const  tokenData = await  Token.destroy({where:{refreshToken}})
        return tokenData
    }

    async findToken(refreshToken, deviceInfo){
        console.log("токен" + refreshToken)
        const  tokenData = await  Token.findOne({where: {refreshToken, deviceInfo}})

        return tokenData
    }

    async
}
module.exports = new TokenService();
