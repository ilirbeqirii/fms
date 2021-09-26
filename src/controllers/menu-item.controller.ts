import * as express from "express";
import { Request, Response } from 'express';
import { body, Result, ValidationChain, ValidationError, validationResult } from "express-validator";
import Controller from "models/controller.interface";
import MenuItem from "../models/menu-item.model";

interface MenuItemActions {
    update: string;
    create: string;
}

const menuItems: MenuItem[] = [
    new MenuItem('1', 'Menu Item 1', 'Menu Item 1 is created!', 5),
    new MenuItem('2', 'Menu Item 2', 'Menu Item 2 is created!', 5),
    new MenuItem('3', 'Menu Item 3', 'Menu Item 3 is created!', 5),
    new MenuItem('4', 'Menu Item 4', 'Menu Item 4 is created!', 5),
    new MenuItem('5', 'Menu Item 5', 'Menu Item 5 is created!', 5)
];

class MenuItemController implements Controller {

    path: string = '/menu-item';
    router: express.Router = express.Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.get('/', this.getMenuItems);
        this.router.get('/:id', this.getMenuItemById);
        this.router.get('/delete/:id', this.deleteMenuItem);
        this.router.put('/update', this.validateBody('update'), this.updateMenuItem);
        this.router.post('/create', this.validateBody('create'), this.createMenuItem);
    }

    private getMenuItems = (req: Request, res: Response) => {
        res.send(menuItems);
    }

    private getMenuItemById = (req: Request, res: Response) => {
        const menuItemId: string = req.params['id'];

        if (!menuItemId) {
            res.status(400).end();
        }

        const menuItemToReturn: MenuItem = menuItems.find((menuItem: MenuItem) => menuItem.id == menuItemId);

        if ((menuItemToReturn)) {
            res.send(menuItemToReturn);
        } else {
            res.status(404).end();
        }
    }

    private deleteMenuItem = (req: Request, res: Response) => {
        const menuItemId: string = req.params['id'];

        if (!menuItemId) {
            res.status(400).end();
        }

        const menuItemIndex: number = menuItems.findIndex((menuItem: MenuItem) => menuItem.id !== menuItemId);

        if (!menuItemIndex) {
            res.status(404).end();
        }

        menuItems.splice(menuItemIndex, 1);

        res.status(200).end();
    }

    private updateMenuItem = (req: Request, res: Response) => {
        const result: Result<ValidationError> = validationResult(req);

        if (!result.isEmpty()) {
            return res.status(422).json({ errors: result.array() });
        }

        const menuItemToUpdate: MenuItem = req.body as MenuItem;

        menuItems.forEach((menuItem: MenuItem) => {
            if (menuItem.id == menuItemToUpdate.id) {
                menuItem = Object.assign({}, menuItemToUpdate);
            }
        });

        res.status(200).end();
    }

    private createMenuItem = (req: Request, res: Response) => {
        const result: Result<ValidationError> = validationResult(req);

        if (!result.isEmpty()) {
            return res.status(422).json({ errors: result.array() });
        }

        const menuItem: MenuItem = req.body as MenuItem;

        menuItems.push(menuItem);

        res.status(200).end();
    }

    private validateBody<T extends keyof MenuItemActions>(type: T): ValidationChain[] {
        switch (type) {
            case 'create':
                return [
                    body('name').notEmpty().isLength({ min: 5 }),
                    body('description').notEmpty().isString().isLength({ min: 8 }),
                    body('price').notEmpty().isNumeric().isCurrency()
                ];
            case 'update':
                return [
                    body('name').notEmpty().isLength({ min: 5 }),
                    body('description').notEmpty().isString().isLength({ min: 8 }),
                    body('price').notEmpty().isNumeric().isCurrency()
                ];
            default:
                throw new Error('No such Menu action defined');
        }
    }
}

export default MenuItemController;