const ApiError = require("../exeptions/apiError");
const Timer = require("../models/timerModel");
const Trips = require("../models/tripsModel");
const Addresses = require("../models/addressesModel");
const FalseTrips = require("../models/falseTripsModel");
const events = require("events");

const emitter = new events.EventEmitter();

class TimerController {
    async getTimer(req, res, next) {
        try {
            const timer = await Timer.findOne({
                order: [['createdAt', 'DESC']],

            });
            return res.json(timer.timeFinish);
        } catch (e) {
            next(e)
        }
    }

    async createTimer(req, res, next) {
        try {
            const {hours, minutes} = req.body;
            console.log(hours + ":" + minutes)
            if (isNaN(hours) || isNaN(minutes)) {
                return next(ApiError.BadRequest("Ошибка ввода таймера"));
            }

            const timer = await Timer.findOne({
                order: [['createdAt', 'DESC']],
            });

            if (timer && timer.timeFinish > new Date()) {
                return res.status(400).json({error: 'Сейчас уже запущен таймер'});
            }

            let currentDate = new Date();

            currentDate.setHours(currentDate.getHours() + parseInt(hours, 10));
            currentDate.setMinutes(currentDate.getMinutes() + parseInt(minutes, 10));


            if (timer) {
                await Timer.destroy({
                    where: {},
                    truncate: true
                });
            }


            await Timer.create({
                timeFinish: currentDate
            })
                .finally(() => emitter.emit('changeTimer'))


            return res.status(200).json({success: true, message: 'Таймер успешно создан'});

        } catch (e) {
            next(e);
        }
    }

    async deleteTimer(req, res, next) {
        try {
            await Timer.destroy({
                where: {},
                truncate: true
            })
                .finally(() => emitter.emit('changeTimer'))
            return res.status(200).json({success: true, message: 'Таймер успешно удален'});
        } catch (e) {
            next(e);
        }
    }

    async connect(req, res, next) {
        try {
            res.writeHead(200, {
                'Connection': 'keep-alive',
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
            });

            emitter.on('changeTimer', async () => {
                try {
                    const timer = await Timer.findOne({
                        order: [['createdAt', 'DESC']],
                    });

                    if (timer == null) {
                        res.write(`data: null \n\n`);
                    } else {
                        res.write(`data: ${timer.timeFinish} \n\n`);
                    }
                } catch (error) {
                    // Handle database query error
                    console.error("Error fetching timer:", error);
                    res.write(`data: null \n\n`);
                }
            });

        } catch (e) {
            next(ApiError.BadRequest(e));
        }
    }


}

module
    .exports = new TimerController()