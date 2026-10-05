const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, {recursive: true}); process.chdir(OUT);
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, colorScheme: 'dark'});
  await ctx.addInitScript(() => { localStorage.setItem('kese.tour', '1'); localStorage.setItem('kese.perms', '1'); localStorage.setItem('kese.people', JSON.stringify({list: [{id: 'p0', name: 'Abdurrahman'}], cur: 'p0'})); });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(pathToFileURL(path.join(ROOT, 'index.html')).href + '#ayarlar'); await pg.waitForTimeout(500); await pg.evaluate(() => document.getElementById('welcome').hidden = true);
  await pg.click('details[data-fold="fixed"] summary'); await pg.waitForTimeout(200);
  await pg.click('[data-editfixed]'); await pg.click('#mForm .x'); await pg.waitForTimeout(300);
  console.log('fold stays open after modal:', await pg.evaluate(() => document.querySelector('details[data-fold="fixed"]').open));
  await pg.screenshot({path: 's-settings.png', fullPage: true});
  console.log('brand:', (await pg.textContent('.brand')).trim(), '| title:', await pg.title(), '| templates:', (await pg.textContent('#view')).includes('Başlangıç şablon'), '| api:', (await pg.textContent('#view')).includes('API'));
  console.log('errors', errs); await b.close();
})();
