import { Db, MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let client: MongoClient;
let dB: Db;
const dbName = "Pokemon";

export const connectToMongoDB = async () => {
    try{
        const mongoUrl = process.env.MONGO_URL;
        if(mongoUrl){
            client = new MongoClient(mongoUrl);
            await client.connect();
            dB = client.db(dbName);
            console.log("Estás conectado al mongo!!");
        } else {
            throw new Error("Error en el mongo!");
        }
    }
    catch(err){
        console.log("Error del mongo: ", err)
    }
};

export const getDB = ():Db => dB;