// DOM Elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
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
const card = document.getElementById('card');
const closeCard = document.getElementById('close-card');
const cardName = document.getElementById('card-name');
const cardId = document.getElementById('card-id');
const cardImage = document.getElementById('card-image');
const cardTypes = document.getElementById('card-types');
const cardHeight = document.getElementById('card-weight');
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
let totalPages = 65;
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
    allButton.addEventListener('click', () => filterByType(type));
    typeFilter.appendChild(button);

    types.forEach(type => {
        const button = document.createElement('button');
        button.className = 'type.btn';
        button.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        button.style.background = typeColors[type];
        button.dataset.type = type;
        button.addEventListener('click', () => filterByType(type));
        typeFilter.appendChild(button);

    });
}

async function loadPokemon(){
    showLoading();
    hideError();

    try{
        const offset = (currentPage - 1) * 20;

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`);
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
        console.error(err);
    }
}

function updatePokemonGrid() {
    pokemonGrid.innerHTML = '';

    if(displayedPokemon.length === 0) {
        pokemonGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; font-size: 1.2rem;">No Pokemon found matching your search.</div>';

        return;
    }

    displayPokemon.forEach(pokemon => {
        const pokemonCard = createPokemonCard(pokemon);
        pokemonGrid.appendChild(pokemonCard);
    });
}