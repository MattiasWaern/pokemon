// DOM Elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-btn');
const resultsInfo = document.getElementById('results-info');
const typeFilter = document.getElementById('type-filter');
const resetButton = document.getElementById('reset-btn');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');
const pokemonGrid = document.getElementById('pokemon-grid');
const pageInfo = document.getElementById('page-info');
const error = document.getElementById('error');
const errorText = document.getElementById('error-text');
const loading = document.getElementById('loading');

// Card Elements
const card = document.getElementById('pokemon-card');
const closeCard = document.getElementById('close-card');
const cardName = document.getElementById('card-name');
const cardId = document.getElementById('card-id');
const cardImage = document.getElementById('card-image');
const modalTypes = document.getElementById('card-types');
const cardHeight = document.getElementById('card-height');
const cardWeight = document.getElementById('card-weight');
const cardExp = document.getElementById('card-exp');
const cardAbilities = document.getElementById('card-abilities');
const cardStats = document.getElementById('card-stats');
const cardMoves = document.getElementById('card-moves');
const cardEvolution = document.getElementById('card-evolution');


// Pokemon type colors mapping
const typeColors = {
    grass: 'var(--grass)',
    fire: 'var(--fire)',
    water: 'var(--water)',
    bug: 'var(--bug)',
    normal: 'var(--normal)',
    poison: 'var(--poison)',
    electric: 'var(--electric)',
    ground: 'var(--ground)',
    fairy: 'var(--fairy)',
    fighting: 'var(--fighting)',
    psychic: 'var(--psychic)',
    rock: 'var(--rock)',
    ghost: 'var(--ghost)',
    ice: 'var(--ice)',
    dragon: 'var(--dragon)',
    dark: 'var(--dark)',
    steel: 'var(--steel)',
    flying: 'var(--flying)'
};

// Genarations
const generations = [
    { name: 'Gen I', start: 1, end: 151 },
    { name: 'Gen II', start: 152, end: 251 },
    { name: 'Gen III', start: 252, end: 386 },
    { name: 'Gen IV', start: 387, end: 493 },
    { name: 'Gen V', start: 494, end: 649 },
    { name: 'Gen VI', start: 650, end: 721 },
    { name: 'Gen VII', start: 722, end: 809 },
    { name: 'Gen VIII', start: 810, end: 905 },
    { name: 'Gen IX', start: 906, end: 1025 },
]


// Stat colors 

const statColors = {
    hp: '#FF5959',
    attack: '#F5AC78',
    defense: '#FAE078',
    'special-attack': '#9DB7F5',
    'special-defense': '#A7DB8D',
    speed: '#FA92B2'
};

// App state

let currentPage = 1;
let totalPages = 44; 
let currentTypeFilter = 'all';
let currentGenFilter = 'all';
let pokemonData = [];
let displayPokemon = [];
let currentPokemonDetail = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeFilters();
    loadPokemon();


    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    resetButton.addEventListener('click', resetFilters);
    prevButton.addEventListener('click', () => changePage(-1));
    nextButton.addEventListener('click', () => changePage(+1));

    closeCard.addEventListener('click', () => {
        card.classList.remove('active');
    });

    card.addEventListener('click', (e) => {
        if (e.target === card) {
            card.classList.remove('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && card.classList.contains('active')) {
            card.classList.remove('active');
        }
    });
});

function initializeFilters(){
    initializeTypeFilters();

    initializeGenerationsFilters();
}

function initializeTypeFilters() {
    const types = Object.keys(typeColors);

    const allButton = document.createElement('button');
    allButton.className = 'type-btn active';
    allButton.textContent = 'All';
    allButton.style.background = 'var(--primary-color)';
    allButton.dataset.type = 'all';
    allButton.addEventListener('click', () => filterByType('all'));
    typeFilter.appendChild(allButton);

    const favoritesButton = document.createElement('button');
    favoritesButton.className = 'type-btn';
    favoritesButton.textContent = '⭐ Favorites';
    favoritesButton.style.background = '#ff6b6b';
    favoritesButton.dataset.type = 'favorites';
    favoritesButton.addEventListener('click', () => filterByFavorites());
    typeFilter.appendChild(favoritesButton);

    types.forEach(type => {
        const button = document.createElement('button');
        button.className = 'type-btn';
        button.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        button.style.background = typeColors[type];
        button.dataset.type = type;
        button.addEventListener('click', () => filterByType(type));
        typeFilter.appendChild(button);

    });
}

function initializeGenerationsFilters(){
    const genFilterContainer = document.getElementById('gen-filter');

    if(!genFilterContainer){
        const container = document.createElement('div');
        container.id = 'gen-filter';
        container.className = 'filter-section';

        const label = document.createElement('h3');
        label.textContent = 'Generation';
        label.className = 'filter-label';

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'gen-buttons';

        container.appendChild(label);
        container.appendChild(buttonsContainer);

        const typeFilterSection = document.querySelector('.filter-section');
        if(typeFilterSection && typeFilterSection.parentNode) {
            typeFilterSection.parentNode.insertBefore(container, typeFilterSection.nextSibling);
        }
    }

    const genButtons = document.querySelector('.gen-buttons') || document.getElementById('gen-filter');

    
    generations.forEach((gen, index) => {
        const button = document.createElement('button');
        button.className = 'gen-btn';
        button.textContent = gen.name;
        button.dataset.gen = index;
        button.addEventListener('click', () => filterByGeneration(index));
        genButtons.appendChild(button);
    });
}

async function filterByFavorites(){
    const favorites = getFavorites();

    if(favorites.length === 0) {
        showError('You have no favorite pokemon yet!!')
        return;
    }

    showLoading();


    try {
        const favoritePokemon = await Promise.all(
            favorites.map(async (id) => {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
                return response.json();
            })
        );

        pokemonData = favoritePokemon;
        displayPokemon = favoritePokemon;
        currentTypeFilter = 'favorites';

        applyFilters();

        updateTypeFilterButtons();
        updatePokemonGrid();
        updateResultsInfo(`Showing ${favoritePokemon.length} favorite pokemon`);
        updatePagination(true);
        hideLoading();
    } catch (err){
        showError('Failed to load favorite pokemon');
        hideLoading();
    }
}



async function loadPokemon(){
    showLoading();
    hideError();

    try{
        const offset = (currentPage - 1) * 30;

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=30&offset=${offset}`);
        const data = await response.json();

        const detailedPokemon = await Promise.all(
            data.results.map(async (pokemon) => {
                const pokemonResponse = await fetch(pokemon.url);
                return pokemonResponse.json();
            })
        );

        pokemonData = detailedPokemon;
        displayPokemon = detailedPokemon;

        updatePokemonGrid();
        updateResultsInfo();
        updatePagination();
        hideLoading();
    } catch (error) {
        showError('Failed to load Pokemon data. Please try again.');
        hideLoading();
        console.error(error);
    }
}

function updatePokemonGrid() {
    pokemonGrid.innerHTML = '';

    if(displayPokemon.length === 0) {
        pokemonGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; font-size: 1.2rem;">No Pokemon found matching your search.</div>';

        return;
    }

    displayPokemon.forEach(pokemon => {
        const pokemonCard = createPokemonCard(pokemon);
        pokemonGrid.appendChild(pokemonCard);
    });
}

function createPokemonCard(pokemon){
    const card = document.createElement('div');
    card.className = 'pokemon-card';

    const pokemonId = pokemon.id.toString().padStart(3, '0');
    const primaryType = pokemon.types[0].type.name;

    const pokemonGen = generations.findIndex(gen =>
        pokemon.id >= gen.start && pokemon.id <= gen.end
    );

    const genName = pokemonGen !== -1 ? generations[pokemonGen].name : '';

    const isFavorite = checkIfFavorite(pokemon.id);

    /* THE ANIMATIONS FOR "POKEMON-IMAGE"
    <img src="https://play.pokemonshowdown.com/sprites/ani/${pokemon.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.gif"
        onerror="this.src='${pokemon.sprites.other['official-artwork'].front_default}'"
        alt="${pokemon.name}">

    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemon.id}.gif"
        onerror="this.src='${pokemon.sprites.other['official-artwork'].front_default}'"
        alt="${pokemon.name}">
    */ 

    card.innerHTML = 
    `
    <div class="pokemon-card-header">
        <div class="pokemon-id-group">
            <span class="pokemon-id">#${pokemonId}</span>
            ${genName ? `<span class="gen-badge">${genName}</span>` : ''}
        </div>
        <h3 class="pokemon-name">${pokemon.name}</h3>
        <div class="card-actions">
            <button class="shiny-toggle" title="Toggle Shiny">✨</button>
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-pokemon-id="${pokemon.id}">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    </div>

    <div class="pokemon-image">
        <img src="https://play.pokemonshowdown.com/sprites/ani/${pokemon.name.toLowerCase()}.gif"
        data-normal = "https://play.pokemonshowdown.com/sprites/ani/${pokemon.name.toLowerCase()}.gif"
        data-shiny = "https://play.pokemonshowdown.com/sprites/ani-shiny/${pokemon.name.toLowerCase()}.gif"
        onerror="this.src='${pokemon.sprites.other['official-artwork'].front_default}'"
        alt="${pokemon.name}">  
    </div>

    

    <div class="pokemon-types">
        ${pokemon.types.map(typeInfo => {
            const typeName = typeInfo.type.name;
            return `<span class="type-badge" style="background: ${typeColors[typeName]}">${typeName}</span>`;
        
        }).join('')}
    </div>

    <div class="pokemon-stats">
        <div class="stat">
            <div class="stat-label">Height</div>
            <div class="stat-value">${pokemon.height / 10}m</div>
        </div>
         <div class="stat">
            <div class="stat-label">Weight</div>
            <div class="stat-value">${pokemon.weight / 10}kg</div>
        </div>
         <div class="stat">
            <div class="stat-label">HP</div>
            <div class="stat-value">${pokemon.stats[0].base_stat}</div>
        </div>
    </div>
    `;

    const favoriteBtn = card.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(pokemon.id);
            favoriteBtn.classList.toggle('active');
        });

    const shinyBtn = card.querySelector('.shiny-toggle');
    const img = card.querySelector('.pokemon-image img');
    let isShiny = false;

    shinyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isShiny = !isShiny;

        if(isShiny){
            img.src = img.dataset.shiny;
            shinyBtn.classList.add('active');
            shinyBtn.textContent = '⭐';
        } else {
            img.src = img.dataset.normal;
            shinyBtn.classList.remove('active');
            shinyBtn.textContent = '✨';
        }
    });


    card.addEventListener('click', () => {
        showPokemonDetail(pokemon);
    });

    return card;
}


//Show detailed card for pokemon..
async function showPokemonDetail(pokemon){
    showLoading();
    currentPokemonDetail = pokemon;

    try {
        cardName.textContent = pokemon.name;
        cardId.textContent = `#${pokemon.id.toString().padStart(3, '0')}`

        const img = cardImage.querySelector('img') || document.createElement('img');
        const normalSprite = `${pokemon.sprites.other['official-artwork'].front_default}`;
        const shinySprite = `${pokemon.sprites.other['official-artwork'].front_shiny}`;
        
        img.src = normalSprite;
        img.alt = pokemon.name;
        img.dataset.normal = normalSprite;
        img.dataset.shiny = shinySprite;

        if (!cardImage.querySelector('img')) {
            cardImage.appendChild(img);
        }

        let shinyToggle = cardImage.querySelector('.shiny-toggle-modal');
        if(!shinyToggle){
            shinyToggle = document.createElement('button'); 
            shinyToggle.className = 'shiny-toggle-modal';
            shinyToggle.textContent = '✨ Toggle Shiny';
            cardImage.appendChild(shinyToggle);
        }

        let isShiny = false;
        shinyToggle.onclick = () => {
            isShiny = !isShiny;
            if(isShiny){
                img.src = shinySprite;
                shinyToggle.textContent = '⭐ Normal'
                shinyToggle.classList.add('active');
            } else {
                img.src = normalSprite;
                shinyToggle.textContent = '✨ Toggle Shiny'
                shinyToggle.classList.remove('active');
            }
        };

        modalTypes.innerHTML = '';
        pokemon.types.forEach(typeInfo => {
            const typeName = typeInfo.type.name;
            const typeBadge = document.createElement('span');
            typeBadge.className = 'type-badge';
            typeBadge.textContent = typeName;
            typeBadge.style.background = typeColors[typeName];
            modalTypes.appendChild(typeBadge);
        });

        cardHeight.textContent  = `${pokemon.height / 10}m`;
        cardWeight.textContent  = `${pokemon.weight / 10}kg`;
        cardExp.textContent  = pokemon.base_experience || 'N/A';


        cardAbilities.innerHTML = '';
        pokemon.abilities.forEach(abilityInfo => {
            const ability = document.createElement('span');
            ability.className = `ability ${abilityInfo.is_hidden ? 'hidden-ability' : ''}`;
            ability.textContent = abilityInfo.ability.name.replace('-', ' ');

            if(abilityInfo.is_hidden) {
                ability.title = 'Hidden Ability';
            }
            cardAbilities.appendChild(ability);
        });

        cardStats.innerHTML = '';
        pokemon.stats.forEach(statInfo => {
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';

            const statName = document.createElement('span');
            statName.className = 'stat-name';
            statName.textContent = statInfo.stat.name.replace('-', ' ');

            const statBarContainer = document.createElement('div');
            statBarContainer.className = 'stat-bar-container';

            const statBar = document.createElement('div');
            statBar.className = 'stat-bar';
            const statValue = statInfo.base_stat;
            const percentage = Math.min(100, (statValue / 255) * 100);
            statBar.style.width = `${percentage}%`;
            statBar.style.background = statColors[statInfo.stat.name] || '#4a90e2';

            const statValueElement = document.createElement('span');
            statValueElement.className = 'stat-value-card';
            statValueElement.textContent = statValue;

            statBarContainer.appendChild(statBar);
            statItem.appendChild(statName);
            statItem.appendChild(statBarContainer);
            statItem.appendChild(statValueElement);
            cardStats.appendChild(statItem);

        });

        cardMoves.innerHTML = '';
        const movesToShow = pokemon.moves.slice(0, 10);
        movesToShow.forEach(moveInfo => {
            const move = document.createElement('span');
            move.className = 'move';

            const levelUpMethod = moveInfo.version_group_details.find(
                detail => detail.move_learn_method.name === 'level-up'
            );

            if(levelUpMethod) {
                move.innerHTML = `<span class="move-level">Lv.${levelUpMethod.level_learned_at}</span> ${moveInfo.move.name.replace('-', ' ')}`;

            } else {
                move.textContent = moveInfo.move.name.replace('-', ' ');
            }

            cardMoves.appendChild(move);
        });

        await updateEvolutionChain(pokemon.species.url);

        card.classList.add('active');
        hideLoading();
    } catch (err) {
        console.error('Error loading Pokemon details:', err);
        hideLoading();
    }
}

async function updateEvolutionChain(speciesUrl){
    try {
        const speciesResponse = await fetch(speciesUrl);
        const speciesData = await speciesResponse.json();
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();

        const evolutionChain = [];
        let currentEvolution = evolutionData.chain;

        while (currentEvolution) {
            const pokemonId = currentEvolution.species.url.split('/').filter(Boolean).pop();

            const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
            const pokemonData = await pokemonResponse.json();

            evolutionChain.push({
                name: currentEvolution.species.name,
                id: pokemonId,
                image: pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default
            });

            currentEvolution = currentEvolution.evolves_to[0];
        }

        cardEvolution.innerHTML = '';

        if(evolutionChain.length < 1) {
            cardEvolution.innerHTML = '<p>This pokemon does not evolve LOL!!.</p>';

            return;
        }

        evolutionChain.forEach((pokemon, index) => {
            const evolutionItem = document.createElement('div');
            evolutionItem.className = 'evolution-item';

            evolutionItem.addEventListener('click', async () => {
                showLoading();
                try {
                    const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
                    const pokemonData = await pokemonResponse.json();
                    showPokemonDetail(pokemonData);
                    console.log('clicked evolution');
                    
                } catch(err){
                    console.error('Error loading evolution Pokemon', err);
                    hideLoading();
                }
            });

            const evolutionImage = document.createElement('div');
            evolutionImage.className = 'evolution-image';

            const img = document.createElement('img');
            img.src = pokemon.image;
            img.alt = pokemon.name;
            evolutionImage.appendChild(img);

            const evolutionName = document.createElement('div');
            evolutionName.className = 'evolution-name';
            evolutionName.textContent = pokemon.name;

            evolutionItem.appendChild(evolutionImage);
            evolutionItem.appendChild(evolutionName);
            cardEvolution.appendChild(evolutionItem);

            if (index < evolutionChain.length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'evolution-arrow';
                arrow.innerHTML = '<i class="fas fa-arrow-right"></i>';;
                cardEvolution.appendChild(arrow);
            }
        });
    } catch (err) {
        console.error('Error loading evolutionchain:', err);
        cardEvolution.innerHTML = '<p>Evolution data not available. </p>';
    }
}

async function handleSearch(){
    const searchTerm = searchInput.value.trim().toLowerCase();

    if(!searchTerm){
        resetFilters();
        return;
    }

    const parsed = parseSearchQueary(searchTerm);

    if(parsed.generation !== null || parsed.type !== null){
        handleAdvancedSearch(parsed);
        return;
    }

    showLoading();
    hideError();

    try {
        let searchUrl;
        if(!isNaN(searchTerm)){
            searchUrl = `https://pokeapi.co/api/v2/pokemon/${parseInt(searchTerm)}`;
        }  else {
        searchUrl = `https://pokeapi.co/api/v2/pokemon/${searchTerm}`;
    }
       

    const response = await fetch(searchUrl);

    if(!response.ok) {
        throw new Error('Pokemon not found');
    }

    const pokemon = await response.json();

    pokemonData = [pokemon];
    displayPokemon = [pokemon];
    currentTypeFilter = 'all';

    updateTypeFilterButtons();
    updateGenerationFilterButtons();
    updatePokemonGrid();
    updateResultsInfo(`Search result for "${searchTerm}"`);
    updatePagination(true);
    updateTypeFilterButtons();
    hideLoading();
    } catch (err) {
        showError(`Pokémon "${searchTerm}" not found. Try another name or ID.`);

        hideLoading();
    }
}

async function handleAdvancedSearch(parsed){
    showLoading();
    hideError();

    try {
        let startId = 1;
        let endId = 1025;

        if(parsed.generation !== null){
            const gen = generations[parsed.generation];
            startId = gen.start;
            endId = gen.end;
        }

        const pokemonPromises = [];
        for (let id = startId; id <= endId; id++){
            pokemonPromises.push(
                fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
                    .then(res => res.json())
                    .catch(() => null)
            );
        }

        let loadedPokemon = await Promise.all(pokemonPromises);
        loadedPokemon = loadedPokemon.filter(p => p !== null);

        if(parsed.type !== null){
            loadedPokemon = loadedPokemon.filter(pokemon =>
                pokemon.types.some(t => t.type.name === parsed.type)
            );
        }

        if(loadedPokemon.length === 0){
            throw new Error('No pokemon found matching your search');
        }

        pokemonData = loadedPokemon;
        displayPokemon = loadedPokemon;

        if(parsed.generation !== null){
            currentGenFilter = parsed.generation;
        } else {
            currentGenFilter = 'all';
        }

        if(parsed.type !== null){
            currentTypeFilter = parsed.type;
        } else {
            currentTypeFilter = 'all';
        }

        updateTypeFilterButtons();
        updateGenerationFilterButtons();
        updatePokemonGrid();

        let resultMsg = 'Showing ';
        if (parsed.generation !== null){
            resultMsg += generations[parsed.generation].name + ' ';
        }
        if(parsed.type !== null){
            resultMsg += parsed.type + ' type ';
        }
        resultMsg += `Pokemon (${loadedPokemon.length} found)`;

        updateResultsInfo(resultMsg);
        updatePagination(true);
        hideLoading();

    } catch(err){
        showError(err.message || 'Failed to search pokemon');
        hideLoading();
    }
}

function parseSearchQueary(query){
    const lowerQuery = query.toLowerCase().trim();

    const result = {
        generation: null,
        type: null,
        pokemonName: null
    };

    const genMatch = lowerQuery.match(/gen(?:eration)?\s*([1-9]|i{1,3}|iv|v|vi{1,3}|ix)/i);
        if(genMatch){
            const genValue = genMatch[1].toLowerCase();
        // Convert roman numerals or numbers to index very fun...
            const genMap = {
                '1': 0, 'i': 0,
                '2': 1, 'ii': 1,
                '3': 2, 'iii': 2,
                '4': 3, 'iv': 3,
                '5': 4, 'v': 4,
                '6': 5, 'vi': 5,
                '7': 6, 'vii': 6,
                '8': 7, 'viii': 7,
                '9': 8, 'ix': 8,
            };
        result.generation = genMap[genValue];
        }

        const types = Object.keys(typeColors);
        for (const type of types){
            if (lowerQuery.includes(type)){
                result.type = type;
                break;
            }
        }

        if(result.generation === null && result.type === null){
            result.pokemonName = query.trim();
        }

        return result;
}



async function filterByGeneration(genIndex) {
    currentGenFilter = genIndex;
    updateGenerationFilterButtons();

    if (genIndex !== 'all'){
        await loadPokemonByGeneration(genIndex);
    }

    applyFilters();
}

async function loadPokemonByGeneration(genIndex) {
    showLoading();

    try {
        const gen = generations[genIndex];
        const pokemonPromises = [];

        for(let id = gen.start; id <= gen.end; id++){
            pokemonPromises.push(
                fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
                .then(res => res.json())
                .catch(() => null)
            );
        }

        let loadedPokemon = await Promise.all(pokemonPromises);
        loadedPokemon = loadedPokemon.filter(p => p !== null);

        pokemonData = loadedPokemon;
        displayPokemon = loadedPokemon;

        hideLoading();
    } catch(err){
        console.error('Error loading generation:', err);
        showError('Failed to load pokemon from this generation');
        hideLoading();
    }
}

function updateGenerationFilterButtons() {
    const buttons = document.querySelectorAll('.gen-btn');
    buttons.forEach(button => {
        if (button.dataset.gen === String(currentGenFilter)) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

function filterByType(type){
    currentTypeFilter = type;
    updateTypeFilterButtons();
    applyFilters();

    if(type === 'all'){
        displayPokemon = pokemonData;
    } else {
        displayPokemon = pokemonData.filter(pokemon => 
            pokemon.types.some(t => t.type.name === type)
        );
    }

    updatePokemonGrid();
    updateResultsInfo();
}

function applyFilters() {
    let filtered = pokemonData;

    if (currentGenFilter !== 'all') {
        const gen = generations[currentGenFilter];
        filtered = filtered.filter(pokemon => 
            pokemon.id >= gen.start && pokemon.id <= gen.end
        );
    }
    
    if (currentTypeFilter !== 'all' && currentTypeFilter !== 'favorites') {
        filtered = filtered.filter(pokemon => 
            pokemon.types.some(t => t.type.name === currentTypeFilter)
        );
    }
    
    displayPokemon = filtered;
    updatePokemonGrid();
    updateResultsInfo();
}

function updateTypeFilterButtons(){
    const buttons = typeFilter.querySelectorAll('.type-btn');
    buttons.forEach(button => {
        if(button.dataset.type === currentTypeFilter){
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

function resetFilters(){
    searchInput.value = '';
    currentTypeFilter = 'all';
    currentGenFilter = 'all'; 
    updateTypeFilterButtons();
    
    const genButtons = document.querySelectorAll('.gen-btn');
    genButtons.forEach(btn => btn.classList.remove('active'));
    
    loadPokemon();
}

function changePage(direction){
    const newPage = currentPage + direction;

    if(newPage < 1 || newPage > totalPages) {
        return;
    }

    currentPage = newPage;
    loadPokemon();
    resetFilters();
    pageTop();
}

function updatePagination(isSearch = false){
    if(isSearch){
        prevButton.disabled = true;
        nextButton.disabled = true;
        pageInfo.textContent = "Search Results";
    } else {
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    }
}

function updateResultsInfo(customText = null){
    if (customText){
        resultsInfo.textContent = customText;
        return;
    }

    let filterText = '';
    
    if (currentGenFilter !== 'all') {
        filterText += generations[currentGenFilter].name + ' ';
    }

    if (currentTypeFilter === 'favorites') {
        filterText = (filterText ? filterText : '') + 'favorite ';
    } else if (currentTypeFilter !== 'all') {
        filterText += currentTypeFilter + ' type ';
    }
    
    if (filterText) {
        resultsInfo.textContent = `Showing ${displayPokemon.length} ${filterText}Pokemon`;
    } else {
        resultsInfo.textContent = `Showing ${displayPokemon.length} Pokemon`;
    }
}

function showLoading() {
    loading.classList.add('active');
}

function hideLoading() {
    loading.classList.remove('active');
}

function showError(message){
    errorText.textContent = message;
    error.classList.add('active');
}

function hideError() {
    error.classList.remove('active');
}

function pageTop(){
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


function getFavorites(){
    const favorites = localStorage.getItem('pokemonFavorites');
    return favorites ? JSON.parse(favorites) : [];
}

function saveFavorites(favorites){
    localStorage.setItem('pokemonFavorites', JSON.stringify(favorites));
}

function checkIfFavorite(pokemonId){
    const favorites = getFavorites();
    return favorites.includes(pokemonId);
}

function toggleFavorite(pokemonId){
    let favorites = getFavorites();

    if(favorites.includes(pokemonId)) {
        favorites = favorites.filter(id => id !== pokemonId);
    } else {
        favorites.push(pokemonId);
    }

    saveFavorites(favorites);
}