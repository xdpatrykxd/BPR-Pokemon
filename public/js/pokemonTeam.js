document.getElementById("showMyPokemon").addEventListener("click", function () {
  document.querySelectorAll(".pokemonNotOwned").forEach(function (element) {
    element.style.display = "none";
  });
});

document
  .getElementById("showAllPokemon")
  .addEventListener("click", function () {
    document.querySelectorAll(".pokemonNotOwned").forEach(function (element) {
      element.style.display = "block";
    });
  });
document
  .querySelector(".search-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const searchTerm = document
      .getElementById("pokemon-search-input")
      .value.toLowerCase();
    document.querySelectorAll(".pokemon-item").forEach(function (element) {
      const name = element.getAttribute("data-name").toLowerCase();
      const id = element.getAttribute("data-id").toLowerCase();
      if (name.includes(searchTerm) || id.includes(searchTerm)) {
        element.style.display = "block";
      } else {
        element.style.display = "none";
      }
    });
  });
