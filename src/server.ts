import * as bodyParser from 'body-parser';
import MenuController from './controllers/menu.controller';
import App from './app';
import AuthController from './controllers/auth.controller';
import HomeController from './controllers/home.controller';
import ProtectedController from './controllers/protected.controller';
import MenuItemController from './controllers/menu-item.controller';



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
        bodyParser.json(),
        bodyParser.urlencoded({ extended: true }),
    ]
})

app.listen()