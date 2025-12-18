import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";
import { COLLECTION_PRODUCTS, COLLECTION_USERS } from "../utils";
import { PokemonType } from "../types";

const COLLECTION_OWNED_POKEMONS = "ownedPokemons";



export const getPokemons = async (page?: number, size?: number) => {
  const db = getDB();
  page = page || 1;
  size = size || 10;

  return await db
    .collection(COLLECTION_PRODUCTS)
    .find()
    .skip((page - 1) * size)
    .limit(size)
    .toArray();
};

export const getPokemonById = async (id: string) => {
  const db = getDB();
  return await db
    .collection(COLLECTION_PRODUCTS)
    .findOne({ _id: new ObjectId(id) });
};

export const createPokemon = async (
  name: string,
  description: string,
  height: number,
  weight: number,
  types: PokemonType[]
) => {
  const db = getDB();
  const result = await db.collection(COLLECTION_PRODUCTS).insertOne({
    name,
    description,
    height,
    weight,
    types,
  });

  return await getPokemonById(result.insertedId.toString());
};



export const catchPokemon = async (
  pokemonId: string,
  userId: string,
  nickname?: string
) => {
  const db = getDB();
  const trainerId = new ObjectId(userId);
  const pokemonObjectId = new ObjectId(pokemonId);

  const trainer = await db
    .collection(COLLECTION_USERS)
    .findOne({ _id: trainerId });

  if (!trainer) throw new Error("Trainer not found");
  if (trainer.pokemons.length >= 6)
    throw new Error("Trainer already has 6 pokemons");

  const pokemon = await db
    .collection(COLLECTION_PRODUCTS)
    .findOne({ _id: pokemonObjectId });

  if (!pokemon) throw new Error("Pokemon not found");

  const ownedPokemon = {
    pokemon: pokemonObjectId,
    nickname: nickname || pokemon.name,
    attack: Math.floor(Math.random() * 100) + 1,
    defense: Math.floor(Math.random() * 100) + 1,
    speed: Math.floor(Math.random() * 100) + 1,
    special: Math.floor(Math.random() * 100) + 1,
    level: Math.floor(Math.random() * 100) + 1,
    trainer: trainerId,
  };

  const result = await db
    .collection(COLLECTION_OWNED_POKEMONS)
    .insertOne(ownedPokemon);

  await db.collection(COLLECTION_USERS).updateOne(
    { _id: trainerId },
    { $push: { pokemons: result.insertedId as any} }
  );

  return {
    _id: result.insertedId.toString(),
    ...ownedPokemon,
  };
};



export const freePokemon = async (
  ownedPokemonId: string,
  userId: string
) => {
  const db = getDB();
  const trainerId = new ObjectId(userId);
  const ownedId = new ObjectId(ownedPokemonId);

  const ownedPokemon = await db
    .collection(COLLECTION_OWNED_POKEMONS)
    .findOne({ _id: ownedId, trainer: trainerId });

  if (!ownedPokemon)
    throw new Error("No tienes al pokemon");

  await db
    .collection(COLLECTION_OWNED_POKEMONS)
    .deleteOne({ _id: ownedId });

  await db.collection(COLLECTION_USERS).updateOne(
    { _id: trainerId },
    { $pull: { pokemons: ownedId } as any}
  );

  const updatedTrainer = await db
    .collection(COLLECTION_USERS)
    .findOne({ _id: trainerId });

  return {
    _id: updatedTrainer!._id.toString(),
    name: updatedTrainer!.name,
    pokemons: updatedTrainer!.pokemons,
  };
};
