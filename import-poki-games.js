const fs = require('fs');
const path = require('path');

// Helper to normalize category slugs for comparison
function normalizeSlug(slug) {
  if (!slug) return '';
  return slug.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .replace(/-games$/, '')
    .replace(/^games-/, '');
}

// Decode standard HTML entities
function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '·');
}

// Strip HTML tags and format text
function cleanDescription(html) {
  if (!html) return '';
  let text = html
    .replace(/<\/p>/g, '\n\n')
    .replace(/<\/li>/g, '\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]*>/g, '')
    .trim();
  
  text = decodeEntities(text);
  
  // Collapse multiple empty lines
  return text.replace(/\n\s*\n\s*\n/g, '\n\n');
}

function main() {
  const gamesPath = path.join(__dirname, 'data', 'games.json');
  const categoriesPath = path.join(__dirname, 'data', 'categories.json');
  const pokiPath = path.join(__dirname, 'poki-all-games.json');

  if (!fs.existsSync(pokiPath)) {
    console.error('Error: poki-all-games.json not found in the root directory.');
    process.exit(1);
  }

  // Load existing data
  const existingGames = fs.existsSync(gamesPath) ? JSON.parse(fs.readFileSync(gamesPath, 'utf8')) : [];
  const existingCategories = fs.existsSync(categoriesPath) ? JSON.parse(fs.readFileSync(categoriesPath, 'utf8')) : [];

  console.log(`Loaded ${existingGames.length} existing games and ${existingCategories.length} existing categories.`);

  // Load Poki data
  const pokiData = JSON.parse(fs.readFileSync(pokiPath, 'utf8'));
  console.log(`Loaded Poki data: ${pokiData.categories.length} categories, ${pokiData.gamesCount} total games.`);

  // Maps to track loaded categories and games
  const categoryMap = new Map(); // normalized_slug -> category object
  const gameSlugs = new Set(existingGames.map(g => g.slug.toLowerCase()));
  const gameIds = new Set(existingGames.map(g => g.id.toLowerCase()));

  // Populate category map with existing categories
  existingCategories.forEach(cat => {
    categoryMap.set(normalizeSlug(cat.slug), cat);
  });

  const newCategories = [...existingCategories];
  const newGamesList = [...existingGames];

  let addedGamesCount = 0;
  let skippedGamesCount = 0;
  let addedCategoriesCount = 0;

  // Process categories first
  for (const pokiCat of pokiData.categories) {
    const normSlug = normalizeSlug(pokiCat.slug);
    let matchedCat = categoryMap.get(normSlug);

    // Also check name match case-insensitive
    if (!matchedCat) {
      matchedCat = existingCategories.find(c => c.name.toLowerCase() === pokiCat.title.toLowerCase());
      if (matchedCat) {
        categoryMap.set(normSlug, matchedCat);
      }
    }

    if (!matchedCat) {
      // Create a new category
      const catId = Math.random().toString(36).substring(2, 11);
      const catSlug = pokiCat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const catName = pokiCat.title;

      // Poki category imageUrl is relative, e.g. "fed61537010ea792ae7e5f104c2a8323/shooting-logo.png"
      const thumbnailUrl = pokiCat.imageUrl 
        ? `https://img.poki-cdn.com/resize/180/180/50/${pokiCat.imageUrl}`
        : 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=60';

      const seoTitle = `${catName} Games - Play Free Online`;
      const seoDesc = cleanDescription(pokiCat.description).substring(0, 155) || `Play the best free online ${catName.toLowerCase()} games. No downloads required, play directly in your browser.`;

      const contentUnit = pokiCat.description || `<h3>Play the Best Free Online ${catName} Games</h3><p>Welcome to our platform, the home of the best ${catName.toLowerCase()} games online! Play directly in your browser with no downloads required.</p>`;

      const newCat = {
        id: catId,
        name: catName,
        slug: catSlug,
        thumbnail: thumbnailUrl,
        seo_title: seoTitle,
        seo_title_fr: seoTitle,
        seo_title_es: seoTitle,
        seo_description: seoDesc,
        seo_description_fr: seoDesc,
        seo_description_es: seoDesc,
        seo_keywords: `${catName.toLowerCase()}, free games, browser games`,
        seo_keywords_fr: `${catName.toLowerCase()}, jeux gratuits, jeux par navigateur`,
        seo_keywords_es: `${catName.toLowerCase()}, juegos gratis, juegos de navegador`,
        content_unit: contentUnit,
        content_unit_fr: contentUnit,
        content_unit_es: contentUnit,
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };

      newCategories.push(newCat);
      categoryMap.set(normSlug, newCat);
      addedCategoriesCount++;
      console.log(`Created new category: "${catName}" (slug: ${catSlug})`);
      matchedCat = newCat;
    }

    // Now process games in this category
    for (const game of pokiCat.games) {
      const gSlug = game.slug.toLowerCase();
      const gId = `pk-${game.id}`;

      // Prevent duplicate slugs or IDs
      if (gameSlugs.has(gSlug) || gameIds.has(gId.toLowerCase())) {
        skippedGamesCount++;
        continue;
      }

      // Clean HTML descriptions
      const cleanedDesc = cleanDescription(game.description);
      const shortDesc = cleanedDesc || `Play ${game.title} online for free.`;

      // Build keywords
      const keywords = `${game.title.toLowerCase()}, ${matchedCat.name.toLowerCase()}, free games, browser games`;

      const newGame = {
        id: gId,
        title: game.title,
        title_fr: game.title,
        title_es: game.title,
        slug: game.slug,
        description: shortDesc,
        description_fr: shortDesc,
        description_es: shortDesc,
        thumbnail: game.imageUrl || game.logoUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=60',
        category: matchedCat.name,
        source_url: game.wrapperUrl || game.gameUri,
        iframe_url: game.gameUri,
        seo_keywords: keywords,
        seo_keywords_fr: keywords,
        seo_keywords_es: keywords,
        rating: 4.5,
        description_source: 'poki',
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };

      newGamesList.push(newGame);
      gameSlugs.add(gSlug);
      gameIds.add(gId.toLowerCase());
      addedGamesCount++;
    }
  }

  console.log(`\nMigration complete summary:`);
  console.log(`- Added ${addedCategoriesCount} new categories (total categories: ${newCategories.length})`);
  console.log(`- Added ${addedGamesCount} new games (total games: ${newGamesList.length})`);
  console.log(`- Skipped ${skippedGamesCount} duplicate games`);

  // Write files back
  fs.writeFileSync(gamesPath, JSON.stringify(newGamesList, null, 2));
  fs.writeFileSync(categoriesPath, JSON.stringify(newCategories, null, 2));

  console.log('Successfully saved games.json and categories.json!');
}

main();
