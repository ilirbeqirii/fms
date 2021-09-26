import * as express from 'express';
import { Request, Response } from 'express';
import Controller from 'models/controller.interface';
import AuthMiddleware from '../middleware/auth.middleware';


class ProtectedController implements Controller {

  private authMiddleware: AuthMiddleware;

  public path: string = '/protected'
  public router = express.Router()

  constructor() {
    this.authMiddleware = new AuthMiddleware();

    this.initRoutes()
  }

  public initRoutes(): void {
    this.router.use(this.authMiddleware.verifyToken)
    this.router.get('/secret', this.secret)
  }

  private secret = (req: Request, res: Response): void => {
    res.send("you can view secret")
  }
}

export default ProtectedController;