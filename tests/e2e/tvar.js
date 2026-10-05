const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, {recursive: true}); process.chdir(OUT);
(async () => {
  const b = await chromium.launch();
  for (const v of ['klasik','pay','aliskanlik','gizli','gizli-acik']) {
    const ctx = await b.newContext({viewport:{width:390,height:844}, deviceScaleFactor:2, colorScheme:'light'});
    await ctx.addInitScript(k => { localStorage.setItem('kese.tour','1'); localStorage.setItem('kese.perms','1'); localStorage.setItem('kese.hero', k); }, v.replace('-acik',''));
    const pg = await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
    await pg.goto(pathToFileURL(path.join(ROOT, 'index.html')).href + '#ozet'); await pg.waitForTimeout(400);
    await pg.fill('#wn','Abdurrahman'); await pg.click('#wName .save'); await pg.waitForTimeout(500); await pg.click('[data-wstart="sample"]'); await pg.waitForTimeout(700);
    await pg.goto(pathToFileURL(path.join(ROOT, 'index.html')).href + '#ozet'); await pg.waitForTimeout(500); await pg.evaluate(()=>{document.getElementById('welcome').hidden=true; document.querySelectorAll('.banner').forEach(e=>e.remove());});
    if (v.endsWith('-acik')) { await pg.click('[data-act="heroPeek"]'); await pg.waitForTimeout(300); await pg.evaluate(()=>document.querySelectorAll('.banner').forEach(e=>e.remove())); }
    await pg.locator('.hero').screenshot({path:`var-${v}.png`});
    console.log(v, errs, (await pg.textContent('.hero')).replace(/\s+/g,' ').slice(0,160));
    await ctx.close();
  }
  await b.close();
})();
