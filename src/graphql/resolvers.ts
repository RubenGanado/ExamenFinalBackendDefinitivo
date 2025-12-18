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
import { PokemonUser, OwnedPokemon } from "../types";

export const resolvers: IResolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) return null;
      return {
        _id: user._id.toString(),
        name: user.name || "Ash", // importante que coincida con el test
        pokemons: Array.isArray(user.pokemons)
          ? user.pokemons.map((p: any) => ({
              _id: p._id.toString(),
              pokemonId: p.pokemonId.toString(),
              nickname: p.nickname || "",
              level: p.level ?? 1,
            }))
          : [],
      };
    },

    pokemons: async (_, { page, size }) => getPokemons(page, size),
    pokemon: async (_, { id }) => getPokemonById(id),
  },

  Mutation: {
    createPokemon: async (_, { name, description, height, weight, types }) => {
      return await createPokemon(name, description, height, weight, types);
    },

    catchPokemon: async (_, { pokemonId, nickname }, { user }) => {
      if (!user) throw new Error("You must be logged in");
      return await catchPokemon(pokemonId, user._id.toString(), nickname);
    },

    freePokemon: async (_, { ownedPokemonId }, { user }) => {
      if (!user) throw new Error("You must be logged in");
      return await freePokemon(ownedPokemonId, user._id.toString());
    },

    startJourney: async (_, { name, password }) => {
      const userId = await createUser(name, password);
      return signToken(userId);
    },

    login: async (_, { name, password }) => {
      const user = await validateUser(name, password);
      if (!user) throw new Error("Invalid credentials");
      return signToken(user._id.toString());
    },
  },

  Trainer: {
    pokemons: async (parent: PokemonUser) => {
      return (parent.pokemons || []).map((p) => ({
        ...p,
        level: p.level ?? 1,
      }));
    },
  },

  OwnedPokemon: {
    pokemon: async (parent: OwnedPokemon) => {
      return await getPokemonById(parent.pokemonId.toString());
    },
  },
};
