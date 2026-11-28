/* Checks the built site. DIST is the build folder (the engine sets it). */
const fs = require('fs');
const path = require('path');

const dist = process.env.DIST || path.join(__dirname, '..', '_site');
let failed = 0;
function check(name, ok, detail) {
  if (ok) console.log('ok  ' + name);
  else { console.error('FAIL ' + name + (detail ? ': ' + detail : '')); failed++; }
}

const hist = JSON.parse(fs.readFileSync(path.join(dist, 'discoveries', 'history.json'), 'utf8'));
check('90 discoveries', (hist.entries || []).length === 90, 'got ' + (hist.entries || []).length);

const people = JSON.parse(fs.readFileSync(path.join(dist, 'data', 'people.json'), 'utf8')).people;
const living = people.filter(p => p.isLiving);
check('six living people', living.length === 6, String(living.length));
const banned = ['birth', 'death', 'burial', 'story', 'media', 'residences', 'occupations', 'cardPlace', 'photo'];
living.forEach(p => {
  banned.forEach(k => check(p.id + ' has no ' + k, p[k] == null || (Array.isArray(p[k]) && p[k].length === 0)));
  check(p.id + ' has a relationship line', typeof p.disambiguator === 'string' && p.disambiguator.length > 0);
});

const places = JSON.parse(fs.readFileSync(path.join(dist, 'data', 'places.json'), 'utf8')).places;
check('Wells is not a place', !places.some(p => /wells/i.test(p.name)));
const events = places.reduce((n, p) => n + (p.events || []).length, 0);
check('67 map events', events === 67, String(events));
check('Denver is a town pin, not a Colorado area', places.some(p => p.id === 'denver-co' && p.drawAs === 'pin') && !places.some(p => p.id === 'colorado'));
check('Hillside Cemetery is on the map', places.some(p => p.id === 'hillside-cemetery-vt' && p.drawAs === 'pin'));
check('a Nova Scotia village is a soft circle', places.some(p => p.id === 'norwood-ns' && p.drawAs === 'halo'));

const html = ['index.html', 'crosby.html', 'magwire.html', 'farr.html', 'richardson.html', 'spaulding.html', 'research.html', 'family-tree.html', 'map.html', 'discoveries.html']
  .map(f => fs.readFileSync(path.join(dist, f), 'utf8')).join('\n');
check('no em dash or en dash', !/[\u2013\u2014]/.test(html));

const discoveries = fs.readFileSync(path.join(dist, 'discoveries.html'), 'utf8');
check('confidence badges stay off the timeline', !discoveries.includes('class="tl-conf"'));
const mapPage = fs.readFileSync(path.join(dist, 'map.html'), 'utf8');
check('map has relationships and source preview', mapPage.includes('map-viewpoint.js') && mapPage.includes('source-preview.js') && mapPage.includes('source-preview.css'));
check('language switch is offered', mapPage.includes('data-i18n') || fs.readFileSync(path.join(dist, 'family-tree.html'), 'utf8').includes('EN'));
const treePage = fs.readFileSync(path.join(dist, 'family-tree.html'), 'utf8');
check('visitor question is on the tree page', treePage.includes('Which relative are you?') || treePage.includes('visitor'));
check('obituary scans are not in the build', !/2009-obituary-|2016-obituary-/.test(html));
const peopleText = fs.readFileSync(path.join(dist, 'data', 'people.json'), 'utf8');
['1934', 'Cynthia', 'Southwick', 'Whitehouse'].forEach(w => check('not in people.json: ' + w, !peopleText.includes(w)));
['1934', 'Cynthia', 'Southwick'].forEach(w => check('not in pages: ' + w, !html.includes(w)));

const files = [];
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else files.push(p);
  }
})(dist);
check('no obituary image file', !files.some(f => /2009-obituary-|2016-obituary-/.test(f)));
check('record image is present', files.some(f => f.endsWith('1906-marriage-crosby-pierce-wakefield-ma-townreport-highlighted.jpg')));

if (failed) {
  console.error(failed + ' check(s) failed');
  process.exit(1);
}
console.log('all checks passed');
