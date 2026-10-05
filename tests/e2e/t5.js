const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, {recursive: true}); process.chdir(OUT);
const U = pathToFileURL(path.join(ROOT, 'index.html')).href + '';
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({viewport: {width: 390, height: 844}, deviceScaleFactor: 2}); await pg.addInitScript(() => { try { localStorage.setItem('kese.tour', '1'); localStorage.setItem('kese.perms', '1'); } catch (e) {} });
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => m.type() === 'error' && !m.text().includes('ERR_CERT') && errs.push(m.text()));
  // 1) brand new user
  await pg.goto(U); await pg.waitForTimeout(500);
  await pg.screenshot({path: 'w1-name.png'});
  await pg.click('#wName .save'); console.log('empty name err:', await pg.textContent('#wErr'));
  await pg.fill('#wn', 'abdurrahman'); await pg.click('#wName .save'); await pg.waitForTimeout(400);
  await pg.screenshot({path: 'w2-start.png'});
  await pg.click('[data-wstart="blank"]'); await pg.waitForTimeout(700);
  console.log('welcome hidden', await pg.isHidden('#welcome'), 'tx', await pg.evaluate(() => JSON.parse(localStorage.getItem('kese.v1')).tx.length));
  console.log('hello:', await pg.textContent('.hello-name'), '| avatar:', await pg.textContent('#gear'));
  await pg.fill('#qtext', 'kahve 120'); await pg.press('#qtext', 'Enter'); await pg.waitForTimeout(300);
  await pg.screenshot({path: 'w3-ozet.png', fullPage: true});
  // 2) reload -> splash greeting
  await pg.reload(); await pg.waitForTimeout(400);
  console.log('splash:', (await pg.textContent('#welcome')).replace(/\s+/g, ' ').trim());
  await pg.screenshot({path: 'w4-splash.png'});
  await pg.waitForTimeout(2000); console.log('splash gone', await pg.isHidden('#welcome'));
  // 3) add second person
  await pg.click('#gear'); await pg.click('[data-act="addPerson"]'); await pg.fill('#f_name', 'rumeysa'); await pg.click('#mForm .save'); await pg.waitForTimeout(800);
  console.log('rumeysa start:', (await pg.textContent('#welcome')).replace(/\s+/g, ' ').trim().slice(0, 40));
  await pg.click('[data-wstart="blank"]'); await pg.waitForTimeout(600);
  console.log('hello2:', await pg.textContent('.hello-name'), 'tx', await pg.evaluate(() => JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => /^kese\.p(?!eople|erms)/.test(k) && !/\.(ui|pin)$/.test(k)))).tx.length));
  // 4) new session -> who is using
  const pg2 = await (await b.newContext()).newPage(); // new context loses storage; instead simulate via sessionStorage clear
  await pg.evaluate(() => sessionStorage.clear()); await pg.reload(); await pg.waitForTimeout(500);
  await pg.screenshot({path: 'w5-pick.png'});
  console.log('picker:', (await pg.textContent('#welcome')).replace(/\s+/g, ' ').trim());
  await pg.click('.person >> text=Abdurrahman'); await pg.waitForTimeout(700);
  await pg.click('#welcome').catch(() => {}); await pg.waitForTimeout(600);
  console.log('back to:', await pg.textContent('.hello-name'), 'tx', await pg.evaluate(() => JSON.parse(localStorage.getItem('kese.v1')).tx.length));
  // 5) pin greet
  await pg.click('#gear'); await pg.click('[data-act="setPin"]'); await pg.fill('#f_p1', '1234'); await pg.fill('#f_p2', '1234'); await pg.click('#mForm .save'); await pg.waitForTimeout(300);
  await pg.reload(); await pg.waitForTimeout(500); console.log('lock title:', await pg.textContent('#lockTitle'), await pg.isVisible('#lock'));
  await pg.screenshot({path: 'w6-lock.png'});
  // 6) existing user without name (legacy data)
  const p3 = await b.newPage({viewport: {width: 390, height: 844}}); await p3.addInitScript(() => { try { localStorage.setItem('kese.tour', '1'); localStorage.setItem('kese.perms', '1'); } catch (e) {} });
  await p3.goto(U); await p3.evaluate(() => { localStorage.clear(); localStorage.setItem('kese.v1', JSON.stringify({v: 2, tx: [{id: 'a', type: 'gider', cat: 'market', amount: 100, note: 'Eski', date: new Date().toISOString().slice(0, 10), method: 'kart'}], budgets: {total: 0, cats: {}}, fixed: [], quick: [], customCats: [], goals: []})); });
  await p3.reload(); await p3.waitForTimeout(400); await p3.fill('#wn', 'Abdurrahman'); await p3.click('#wName .save'); await p3.waitForTimeout(300);
  console.log('legacy after name:', (await p3.textContent('#welcome')).replace(/\s+/g, ' ').trim(), '| kept tx', await p3.evaluate(() => JSON.parse(localStorage.getItem('kese.v1')).tx.length));
  console.log('overflow', await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  console.log('errors', errs);
  await b.close();
})();
