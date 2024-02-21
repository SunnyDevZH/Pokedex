let pokemon = [];
let audio = new Audio('audio/Pokemon.mp3');
let currentOffset = 0; // Variable zum Verfolgen des aktuellen Offsets

async function loadPokemon(limit) {
    const totalPokemonCount = await getTotalPokemonCount();
    const loadingBar = document.getElementById('loadingBar');

    for (let i = currentOffset + 1; i <= Math.min(currentOffset + limit, totalPokemonCount); i++) {
        let url = `https://pokeapi.co/api/v2/pokemon/${i}`;
        let response = await fetch(url);

        if (response.ok) {
            let currentPokemon = await response.json();
            pokemon.push(currentPokemon);
        } else {
            console.error(`Failed to fetch data for Pokemon with ID ${i}`);
        }

        // Aktualisiere den Ladebalken basierend auf dem Fortschritt
        loadingBar.style.width = `${((i - currentOffset) / limit) * 100}%`;
    }

    // Aktualisiere den Offset für das nächste Laden von Pokémon
    currentOffset += limit;

    // Setze den Ladebalken auf 0, wenn das Laden abgeschlossen ist
    loadingBar.style.width = '0';

    filterPokemonNamesBySearchTerm();
}


async function getTotalPokemonCount() {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1');
    const data = await response.json();
    return data.count;
}

function renderPokemonInfo(filteredPokemonNames) {
    const about = document.getElementById('aboutPokemon');

    if (!about) {
        console.error("Element with ID 'aboutPokemon' not found.");
        return;
    }

    about.innerHTML = ''; // Vorherigen Inhalt leeren, bevor neue Daten gerendert werden

    for (let j = 0; j < pokemon.length; j++) {
        const currentPokemon = pokemon[j];

        if (!currentPokemon || !currentPokemon.name) {
            // Überspringen der Anzeige, wenn currentPokemon nicht definiert ist oder keinen Namen hat
            continue;
        }

        if (filteredPokemonNames.includes(currentPokemon.name)) {
            // Extrahiere die ersten 10 Moves
            const first10Moves = currentPokemon['moves'].slice(0, 10);

            about.innerHTML += `
            <div class="infoCard" onclick="toggleZoom(this)">
                <div>
                    <div id="pokedex"> 
                        <h1>${currentPokemon['name']}</h1>
                        <img class="pokemonImage" src="${currentPokemon['sprites']['other']['official-artwork']['front_default']}">
                    </div>
                </div>

                <div id="container" class="container">
                    <div class="margin">
                        <h2> About: </h2>
                        <p>Grösse: ${currentPokemon['height']} m</p>
                        <p>Gewicht: ${currentPokemon['weight']} kg</p>
                        <p>Erfahrungen: ${currentPokemon['base_experience']}</p>
                    </div>

                    <div class="margin">
                        <h2> Base Stats: </h2>
                        <p>HP: ${currentPokemon['stats']['0']['base_stat']} </p>
                        <p>Attack: ${currentPokemon['stats']['1']['base_stat']} </p>
                        <p>Defense: ${currentPokemon['stats']['2']['base_stat']} </p>
                        <p>Special-attack: ${currentPokemon['stats']['3']['base_stat']} </p>
                        <p>Special-defense: ${currentPokemon['stats']['4']['base_stat']} </p>
                        <p>Speed: ${currentPokemon['stats']['5']['base_stat']} </p>
                    </div>

                    <div class="margin">
                        <h2> Type: </h2>
                        <p>Art: ${currentPokemon['types'][0]['type']['name']}</p>
                    </div>

                    <div class="margin">
                        <h2> Moves: </h2>
                        <ul>
                            ${first10Moves.map(move => `<li>${move['move']['name']}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>`;
        }
    }
}

function filterPokemonNamesBySearchTerm() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredPokemonNames = pokemon
        .filter((p) => p.name.toLowerCase().includes(searchTerm))
        .map((p) => p.name);

    console.log(filteredPokemonNames);
    renderPokemonInfo(filteredPokemonNames);
}

function toggleZoom(element) {
    element.classList.toggle('zoomed');
}

function loadMorePokemon(limit) {
    loadPokemon(limit);
}

function playAudio() {
    audio.play();
}

// Funktion zum Anhalten des Audio
function pauseAudio() {
    audio.pause();
}
