import express, { Application } from 'express'
import Controller from 'models/controller.interface'

class App {

    public app: Application
    public port: number

    constructor(appInit: { port: number; middleWares: any; controllers: Controller[]; }) {
        this.app = express()
        this.port = appInit.port

        this.setMiddlewares(appInit.middleWares)
        this.setRoutes(appInit.controllers)
    }

    private setMiddlewares(middleWares: any) {
        middleWares.forEach(middleWare => {
            this.app.use(middleWare)
        })
    }

    private setRoutes(controllers: Controller[]) {
        controllers.forEach((controller: Controller) => {
            this.app.use(controller.path, controller.router)
        })
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on the http://localhost:${this.port}`)
        })
    }
}

export default App