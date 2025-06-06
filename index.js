require('dotenv').config()
const express = require('express')
const sequelize = require('./models/db')
const cors = require('cors')
const router = require('./routes/index')
const cookieParser = require('cookie-parser')
const path = require("path")
const fileUpload = require('express-fileupload')
const errorMiddleware = require('./middlewares/errorMiddleware')

const PORT = process.env.PORT || 5000

const addresesModel = require('./models/addressesModel')
const timerModel = require('./models/timerModel')
const tokenModel = require('./models/tokenModel')
const tripsModel = require('./models/tripsModel')
const usersModel = require('./models/usersModel')
const question = require('./models/questionModel');
const answer = require('./models/answerModel');

const app = express()
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({}))
app.use(cookieParser())

// Проверка на наличие CLIENT_URL
if (!process.env.CLIENT_URL) {
    console.error('CLIENT_URL is not defined in the environment variables.')
    process.exit(1)
}


app.use(cors({
    credentials: true,
    origin: [
        process.env.CLIENT_URL,
        'http://31.129.57.26:3000',
        'http://merop.ru',
        "http://merop.ru:3000",
        /http:\/\/localhost(:\d+)?/  // Разрешение всех локальных хостов
    ]
}));

app.use(express.json())
app.use('/api', router)
app.use(errorMiddleware)

app.get('/', (req, res) => {
    res.status(200).json({ message: 'good' })
})

const start = async () => {
    try {
        await sequelize.authenticate()
        console.log('Database authenticated successfully.')
        await sequelize.sync()
        console.log('Database synced successfully.')
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e) {
        console.error('Unable to connect to the database:', e)
    }
}

start()
