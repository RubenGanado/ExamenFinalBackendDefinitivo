import { gql } from "apollo-server";



export const typeDefs = gql`

 enum PokemonType {
    NORMAL
    GRASS
    POISON
    FIRE
    WATER
    ELECTRIC
  }

    type Trainer {
  _id: ID!
  name: String!
  pokemons: [OwnedPokemon!]!
}

type Pokemon {
  _id: ID!
  name: String!
  description: String!
  height: Float!
  weight: Float!
  types: [PokemonType!]!
}

type OwnedPokemon {
  _id: ID!
  nickname: String
  level: Int!
  pokemon: Pokemon!
}



type Query {
  me: Trainer
  pokemons(first: Int, after: ID): [Pokemon!]!
  pokemon(id: ID!): Pokemon
}

type Mutation {
  startJourney(name: String!, password: String!): String!
  login(name: String!, password: String!): String!
  createPokemon(
    name: String!
    description: String!
    height: Float!
    weight: Float!
    types: [PokemonType!]!
  ): Pokemon!
  catchPokemon(pokemonId: ID!, nickname: String): OwnedPokemon
  freePokemon(ownedPokemonId: ID!): Trainer
}
`