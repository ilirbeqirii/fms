import BSON from "bson";
import * as express from "express";
import { Request, Response } from 'express';
import { body, Result, ValidationChain, ValidationError, validationResult } from 'express-validator';
import Controller from "models/controller.interface";
import { Db } from "mongodb";
import MongoDbConnection from "../db/connection";
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
        this.router.delete('/:id', this.deleteMenu);
        this.router.put('/:id', this.validateBody('update'), this.updateMenu);
        this.router.post('/', this.validateBody('create'), this.createMenu);
    }

    private getMenus = (req: Request, res: Response) => {
        const dbConnection: Db = MongoDbConnection.getDb();

        dbConnection.collection('menus')
            .find({})
            .limit(50)
            .toArray()
            .then(
                result => res.json(result),
                err => res.status(400).send("Error fetching menus")
            )
    }

    private getMenuById = (req: Request, res: Response) => {
        const menuId: string = req.params['id'];

        if (!menuId) {
            res.status(400).end();
        }

        const dbConnection: Db = MongoDbConnection.getDb();
        const listingQuery = { _id: new BSON.ObjectID(menuId) };

        dbConnection.collection('menus')
            .findOne(listingQuery)
            .then(
                (result) => res.status(200).send(result),
                (err) => res.status(400).send(`Error getting menu with id ${listingQuery._id}`)
            );
    }

    private createMenu = (req: Request, res: Response) => {
        const result: Result<ValidationError> = validationResult(req);

        if (!result.isEmpty()) {
            return res.status(422).json({ errors: result.array() });
        }

        const menu: Menu = req.body as Menu;

        const dbConnection: Db = MongoDbConnection.getDb();

        dbConnection.collection('menus')
            .insertOne(menu)
            .then(
                () => res.status(204).send(),
                err => res.status(400).send("Error creating menu!")
            );
    }

    private updateMenu = (req: Request, res: Response) => {
        const result: Result<ValidationError> = validationResult(req);

        if (!result.isEmpty()) {
            return res.status(422).json({ errors: result.array() });
        }

        const menuId: string = req.params['id'];

        if (!menuId) {
            res.status(400).send('id is not provided!');
        }

        const menuToUpdate: Menu = req.body as Menu;

        const dbConnection: Db = MongoDbConnection.getDb();
        const listingQuery = { _id: new BSON.ObjectID(menuId) };


        dbConnection.collection('menus')
            .updateOne(
                listingQuery,
                { $set: menuToUpdate }
            )
            .then(
                (data) => res.status(200).send(),
                err => res.status(400).send(`Error updating menu with id ${listingQuery._id}!`)
            );
    }

    private deleteMenu = (req: Request, res: Response) => {
        const menuId: string = req.params['id'];

        if (!menuId) {
            res.status(400).end();
        }

        const dbConnection: Db = MongoDbConnection.getDb();
        const listingQuery = { _id: new BSON.ObjectID(menuId) };

        dbConnection.collection('menus')
            .deleteOne(listingQuery)
            .then(
                () => res.status(200).send(),
                err => res.status(400).send(`Error deleting menu with id ${listingQuery._id}!`)
            );
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