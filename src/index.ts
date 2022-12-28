import './utils/envloader'
import './extensions'
import express from 'express'
import errorMiddleware from './middlewares/error.middleware'
import routes from './routes'
import mongoose from 'mongoose'

// setup express
const app: express.Express = express()

// get env variables
const { PORT, DBURL } = process.env

// setup app
const setup = async () => {
    // use json body parser
    app.use(express.json())

    // setup routes
    app.use(routes)

    // setup errorMiddleware
    app.use(errorMiddleware)

    // setup public folder to be reachable for images
    app.use(express.static(__dirname + '/public'))

    // wait for db connection
    await mongoose.connect(DBURL!)

    // start server
    app.listen(PORT, () => {
        console.log(
            `⚡️[server]: Server is running at https://localhost:${PORT}`
        )
    })
}

// run setup
setup()
