import * as bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import App from './app';
import AuthController from './controllers/auth.controller';
import HomeController from './controllers/home.controller';
import MenuItemController from './controllers/menu-item.controller';
import MenuController from './controllers/menu.controller';
import ProtectedController from './controllers/protected.controller';
import MongoDbConnection from './db/connection';

dotenv.config({ path: "./config.env" })

// require('dotenv').config();
// var cors = require('cors')


const app = new App({
    port: 5000,
    controllers: [
        new HomeController(),
        new AuthController(),
        new MenuController(),
        new MenuItemController(),
        new ProtectedController()
    ],
    middleWares: [
        cors(),
        bodyParser.json(),
        bodyParser.urlencoded({ extended: true }),
    ]
})

const mongoDbConnection: MongoDbConnection = new MongoDbConnection();

mongoDbConnection.connectToServer(function (err) {
    if (err) {
        console.error('Error connecting to MongoDB server!: ' + err);
        process.exit();
    }

    app.listen()
});
