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