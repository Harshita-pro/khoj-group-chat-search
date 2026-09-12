const { corpus, queries, search } = require('../public/search-engine');
const results = queries.map(query => ({ ...query, found: search(query.text, corpus)[0]?.id }));
const accuracy = results.filter(item => item.found === item.answer).length / results.length;
const hard = results.filter(item => item.hard);
const hardAccuracy = hard.filter(item => item.found === item.answer).length / hard.length;
console.log(`All queries: ${Math.round(accuracy * 100)}% (${results.filter(item => item.found === item.answer).length}/${results.length})`);
console.log(`Zero-overlap: ${Math.round(hardAccuracy * 100)}% (${hard.filter(item => item.found === item.answer).length}/${hard.length})`);
