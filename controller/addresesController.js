const ApiError = require("../exeptions/apiError");
const Timer = require("../models/timerModel");
const Trips = require("../models/tripsModel");
const Addresses = require("../models/addressesModel");
const FalseTrips = require("../models/falseTripsModel");
const Users = require("../models/usersModel");
const timerService = require("../service/timerService");


class AddressesController {
    async getAddresses(req, res, next) {
        try {
            const address = await Addresses.findAll({});
            return res.json(address);
        } catch (e) {
            next(e)
        }
    }
    async createAddres(req, res, next) {
        try {
            let { district, number, title, info, appendix } = req.body;

            district = district.trim();
            title = title.trim();
            info = info.trim();

            if (district === undefined || district === null || number === undefined || number === null || title === undefined || title === null || info === undefined || info === null) {
                return next(ApiError.BadRequest("не все поля заполнены"));
            }


            const existingAddress = await Addresses.findOne({where:{district, number} });

            if (!!existingAddress) {
                console.log(existingAddress)
                return next(ApiError.BadRequest("Адрес с таким районом и номером уже существует"));
            }

            const address = await Addresses.create({ district, number, title, info, appendix });

            return res.status(200).json(address);
        } catch (e) {
            next(ApiError.BadRequest(e));
        }
    }



    async deleteAddresses(req, res, next) {
        try {
            const {id} = req.params;
            await Addresses.destroy({where: {id}});
            return res.json({message: "Адрес удален"});
        } catch (e) {
            next(ApiError.BadRequest(e));
        }

    }


}

module.exports = new AddressesController()