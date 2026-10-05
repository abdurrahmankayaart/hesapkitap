const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, {recursive: true}); process.chdir(OUT);
(async () => {
  const b = await chromium.launch();
  for (const scheme of ['light','dark']) {
  const ctx = await b.newContext({viewport:{width:390,height:844}, deviceScaleFactor:2, colorScheme:scheme});
  await ctx.addInitScript(() => { localStorage.setItem('kese.tour','1'); localStorage.setItem('kese.perms','1'); });
  const pg = await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto(pathToFileURL(path.join(ROOT, 'index.html')).href + '#ozet'); await pg.waitForTimeout(400);
  await pg.fill('#wn','Abdurrahman'); await pg.click('#wName .save'); await pg.waitForTimeout(500); await pg.click('[data-wstart="sample"]'); await pg.waitForTimeout(700);
  await pg.goto(pathToFileURL(path.join(ROOT, 'index.html')).href + '#hareketler'); await pg.waitForTimeout(400); await pg.evaluate(()=>document.getElementById('welcome').hidden=true);
  await pg.click('[data-ltab="takvim"]'); await pg.waitForTimeout(300);
  const cells = await pg.$$eval('.cal button', bs => bs.length);
  await pg.click('.cal button:not(.fut)'); await pg.waitForTimeout(300);
  const sel = await pg.textContent('#view .day-h'); const rows = await pg.$$eval('#view .txg .tx', r=>r.length);
  await pg.screenshot({path:`cal-${scheme}.png`, fullPage:true});
  await pg.click('[data-calall="1"]'); await pg.waitForTimeout(200);
  const tot1 = await pg.textContent('.cal-sum');
  const ov = await pg.evaluate(()=>document.documentElement.scrollWidth - innerWidth);
  // previous month
  await pg.click('.month button:first-child'); await pg.waitForTimeout(300);
  const aug = await pg.$$eval('.cal button', bs => bs.length);
  console.log(scheme, {cells, sel, rows, tot1, ov, aug, errs});
  await ctx.close(); }
  await b.close();
})();
