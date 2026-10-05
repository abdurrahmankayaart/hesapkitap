const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, {recursive: true}); process.chdir(OUT);
const U = pathToFileURL(path.join(ROOT, 'index.html')).href + '';
const pad = n => String(n).padStart(2, '0');
const now = new Date(); const ym = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const today = `${ym(now)}-${pad(now.getDate())}`;
const prevM = new Date(now.getFullYear(), now.getMonth() - 1, 1);
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const mk = async (opts = {}) => { const pg = await b.newPage({viewport: {width: 390, height: 844}, deviceScaleFactor: 2}); pg.on('pageerror', e => errs.push(e.message)); return pg; };

  // ---- 1) tour on first run
  let pg = await mk();
  await pg.goto(U); await pg.waitForTimeout(300);
  await pg.fill('#wn', 'Abdurrahman'); await pg.click('#wName .save'); await pg.waitForTimeout(300);
  await pg.click('[data-wstart="blank"]'); await pg.waitForTimeout(400);
  console.log('tour1:', (await pg.textContent('#welcome .w-hi')).trim());
  await pg.screenshot({path: 'n-tour.png'});
  await pg.click('[data-tour="next"]'); await pg.waitForTimeout(200); console.log('tour2:', (await pg.textContent('#welcome .w-hi')).trim());
  await pg.click('[data-tour="skip"]'); await pg.waitForTimeout(600);
  console.log('tour closed', await pg.isHidden('#welcome'));
  await pg.reload(); await pg.waitForTimeout(400); console.log('after reload shows:', (await pg.textContent('#welcome')).replace(/\s+/g, ' ').trim().slice(0, 30));
  await pg.close();

  // ---- seeded state for the rest
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const seed = {v: 3, since: new Date(now.getFullYear(), now.getMonth() - 2, 1).getTime(), tx: [
      {id: 'p1', type: 'gelir', cat: 'maas', amount: 10000, note: 'Maaş', date: `${ym(prevM)}-01`, method: 'kart'},
      {id: 'p2', type: 'gider', cat: 'market', amount: 4000, note: 'Market', date: `${ym(prevM)}-10`, method: 'kart'},
      {id: 'c1', type: 'gider', cat: 'giyim', amount: 700, note: 'Mont', date: today, method: 'kart'},
      {id: 'c2', type: 'gider', cat: 'yemek', amount: 300, note: 'Nakit yemek', date: today, method: 'nakit'},
      {id: 'm1', type: 'gider', cat: 'market', amount: 900, note: 'Migros', date: today, method: 'kart'}],
    budgets: {total: 0, cats: {market: 1000}}, fixed: tomorrow.getMonth() === now.getMonth() ? [{id: 'f1', name: 'Kira', cat: 'kira', amount: 15000, day: tomorrow.getDate(), type: 'gider', auto: false}] : [],
    quick: [], customCats: [], goals: [{id: 'g1', name: 'Tatil', ic: '', target: 20000, deadline: '', color: '#06B6D4', deposits: []}],
    cards: [{id: 'k1', name: 'Bonus', cutDay: 20, dueDay: 30, limit: 10000}], debts: [], assets: [], rollover: {}, dismissed: {}, autoDone: {}};
  const init = (s) => [(s) => { localStorage.setItem('kese.tour', '1'); localStorage.setItem('kese.perms', '1'); localStorage.setItem('kese.people', JSON.stringify({list: [{id: 'p0', name: 'Abdurrahman'}], cur: 'p0'})); if (!sessionStorage.getItem('seeded')) { localStorage.setItem('kese.v1', s); sessionStorage.setItem('seeded', '1'); } }, s];
  pg = await mk();
  await pg.addInitScript(...init(JSON.stringify(seed)));
  await pg.addInitScript(() => { window.Tesseract = {recognize: async () => ({data: {text: 'MIGROS TICARET A.S.\nFIS NO 0042\nTARIH 27.09.2026 SAAT 14:02\nARA TOPLAM 200,00\nTOPKDV 45,90\nGENEL TOPLAM 245,90\n'}})}; });
  await pg.route(/frankfurter/, r => r.fulfill({status: 200, contentType: 'application/json', headers: {'access-control-allow-origin': '*'}, body: JSON.stringify({rates: {TRY: 40, EUR: 0.8}})}));
  await pg.route(/gold-api/, r => r.fulfill({status: 200, contentType: 'application/json', headers: {'access-control-allow-origin': '*'}, body: JSON.stringify({price: 3110.35})}));
  await pg.goto(U + '#ozet'); await pg.waitForTimeout(400); await pg.evaluate(() => { document.getElementById('welcome').hidden = true; });
  const S = () => pg.evaluate(() => JSON.parse(localStorage.getItem('kese.v1')));
  // reminders
  const rems = (await pg.$$eval('.rem', a => a.map(x => x.textContent.replace(/\s+/g, ' ').trim())));
  console.log('reminders:', rems);
  await pg.screenshot({path: 'n-ozet.png', fullPage: true});
  if (rems.length) { await pg.click('.rem-x'); await pg.waitForTimeout(150); console.log('after dismiss', await pg.$$eval('.rem', a => a.length)); }
  // rollover card
  console.log('rollover card:', await pg.isVisible('[data-roll="carry"]'), (await pg.textContent('body')).includes('ayından ₺6.000 arttı'));
  await pg.click('[data-roll="carry"]'); await pg.waitForTimeout(200);
  const st1 = await S(); console.log('devir tx:', st1.tx.filter(t => t.cat === 'devir').map(t => t.amount + ' ' + t.date), 'flag', JSON.stringify(st1.rollover));
  // card card
  await pg.click('.nav a[data-v="hareketler"]'); await pg.click('[data-ltab="sabit"]'); await pg.waitForTimeout(150); const cardTxt = (await pg.textContent('section.card:has(h2:text("Kartlar"))')).replace(/\s+/g, ' '); await pg.click('.nav a[data-v="ozet"]'); await pg.waitForTimeout(150);
  console.log('kartlar:', cardTxt.slice(0, 160));
  // tag via quick text
  await pg.fill('#qtext', 'otel 3000 #tatil'); await pg.waitForTimeout(50); console.log('qprev:', (await pg.textContent('#qprev')).replace(/\s+/g, ' ').trim());
  await pg.press('#qtext', 'Enter'); await pg.waitForTimeout(150);
  console.log('tags saved:', (await S()).tx.filter(t => t.tags).map(t => t.note + ':' + t.tags.join(',')));
  // receipt
  await pg.click('#fab'); await pg.waitForTimeout(200);
  const png = await pg.evaluate(() => { const c = document.createElement('canvas'); c.width = 400; c.height = 600; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 400, 600); x.fillStyle = '#000'; x.font = '24px monospace'; x.fillText('GENEL TOPLAM 245,90', 20, 300); return c.toDataURL('image/png').split(',')[1]; });
  await pg.setInputFiles('#rcFile', {name: 'fis.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64')});
  await pg.waitForTimeout(800);
  console.log('receipt msg:', await pg.textContent('#rcMsg'), '| amount:', await pg.textContent('#amtDisp'), '| note:', await pg.inputValue('#txNote'), '| date:', await pg.inputValue('#txDate'));
  await pg.screenshot({path: 'n-receipt.png'});
  await pg.click('#txSave'); await pg.waitForTimeout(400);
  const rt = (await S()).tx.find(t => t.amount === 245.9);
  console.log('receipt tx:', rt && rt.note, rt && rt.cat, 'photo', rt && rt.photo, 'card', rt && rt.card);
  console.log('photo in idb:', await pg.evaluate(id => new Promise(res => { const q = indexedDB.open('kese-photos', 1); q.onsuccess = () => { const g = q.result.transaction('p').objectStore('p').get(id); g.onsuccess = () => res(!!g.result && g.result.size); }; }), rt.id));
  // debts
  await pg.click('.nav a[data-v="hedefler"]'); await pg.click('[data-gtab="borc"]'); await pg.click('[data-act="newDebt"]');
  await pg.fill('#f_name', 'ahmet'); await pg.fill('#f_amount', '1000'); await pg.click('#mForm .save'); await pg.waitForTimeout(150);
  await pg.click('[data-dpay]'); await pg.fill('#f_amount', '400'); await pg.click('#mForm .save'); await pg.waitForTimeout(150);
  console.log('debt left:', (await pg.textContent('.debt .left')).trim(), '| duo:', (await pg.textContent('.duo')).replace(/\s+/g, ' ').trim());
  await pg.screenshot({path: 'n-debt.png'});
  await pg.click('[data-dpay]'); await pg.click('#mForm .save'); await pg.waitForTimeout(150);
  console.log('closed section:', await pg.isVisible('text=Kapananlar'));
  // assets & rates
  await pg.click('[data-gtab="varlik"]'); await pg.waitForTimeout(400);
  await pg.click('[data-act="newAsset"]'); await pg.fill('#f_amount', '100'); await pg.click('#mForm .save'); await pg.waitForTimeout(200);
  await pg.click('[data-act="newAsset"]'); await pg.selectOption('#f_unit', 'GAU'); await pg.fill('#f_amount', '10'); await pg.click('#mForm .save'); await pg.waitForTimeout(200);
  console.log('assets hero:', await pg.textContent('.hero .big'), '(beklenen 100*40 + 10*(3110.35/31.1035*40)=4000+40000=44000)');
  await pg.screenshot({path: 'n-assets.png', fullPage: true});
  // yearly report
  await pg.click('.nav a[data-v="ozet"]'); await pg.click('[data-act="report"]'); await pg.waitForTimeout(200); await pg.click('[data-rmode="yil"]'); await pg.waitForTimeout(300);
  console.log('year bars:', await pg.$$eval('#yChart path', a => a.length), '| grid:', (await pg.textContent('#mForm .rp-grid')).replace(/\s+/g, ' ').trim().slice(0, 120));
  await pg.screenshot({path: 'n-year.png'});
  await pg.close();

  // ---- shortcut
  pg = await mk(); await pg.addInitScript(...init(JSON.stringify(seed)));
  await pg.goto(U + '#ekle'); await pg.waitForTimeout(500);
  console.log('shortcut sheet open:', await pg.isVisible('#sheet'), 'welcome hidden', await pg.isHidden('#welcome'));
  console.log('overflow', await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  console.log('errors', errs);
  await b.close();
})();
