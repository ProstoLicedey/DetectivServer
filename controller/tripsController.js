const ApiError = require("../exeptions/apiError");
const Timer = require("../models/timerModel");
const Addresses = require("../models/addressesModel");
const Users = require("../models/usersModel");
const Trips = require("../models/tripsModel");
const FalseTrips = require("../models/falseTripsModel");
const timerService = require('../service/timerService');
const events = require('events')
const userService = require("../service/userService");

const emitter = new events.EventEmitter();

class TripsController {
    async create(req, res, next) {
        try {
            console.log('start create')

            let {id, district, number} = req.body;

            district = district.trim();
            number = number.trim();

            if (id === undefined || id === null || district === undefined || district === null || number === undefined || number === null) {
                return next(ApiError.BadRequest("не все поля заполнены"));
            }

            const timer = await Timer.findOne({
                order: [['createdAt', 'DESC']],
            });

            await timerService.checkTime();

            let address = await Addresses.findOne({
                where: {district, number}
            });

            let trip;

            if (address == null) {
                trip = await Trips.create({userId: id});
                const falseTrips = await FalseTrips.create({tripId: trip.id, district, number});
            } else {
                trip = await Trips.create({userId: id, addressId: address.id});

            }
            const response = await Trips.findAll({
                where: {userId: id},
                include: [
                    {
                        model: Addresses,
                    },
                    {
                        model: FalseTrips,
                    },

                ],
            });
            emitter.emit('newTrip', trip.id)
            return res.status(200).json(response)
        } catch (e) {
            next(ApiError.BadRequest(e));
        }
    }

    async issedTrue(req, res, next) {
        try {
            const {id} = req.body;

            const trip = await Trips.findOne({
                where: {id},
            });

            if (!trip) {
                return res.status(404).json({error: 'Поездка не найдена'});
            }

            trip.issued = true;
            await trip.save();

            emitter.emit('newTrip')
            return res.status(200).json(trip);
        } catch (e) {

            next(ApiError.BadRequest(e));
        }
    }


    async getTrips(req, res, next) {
        try {
            const {id} = req.params;
            const trips = await Trips.findAll({
                where: {userId: id},
                include: [
                    {model: Addresses},
                    {model: FalseTrips},
                ],
                order: [['createdAt', 'DESC']]
            });

            const formattedTrips = trips.map(trip => {

                const title = trip.address ? `${trip.address.district}-${trip.address.number}: ${trip.address.title}` : `${trip.falseTrips[0].district}-${trip.falseTrips[0].number}`;
                const info = trip.address ? trip.address.info : "По данному адресу полезной информации не нашлось(";
                const appendix = trip.address && trip.address.appendix != null ? "ПРИЛОЖЕНИЕ " + trip.address.appendix : null;
                return {id: trip.id, goodTrip: !!trip.address, title, info, appendix};
            });

            return res.json(formattedTrips);
        } catch (e) {
            next(ApiError.BadRequest(e));
        }
    }

    async adminGet(req, res, next) {
        try {
            const trips = await Trips.findAll({
                include: [
                    {model: Addresses},
                    {model: FalseTrips},
                    {model: Users},
                ],
                order: [['createdAt', 'DESC']]
            });

            const formattedTrips = trips.map(trip => {

                const id = trip.id;
                const team = trip.user.login
                const address = trip.address ? `${trip.address.district}-${trip.address.number}: ${trip.address.title}` : `${trip.falseTrips[0].district}-${trip.falseTrips[0].number}`;
                const appendix = trip.address && trip.address.appendix != null ? "ПРИЛОЖЕНИЕ " + trip.address.appendix : null;
                const issued = appendix ? trip.issued : null;
                let status;

                if (!trip.address) {
                    status = '#4C2D30'
                } else if (appendix !== null && issued === false) {
                    status = '#614700';
                } else {
                    status = '#2B2D30';
                }

                return {id, team, address, appendix, issued, status};
            });

            return res.json(formattedTrips);
        } catch (e) {
            next(ApiError.BadRequest(e));
        }
    }

    async connect(req, res, next) {
        try {
            const {userId} = req.params;
            res.writeHead(200, {
                'Connection': 'keep-alive',
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
            })
            emitter.on('newTrip', async (id) => {

                if (id != null && id != undefined) {
                    const trip = await Trips.findOne({
                        where: {id, userId},
                        include: [
                            {model: Addresses},
                            {model: FalseTrips},
                        ],
                    });

                    if (trip) {
                        const formattedTrip = {
                            id: trip.id,
                            goodTrip: !!trip.address,
                            title: trip.address ? `${trip.address.district}-${trip.address.number}: ${trip.address.title}` : `${trip.falseTrips[0].district}-${trip.falseTrips[0].number}`,
                            info: trip.address ? trip.address.info : "По данному адресу полезной информации не нашлось(",
                            appendix: trip.address && trip.address.appendix != null ? "ПРИЛОЖЕНИЕ " + trip.address.appendix : null
                        };

                        res.write(`data: ${JSON.stringify(formattedTrip)} \n\n`)
                    }
                }
            })

        } catch (e) {
            next(ApiError.BadRequest(e));
        }
    }

    async connectAdmin(req, res, next) {
        try {
            res.writeHead(200, {
                'Connection': 'keep-alive',
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
            });

            emitter.on('newTrip', async (id) => {
                const trips = await Trips.findAll({
                    include: [
                        {model: Addresses},
                        {model: FalseTrips},
                        {model: Users},
                    ],
                    order: [['createdAt', 'DESC']]
                });

                const formattedTrips = trips.map(trip => {
                    const id = trip.id;
                    const team = trip.user.login;
                    const appendix = trip.address && trip.address.appendix != null ? "ПРИЛОЖЕНИЕ " + trip.address.appendix : null;
                    const address = trip.address ? `${trip.address.district}-${trip.address.number}: ${trip.address.title}` : `${trip.falseTrips[0].district}-${trip.falseTrips[0].number}`;
                    let status;
                    const issued = appendix ? trip.issued : null;
                    if (!trip.address) {
                        status = '#4C2D30';
                    } else if (appendix !== null && issued === false) {
                        status = '#614700';
                    } else {
                        status = '#2B2D30';
                    }

                    return {id, team, address, appendix, issued, status};
                });

                res.write(`data: ${JSON.stringify(formattedTrips)} \n\n`);
            });
        } catch (e) {
            next(ApiError.BadRequest(e));
        }
    }

}

module.exports = new TripsController();
