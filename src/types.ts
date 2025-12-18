// Pokémon que un usuario posee
export type OwnedPokemon = {
  _id: string;          // ID único de la relación
  pokemonId: string;    // referencia al Pokémon base
  nickname: string;
  level: number;
};

// Usuario con sus Pokémon capturados
export type PokemonUser = {
  _id: string;
  name: string;
  pokemons: OwnedPokemon[];
};

// Tipos de Pokémon disponibles
export type PokemonType =
  | "NORMAL"
  | "GRASS"
  | "POISON"
  | "FIRE"
  | "WATER"
  | "ELECTRIC";
