import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";
import { COLLECTION_PRODUCTS, COLLECTION_USERS } from "../utils";
import { PokemonType, OwnedPokemon } from "../types";


// --- Obtener Pokémon con paginación ---
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

// --- Obtener Pokémon por ID ---
export const getPokemonById = async (id: string) => {
  const db = getDB();
  return await db
    .collection(COLLECTION_PRODUCTS)
    .findOne({ _id: new ObjectId(id) });
};

// --- Crear Pokémon ---
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

  const newPokemon = await getPokemonById(result.insertedId.toString());
  return newPokemon;
};

// --- Capturar Pokémon ---
export const catchPokemon = async (
  pokemonId: string,
  userId: string,
  nickname?: string
): Promise<OwnedPokemon | undefined> => {
  const db = getDB();
  const localUserId = new ObjectId(userId);
  const localPokemonId = new ObjectId(pokemonId);

  const pokemonToAdd = await db
    .collection(COLLECTION_PRODUCTS)
    .findOne({ _id: localPokemonId });
  if (!pokemonToAdd) throw new Error("Pokemon not found");

  // Crear objeto OwnedPokemon
  const ownedPokemon: OwnedPokemon = {
    _id: new ObjectId().toString(), // ID único para la relación como string
    pokemonId: localPokemonId.toString(),
    nickname: nickname || pokemonToAdd.name,
    level: 1,
  };

  await db.collection(COLLECTION_USERS).updateOne(
    { _id: localUserId },
    { $addToSet: { pokemons: ownedPokemon } }
  );

  // Devolver el OwnedPokemon recién creado
  const updatedUser = await db
    .collection(COLLECTION_USERS)
    .findOne({ _id: localUserId });

  return updatedUser?.pokemons.find(
    (p: any) => p._id === ownedPokemon._id
  );
};

// --- Liberar Pokémon ---
export const freePokemon = async (ownedPokemonId: string, userId: string): Promise<{ _id: string; name: string; pokemons: OwnedPokemon[] }> => {
  const db = getDB();
  const localUserId = new ObjectId(userId);

  // 1️⃣ Buscar al usuario
  const user = await db.collection(COLLECTION_USERS).findOne({ _id: localUserId });
  if (!user) throw new Error("User not found");

  // 2️⃣ Filtrar el Pokémon a eliminar
  const pokemonIndex = user.pokemons.findIndex((p: any) => p._id === ownedPokemonId);
  if (pokemonIndex === -1) throw new Error("Owned Pokemon not found");

  // 3️⃣ Eliminar Pokémon del array
  user.pokemons.splice(pokemonIndex, 1);

  // 4️⃣ Actualizar usuario en DB
  await db.collection(COLLECTION_USERS).updateOne(
    { _id: localUserId },
    { $set: { pokemons: user.pokemons } }
  );

  // 5️⃣ Devolver usuario completo (nombre no nulo)
  return {
    _id: user._id.toString(),
    name: user.name || "Trainer",
    pokemons: user.pokemons
  };
};