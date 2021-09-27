import * as express from "express";

export default interface Controller {
    path: string;
    router: express.Router;
}