import { getDB } from "../db/mongo";
import bcrypt from "bcryptjs";
import { COLLECTION_USERS } from "../utils";
import { ObjectId } from "mongodb";





export const createUser = async (name: string, password: string) => {
    const db = getDB();
    const exists = await db.collection(COLLECTION_USERS).findOne({ name });
    if (exists) {
        throw new Error("El usuario ya existe");
    }
    
    const toEncriptao = await bcrypt.hash(password, 10);

    const result = await db.collection(COLLECTION_USERS).insertOne({
        name,
        password: toEncriptao,
        pokemons: []
    });

    return result.insertedId.toString();
};

export const validateUser = async (name: string, password: string) => {
    const db = getDB();
    const user = await db.collection(COLLECTION_USERS).findOne({ name });
    if (!user) return null;

    const passOk = await bcrypt.compare(password, user.password);
    if (!passOk) return null;

    return {
        _id: user._id.toString(),
        name: user.name,
        pokemons: user.pokemons || []
    };
};

export const findUserById = async (id: string) => {
    const db = getDB();
    return await db.collection(COLLECTION_USERS).findOne({_id: new ObjectId(id)})
}