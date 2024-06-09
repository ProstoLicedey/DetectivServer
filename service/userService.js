const User = require('../models/usersModel');
const  tokenService = require('./tokenService')
const  ApiError = require('../exeptions/apiError')

class UserService{
    // async registration(email, password, name, surname, birthday, role, creatorId){
    //     const candidate = await User.findOne({ where: { email: email } })
    //     if(candidate){
    //         throw ApiError.BadRequest( 'Пользователь с таким email уже зарегестрирован')
    //     }
    //     const hashPassword = await  bcrypt.hash(password,3 )
    //     const user = await  User.create({email: email.toLowerCase(), password: hashPassword, name:name, surname: surname, birthday: birthday, role:role})
    //
    //    if(!!creatorId){
    //        const controller = await  Controller.create({creatorId: creatorId, controllerId: user.id, })
    //        return("Пользователь добавлен")
    //    }
    //
    //     const userDto = new UserDto(user);
    //     const tokens = tokenService.generateTokens({...userDto});
    //     await  LinkService.saveLink(userDto.id, email  )
    //     await  tokenService.saveToken(userDto.id, tokens.refreshToken)
    //
    //     return{...tokens, user: userDto}
    // }

    async login(login, password, deviceIdentifier) {
        const user = await User.findOne({ where: { login, password } });
        if (!user) {
            throw ApiError.BadRequest('Неверный логин или пароль');
        }
        const tokens = tokenService.generateTokens({ id: user.id, role: user.role, login: user.login });
        await tokenService.saveToken(user.id, tokens.refreshToken, deviceIdentifier);
        return { ...tokens, user: {id: user.id, role: user.role, login: user.login} };
    }
    async logout(refreshToken){
        const token = await tokenService.removeToken(refreshToken)
        return token
    }

    async refresh(refreshToken, deviceId){
        if(!refreshToken || !deviceId){
            throw  ApiError.UnauthorizedError()
        }
        const  userData = tokenService.validateRefreshToken(refreshToken)
        const  tokenFromDb = await  tokenService.findToken(refreshToken, deviceId)
        if(!userData ){
            throw ApiError.BadRequest('12')
        }
        if( !tokenFromDb){
            throw ApiError.BadRequest('1234')
        }

       const  user = await User.findOne({where: {id: userData.id}})
        if(!user){
            throw ApiError.BadRequest({tokenFromDb})
        }
        const  tokens = tokenService.generateTokens({id: user.id, role: user.role,login: user.login})
        await  tokenService.saveToken(user.id, tokens.refreshToken, deviceId)

        return{...tokens, user: {id: user.id, role: user.role, login: user.login}}

    }



}
module.exports = new UserService();

