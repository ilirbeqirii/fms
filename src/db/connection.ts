import * as mongoDB from "mongodb";

class MongoDbConnection {

    private connectionString: string;
    private static databaseConnection: mongoDB.Db;

    constructor() {
        this.connectionString = process.env.ATLAS_DB_URI
    }

    connectToServer(callback: (...args) => any) {
        const client: mongoDB.MongoClient = new mongoDB.MongoClient(this.connectionString);

        client.connect((err: mongoDB.AnyError, db: mongoDB.MongoClient) => {
            if (err || !db) {
                return callback(err);
            }

            MongoDbConnection.databaseConnection = db.db("butler-db");

            console.log("Successfully connected to MongoDB.");

            return callback();
        });
    }

    static getDb(): mongoDB.Db {
        return MongoDbConnection.databaseConnection;
    }

}

export default MongoDbConnection;