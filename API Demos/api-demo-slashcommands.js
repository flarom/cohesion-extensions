/**
 * @extension
 * @title API DEMO slash commands
 * @author Flarom
 * @description Creates a '/pokemon' slash command that fetches data from pokeapi
 * @icon raven
 * @color #2196F3
 */

CommandRegistry.register("pokemon", {
    description: "Fetch data from a pokémon",
    icon: "raven",
    exec: function() {
        showTextMenu(searchPokemon, "Enter a pokémon name", true);
        function searchPokemon(pkmnName) {
            network.fetch(`https://pokeapi.co/api/v2/pokemon/${pkmnName}`, function(data) {
                const md = `### ${data.name}
| Image  | ![${data.name}](${data.sprites.front_default})
| ------ | ---
| ID     | ${data.id}
| Height | ${data.height}
| Weight | ${data.weight}
| Type   | ${data.types.map(t => t.type.name).join(", ")}
| Cry    | ![${data.name}'s cry](${data.cries.latest})`;

                insertSnippet(md);
            });
        }
    }
})