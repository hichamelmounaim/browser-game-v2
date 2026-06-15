const fs = require('fs');
const path = require('path');

const gamesPath = path.join(__dirname, '..', 'data', 'games.json');
const categoriesPath = path.join(__dirname, '..', 'data', 'categories.json');

const games = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));
const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

console.log('Total games:', games.length);
console.log('Total categories:', categories.length);

const gameCategories = new Set(games.map(g => g.category));
console.log('Unique game categories in games.json:', Array.from(gameCategories));

const firstFewGames = games.slice(0, 5).map(g => ({
  id: g.id,
  title: g.title,
  category: g.category,
  thumbnail: g.thumbnail,
  description_source: g.description_source
}));
console.log('First few games:', firstFewGames);
