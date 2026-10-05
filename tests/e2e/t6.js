const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, {recursive: true}); process.chdir(OUT);
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, colorScheme: 'dark'}); await pg.addInitScript(() => { try { localStorage.setItem('kese.tour', '1'); localStorage.setItem('kese.perms', '1'); } catch (e) {} });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(pathToFileURL(path.join(ROOT, 'index.html')).href + ''); await pg.waitForTimeout(400);
  await pg.fill('#wn', 'Abdurrahman'); await pg.click('#wName .save'); await pg.waitForTimeout(300);
  await pg.click('[data-wstart="blank"]'); await pg.waitForTimeout(700); await pg.click('.nav a[data-v="hareketler"]'); await pg.click('[data-ltab="sabit"]'); for (const [n, a, d] of [['Kira', '22000', '1'], ['Su', '450', '16']]) { await pg.click('.card [data-act="newFixed"]'); await pg.fill('#f_name', n); await pg.fill('#f_amount', a); await pg.fill('#f_day', d); await pg.click('#mForm .save'); await pg.waitForTimeout(200); } await pg.click('.nav a[data-v="ozet"]');
  console.log('onboarding card gone:', !(await pg.isVisible('text=Nasıl başlamak istersin?')));
  const n = () => pg.evaluate(() => JSON.parse(localStorage.getItem('kese.v1')).fixed.length);
  console.log('fixed', await n());
  // add from Özet card
  await pg.click('.nav a[data-v="hareketler"]'); await pg.click('[data-ltab="sabit"]'); await pg.waitForTimeout(150); await pg.click('.card [data-act="newFixed"]'); await pg.fill('#f_name', 'Spor salonu'); await pg.fill('#f_amount', '1500'); await pg.fill('#f_day', '10'); await pg.click('#mForm .save'); await pg.waitForTimeout(300);
  console.log('after add', await n());
  // tap row -> edit -> delete -> undo
  await pg.click('.li-main >> text=Su'); await pg.waitForTimeout(300);
  console.log('edit modal title', await pg.textContent('#mForm h2'));
  await pg.click('#mDel'); await pg.waitForTimeout(300); console.log('after delete', await n(), await pg.textContent('#toast'));
  await pg.click('#toast button'); await pg.waitForTimeout(200); console.log('after undo', await n());
  // pay still works
  await pg.click('[data-pay]'); await pg.waitForTimeout(200); console.log('paid tx', await pg.evaluate(() => JSON.parse(localStorage.getItem('kese.v1')).tx.length));
  const card = await pg.$('section.card:has(h2:text("Sabit kalemler"))'); await card.screenshot({path: 'fx.png'});
  await pg.screenshot({path: 'fx-top.png'});
  console.log('errors', errs);
  await b.close();
})();
