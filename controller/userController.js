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

        await Users.update(
            { age: 26 },
            { where: { id: 1 } }
        );
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
                where: { role: 'user' },
                include: [
                    {
                        model: Trips,
                        include: [
                            { model: Addresses },
                            { model: FalseTrips },
                        ],
                    },
                    {
                        model: Answer,
                        include: [
                            { model: Question, attributes: ['numberPoints'] },
                        ],
                    },
                ],
                order: [['id', 'DESC']],
            });

            const processTrips = (trips) => {
                const uniqueAddresses = new Set();
                const uniqueIssuedAddresses = new Set();
                const uniqueAppendixAddresses = new Set();

                let falseTripCount = 0;

                for (const trip of trips) {
                    if (trip.address && trip.address.id != null) {
                        uniqueAddresses.add(trip.address.id);

                        if (trip.issued === true) {
                            uniqueIssuedAddresses.add(trip.address.id);
                        }

                        if (trip.address.appendix != null) {
                            uniqueAppendixAddresses.add(trip.address.id);
                        }
                    }

                    if (trip.falseTrips && trip.falseTrips.length > 0) {
                        falseTripCount++;
                    }
                }

                return {
                    goodTripCount: uniqueAddresses.size,
                    falseTripCount,
                    issuedCount: uniqueIssuedAddresses.size,
                    appendixNeedCount: uniqueAppendixAddresses.size,
                };
            };

            const processAnswers = (answers) => {
                let totalPoints = 0;
                let allAnswersNull = true;
                const seenQuestions = new Set();

                for (const answer of answers) {
                    if (
                        answer.pointsAwarded !== null &&
                        answer.questionId != null &&
                        !seenQuestions.has(answer.questionId)
                    ) {
                        seenQuestions.add(answer.questionId);
                        allAnswersNull = false;
                        totalPoints += answer.pointsAwarded;
                    }
                }

                return allAnswersNull ? "Ответы не проверенны" : totalPoints;
            };

            const result = users.map(user => {
                const trips = user.trips || [];
                const { goodTripCount, falseTripCount, issuedCount, appendixNeedCount } = processTrips(trips);
                const totalPoints = user.answers?.length ? processAnswers(user.answers) : "Ответы не даны";

                let resultBall = "-";
                if (typeof totalPoints === 'number' && trips.length > 0) {
                    resultBall = (((totalPoints * totalPoints) + appendixNeedCount) / trips.length).toFixed(1);

                    if (!isFinite(resultBall)) {
                        resultBall = "-";
                    }
                }

                return {
                    trips,
                    login: user.login,
                    id: user.id,
                    password: user.password,
                    tripCount: trips.length,
                    goodTripCount,
                    appendix: `${issuedCount}/${appendixNeedCount}`,
                    falseTripCount,
                    answer: totalPoints,
                    resultBall,
                };
            });

            if (result.length === 0) {
                return res.json({ answer: "Ответы не даны" });
            }

            return res.json(result);
        } catch (e) {
            next(ApiError.BadRequest(e));
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