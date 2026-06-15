const fs = require('fs');
const path = require('path');

const pokiPath = path.join(__dirname, '..', 'poki-all-games.json');
const pokiData = JSON.parse(fs.readFileSync(pokiPath, 'utf8'));

const targetSlugs = ['vortellas-dress-up', 'snapstyle-dress-up', 'party-time', 'rail-in-the-air'];

targetSlugs.forEach(slug => {
  console.log(`\nSearching for slug: ${slug}`);
  let found = false;
  for (const cat of pokiData.categories) {
    const game = cat.games.find(g => g.slug === slug);
    if (game) {
      console.log('Found in category:', cat.title);
      console.log(JSON.stringify(game, null, 2));
      found = true;
      break;
    }
  }
  if (!found) {
    console.log('Not found in poki-all-games.json');
  }
});
