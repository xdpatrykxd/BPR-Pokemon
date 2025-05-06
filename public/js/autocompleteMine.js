// pokemon-autocomplete.js
document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("search-input-1");
  const datalist = document.getElementById("pokemonNames");
  if (input) {
    // Fetch pokemonList from the server
    fetch("/myPokemonList")
      .then((response) => response.json())
      .then((pokemonList) => {
        // Populate the datalist with Pokémon names from pokemonList
        pokemonList.forEach((pokemon) => {
          const option = document.createElement("option");
          option.value = pokemon.name;
          datalist.appendChild(option);
        });

        // Enable autocomplete for the input field
        input.setAttribute("list", "pokemonNames");
      })
      .catch((error) => console.error("Error fetching pokemonList:", error));
  }
});
