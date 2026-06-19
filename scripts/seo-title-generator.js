const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/games.json');
const games = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Dictionaries for localized SEO templates
const frTemplates = {
  "Sports": "Jeu de Sport",
  "Action": "Jeu d'Action",
  "Adventure": "Jeu d'Aventure",
  "Puzzle": "Jeu de Puzzle",
  "Racing": "Jeu de Course",
  "Arcade": "Jeu d'Arcade",
  "Strategy": "Jeu de Stratégie",
  "Simulation": "Jeu de Simulation",
  "Board": "Jeu de Société",
  "Card": "Jeu de Cartes",
  "Casino": "Jeu de Casino",
  "Word": "Jeu de Mots",
  "Trivia": "Jeu de Quiz",
  "Multiplayer": "Jeu Multijoueur",
  "IO": "Jeu IO",
  "Shooter": "Jeu de Tir",
  "Casual": "Jeu Casual",
  "Girls": "Jeu pour Filles",
  "Dress Up": "Jeu d'Habillage",
  "Cooking": "Jeu de Cuisine",
  "Make Up": "Jeu de Maquillage",
  "Default": "Jeu"
};

const esTemplates = {
  "Sports": "Juego de Deportes",
  "Action": "Juego de Acción",
  "Adventure": "Juego de Aventura",
  "Puzzle": "Juego de Puzzle",
  "Racing": "Juego de Carreras",
  "Arcade": "Juego de Arcade",
  "Strategy": "Juego de Estrategia",
  "Simulation": "Juego de Simulación",
  "Board": "Juego de Mesa",
  "Card": "Juego de Cartas",
  "Casino": "Juego de Casino",
  "Word": "Juego de Palabras",
  "Trivia": "Juego de Trivia",
  "Multiplayer": "Juego Multijugador",
  "IO": "Juego IO",
  "Shooter": "Juego de Disparos",
  "Casual": "Juego Casual",
  "Girls": "Juego para Chicas",
  "Dress Up": "Juego de Vestir",
  "Cooking": "Juego de Cocina",
  "Make Up": "Juego de Maquillaje",
  "Default": "Juego"
};

let updated = 0;

for (const game of games) {
  if (!game.title_fr) {
    const cat = game.category || "Default";
    const prefix = frTemplates[cat] || frTemplates["Default"];
    game.title_fr = `${game.title} - ${prefix} Gratuit en Ligne`;
    updated++;
  }
  
  if (!game.title_es) {
    const cat = game.category || "Default";
    const prefix = esTemplates[cat] || esTemplates["Default"];
    game.title_es = `${game.title} - ${prefix} Gratis Online`;
  }
  
  if (!game.seo_keywords_fr) {
    game.seo_keywords_fr = `${game.title.toLowerCase()}, jeu gratuit, jeu en ligne, ${game.category ? game.category.toLowerCase() : ''}`;
  }
  
  if (!game.seo_keywords_es) {
    game.seo_keywords_es = `${game.title.toLowerCase()}, juego gratis, juego online, ${game.category ? game.category.toLowerCase() : ''}`;
  }
}

fs.writeFileSync(dataPath, JSON.stringify(games, null, 2), 'utf8');

console.log(`Updated ${updated} games with programmatic localized SEO titles and keywords.`);
