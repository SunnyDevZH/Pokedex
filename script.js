let showNumberPokemons = 20;
let pokemons = [];

/**
 * Initialisiert die Anwendung, lädt Pokémon-Daten und versteckt das Popup.
 */
function render() {
    loadPokemons();
    hidePopup();
}

/**
 * Lädt die Pokémon-Liste von der API, holt für jedes Pokémon die Detaildaten,
 * speichert sie im Array und rendert die Karten. Zeigt und versteckt dabei den Ladescreen.
 */
async function loadPokemons() {
    document.getElementById('loadingScreen').style.display = 'block';

    const BASE_URL = `https://pokeapi.co/api/v2/pokemon?limit=${showNumberPokemons}&offset=0`;
    const response = await fetch(BASE_URL);
    const data = await response.json();

    for (const { url } of data.results) {
        const response = await fetch(url);
        const pokemon = await response.json();
        pokemons.push(pokemon);
    }

    renderPokemons();

    document.getElementById('loadingScreen').style.display = 'none';
}

/**
 * Rendert alle geladenen Pokémon als Karten im Content-Container.
 */
function renderPokemons() {
    const contentContainer = document.getElementById('content');
    contentContainer.innerHTML = '';
    pokemons.forEach(pokemon => {
        contentContainer.innerHTML += createPokemonCard(pokemon);
    });
}

/**
 * Rendert nur die neu hinzugefügten Pokémon ab dem angegebenen Startindex.
 * @param {number} startIndex - Index ab dem neue Pokémon gerendert werden.
 */
function renderNewPokemons(startIndex) {
    const contentContainer = document.getElementById('content');
    for (let i = startIndex; i < pokemons.length; i++) {
        contentContainer.innerHTML += createPokemonCard(pokemons[i]);
    }
}

/**
 * Lädt weitere Pokémon (10 Stück), fügt sie dem Array hinzu und rendert nur die neuen Karten.
 * Zeigt und versteckt dabei den Ladescreen.
 */
async function loadMore() {
    document.getElementById('loadingScreen').style.display = 'block';

    const currentLength = pokemons.length;
    const BASE_URL = `https://pokeapi.co/api/v2/pokemon?limit=10&offset=${currentLength}`;
    const response = await fetch(BASE_URL);
    const data = await response.json();

    for (const { url } of data.results) {
        const response = await fetch(url);
        const pokemon = await response.json();
        pokemons.push(pokemon);
    }

    renderNewPokemons(currentLength);

    console.log(showNumberPokemons);

    document.getElementById('loadingScreen').style.display = 'none';
}

/**
 * Zeigt das Popup mit Detailinformationen zu einem bestimmten Pokémon an.
 * @param {number} i - Die ID des Pokémon.
 */
async function showPopup(i) {
    let popup = document.getElementById('popup');
    popup.classList.remove('d-none');
    let url = `https://pokeapi.co/api/v2/pokemon/${i}`;
    let response = await fetch(url);
    let pokemon = await response.json();
    let infoCardContainer = document.getElementById('infoCard');
    infoCardContainer.innerHTML = createPokemonPopup(pokemon);
}

/**
 * Versteckt das Popup-Fenster.
 */
function hidePopup() {
    let popup = document.getElementById('popup');
    popup.classList.add('d-none');
}

/**
 * Schließt das Popup-Fenster (identisch zu hidePopup).
 */
function closePopup() {
    let popup = document.getElementById('popup');
    popup.classList.add('d-none');
}

/**
 * Zeigt die Basiswerte (HP, Angriff, Verteidigung) eines Pokémon als Balkendiagramm an.
 * @param {number|string} pokemon - Die ID oder der Name des Pokémon.
 */
async function showStats(pokemon) {
    const infoCardContent = document.getElementById('infoCardContent');
    infoCardContent.innerHTML = getChartTemplate();

    const url = `https://pokeapi.co/api/v2/pokemon/${pokemon}`;
    const responseStats = await fetch(url);
    const stats = await responseStats.json();

    const { base_stat: hp } = stats['stats'][0];
    const { base_stat: attack } = stats['stats'][1];
    const { base_stat: defense } = stats['stats'][2];

    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['HP', 'Attack', 'Defense'],
            datasets: [{
                label: 'Wert',
                data: [hp, attack, defense],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    max: 200,
                    ticks: {
                        color: '#2591c7'
                    },
                    grid: {
                        color: '#494949'
                    }
                },
                y: {
                    ticks: {
                        color: '#2591c7'
                    },
                    grid: {
                        color: '#494949'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#2591c7'
                    }
                }
            }
        }
    });
}

/**
 * Zeigt die Evolutionskette eines Pokémon als Bildreihe mit Pfeilen an.
 * @param {number|string} pokemonId - Die ID des Pokémon.
 */
async function showEvolution(pokemonId) {
    const infoCardContent = document.getElementById('infoCardContent');
    infoCardContent.innerHTML = '';

    const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`;
    const speciesResponse = await fetch(speciesUrl);
    const speciesData = await speciesResponse.json();
    const evolutionChainUrl = speciesData.evolution_chain.url;

    const responseEvolution = await fetch(evolutionChainUrl);
    const evolutionData = await responseEvolution.json();

    function getIdFromUrl(url) {
        const parts = url.split('/');
        return parts[parts.length - 2];
    }

    function getEvolutions(chain, count = 0) {
        const evolutions = [];
        const id = getIdFromUrl(chain.species.url);
        evolutions.push(getEvolutionImageTemplate(id));

        if (count < 2 && chain.evolves_to.length > 0) {
            evolutions.push(getEvolutionArrowTemplate());
            chain.evolves_to.forEach(evolution => {
                evolutions.push(...getEvolutions(evolution, count + 1));
            });
        }

        return evolutions;
    }

    const firstThreeEvolutions = getEvolutions(evolutionData.chain).slice(0, 5).join('');
    infoCardContent.innerHTML = firstThreeEvolutions;
}

/**
 * Zeigt Gewicht und Größe eines Pokémon als Tabelle im Info-Panel an.
 * @param {number|string} pokemonid - Die ID oder der Name des Pokémon.
 */
async function showPokemonInfo(pokemonid) {
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonid}`;
    const responseInformation = await fetch(url);
    const information = await responseInformation.json();
    const weight = information['weight'] / 10;
    const height = information['height'] / 10;

    const infoCardContent = document.getElementById('infoCardContent');
    infoCardContent.innerHTML = getInfoTableTemplate(weight, height);
}

/**
 * Filtert die Pokémon-Liste nach dem eingegebenen Suchbegriff und zeigt passende Karten an.
 */
async function filterNames() {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${showNumberPokemons}`;
    const response = await fetch(url);
    const data = await response.json();

    let search = document.getElementById('searchPokemon').value;
    search = search.toLowerCase();

    let contentContainer = document.getElementById('content');
    contentContainer.innerHTML = '';

    let pokemons = data.results;

    for (let i = 0; i < pokemons.length; i++) {
        let pokemonName = pokemons[i].name;
        if (pokemonName.toLowerCase().includes(search)) {
            let pokemonDetailResponse = await fetch(pokemons[i].url);
            let pokemon = await pokemonDetailResponse.json();
            contentContainer.innerHTML += createPokemonCard(pokemon);
        }
    }
}