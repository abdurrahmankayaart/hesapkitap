const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, {recursive: true}); process.chdir(OUT);
const R = ROOT;
(async () => {
  const b = await chromium.launch();
  const ctx0 = null; const pg = await b.newPage({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, hasTouch: true}); await pg.addInitScript(() => { try { localStorage.setItem('kese.tour', '1'); localStorage.setItem('kese.perms', '1'); } catch (e) {} });
  const errs = [];
  pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => m.type() === 'error' && !m.text().includes('ERR_CERT') && errs.push(m.text()));
  await pg.goto(pathToFileURL(path.join(R, 'index.html')).href); await pg.evaluate(() => { if (!localStorage.getItem('kese.people')) { localStorage.setItem('kese.people', JSON.stringify({list:[{id:'p0',name:'Test'}],cur:'p0'})); location.reload(); } }).catch(()=>{}); await pg.waitForTimeout(900); await pg.evaluate(() => { const w = document.getElementById('welcome'); if (w) w.hidden = true; });
  await pg.waitForTimeout(600);
  await pg.screenshot({path: 'v2-ozet.png', fullPage: true});
  // quick text entries
  for (const s of ['kahve 120', 'taksi 180 dün nakit', 'telefon 24000 6 taksit', 'maaş 52.000', 'migros 1.250,50', 'eczane 85 tl']) {
    await pg.fill('#qtext', s); await pg.waitForTimeout(50);
    const prev = await pg.textContent('#qprev');
    await pg.press('#qtext', 'Enter'); await pg.waitForTimeout(80);
    console.log(s, '=>', prev.replace(/\s+/g,' ').trim());
  }
  const last = await pg.evaluate(() => JSON.parse(localStorage.getItem('kese.v1')).tx.slice(-11).map(t => [t.note, t.cat, t.type, t.amount, t.date, t.method, t.inst ? t.inst.i+'/'+t.inst.n : '']));
  console.log(last);
  // report
  await pg.click('[data-act="report"]'); await pg.waitForTimeout(300);
  await pg.screenshot({path: 'v2-report.png'});
  await pg.click('#mForm .x');
  // goals
  await pg.click('.nav a[data-v="hedefler"]'); await pg.waitForTimeout(300);
  await pg.click('[data-gdep]'); await pg.fill('#f_amount', '50000'); await pg.click('#mForm .save'); await pg.waitForTimeout(300);
  await pg.screenshot({path: 'v2-goals.png', fullPage: true});
  // list + swipe
  await pg.click('.nav a[data-v="hareketler"]'); await pg.waitForTimeout(300);
  const before = await pg.$$eval('.tx', a => a.length);
  const box = await (await pg.$('.tx')).boundingBox();
  await pg.mouse.move(box.x + 300, box.y + 20); await pg.mouse.down(); await pg.mouse.move(box.x + 250, box.y + 22, {steps: 3}); await pg.mouse.move(box.x + 100, box.y + 22, {steps: 5}); await pg.mouse.up();
  await pg.waitForTimeout(500);
  const after = await pg.$$eval('.tx', a => a.length);
  console.log('swipe delete', before, '->', after);
  await pg.screenshot({path: 'v2-list.png'});
  // sheet with installment
  await pg.click('#fab'); for (const k of ['1','2','0','0','0']) await pg.click(`#keypad button:text-is("${k}")`);
  await pg.click('[data-c="giyim"]'); await pg.selectOption('#txInst', '3'); await pg.screenshot({path: 'v2-sheet.png'});
  await pg.click('#txSave'); await pg.waitForTimeout(200);
  await pg.click('.nav a[data-v="butce"]'); await pg.waitForTimeout(200); await pg.screenshot({path: 'v2-butce.png', fullPage: true});
  await pg.click('#gear'); await pg.waitForTimeout(200);
  await pg.emulateMedia({colorScheme: 'dark'}); await pg.click('.nav a[data-v="ozet"]'); await pg.waitForTimeout(300); await pg.screenshot({path: 'v2-dark.png'});
  console.log('overflow', await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  console.log('errors', errs);
  await b.close();
})();
