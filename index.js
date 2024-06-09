require('dotenv').config()
const express = require('express')
const sequelize = require('./models/db')
const cors = require('cors')
const router = require('./routes/index')
const cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 5000
const errorMiddleware = require('./middlewares/errorMiddleware')
const path = require("path");
const fileUpload = require('express-fileupload')

const addresesModel = require('./models/addressesModel')
const timerModel = require('./models/timerModel')
const tokenModel = require('./models/tokenModel')
const tripsModel = require('./models/tripsModel')
const usersModel = require('./models/usersModel')
const falseTrips = require('./models/falseTripsModel')


const app = express()
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({}))
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: [process.env.CLIENT_URL]
}))
app.use(express.json())
app.use('/api', router)


app.use(errorMiddleware)

app.get('/', (req, res) => {
    res.status(200).json({message: 'good'})
})

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, () => console.log(`Server started on port${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

start()

