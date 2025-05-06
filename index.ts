import "dotenv/config";
import e from "express";
import express from "express";
import session, { Cookie } from "express-session";
import { MongoClient, NumericType, ObjectId } from "mongodb";
import { exit, nextTick } from "process";
import cookieParser from "cookie-parser";
import { PokemonSpecies } from "./pokemonSpecies";
import bcrypt from "bcrypt";
const MongoStore = require("connect-mongo");
const uri = process.env.urlMongo;
if (!uri) {
  console.log("uri not found!");
  exit(1);
}
const app = express();
const client = new MongoClient(uri);
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
const jwtsecret = process.env.JWT_SECRET;
if (!jwtsecret) {
  console.log("JWT secret not found!");
  exit(1);
}
const secure = process.env.secure === "true";
app.use(
  session({
    secret: jwtsecret,
    store: MongoStore.create({ mongoUrl: uri }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: secure,
      maxAge: 604800000,
    },
  })
);
app.set("view engine", "ejs");
const port = process.env.port;
if (!port) {
  console.log("port not found!");
  exit(1);
}
interface UserProfile {
  _id?: ObjectId;
  id: number;
  readonly username: string;
  password: string;
  emailAddress: string;
  userFlattenedPokemon: FlattenedPokemon[];
  buddyId: number;
}

export interface FlattenedPokemon {
  _id?: ObjectId;
  id: number;
  name: string;
  won: number;
  lost: number;
  height: number;
  weight: number;
  order: number;
  species: string;
  speciesId: number;
  spriteBack: string;
  spriteFront: string;
  stats: Stat[];
  types: Type[];
}
interface PokemonList {
  pokemonId: number;
}
interface HundredPokemon {
  count: number;
  next: string;
  previous: null;
  results: Result[];
}

interface Result {
  name: string;
  url: string;
}
interface OnePokemon {
  abilities: Ability[];
  base_experience: number;
  cries: Cries;
  forms: Species[];
  game_indices: GameIndex[];
  height: number;
  held_items: any[];
  id: number;
  is_default: boolean;
  location_area_encounters: string;
  moves: Move[];
  name: string;
  order: number;
  past_abilities: any[];
  past_types: any[];
  species: Species;
  sprites: Sprites;
  stats: Stat[];
  types: Type[];
  weight: number;
}

interface Ability {
  ability: Species;
  is_hidden: boolean;
  slot: number;
}

interface Species {
  name: string;
  url: string;
}

interface Cries {
  latest: string;
  legacy: string;
}

interface GameIndex {
  game_index: number;
  version: Species;
}

interface Move {
  move: Species;
  version_group_details: VersionGroupDetail[];
}

interface VersionGroupDetail {
  level_learned_at: number;
  move_learn_method: Species;
  version_group: Species;
}

interface GenerationV {
  "black-white": Sprites;
}

interface GenerationIv {
  "diamond-pearl": Sprites;
  "heartgold-soulsilver": Sprites;
  platinum: Sprites;
}

interface Versions {
  "generation-i": GenerationI;
  "generation-ii": GenerationIi;
  "generation-iii": GenerationIii;
  "generation-iv": GenerationIv;
  "generation-v": GenerationV;
  "generation-vi": { [key: string]: Home };
  "generation-vii": GenerationVii;
  "generation-viii": GenerationViii;
}

interface Other {
  dream_world: DreamWorld;
  home: Home;
  "official-artwork": OfficialArtwork;
  showdown: Sprites;
}

interface Sprites {
  back_default: string;
  back_female: null;
  back_shiny: string;
  back_shiny_female: null;
  front_default: string;
  front_female: null;
  front_shiny: string;
  front_shiny_female: null;
  other?: Other;
  versions?: Versions;
  animated?: Sprites;
}

interface GenerationI {
  "red-blue": RedBlue;
  yellow: RedBlue;
}

interface RedBlue {
  back_default: string;
  back_gray: string;
  back_transparent: string;
  front_default: string;
  front_gray: string;
  front_transparent: string;
}

interface GenerationIi {
  crystal: Crystal;
  gold: Gold;
  silver: Gold;
}

interface Crystal {
  back_default: string;
  back_shiny: string;
  back_shiny_transparent: string;
  back_transparent: string;
  front_default: string;
  front_shiny: string;
  front_shiny_transparent: string;
  front_transparent: string;
}

interface Gold {
  back_default: string;
  back_shiny: string;
  front_default: string;
  front_shiny: string;
  front_transparent?: string;
}

interface GenerationIii {
  emerald: OfficialArtwork;
  "firered-leafgreen": Gold;
  "ruby-sapphire": Gold;
}

interface OfficialArtwork {
  front_default: string;
  front_shiny: string;
}

interface Home {
  front_default: string;
  front_female: null;
  front_shiny: string;
  front_shiny_female: null;
}

interface GenerationVii {
  icons: DreamWorld;
  "ultra-sun-ultra-moon": Home;
}

interface DreamWorld {
  front_default: string;
  front_female: null;
}

interface GenerationViii {
  icons: DreamWorld;
}

interface Stat {
  name: string;
  base_stat: number;
}

interface Type {
  slot: number;
  type: string[];
}

app.set("port", parseInt(port));
declare module "express-session" {
  interface SessionData {
    user: UserProfile;
  }
}

let userProfile: UserProfile[] = [];
let pokemonList: FlattenedPokemon[] = [];

app.get("/battler", (req, res) => {
  const user = req.session.user;
  const pokemon = user?.userFlattenedPokemon.find(
    (pokemon) => pokemon.id === user?.buddyId
  ) as FlattenedPokemon;
  const randomPokemonId = getRandomNumber(1, pokemon.id + 25);
  const pokemonToFight = pokemonList.find(
    (pokemon) => pokemon?.id === randomPokemonId
  ) as FlattenedPokemon;
  res.render("battler", { user, pokemon, pokemonToFight });
});

app.get("/home", (req, res) => {
  const user = req.session.user;
  res.render("home", { user });
});

app.get("/", (req, res) => {
  const user = req.session.user;
  if (user) {
    res.redirect("index");
  } else {
    res.render("index");
  }
});
app.get("/index", (req, res) => {
  const user = req.session.user;
  res.render("index");
});
app.get("/login", (req, res) => {
  const errorMessage = req.query.errorMessage || null;
  res.render("login", { errorMessage });
});
// Endpoint to send pokemonList as JSON
app.get("/pokemonList", (req, res) => {
  res.json(pokemonList);
});
app.get("/myPokemonList", (req, res) => {
  const user = req.session.user;
  res.json(user?.userFlattenedPokemon);
});
app.post("/createProfile", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const hash = await bcrypt.hash(password, 13);
  const email = req.body.email;
  const highestIdUser = await client
    .db("pokemonBPR")
    .collection("userProfile")
    .findOne({}, { sort: { id: -1 } });
  let nextId;
  if (highestIdUser) {
    nextId = highestIdUser.id + 1;
  } else {
    nextId = 0;
  }
  if (nextId == 0) {
    const user: UserProfile = {
      id: nextId,
      username: `${username}`,
      emailAddress: email,
      password: hash,
      userFlattenedPokemon: [
        {
          _id: new ObjectId(),
          id: -1,
          name: "StarterBuddy",
          won: 0,
          lost: 0,
          height: 0,
          weight: 0,
          order: 1,
          species: "StarterBuddy",
          speciesId: -1,
          spriteBack: "/styles/images/buddyNone.png",
          spriteFront: "/styles/images/buddyNone.png",
          stats: [
            { name: "hp", base_stat: 30 },
            { name: "attack", base_stat: 30 },
            { name: "defense", base_stat: 30 },
            { name: "special-attack", base_stat: 30 },
            { name: "special-defense", base_stat: 30 },
            { name: "speed", base_stat: 30 },
          ],
          types: [],
        },
      ],
      buddyId: -1,
    };
    userProfile = await client
      .db("pokemonBPR")
      .collection("userProfile")
      .find<UserProfile>({})
      .toArray();
    userProfile.push(user);
    const newUserForDatabase = await client
      .db("pokemonBPR")
      .collection("userProfile")
      .insertOne(user);
    req.session.user = user;
    res.redirect("/home");
  } else {
    const user: UserProfile = {
      id: nextId,
      username: `${username}`,
      emailAddress: email,
      password: hash,
      userFlattenedPokemon: [
        {
          _id: new ObjectId(),
          id: -1,
          name: "StarterBuddy",
          won: 0,
          lost: 0,
          height: 0,
          weight: 0,
          order: 1,
          species: "StarterBuddy",
          speciesId: -1,
          spriteBack: "/styles/images/buddyNone.png",
          spriteFront: "/styles/images/buddyNone.png",
          stats: [
            { name: "hp", base_stat: 30 },
            { name: "attack", base_stat: 30 },
            { name: "defense", base_stat: 30 },
            { name: "special-attack", base_stat: 30 },
            { name: "special-defense", base_stat: 30 },
            { name: "speed", base_stat: 30 },
          ],
          types: [],
        },
      ],
      buddyId: -1,
    };
    userProfile = await client
      .db("pokemonBPR")
      .collection("userProfile")
      .find<UserProfile>({})
      .toArray();
    userProfile.push(user);
    const newUserForDatabase = await client
      .db("pokemonBPR")
      .collection("userProfile")
      .insertOne(user);
    req.session.user = user;
    res.redirect("/home");
  }
});
app.post("/loginAttempt", async (req, res) => {
  const { username, password } = req.body;
  userProfile = await client
    .db("pokemonBPR")
    .collection("userProfile")
    .find<UserProfile>({})
    .toArray();
  const user = userProfile.find((user) => user.username === username);
  const errorMessage = "Login of passwoord niet correct";
  if (user) {
    const isMatch = await bcrypt.compare(password, user?.password);

    if (isMatch) {
      req.session.user = user;
      req.session.save(() => res.redirect(`/home`));
    } else {
      res.render("login", { errorMessage });
    }
  } else {
    res.render("login", { errorMessage });
  }
});
app.get("/logout", async (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});
app.get("/nietbeschikbaar", (req, res) => {
  const user = req.session.user;
  res.render("nietbeschikbaar");
});

app.get("/pokemoninfo/:id", (req, res) => {
  const user = req.session.user;
  const pokemonId = parseInt(req.params.id);
  let pokemonToDisplay;
  let hide: boolean = false;
  user?.userFlattenedPokemon.forEach((element) => {
    if (element.id == pokemonId) pokemonToDisplay = element;
  });
  if (!pokemonToDisplay) {
    pokemonToDisplay = pokemonList.find((pokemon) => pokemon.id == pokemonId);
    hide = true;
  }

  res.render("pokemoninfo", { pokemonList, user, pokemonToDisplay, hide });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/team", (req, res) => {
  const user = req.session.user;
  res.render("team", { pokemonList, user });
});
app.post("/team/addBuddy/:userPokemonId", async (req, res) => {
  let user = req.session.user;
  const userPokemonId = parseInt(req.params.userPokemonId);

  if (user?.buddyId === userPokemonId) {
    res.status(400).send("Cannot add the same buddy Pokemon as a buddy");
    return;
  } else {
    if (user?.buddyId) {
      user.buddyId = userPokemonId;
      await client
        .db("pokemonBPR")
        .collection("userProfile")
        .updateOne({ id: user?.id }, { $set: { buddyId: user.buddyId } });
      userProfile = await client
        .db("pokemonBPR")
        .collection("userProfile")
        .find<UserProfile>({})
        .toArray();
      user = userProfile.find((user) => user.username);
      res.redirect("../../team");
    } else {
      res.render("ERROR");
    }
  }
});
function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function calculateDamagePercentage(
  currentPokemon: FlattenedPokemon,
  targetPokemon: FlattenedPokemon
): number {
  /*Vind de aanvallende eigenschap van de huidige Pokémon*/
  const attackStat = currentPokemon.stats.find((stat) => stat.name == "attack");
  if (!attackStat) {
    throw new Error("Attack stat not found for currentPokemon");
  }

  /*Vind de verdedigende eigenschap van de doelpokémon*/
  const defenceStat = targetPokemon?.stats.find(
    (stat) => stat.name == "defense"
  );
  if (!defenceStat) {
    throw new Error("Defense stat not found for targetPokemon");
  }

  const damage = 100 - defenceStat.base_stat + attackStat.base_stat;
  return damage;
}
function calculateCatchSuccessRate(damagePercentage: number): number {
  // Use the damage percentage as the catch success rate
  // Ensure the success rate is within valid range (0 to 1)
  return Math.max(0, Math.min(damagePercentage / 100, 1));
}
app.post("/changeName/:id", async (req, res) => {
  const changeName = req.body.changeName;
  const id = parseInt(req.params.id);
  const user = req.session.user;
  // Find the index of the Pokemon to change
  const pokemonIndex = user?.userFlattenedPokemon.findIndex(
    (pokemon) => pokemon?.id === id
  );

  if (pokemonIndex && user) {
    user.userFlattenedPokemon[pokemonIndex].name = changeName;
    req.session.user = user;
  }

  const userProfile = await client
    .db("pokemonBPR")
    .collection("userProfile")
    .updateOne(
      { id: user?.id },
      {
        $set: {
          userFlattenedPokemon: user?.userFlattenedPokemon,
        },
      }
    );
  res.redirect("../../vangen");
});
app.post("/won", async (req, res) => {
  try {
    const user = req.session.user;

    if (!user || !user.userFlattenedPokemon) {
      return res
        .status(400)
        .send("User not found or userFlattenedPokemon not available");
    }

    const pokemon = user.userFlattenedPokemon.find(
      (pokemon) => pokemon.id === user.buddyId
    ) as FlattenedPokemon;

    if (!pokemon) {
      return res.status(400).send("Buddy Pokemon not found");
    }

    pokemon.won += 1;

    const updateResult = await client
      .db("pokemonBPR")
      .collection("userProfile")
      .updateOne(
        { id: user.id },
        {
          $set: {
            userFlattenedPokemon: user.userFlattenedPokemon,
          },
        }
      );

    if (updateResult.modifiedCount === 0) {
      return res.status(500).send("Failed to update the user profile");
    }

    res.status(200).send("Win recorded successfully");
  } catch (error) {
    console.error("Error recording win:", error);
    res.status(500).send("An error occurred while recording the win");
  }
});
app.post("/lost", async (req, res) => {
  try {
    const user = req.session.user;

    if (!user || !user.userFlattenedPokemon) {
      return res
        .status(400)
        .send("User not found or userFlattenedPokemon not available");
    }

    const pokemon = user.userFlattenedPokemon.find(
      (pokemon) => pokemon.id === user.buddyId
    ) as FlattenedPokemon;

    if (!pokemon) {
      return res.status(400).send("Buddy Pokemon not found");
    }

    pokemon.lost += 1;

    const updateResult = await client
      .db("pokemonBPR")
      .collection("userProfile")
      .updateOne(
        { id: user.id },
        {
          $set: {
            userFlattenedPokemon: user.userFlattenedPokemon,
          },
        }
      );

    if (updateResult.modifiedCount === 0) {
      return res.status(500).send("Failed to update the user profile");
    }

    res.status(200).send("Loss recorded successfully");
  } catch {
    res.status(500).send("An error occurred while recording the loss");
  }
});

app.get("/vangen", async (req, res) => {
  const user = req.session.user;
  let alreadyOwned = false;
  let changeName = false;
  if (!req.cookies.playerChanceInfo) {
    const pokemon = user?.userFlattenedPokemon.find(
      (pokemon) => pokemon.id === user?.buddyId
    ) as FlattenedPokemon;
    const randomPokemonId = getRandomNumber(1, 1024);
    const pokemonToCatch = pokemonList.find(
      (pokemon) => pokemon?.id === randomPokemonId
    ) as FlattenedPokemon;
    if (user) {
      user.userFlattenedPokemon.forEach((element) => {
        if (element.id == randomPokemonId) alreadyOwned = true;
      });
    }
    res.cookie("playerChanceInfo", {
      pokemonToCatch: pokemonToCatch,
      tryAmount: 1,
      randomPokemonId: randomPokemonId,
    });
    if (alreadyOwned) {
      res.clearCookie("playerChanceInfo");
    }
    res.render("vangen", {
      pokemonToCatch,
      user,
      randomPokemonId,
      changeName,
      alreadyOwned,
      tryAmount: 1,
      message: "JE KAN DEZE POKÉMON PROBEREN TE VANGEN!",
    });
  } else {
    // If the cookie exists, read values from it
    const { pokemonToCatch, tryAmount, randomPokemonId } =
      req.cookies.playerChanceInfo;
    let tryAmountCookieInfo = tryAmount;
    tryAmountCookieInfo++;
    const pokemon = user?.userFlattenedPokemon.find(
      (pokemon) => pokemon.id === user?.buddyId
    ) as FlattenedPokemon;
    // Check if the player catches the Pokémon
    const damagePercentage = calculateDamagePercentage(pokemon, pokemonToCatch); // Calculate damage percentage
    const catchSuccessRate = calculateCatchSuccessRate(damagePercentage); // Calculate catch success rate

    // Generate a random number between 0 and 1
    const randomChance = Math.random();

    // If the random number is less than the catch success rate, the player catches the Pokémon
    if (randomChance < catchSuccessRate && tryAmountCookieInfo < 3) {
      // Pokémon is caught
      // Add the Pokémon to the user's Pokémon collection or do whatever you need to do
      res.cookie("playerChanceInfo", {
        pokemonToCatch: pokemonToCatch,
        tryAmount: tryAmountCookieInfo,
        randomPokemonId: randomPokemonId,
      });
      user?.userFlattenedPokemon.push(pokemonToCatch);
      user?.userFlattenedPokemon.sort((a, b) => a.id - b.id);
      try {
        await client
          .db("pokemonBPR")
          .collection("userProfile")
          .updateOne(
            { id: user?.id },
            {
              $set: {
                userFlattenedPokemon: user?.userFlattenedPokemon,
              },
            }
          );
      } catch (error) {
        console.error("Error handling request:", error);
        res.status(500).send("An error occurred");
      }
      res.clearCookie("playerChanceInfo");
      changeName = true;
      res.render("vangen", {
        pokemonToCatch,
        user,
        alreadyOwned,
        randomPokemonId,
        changeName,
        tryAmount: tryAmountCookieInfo,
        message: "Gefeliciteerd! Je hebt de Pokémon gevangen!",
      });
      randomPokemonId;
    } else if (tryAmountCookieInfo <= 3) {
      res.cookie("playerChanceInfo", {
        pokemonToCatch: pokemonToCatch,
        tryAmount: tryAmountCookieInfo,
        randomPokemonId: randomPokemonId,
      });
      res.render("vangen", {
        pokemonToCatch,
        user,
        alreadyOwned,
        changeName,
        randomPokemonId,
        tryAmount: tryAmountCookieInfo,
        message: "Oh nee! De Pokémon is ontsnapt! Probeer het opnieuw!",
      });
    } else {
      res.clearCookie("playerChanceInfo");
      res.render("vangen", {
        pokemonToCatch,
        user,
        alreadyOwned,
        changeName,
        randomPokemonId,
        tryAmount: tryAmountCookieInfo,
        message: "Oh nee! De Pokémon is ontsnapt! Op naar de volgende Pokémon",
      });
    }
  }
});

app.get("/vergelijken", (req, res) => {
  const user = req.session.user;
  res.render("vergelijken", { user, pokemonList });
});
app.get("/getPokemonStats", (req, res) => {
  const user = req.session.user;
  let pokemonName: string;
  if (req.query.pokemonName) {
    pokemonName = req.query.pokemonName?.toString();
  } else {
    pokemonName = "";
  }
  const pokemon = user?.userFlattenedPokemon.find(
    (pokemon) => pokemon.name.toLowerCase() === pokemonName.toLowerCase()
  ) as FlattenedPokemon;
  const stats = pokemon;
  if (stats) {
    res.json(stats);
  } else {
    res.status(404).json({ error: "Pokemon not found" });
  }
});
app.get("/whoisthatpokemonReset", async (req, res) => {
  res.clearCookie("playerGuessInfo");
  res.redirect("whoisthatpokemon");
});
app.get("/whoisthatpokemon", async (req, res) => {
  const user = req.session.user;
  if (!req.cookies.playerGuessInfo) {
    const randomPokemonId = getRandomNumber(1, 1024);
    const pokemonToGuess = pokemonList.find(
      (pokemon) => pokemon?.id === randomPokemonId
    ) as FlattenedPokemon;
    res.cookie("playerGuessInfo", {
      pokemonToGuess: pokemonToGuess,
      tryAmount: 1,
      randomPokemonId: randomPokemonId,
    });
    res.render("whoisthatpokemon", {
      pokemonToGuess,
      user,
      randomPokemonId,
      tryAmount: 1,
      result: "",
      message: "WELKE POKÉMON IS DIT? ",
    });
  } else {
    // If the cookie exists, read values from it
    const { pokemonToGuess, tryAmount, randomPokemonId, result } =
      req.cookies.playerGuessInfo;
    let tryAmountCookieInfo = tryAmount;
    res.render("whoisthatpokemon", {
      pokemonToGuess,
      user,
      randomPokemonId,
      tryAmount: tryAmountCookieInfo,
      result: result,
      message: "WELKE POKÉMON IS DIT? ",
    });
  }
});
app.post("/whoisthatpokemon", async (req, res) => {
  const guess = req.body.guess.toLowerCase();
  const user = req.session.user;
  let { pokemonToGuess, tryAmount, randomPokemonId, result } =
    req.cookies.playerGuessInfo;
  let tryAmountCookieInfo = tryAmount;
  if (guess == pokemonToGuess.name) {
    const randomPokemonId = getRandomNumber(1, 1024);
    const pokemonToGuess = pokemonList.find(
      (pokemon) => pokemon?.id === randomPokemonId
    ) as FlattenedPokemon;
    const pokemon = user?.userFlattenedPokemon.find(
      (pokemon) => pokemon.id === user?.buddyId
    ) as FlattenedPokemon;
    const randomstat = getRandomNumber(0, 3);
    let stat = pokemon.stats[randomstat].base_stat + 1;
    pokemon.stats[randomstat].base_stat = stat;
    const userProfile = await client
      .db("pokemonBPR")
      .collection("userProfile")
      .updateOne(
        { id: user?.id },
        {
          $set: {
            userFlattenedPokemon: user?.userFlattenedPokemon,
          },
        }
      );
    res.cookie("playerGuessInfo", {
      pokemonToGuess: pokemonToGuess,
      tryAmount: tryAmountCookieInfo,
      randomPokemonId: randomPokemonId,
      result: result,
    });
    res.render("whoisthatpokemon", {
      pokemonToGuess,
      user,
      randomPokemonId,
      tryAmount: tryAmountCookieInfo,
      result: "Correct! Je POKÉMON is met 1 punt sterker",
      message: "WELKE POKÉMON IS DIT? ",
    });
  } else if (tryAmount >= 9) {
    res.redirect("whoisthatpokemonReset");
  } else {
    let tryAmountCookieInfo = tryAmount;
    tryAmountCookieInfo++;
    res.cookie("playerGuessInfo", {
      pokemonToGuess: pokemonToGuess,
      tryAmount: tryAmountCookieInfo,
      randomPokemonId: randomPokemonId,
      result: result,
    });
    res.render("whoisthatpokemon", {
      pokemonToGuess,
      user,
      randomPokemonId,
      tryAmount: tryAmountCookieInfo,
      result: "Probeer het opnieuw!",
      message: "WELKE POKÉMON IS DIT? ",
    });
  }
});

app.listen(app.get("port"), async () => {
  let hundredPokemon: any = [];
  await client.connect();
  userProfile = await client
    .db("pokemonBPR")
    .collection("userProfile")
    .find<UserProfile>({})
    .toArray();
  pokemonList = await client
    .db("pokemonBPR")
    .collection("pokemonList")
    .find<FlattenedPokemon>({})
    .toArray();
  async function fetchPokemonInfo(): Promise<FlattenedPokemon[]> {
    const response = await fetch(
      "https://pokeapi.co/api/v2/pokemon?limit=1024&offset=0"
    );
    const data: any = await response.json();
    const pokemonResults: any[] = data.results;
    const pokemonData: FlattenedPokemon[] = [];
    for (const pokemon of pokemonResults) {
      const pokemonResponse = await fetch(pokemon.url);
      const pokemonInfo: any = await pokemonResponse.json();
      async function fetchDataFromLink(link1: string): Promise<PokemonSpecies> {
        // Fetch data from link1
        const response = await fetch(link1);
        const pokemonSpeciesData = (await response.json()) as PokemonSpecies;
        return pokemonSpeciesData;
      }
      const speciesData = await fetchDataFromLink(pokemonInfo.species.url);

      const startIndex =
        speciesData.evolution_chain.url.indexOf("pokemon-species/") +
        "pokemon-species/".length;
      // Find the index of the next `/` after the startIndex
      const urlParts = speciesData.evolution_chain.url.split("/");
      const speciesId = parseInt(urlParts[urlParts.length - 2]);
      const flattenedPokemon: FlattenedPokemon = {
        id: pokemonInfo.id,
        name: pokemonInfo.name,
        won: 0,
        lost: 0,
        height: pokemonInfo.height,
        weight: pokemonInfo.weight,
        order: pokemonInfo.order,
        species: pokemonInfo.species.name,
        speciesId: speciesId,
        spriteBack: pokemonInfo.sprites.back_default,
        spriteFront: pokemonInfo.sprites.front_default,
        stats: pokemonInfo.stats.map((stat: any) => ({
          name: stat.stat.name,
          base_stat: stat.base_stat,
        })),
        types: pokemonInfo.types.map((type: any) => type.type.name),
      };

      pokemonData.push(flattenedPokemon);
    }

    return pokemonData;
  }

  if (pokemonList.length === 0) {
    const pokemonData = await fetchPokemonInfo();
    const insertionResults = await client
      .db("pokemonBPR")
      .collection("pokemonList")
      .insertMany(pokemonData);

    pokemonList.push(...pokemonData);
  }

  pokemonList.sort((a, b) => a.id - b.id);
});
