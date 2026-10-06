const { chromium } = require('playwright');
const path = require('path'), fs2 = require('fs'), { pathToFileURL } = require('url');
const ROOT = path.resolve(__dirname, '..');
const OUTDIR = path.join(ROOT, 'store', 'ekran-goruntuleri', '_yeni'); fs2.mkdirSync(OUTDIR, {recursive: true});
const sizes = [{n:'ios', w:440, h:956, s:3}, {n:'android', w:360, h:720, s:3}];
const U = pathToFileURL(path.join(ROOT, 'index.html')).href;
(async () => {
  const b = await chromium.launch();
  for (const z of sizes) for (const scheme of ['light','dark']) {
    const ctx = await b.newContext({viewport:{width:z.w,height:z.h}, deviceScaleFactor:z.s, colorScheme:scheme, locale:'tr-TR'});
    await ctx.addInitScript(() => { localStorage.setItem('kese.tour','1'); localStorage.setItem('kese.perms','1'); });
    const pg = await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
    await pg.goto(U+'#ozet'); await pg.waitForTimeout(400);
    await pg.fill('#wn','Abdurrahman'); await pg.click('#wName .save'); await pg.waitForTimeout(500); await pg.click('[data-wstart="sample"]'); await pg.waitForTimeout(700);
    // Açılış kartı bugünkü harcamayı gösterir; ₺0 görünmesin diye bugüne iki kayıt gir.
    for (const t of ['kahve 120', 'market 450']) { await pg.fill('#qtext', t); await pg.press('#qtext', 'Enter'); await pg.waitForTimeout(350); }
    await pg.evaluate(() => { const t = document.getElementById('toast'); if (t) t.hidden = true; }); await pg.waitForTimeout(100);
    const clean = () => pg.evaluate(() => { const w=document.getElementById('welcome'); if (w) w.hidden=true;
      document.querySelectorAll('#view > *').forEach(e => { if (/Örnek verilerle|Ana ekrana ekle|yükle/i.test(e.textContent) && e.textContent.length < 400) e.remove(); });
      const m=document.getElementById('qmic'); if (m) m.hidden=true; });
    const shot = async name => { await clean(); await pg.waitForTimeout(350); await pg.screenshot({path:`${OUTDIR}/${z.n}-${scheme}-${name}.png`}); };
    const nav = async h => { await pg.goto(U+'#'+h); await pg.waitForTimeout(400); };
    if (scheme === 'light') {
      await shot('1-ozet');
      await nav('hareketler'); await shot('2-gunluk');
      await pg.click('[data-ltab="sabit"]'); await shot('3-sabit');
      await pg.click('[data-ltab="takvim"]'); await shot('4-takvim');
      await nav('butce'); await shot('7-butce');
      await nav('ozet'); await clean(); await pg.click('.fab'); await pg.waitForTimeout(500); await shot('5-ekle');
    } else { await shot('6-koyu'); }
    console.log(z.n, scheme, 'errs', errs);
    await ctx.close();
  }
  await b.close();
})();
