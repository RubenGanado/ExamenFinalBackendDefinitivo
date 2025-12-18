
export type OwnedPokemon = {
  _id: string;          
  pokemonId: string;    
  nickname: string;
  level: number;
};


export type PokemonUser = {
  _id: string;
  name: string;
  pokemons: OwnedPokemon[];
};

export type PokemonType =
  
  |"FIRE"
  |"WATER"
  |"ELECTRIC"
  |"GRASS"
  |"ICE"
  |"FIGHTING"
  |"POISON"
  |"GROUND"
  |"FLYING"
  |"PSYCHIC"
  |"BUG"
  |"ROCK"
  |"GHOST"
  |"DRAGON";
