const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, {recursive: true}); process.chdir(OUT);
const R = ROOT;
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2});
  await ctx.addInitScript(() => { try { localStorage.setItem('kese.tour', '1'); localStorage.setItem('kese.perms', '1'); } catch (e) {} }); const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => m.type() === 'error' && !m.text().includes('ERR_CERT') && errs.push(m.text()));
  await pg.goto(pathToFileURL(path.join(R, 'index.html')).href); await pg.evaluate(() => { if (!localStorage.getItem('kese.people')) { localStorage.setItem('kese.people', JSON.stringify({list:[{id:'p0',name:'Test'}],cur:'p0'})); location.reload(); } }).catch(()=>{}); await pg.waitForTimeout(900); await pg.evaluate(() => { const w = document.getElementById('welcome'); if (w) w.hidden = true; }); await pg.waitForTimeout(500);
  // clear sample then add auto fixed item due yesterday-ish (day 1)
  await pg.click('[data-act="clearSample"]'); await pg.click('#mForm .save'); await pg.waitForTimeout(200);
  await pg.evaluate(() => { if (!document.querySelector('[data-themeset]')) document.getElementById('gear').click(); }); await pg.waitForTimeout(150); await pg.click('details[data-fold="fixed"] summary'); await pg.click('[data-act="newFixed"]');
  await pg.fill('#f_name', 'Test kira'); await pg.fill('#f_amount', '1000'); await pg.fill('#f_day', '1'); await pg.selectOption('#f_auto', '1');
  await pg.click('#mForm .save'); await pg.waitForTimeout(700);
  const cnt = () => pg.evaluate(() => JSON.parse(localStorage.getItem('kese.v1')).tx.filter(t => t.note === 'Test kira').length);
  console.log('auto after save', await cnt());
  await pg.reload(); await pg.evaluate(() => { if (!localStorage.getItem('kese.people')) { localStorage.setItem('kese.people', JSON.stringify({list:[{id:'p0',name:'Test'}],cur:'p0'})); location.reload(); } }).catch(()=>{}); await pg.waitForTimeout(900); await pg.evaluate(() => { const w = document.getElementById('welcome'); if (w) w.hidden = true; }); await pg.waitForTimeout(700); console.log('after reload', await cnt());
  // undo scenario: delete it, reload, should not come back
  await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('kese.v1')); s.tx = s.tx.filter(t => t.note !== 'Test kira'); localStorage.setItem('kese.v1', JSON.stringify(s)); });
  await pg.reload(); await pg.evaluate(() => { if (!localStorage.getItem('kese.people')) { localStorage.setItem('kese.people', JSON.stringify({list:[{id:'p0',name:'Test'}],cur:'p0'})); location.reload(); } }).catch(()=>{}); await pg.waitForTimeout(900); await pg.evaluate(() => { const w = document.getElementById('welcome'); if (w) w.hidden = true; }); await pg.waitForTimeout(700); console.log('after delete+reload', await cnt());
  // fixed income: Maaş via profile
  await pg.evaluate(() => { if (!document.querySelector('[data-themeset]')) document.getElementById('gear').click(); }); await pg.waitForTimeout(150); await pg.evaluate(() => { const d = document.querySelector('details[data-fold="fixed"]'); if (d && !d.open) d.querySelector('summary').click(); }); await pg.click('[data-act="newFixed"]'); await pg.fill('#f_name', 'Maaş'); await pg.selectOption('#f_type', 'gelir'); await pg.fill('#f_amount', '52000'); await pg.fill('#f_day', '1'); await pg.selectOption('#f_cat', 'maas'); await pg.click('#mForm .save'); await pg.waitForTimeout(300);
  await pg.click('.nav a[data-v="hareketler"]'); await pg.click('[data-ltab="sabit"]'); await pg.waitForTimeout(150); await pg.click('[data-pay]'); await pg.waitForTimeout(200);
  console.log('maas income', await pg.evaluate(() => JSON.parse(localStorage.getItem('kese.v1')).tx.filter(t => t.type === 'gelir').map(t => t.note + ' ' + t.amount)));
  // add some records and open category detail
  await pg.click('.nav a[data-v="ozet"]'); await pg.waitForTimeout(150);
  for (const s of ['market 450', 'migros 800', 'kahve 120']) { await pg.fill('#qtext', s); await pg.press('#qtext', 'Enter'); await pg.waitForTimeout(80); }
  await pg.click('.ccard[data-cat="market"]'); await pg.waitForTimeout(300);
  await pg.fill('#catBud', '5000'); await pg.press('#catBud', 'Tab'); await pg.waitForTimeout(200);
  await pg.screenshot({path: 'v21-cat.png'});
  console.log('budget market', await pg.evaluate(() => JSON.parse(localStorage.getItem('kese.v1')).budgets.cats.market));
  await pg.click('#mForm [data-catlist]'); await pg.waitForTimeout(200);
  await pg.click('[data-fall]'); await pg.waitForTimeout(200);
  console.log('all months pressed', await pg.getAttribute('[data-fall]', 'aria-pressed'));
  // theme
  await pg.evaluate(() => { if (!document.querySelector('[data-themeset]')) document.getElementById('gear').click(); }); await pg.waitForTimeout(150); await pg.click('[data-themeset="dark"]'); console.log('theme', await pg.evaluate(() => document.documentElement.dataset.theme));
  await pg.click('[data-themeset="system"]'); console.log('theme sys', await pg.evaluate(() => document.documentElement.dataset.theme || 'none'));
  // pin
  await pg.click('[data-act="setPin"]'); await pg.fill('#f_p1', '1234'); await pg.fill('#f_p2', '1234'); await pg.click('#mForm .save'); await pg.waitForTimeout(300);
  await pg.reload(); await pg.evaluate(() => { if (!localStorage.getItem('kese.people')) { localStorage.setItem('kese.people', JSON.stringify({list:[{id:'p0',name:'Test'}],cur:'p0'})); location.reload(); } }).catch(()=>{}); await pg.waitForTimeout(900); await pg.evaluate(() => { const w = document.getElementById('welcome'); if (w) w.hidden = true; }); await pg.waitForTimeout(500);
  console.log('lock visible', await pg.isVisible('#lock'));
  await pg.screenshot({path: 'v21-lock.png'});
  for (const k of ['1','1','1','1']) await pg.click(`#lockPad button:text-is("${k}")`);
  await pg.waitForTimeout(200); console.log('wrong pin still locked', await pg.isVisible('#lock'), await pg.textContent('#lockErr'));
  await pg.waitForTimeout(350);
  for (const k of ['1','2','3','4']) await pg.keyboard.press(k);
  await pg.waitForTimeout(200); console.log('right pin unlocked', !(await pg.isVisible('#lock')));
  // backup banner: simulate old since with 20+ tx
  await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('kese.v1')); s.since = Date.now() - 40*864e5; for (let i=0;i<20;i++) s.tx.push({id:'x'+i,type:'gider',cat:'yemek',amount:50,note:'x',date:s.tx[0].date,method:'kart'}); localStorage.setItem('kese.v1', JSON.stringify(s)); localStorage.removeItem('kese.v1.pin'); });
  await pg.reload(); await pg.evaluate(() => { if (!localStorage.getItem('kese.people')) { localStorage.setItem('kese.people', JSON.stringify({list:[{id:'p0',name:'Test'}],cur:'p0'})); location.reload(); } }).catch(()=>{}); await pg.waitForTimeout(900); await pg.evaluate(() => { const w = document.getElementById('welcome'); if (w) w.hidden = true; }); await pg.waitForTimeout(500);
  console.log('backup banner', await pg.isVisible('[data-act="snoozeBackup"]'));
  await pg.screenshot({path: 'v21-ozet.png'});
  console.log('overflow', await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  console.log('errors', errs);
  await b.close();
})();
