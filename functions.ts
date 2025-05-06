import { FlattenedPokemon } from "./index";

export function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}
export function calculateDamagePercentage(
  currentPokemon: FlattenedPokemon,
  targetPokemon: FlattenedPokemon
): number {
  /*Vind de aanvallende eigenschap van de huidige Pokémon*/
  const attackStat = currentPokemon.stats.find(
    (stat) => stat.name === "attack"
  );
  if (!attackStat) {
    throw new Error("Attack stat not found for currentPokemon");
  }

  /*Vind de verdedigende eigenschap van de doelpokémon*/
  const defenceStat = targetPokemon.stats.find(
    (stat) => stat.name === "defense"
  );
  if (!defenceStat) {
    throw new Error("Defense stat not found for targetPokemon");
  }

  const damage = 100 - defenceStat.base_stat + attackStat.base_stat;
  return damage;
}
export function calculateCatchSuccessRate(damagePercentage: number): number {
  // Use the damage percentage as the catch success rate
  // Ensure the success rate is within valid range (0 to 1)
  return Math.max(0, Math.min(damagePercentage / 100, 1));
}
export {};
