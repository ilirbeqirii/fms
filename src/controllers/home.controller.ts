import * as express from 'express';
import { Request, Response } from 'express';
import Controller from 'models/controller.interface';

class HomeController implements Controller {

    public path: string = '/'
    public router: express.Router = express.Router();

    constructor() {
        this.initRoutes()
    }

    private initRoutes(): void {
        this.router.get('/', this.home);
    }

    private home = (req: Request, res: Response) => {
        res.send("Butler's Food Management App!");
    }
}

export default HomeController