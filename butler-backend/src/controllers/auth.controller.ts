import { AttributeListType } from 'aws-sdk/clients/cognitoidentityserviceprovider';
import * as express from 'express';
import { Request, Response } from 'express';
import { body, ValidationChain, validationResult } from 'express-validator';
import Controller from 'models/controller.interface';
import LoginDTO from 'models/login.interface';
import SignUpDTO from 'models/signup.interface';
import VerifyDTO from 'models/verify.interface';
import CognitoService from '../services/cognito.service';

interface AuthActions {
  signUp: string;
  signIn: string;
  verify: string;
}

class AuthController implements Controller {

  path: string = '/auth'
  router: express.Router = express.Router()

  constructor() {
    this.initRoutes()
  }

  get CognitoService(): CognitoService {
    return new CognitoService();
  }

  private initRoutes(): void {
    this.router.post('/signup', this.validateBody('signUp'), this.signUp)
    this.router.post('/signin', this.validateBody('signIn'), this.signIn)
    this.router.post('/verify-account', this.validateBody('verify'), this.verifyAccount)
  }

  private getUserAttributes(signUpDTO: SignUpDTO): AttributeListType {
    return [
      { Name: 'email', Value: signUpDTO.email },
      { Name: 'gender', Value: signUpDTO.gender },
      { Name: 'birthdate', Value: signUpDTO.birthdate },
      { Name: 'name', Value: signUpDTO.name },
      { Name: 'family_name', Value: signUpDTO.family_name }
    ]
  }

  private signUp = (req: Request, res: Response) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(422).json({ errors: result.array() });
    }

    const signUpDTO: SignUpDTO = req.body;
    const userAttributes: AttributeListType = this.getUserAttributes(signUpDTO);

    this.CognitoService.signUpUser(signUpDTO.username, signUpDTO.password, userAttributes)
      .then(
        () => res.status(200).end(),
        () => res.status(400).end()
      );
  }

  signIn = (req: Request, res: Response) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(422).json({ errors: result.array() });
    }

    const loginDTO: LoginDTO = req.body;

    this.CognitoService.signInUser(loginDTO.username, loginDTO.password)
      .then(
        () => res.status(200).end(),
        () => res.status(400).end()
      );
  }

  verifyAccount = (req: Request, res: Response) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(422).json({ errors: result.array() });
    }

    const verifyDTO: VerifyDTO = req.body;

    this.CognitoService.confirmSignUp(verifyDTO.username, verifyDTO.code)
      .then(
        () => res.status(200).end(),
        () => res.status(400).end()
      );
  }

  private validateBody<T extends keyof AuthActions>(type: T): ValidationChain[] {
    switch (type) {
      case 'signUp':
        return [
          body('username').notEmpty().isLength({ min: 5 }),
          body('email').notEmpty().normalizeEmail().isEmail(),
          body('password').isString().isLength({ min: 8 }),
          body('birthdate').exists().isISO8601(),
          body('gender').notEmpty().isString(),
          body('name').notEmpty().isString(),
          body('family_name').notEmpty().isString()
        ];
      case 'signIn':
        return [
          body('username').notEmpty().isLength({ min: 5 }),
          body('password').isString().isLength({ min: 8 }),
        ];
      case 'verify':
        return [
          body('username').notEmpty().isLength({ min: 5 }),
          body('code').notEmpty().isString().isLength({ min: 6, max: 6 })
        ];
      default:
        throw new Error('No such Auth action defined');
    }
  }
}

export default AuthController