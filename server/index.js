const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
// The data below is mocked.
const data = require("./data");

// The schema should model the full data object available.
const schema = buildSchema(`
  type Pokemon {
    id: String
    name: String!
    classification: String!
    types: [String]
    resistant: [String]
    weaknesses: [String]
    weight: pokeWeight
    height: pokeHeight
    fleeRate: Float
    evolutionRequirements: pokeEvolutionRequirements
    evolutions:[pokeEvolutions]
    maxCP: Int
    maxHP: Int
    attacks:pokeAttacks
  }

  type Attacks{
    fast: [attributesOfAttack]
    special: [attributesOfAttack]
  }

  type data{
    Pokemon:[Pokemon]
    attacks:Attacks
    types:[String]
  }

  type Query {
    Pokemons: [Pokemon]
    Types: [String]
    Attacks: Attacks
    Pokemon(name: String,id: String): Pokemon
    Attack(type: String): [attributesOfAttack]
    Type(type: String):data
    GetAttack(name: String):GetAttack
  }

  type Mutation {
    createType(newType: String!): [String]
    createNewAttack(type: String!, name: String!, type: String!, damage: Int): [String]
  }

  type newAttack {
    type: String 
    data: NewAttackInformation
  }
  
  type NewAttackInformation{
    name: String
    type: String
    damage: Int
  }
  
  type GetAttack {
    name: String
    type: String
    damage: Int
    Pokemon: [Pokemon]
  }

  type pokeWeight {
    minimum: String
    maximum: String
  }

  type pokeHeight {
    minimum: String
    maximum: String
  }

  type pokeEvolutionRequirements {
    amount: Int
    name: String
  }

  type pokeEvolutions{
    id: Int
    name: String
  }

  type pokeAttacks{
    fast: [attributesOfAttack]
    special: [attributesOfAttack]
  }

  type attributesOfAttack{
    name: String
    type: String
    damage: Int
  }
`);

// The root provides the resolver functions for each type of query or mutation.
const root = {
  Pokemons: () => {
    return data.pokemon;
  },
  Types: () => {
    return data.types;
  },
  Attacks: () => {
    return data.attacks;
  },
  Attack: (request) => {
    if (request.type === "fast") return data.attacks.fast;
    if (request.type === "special") return data.attacks.special;
  },
  Type: (request) => {
    const tmp = { Pokemon: "" };
    tmp.Pokemon = data.pokemon.filter((pokemon) => {
      return pokemon.types.some((type) => {
        return type === request.type;
      });
    });
    return tmp;
  },

  GetAttack: (request) => {
    let returnOb = { name: "", type: "", damage: 0, Pokemon: [] };

    const [tempArray] = data.attacks.fast
      .concat(data.attacks.special)
      .filter((attacks) => {
        return attacks.name === request.name;
      });

    returnOb.name = tempArray.name;
    returnOb.type = tempArray.type;
    returnOb.damage = tempArray.damage;

    returnOb.Pokemon = data.pokemon.filter((pokemon) => {
      const allAttacks = pokemon.attacks.fast.concat(pokemon.attacks.special);
      return allAttacks.some((attack) => {
        return attack.name === request.name;
      });
    });
    return returnOb;
  },

  // retrieve all data from attacks
  // we want to return attacks field
  // also we want to put pokemon data into attacks field
  // attack name

  Pokemon: (request) => {
    return data.pokemon.find((pokemon) => {
      //if request is a name --> return pokemon.name
      // if it's a number --> return pokemon.id
      return isNaN(parseInt(request))
        ? pokemon.id === request.id
        : pokemon.name === request.name;
    });
  },

  createType: (request) => {
    data.types.push(request.newType);
    return data.types;
  },
};

// Start your express server!
const app = express();

/*
  The only endpoint for your server is `/graphql`- if you are fetching a resource, 
  you will need to POST your query to that endpoint. Suggestion: check out Apollo-Fetch
  or Apollo-Client. Note below where the schema and resolvers are connected. Setting graphiql
  to 'true' gives you an in-browser explorer to test your queries.
*/
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Running a GraphQL API server at localhost:${PORT}/graphql`);
});
