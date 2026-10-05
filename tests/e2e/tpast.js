const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, {recursive: true}); process.chdir(OUT);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({viewport:{width:390,height:844}});
  await ctx.addInitScript(() => { localStorage.setItem('kese.tour','1'); localStorage.setItem('kese.perms','1'); });
  const pg = await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto(pathToFileURL(path.join(ROOT, 'index.html')).href + '#ozet'); await pg.waitForTimeout(400);
  await pg.fill('#wn','A'); await pg.click('#wName .save'); await pg.waitForTimeout(500); await pg.click('[data-wstart="blank"]'); await pg.waitForTimeout(700);
  for (const t of ['kahve 50 3 gün önce','market 300 dün','yemek 200 2 ekim','telefon 24000 6 taksit 15.07']) { await pg.fill('#qtext', t); await pg.press('#qtext','Enter'); await pg.waitForTimeout(300); }
  const dates = await pg.evaluate(() => { const k = localStorage.getItem('kese.v1') ? 'kese.v1' : Object.keys(localStorage).find(k=>/^kese\.p(?!eople|erms)/.test(k) && !/\.(ui|pin)$/.test(k)); return JSON.parse(localStorage[k]).tx.map(t=>t.note+':'+t.date); });
  console.log(dates, await pg.textContent('.month span'));
  await pg.goto(pathToFileURL(path.join(ROOT, 'index.html')).href + '#hareketler'); await pg.waitForTimeout(400); await pg.evaluate(()=>document.getElementById('welcome').hidden=true);
  await pg.click('[data-ltab="takvim"]'); await pg.waitForTimeout(200);
  while (!(await pg.textContent('.month span')).includes('Ekim')) { await pg.click('.month button:last-child'); await pg.waitForTimeout(150); } await pg.click('[data-calday="2026-10-02"]'); await pg.waitForTimeout(200);
  await pg.click('[data-calnew]'); await pg.waitForTimeout(400);
  const sd = await pg.evaluate(() => [...document.querySelectorAll('#sheet input[type=date]')].map(i=>i.value));
  console.log({dates, sd, errs});
  await b.close();
})();
