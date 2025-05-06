document.addEventListener("DOMContentLoaded", function () {
  // Add event listener to the fight button
  var fightBtn = document.getElementById("fight-btn");
  if (fightBtn) {
    fightBtn.addEventListener("click", function () {
      // Retrieve pokemon and pokemonToFight data from data attributes
      var pokemonData = JSON.parse(fightBtn.getAttribute("data-pokemon"));
      var pokemonToFightData = JSON.parse(
        fightBtn.getAttribute("data-pokemon-to-fight")
      );

      // Call animateBattle function with the retrieved data
      animateBattle(pokemonData, pokemonToFightData);

      // Remove the fight button
      fightBtn.remove();
    });
  } else {
  }
});

function animateBattle(pokemon, pokemonToFight) {
  var pokemonSprite = document.getElementById("pokemon1-sprite");
  var pokemonToFightSprite = document.getElementById("pokemon2-sprite");

  // Animate Pokémon sprites
  pokemonSprite.classList.add("pokemon");
  pokemonToFightSprite.classList.add("pokemon-to-fight");

  // Define initial HP values
  var pokemonCurrentHp = pokemon.stats[0].base_stat;
  var pokemonToFightCurrentHp = pokemonToFight.stats[0].base_stat;

  // Define a function for the battle loop
  function battleLoop() {
    // Check if any Pokémon's HP drops to 0 or below, if so, end the battle
    if (pokemonCurrentHp <= 0) {
      displayText("battle-text-winner", pokemonToFight.name + " wins!");
      displayReset("battle-reset", "volgend gevecht");
      updateHpBar("pokemon1-hp-bar", 0, pokemon.stats[0].base_stat);
      callResultEndpoint("/lost");
      return;
    } else if (pokemonToFightCurrentHp <= 0) {
      displayText("battle-text-winner", pokemon.name + " wins!");
      displayReset("battle-reset", "volgend gevecht");
      updateHpBar("pokemon2-hp-bar", 0, pokemonToFight.stats[0].base_stat);
      callResultEndpoint("/won");
      return;
    }

    // Get the attack and defense stats for each Pokémon
    var pokemonAttack = pokemon.stats[1].base_stat;
    var pokemonDefense = pokemon.stats[2].base_stat;
    var pokemonToFightAttack = pokemonToFight.stats[1].base_stat;
    var pokemonToFightDefense = pokemonToFight.stats[2].base_stat;

    // Calculate damage dealt by each Pokémon
    var damageDealtByPokemon = calculateDamage(
      pokemonAttack,
      pokemonToFightDefense
    );
    var damageDealtByPokemonToFight = calculateDamage(
      pokemonToFightAttack,
      pokemonDefense
    );

    // Reduce opponent's HP based on the damage dealt
    pokemonToFightCurrentHp -= damageDealtByPokemon;
    pokemonCurrentHp -= damageDealtByPokemonToFight;

    // Update HP bars with new HP values
    var pokemonMaxHp = pokemon.stats[0].base_stat;
    var pokemonToFightMaxHp = pokemonToFight.stats[0].base_stat;
    updateHpBar("pokemon1-hp-bar", pokemonCurrentHp, pokemonMaxHp);
    updateHpBar(
      "pokemon2-hp-bar",
      pokemonToFightCurrentHp,
      pokemonToFightMaxHp
    );

    // Display text for moves and hits
    displayText(
      "battle-text-pokemon1",
      "Pokemon " + pokemon.name + " dealt " + damageDealtByPokemon + " damage!"
    );
    displayText(
      "battle-text-pokemon2",
      "Pokemon " +
        pokemonToFight.name +
        " dealt " +
        damageDealtByPokemonToFight +
        " damage!"
    );

    // Call battleLoop again after a delay (e.g., 1000 milliseconds)
    setTimeout(battleLoop, 1000);
  }

  // Start the battle loop
  battleLoop();
}

function displayText(elementId, text) {
  // Get the battle text element
  var battleText = document.getElementById(elementId);

  // Create a new paragraph element
  var paragraph = document.createElement("p");

  // Set the text content of the paragraph element
  paragraph.textContent = text;

  // Append the paragraph element to the battle text element
  battleText.appendChild(paragraph);
}

function displayReset(elementId, text) {
  // Get the battle text element
  var battleText = document.getElementById(elementId);

  var anchor = document.createElement("a");
  var buttonRESET = document.createElement("button");

  // Set the text content of the paragraph element
  buttonRESET.textContent = text;
  anchor.href = "./battler";
  anchor.appendChild(buttonRESET);
  // Append the paragraph element to the battle text element
  battleText.appendChild(anchor);
}

function callResultEndpoint(endpoint) {
  fetch(endpoint, {
    method: "POST",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {})
    .catch((error) => {});
}

function clearBattleText() {
  var battleText = document.getElementById("battle-text");
  battleText.innerHTML = "";
}

// Function to calculate damage based on attack and defense stats
function calculateDamage(attack, defense) {
  // You can use any formula for damage calculation here
  var damage =
  (attack * Math.floor(Math.random() * 30)) /(defense * 2);
  return Math.ceil(damage > 0 ? damage : 0);
}

function updateHpBar(barId, currentHp, maxHp) {
  // Calculate the width percentage based on current and max HP
  var widthPercentage = (currentHp / maxHp) * 100;

  // Get the HP bar element and update its width
  var hpBar = document.getElementById(barId);
  hpBar.style.width = widthPercentage + "%";
}
