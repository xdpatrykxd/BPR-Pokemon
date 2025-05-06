document.addEventListener("DOMContentLoaded", function () {
  var submitCompare1 = document.getElementById("submit-compare1");

  // Get initial Pokémon data from the data attribute
  var initialPokemonDataElement = document.getElementById("pokemon-data");
  var pokemonToDisplay = JSON.parse(
    initialPokemonDataElement.getAttribute("data-pokemon")
  );
  var comparePokemonToDisplay = { stats: [] }; // Variable for comparison Pokémon

  submitCompare1.addEventListener("click", function () {
    var pokemonName1 = document.getElementById("search-input-1").value;
    fetchPokemonStats(pokemonName1);
  });

  function fetchPokemonStats(pokemonName) {
    // Fetch Pokémon data based on the name
    fetch("/getPokemonStats?pokemonName=" + pokemonName)
      .then((response) => response.json())
      .then((data) => {
        // Assign the fetched Pokémon data to the comparison variable
        comparePokemonToDisplay = data;

        // If comparePokemonToDisplay is available, render its stats
        if (comparePokemonToDisplay) {
          renderPokemonStats(comparePokemonToDisplay);
        }
      })
      .catch((error) => {
      });
  }

  function renderPokemonStats(pokemon) {
    // Populate comparison Pokémon name and image
    var comparePokemonName = document.getElementById("compare-pokemon-name");
    var comparePokemonImage = document.getElementById("compare-pokemon-image");

    if (comparePokemonName) {
      comparePokemonName.textContent = pokemon.name;
    }
    if (comparePokemonImage) {
      comparePokemonImage.src = pokemon.spriteFront;
      if (pokemon.spriteFront == undefined) {
        comparePokemonImage.classList.add("hide");
      } else {
        comparePokemonImage.classList.remove("hide");
      }
    }

    // Populate Pokémon stats and compare them with the initial Pokémon
    compareAndDisplayStat(
      pokemon.won,
      pokemonToDisplay.won,
      "compare-pokemon-won"
    );
    compareAndDisplayStat(
      pokemon.lost,
      pokemonToDisplay.lost,
      "compare-pokemon-lost"
    );
    compareAndDisplayStat(
      pokemon.stats[0].base_stat,
      pokemonToDisplay.stats[0].base_stat,
      "compare-pokemon-stat1"
    );
    compareAndDisplayStat(
      pokemon.stats[1].base_stat,
      pokemonToDisplay.stats[1].base_stat,
      "compare-pokemon-stat2"
    );
    compareAndDisplayStat(
      pokemon.stats[2].base_stat,
      pokemonToDisplay.stats[2].base_stat,
      "compare-pokemon-stat3"
    );
    compareAndDisplayStat(
      pokemon.stats[3].base_stat,
      pokemonToDisplay.stats[3].base_stat,
      "compare-pokemon-stat4"
    );
    compareAndDisplayStat(
      pokemon.stats[4].base_stat,
      pokemonToDisplay.stats[4].base_stat,
      "compare-pokemon-stat5"
    );
    compareAndDisplayStat(
      pokemon.stats[5].base_stat,
      pokemonToDisplay.stats[5].base_stat,
      "compare-pokemon-stat6"
    );

    // Remove hide class from Pokémon name and stats
    toggleVisibility("compare-pokemon-lost-td", false);
    toggleVisibility("compare-pokemon-won-td", false);
    toggleVisibility("compare-pokemon-lost", false);
    toggleVisibility("compare-pokemon-won", false);
    toggleVisibility("compare-pokemon-name", false);
    toggleVisibility("compare-pokemon-name-th", false);
    toggleVisibility("compare-pokemon-stat1", false);
    toggleVisibility("compare-pokemon-stat2", false);
    toggleVisibility("compare-pokemon-stat3", false);
    toggleVisibility("compare-pokemon-stat4", false);
    toggleVisibility("compare-pokemon-stat5", false);
    toggleVisibility("compare-pokemon-stat6", false);
  }

  function compareAndDisplayStat(compareStat, originalStat, elementId) {
    var compareElement = document.getElementById(elementId);

    if (!compareElement) {
      return;
    }

    if (elementId === "compare-pokemon-won") {
      var originalElement = document.getElementById("compare-pokemon-won-td");
    } else if (elementId === "compare-pokemon-lost") {
      var originalElement = document.getElementById("compare-pokemon-lost-td");
    } else {
      var originalElement = compareElement.previousElementSibling;
    }

    if (!originalElement) {
      return;
    }

    if (compareStat > originalStat) {
      compareElement.textContent = compareStat;
      compareElement.classList.add("stat-high");
      compareElement.classList.remove("stat-low");

      originalElement.classList.add("stat-low");
      originalElement.classList.remove("stat-high");
    } else if (compareStat < originalStat) {
      compareElement.textContent = compareStat;
      compareElement.classList.add("stat-low");
      compareElement.classList.remove("stat-high");

      originalElement.classList.add("stat-high");
      originalElement.classList.remove("stat-low");
    } else {
      compareElement.textContent = compareStat;
      compareElement.classList.remove("stat-high", "stat-low");
      originalElement.classList.remove("stat-high", "stat-low");
    }
  }

  function toggleVisibility(elementId, hide) {
    var element = document.getElementById(elementId);
    if (element) {
      element.classList.toggle("hide", hide);
    }
  }
});
