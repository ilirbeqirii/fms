import BSON from "bson";
import * as express from "express";
import { Request, Response } from 'express';
import { body, Result, ValidationChain, ValidationError, validationResult } from "express-validator";
import Controller from "models/controller.interface";
import { Db } from "mongodb";
import MongoDbConnection from "../db/connection";
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
        this.router.delete('/:id', this.deleteMenuItem);
        this.router.put('/:id', this.validateBody('update'), this.updateMenuItem);
        this.router.post('/', this.validateBody('create'), this.createMenuItem);
    }

    private getMenuItems = (req: Request, res: Response) => {
        const dbConnection: Db = MongoDbConnection.getDb();

        dbConnection.collection('menuitems')
            .find({})
            .limit(50)
            .toArray()
            .then(
                result => res.json(result),
                err => res.status(400).send("Error fetching menu items")
            )
    }

    private getMenuItemById = (req: Request, res: Response) => {
        const menuItemId: string = req.params['id'];

        if (!menuItemId) {
            res.status(400).end();
        }

        const dbConnection: Db = MongoDbConnection.getDb();
        const listingQuery = { _id: new BSON.ObjectID(menuItemId) };

        dbConnection.collection('menuitems')
            .findOne(listingQuery)
            .then(
                (result) => res.status(200).send(result),
                (err) => res.status(400).send(`Error getting menu item with id ${listingQuery._id}`)
            );
    }

    private deleteMenuItem = (req: Request, res: Response) => {
        const menuItemId: string = req.params['id'];

        if (!menuItemId) {
            res.status(400).end();
        }

        const dbConnection: Db = MongoDbConnection.getDb();
        const listingQuery = { _id: new BSON.ObjectID(menuItemId) };

        dbConnection.collection('menuitems')
            .deleteOne(listingQuery)
            .then(
                () => res.status(200).send(),
                err => res.status(400).send(`Error deleting menu item with id ${listingQuery._id}!`)
            );
    }

    private updateMenuItem = (req: Request, res: Response) => {
        const result: Result<ValidationError> = validationResult(req);

        if (!result.isEmpty()) {
            return res.status(422).json({ errors: result.array() });
        }

        const menuItemId: string = req.params['id'];

        if (!menuItemId) {
            res.status(400).send('id is not provided!');
        }

        const menuItemToUpdate: MenuItem = req.body as MenuItem;

        const dbConnection: Db = MongoDbConnection.getDb();
        const listingQuery = { _id: new BSON.ObjectID(menuItemId) };

        dbConnection.collection('menuitems')
            .updateOne(
                listingQuery,
                { $set: menuItemToUpdate }
            )
            .then(
                (data) => res.status(200).send(),
                err => res.status(400).send(`Error updating menu item with id ${listingQuery._id}!`)
            );
    }

    private createMenuItem = (req: Request, res: Response) => {
        const result: Result<ValidationError> = validationResult(req);

        if (!result.isEmpty()) {
            return res.status(422).json({ errors: result.array() });
        }

        const menuItem: MenuItem = req.body as MenuItem;

        const dbConnection: Db = MongoDbConnection.getDb();

        dbConnection.collection('menuitems')
            .insertOne(menuItem)
            .then(
                () => res.status(204).send(),
                err => res.status(400).send("Error creating menu item!")
            );
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