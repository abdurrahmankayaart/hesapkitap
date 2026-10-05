const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, {recursive: true}); process.chdir(OUT);
const U = pathToFileURL(path.join(ROOT, 'index.html')).href + '';
const FAKE = (mode) => `export default class Anthropic { constructor(o){ window.__aiopts = o; this.beta = {messages: {create: async (req) => { window.__aireq = req;
  ${mode === '401' ? "const e = new Error('invalid x-api-key'); e.status = 401; throw e;" : "return {stop_reason: 'end_turn', content: [{type: 'thinking', thinking: ''}, {type: 'text', text: JSON.stringify({is_receipt: true, store: 'Mado', amount: 612.5, date: '2026-09-27', category: 'yemek'})}]};"} }}}; } }`;
(async () => {
  const b = await chromium.launch(); const errs = [];
  const mk = async (opts = {}) => {
    const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2});
    await ctx.addInitScript(([k]) => { localStorage.setItem('kese.tour', '1'); localStorage.setItem('kese.perms', '1');
      localStorage.setItem('kese.people', JSON.stringify({list: [{id: 'p0', name: 'Abdurrahman'}], cur: 'p0'}));
      if (k) localStorage.setItem('kese.aikey', k);
      window.Tesseract = {recognize: async () => ({data: {text: 'MADO\nNISANTASI SUBE\nTARIH 28.09.2026\nKDV 43,00\nTOPLAM 485,00\n'}})}; }, [opts.key || '']);
    if (opts.fake) await ctx.route(/@anthropic-ai\/sdk@0\.129\.0\/\+esm/, r => r.fulfill({status: 200, contentType: 'application/javascript', headers: {'access-control-allow-origin': '*'}, body: FAKE(opts.fake)}));
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(U + '#ozet'); await pg.waitForTimeout(500); await pg.evaluate(() => { document.getElementById('welcome').hidden = true; });
    return pg;
  };
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=', 'base64');
  const S = pg => pg.evaluate(() => JSON.parse(localStorage.getItem('kese.v1')));

  // --- layout
  let pg = await mk();
  const txt = await pg.textContent('#view');
  console.log('Özet has fixed card:', txt.includes('Sabit kalemler'), '| 6 ay:', txt.includes('Son 6 ay'), '| hedef şeridi:', !!(await pg.$('.gmini')), '| camera:', !!(await pg.$('#qcamFile')));
  console.log('gider em:', (await pg.textContent('.io .card:nth-child(2) em')).trim());
  await pg.screenshot({path: 'r-ozet.png', fullPage: true});
  await pg.click('.nav a[data-v="hareketler"]'); await pg.waitForTimeout(200);
  console.log('günlük list has fixed?', await pg.evaluate(() => [...document.querySelectorAll('.tx .m')].some(x => x.textContent.includes('sabit'))));
  await pg.click('[data-ltab="sabit"]'); await pg.waitForTimeout(200);
  const st = await pg.textContent('#view');
  console.log('sabit tab:', ['sabit giderler', 'Sabit kalemler', 'Taksitler'].map(k => k + ':' + st.includes(k)).join(' '));
  await pg.screenshot({path: 'r-sabit.png', fullPage: true});

  // --- OCR auto entry (no key)
  await pg.click('.nav a[data-v="ozet"]'); await pg.waitForTimeout(200);
  await pg.click('[data-act="clearSample"]'); await pg.click('#mForm .save'); await pg.waitForTimeout(200);
  await pg.setInputFiles('#qcamFile', {name: 'fis.png', mimeType: 'image/png', buffer: png}); await pg.waitForTimeout(900);
  let t = (await S(pg)).tx.slice(-1)[0];
  console.log('OCR auto:', t.note, t.cat, t.amount, t.date, 'photo', t.photo, '| toast:', await pg.textContent('#toast'));
  await pg.close();

  // --- AI path
  pg = await mk({key: 'sk-ant-test', fake: 'ok'});
  await pg.click('[data-act="clearSample"]'); await pg.click('#mForm .save'); await pg.waitForTimeout(200);
  await pg.setInputFiles('#qcamFile', {name: 'fis.png', mimeType: 'image/png', buffer: png}); await pg.waitForTimeout(1200);
  t = (await S(pg)).tx.slice(-1)[0];
  console.log('AI auto:', t && t.note, t && t.cat, t && t.amount, t && t.date, '| toast:', await pg.textContent('#toast'));
  const req = await pg.evaluate(() => ({model: __aireq.model, betas: __aireq.betas, fallbacks: __aireq.fallbacks, effort: __aireq.output_config.effort, fmt: __aireq.output_config.format.type, enumHasYemek: __aireq.output_config.format.schema.properties.category.enum.includes('yemek'), img: __aireq.messages[0].content[0].source.media_type, browser: __aiopts.dangerouslyAllowBrowser}));
  console.log('request:', JSON.stringify(req));
  await pg.close();

  // --- AI 401 -> falls back to on-device
  pg = await mk({key: 'sk-ant-bad', fake: '401'});
  await pg.click('[data-act="clearSample"]'); await pg.click('#mForm .save'); await pg.waitForTimeout(200);
  await pg.setInputFiles('#qcamFile', {name: 'fis.png', mimeType: 'image/png', buffer: png}); await pg.waitForTimeout(1200);
  t = (await S(pg)).tx.slice(-1)[0];
  console.log('401 fallback:', t && t.note, t && t.amount, '| toast:', await pg.textContent('#toast'));
  // settings card
  await pg.click('#gear'); await pg.waitForTimeout(200);
  console.log('settings card:', (await pg.textContent('#view')).includes('Yapay zeka açık'));
  console.log('overflow', await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  console.log('errors', errs);
  await b.close();
})();
