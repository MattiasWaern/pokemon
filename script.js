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
let pokemonData = [];
let displayPokemon = [];
let currentPokemonDetail = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeTypeFilters();
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
        <span class="pokemon-id">#${pokemonId}</span>
        <h3 class="pokemon-name">${pokemon.name}</h3>
        <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-pokemon-id="${pokemon.id}">
            <i class="fas fa-heart"></i>
        </button>
    </div>

   <div class="pokemon-image">
        <img src="https://play.pokemonshowdown.com/sprites/ani/${pokemon.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.gif"
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

        img.src = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
        img.alt = pokemon.name;
        if (!cardImage.querySelector('img')) {
            cardImage.appendChild(img);
        }

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
    updatePokemonGrid();
    updateResultsInfo(`Search result for "${searchTerm}"`);
    updatePagination(true);
    hideLoading();
    } catch (err) {
        showError(`Pokémon "${searchTerm}" not found. Try another name or ID.`);

        hideLoading();
    }
}

function filterByType(type){
    currentTypeFilter = type;

    updateTypeFilterButtons();

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
    updateTypeFilterButtons();
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

    if(currentTypeFilter === 'all'){
        resultsInfo.textContent = `Showing ${displayPokemon.length} Pokemon`;
    } 
    
    else {
        resultsInfo.textContent = `Showing ${displayPokemon.length} ${currentTypeFilter} type pokemon`;
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