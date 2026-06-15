const fs = require('fs');
const path = require('path');

const gamesPath = path.join(__dirname, '..', 'data', 'games.json');
const games = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));

const brokenCategories = ['Games for Girls', 'Obby Games'];

brokenCategories.forEach(cat => {
  console.log(`\n--- Games in category: ${cat} ---`);
  const catGames = games.filter(g => g.category === cat);
  console.log(`Count: ${catGames.length}`);
  
  catGames.slice(0, 10).forEach(g => {
    console.log({
      id: g.id,
      title: g.title,
      slug: g.slug,
      thumbnail: g.thumbnail,
      description: g.description ? g.description.substring(0, 50) + '...' : 'none',
      description_source: g.description_source,
      source_url: g.source_url,
      iframe_url: g.iframe_url
    });
  });
});
