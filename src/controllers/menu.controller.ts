import * as express from "express";
import { Request, Response } from 'express';
import { body, Result, ValidationChain, ValidationError, validationResult } from 'express-validator';
import Controller from "models/controller.interface";
import Menu from "../models/menu.model";

interface MenuActions {
    update: string;
    create: string;
}

const menus: Menu[] = [
    new Menu('1', 'Menu 1', 'Menu 1 is created!'),
    new Menu('2', 'Menu 2', 'Menu 2 is created!'),
    new Menu('3', 'Menu 3', 'Menu 3 is created!'),
    new Menu('4', 'Menu 4', 'Menu 4 is created!'),
    new Menu('5', 'Menu 5', 'Menu 5 is created!')
];

class MenuController implements Controller {

    path: string = '/menu';
    router: express.Router = express.Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.get('/', this.getMenus);
        this.router.get('/:id', this.getMenuById);
        this.router.get('/delete/:id', this.deleteMenu);
        this.router.put('/update', this.validateBody('update'), this.updateMenu);
        this.router.post('/create', this.validateBody('create'), this.createMenu);
    }

    private getMenus = (req: Request, res: Response) => {
        res.send(menus);
    }

    private getMenuById = (req: Request, res: Response) => {
        const menuId: string = req.params['id'];

        if (!menuId) {
            res.status(400).end();
        }

        const menuToReturn: Menu = menus.find((menu: Menu) => menu.id == menuId);

        if ((menuToReturn)) {
            res.send(menuToReturn);
        } else {
            res.status(404).end();
        }
    }

    private createMenu = (req: Request, res: Response) => {
        const result: Result<ValidationError> = validationResult(req);

        if (!result.isEmpty()) {
            return res.status(422).json({ errors: result.array() });
        }

        const menu: Menu = req.body as Menu;

        menus.push(menu);

        res.status(200).end();
    }

    private updateMenu = (req: Request, res: Response) => {
        const result: Result<ValidationError> = validationResult(req);

        if (!result.isEmpty()) {
            return res.status(422).json({ errors: result.array() });
        }

        const menuToUpdate: Menu = req.body as Menu;

        menus.forEach((menu: Menu) => {
            if (menu.id == menuToUpdate.id) {
                menu = Object.assign({}, menuToUpdate);
            }
        });

        res.status(200).end();
    }

    private deleteMenu = (req: Request, res: Response) => {
        const menuId: string = req.params['id'];

        if (!menuId) {
            res.status(400).end();
        }

        const menuIndex: number = menus.findIndex((menu: Menu) => menu.id !== menuId);

        if (!menuIndex) {
            res.status(404).end();
        }

        menus.splice(menuIndex, 1);

        res.status(200).end();
    }

    private validateBody<T extends keyof MenuActions>(type: T): ValidationChain[] {
        switch (type) {
            case 'create':
                return [
                    body('name').notEmpty().isLength({ min: 5 }),
                    body('description').notEmpty().isString().isLength({ min: 8 })
                ];
            case 'update':
                return [
                    body('name').notEmpty().isLength({ min: 5 }),
                    body('description').notEmpty().isString().isLength({ min: 8 })
                ];
            default:
                throw new Error('No such Menu action defined');
        }
    }
}

export default MenuController;