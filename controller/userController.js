const ApiError = require("../exeptions/apiError");
const userService = require('../service/userService')
const Trips = require("../models/tripsModel");
const Addresses = require("../models/addressesModel");
const FalseTrips = require("../models/falseTripsModel");
const Users = require("../models/usersModel");
const Answer = require("../models/answerModel");
const Question = require("../models/questionModel");

class UserController {
    async create(req, res, next) {
        try {
            const {login, password} = req.body;

            const existingUser = await Users.findOne({where: {login}});
            if (existingUser) {

                return next(ApiError.BadRequest("Пользователь с таким логином уже существует"));
            }

            const user = await Users.create({login, password, role: 'user'});
            return res.json({message: "Пользователь успешно создан"});
        } catch (e) {
            next(ApiError.BadRequest(e));
        }
    }

    async login(req, res, next) {
        try {
            const {login, password, deviceIdentifier} = req.body;
            const userData = await userService.login(login, password, deviceIdentifier);

            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});

            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken)
            res.clearCookie('refreshToken')
            return res.json(!!token ? true : false);
        } catch (e) {
            next(e)
        }
    }

    async refresh(req, res, next) {
        try {
            const {deviceId} = req.params
            const {refreshToken} = req.cookies;

            const userData = await userService.refresh(refreshToken, deviceId)
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            next(ApiError.BadRequest(e))
        }
    }

    async team(req, res, next) {
        try {
            const users = await Users.findAll({
                where: {role: 'user'},
                include: [
                    {
                        model: Trips,
                        include: [
                            {
                                model: Addresses,
                            },
                            {
                                model: FalseTrips,
                            },
                        ],
                    },
                    {
                        model: Answer,
                        include: [
                            {
                                model: Question,
                                attributes: ['numberPoints'],
                            },
                        ],
                    },
                ],
                order: [['id', 'DESC']]
            });

            const result = users.map(user => {
                const trips = user.trips || [];
                const goodTripCount = trips.filter(trip => trip.address && typeof trip.address === 'object');
                const falseTripCount = trips.filter(trip => trip.falseTrips && trip.falseTrips.length > 0);
                const issuedCount = trips.filter(trip => trip.issued == true);
                const appendixNeedCount = trips.filter(trip => trip.address && trip.address.appendix != null);

                if (!user.answers || user.answers.length === 0) {
                    return {
                        trips,
                        login: user.login,
                        id: user.id,
                        password: user.password,
                        tripCount: trips.length,
                        goodTripCount: goodTripCount.length,
                        appendix: issuedCount.length + "/" + appendixNeedCount.length,
                        falseTripCount: falseTripCount.length,
                        result: "Ответы еще не даны",
                    };
                }

                const totalPoints = user.answers.reduce((sum, answer) => {
                    if (answer.pointsAwarded === null) {
                        return "Ответы еще не проверенны";
                    }
                    return sum + (answer.question ? answer.question.numberPoints : 0);
                }, 0);

                return {
                    trips,
                    login: user.login,
                    id: user.id,
                    password: user.password,
                    tripCount: trips.length,
                    goodTripCount: goodTripCount.length,
                    appendix: issuedCount.length + "/" + appendixNeedCount.length,
                    falseTripCount: falseTripCount.length,
                    result: totalPoints,
                };
            });

            return res.json(result);
        } catch (e) {
            next(ApiError.BadRequest(e));
        }
    }



async delete(req, res, next) {
        try {
            const {id} = req.params;
            await Users.destroy({where: {id}});
            return res.json({message: "Команда удалена"});
        } catch (e) {
            next(ApiError.BadRequest(e));
        }
    }


}

module.exports = new UserController()