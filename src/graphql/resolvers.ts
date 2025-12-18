  import { IResolvers } from "@graphql-tools/utils";
  import {
    createPokemon,
    getPokemons,
    getPokemonById,
    catchPokemon,
    freePokemon,
  } from "../collections/pokemonsfunctionsCollections";
  import { createUser, validateUser } from "../collections/usersCollections";
  import { signToken } from "../auth";
  import { getDB } from "../db/mongo";
  import { ObjectId } from "mongodb";

  const COLLECTION_OWNED_POKEMONS = "ownedPokemons";

  export const resolvers: IResolvers = {
    
    Query: {
      me: async (_, __, { user }) => {
        if (!user) return null;
        return {
          _id: user._id.toString(),
          name: user.name,
          pokemons: user.pokemons, 
        };
      },

      pokemons: async (_, { page, size }) => getPokemons(page, size),

      pokemon: async (_, { id }) => getPokemonById(id),
    },

    
    Mutation: {
      startJourney: async (_, { name, password }) => {
        const userId = await createUser(name, password);
        return signToken(userId);
      },

      login: async (_, { name, password }) => {
        const user = await validateUser(name, password);
        if (!user) throw new Error("Invalid credentials");
        return signToken(user._id.toString());
      },

      createPokemon: async (_, args, { user }) => {
        if (!user) throw new Error("You must be logged in");
        return createPokemon(
          args.name,
          args.description,
          args.height,
          args.weight,
          args.types
        );
      },

      catchPokemon: async (_, { pokemonId, nickname }, { user }) => {
        if (!user) throw new Error("You must be logged in");
        return catchPokemon(pokemonId, user._id.toString(), nickname);
      },

      freePokemon: async (_, { ownedPokemonId }, { user }) => {
        if (!user) throw new Error("You must be logged in");
        return freePokemon(ownedPokemonId, user._id.toString());
      },
    },

  

    Trainer: {
      pokemons: async (parent) => {
        const db = getDB();
        if (!parent.pokemons || parent.pokemons.length === 0) return [];

        return await db
          .collection(COLLECTION_OWNED_POKEMONS)
          .find({ _id: { $in: parent.pokemons.map((id: string) => new ObjectId(id)) } })
          .toArray();
      },
    },

    OwnedPokemon: {
      pokemon: async (parent) => {
        return getPokemonById(parent.pokemon.toString());
      },
    },
  };
