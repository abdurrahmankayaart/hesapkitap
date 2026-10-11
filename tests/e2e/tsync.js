// Cihazlar arası eşitleme: iki ayrı tarayıcı (iki cihaz) aynı kodla bağlanır; ekleme, silme, çevrimdışı çakışma, sunucu yeniden başlatma.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path'), fs = require('fs'), os = require('os');
const ROOT = path.resolve(__dirname, '../..');
const PORT = 8700 + Math.floor(Math.random() * 200), URL0 = `http://localhost:${PORT}/takip/`;
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'hk-sync-'));
const startServer = () => new Promise(res => { const p = spawn(process.execPath, [path.join(ROOT, 'server.js')], {env: {...process.env, PORT, DATA_DIR: DATA, WEB_ROOT: ROOT}}); p.stdout.on('data', () => res(p)); p.stderr.on('data', d => console.log('server err', String(d))); });
(async () => {
  let srv = await startServer();
  const b = await chromium.launch(), errs = [], fail = [];
  const check = (name, ok) => { console.log(ok ? 'ok ' : 'FAIL', name); if (!ok) fail.push(name); };
  const device = async name => { const ctx = await b.newContext({viewport: {width: 390, height: 844}, locale: 'tr-TR'}); await ctx.addInitScript(() => localStorage.setItem('kese.tour', '1'));
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(name + ': ' + e.message)); pg.on('dialog', d => d.accept());
    await pg.goto(URL0); await pg.waitForTimeout(500); await pg.fill('#wn', name); await pg.click('#wName .save'); await pg.waitForTimeout(500); await pg.click('[data-wstart="blank"]'); await pg.waitForTimeout(800); return {ctx, pg}; };
  const add = async (pg, t) => { await pg.fill('#qtext', t); await pg.press('#qtext', 'Enter'); await pg.waitForTimeout(300); };
  const notes = pg => pg.evaluate(() => JSON.parse(localStorage.getItem('kese.v1')).tx.map(t => t.note).sort().join(','));
  const sync = async pg => { await pg.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await pg.waitForTimeout(900); };
  const settle = async (...pgs) => { for (let i = 0; i < 3; i++) for (const p of pgs) await sync(p); };

  // A: kayıt gir, eşitlemeyi aç
  const A = await device('Abdurrahman'); await add(A.pg, 'kahve 120'); await add(A.pg, 'market 450');
  await A.pg.click('#gear'); await A.pg.waitForTimeout(300); await A.pg.click('[data-act="syncOn"]'); await A.pg.waitForTimeout(1500);
  const code = (await A.pg.textContent('#syncCode')).trim();
  check('kod üretildi', /^[a-z0-9]{5}(-[a-z0-9]{5}){3}$/.test(code));
  check('sunucuda dosya oluştu', fs.readdirSync(DATA).filter(f => /^[a-f0-9]{64}\.json$/.test(f)).length === 1);
  await A.pg.click('#gear'); await A.pg.waitForTimeout(300);

  // B: boş cihaz, bağlantıyla bağlanır → A'nın kayıtlarını alır
  const B = await device('Telefon');
  await B.pg.goto(URL0 + '#bagla=' + code); await B.pg.reload(); await B.pg.waitForTimeout(1200);
  await B.pg.click('#modal .save'); await B.pg.waitForTimeout(1800);
  check('B, A\'nın kayıtlarını aldı', await notes(B.pg) === 'Kahve,Market');
  check('B ekranında görünüyor', (await B.pg.textContent('#view')).includes('₺570'));

  // B ekler → A görür
  await add(B.pg, 'simit 25'); await B.pg.waitForTimeout(1500); await settle(A.pg, B.pg);
  check('B\'nin eklediği A\'da', await notes(A.pg) === 'Kahve,Market,Simit');

  // A siler → B'de de silinir (geri gelmez)
  await A.pg.click('.nav a[data-v="hareketler"]'); await A.pg.waitForTimeout(300); await A.pg.click('[data-tx]:has-text("Kahve")'); await A.pg.waitForTimeout(400); await A.pg.click('#txDel'); await A.pg.waitForTimeout(400);
  const yes = await A.pg.$('#modal .save'); if (yes && await yes.isVisible()) { await yes.click(); await A.pg.waitForTimeout(300); }
  await A.pg.click('.nav a[data-v="ozet"]'); await A.pg.waitForTimeout(1500); await settle(B.pg, A.pg);
  check('A\'nın sildiği B\'de de silindi', await notes(B.pg) === 'Market,Simit' && await notes(A.pg) === 'Market,Simit');

  // İkisi de internetsizken ayrı kayıt girer → bağlanınca ikisi de kalır
  await A.ctx.setOffline(true); await B.ctx.setOffline(true);
  await add(A.pg, 'taksi 180'); await add(B.pg, 'ekmek 30'); await A.pg.waitForTimeout(1500);
  check('internetsizken kayıt cihazda duruyor', (await notes(A.pg)).includes('Taksi') && (await notes(B.pg)).includes('Ekmek'));
  await A.ctx.setOffline(false); await B.ctx.setOffline(false); await settle(A.pg, B.pg, A.pg);
  check('çevrimdışı girilenler birleşti', await notes(A.pg) === 'Ekmek,Market,Simit,Taksi' && await notes(B.pg) === 'Ekmek,Market,Simit,Taksi');

  // Durulunca gereksiz yazma yok (iki cihaz birbirini sonsuza kadar tetiklemesin)
  const ver = () => JSON.parse(fs.readFileSync(path.join(DATA, fs.readdirSync(DATA).find(f => /^[a-f0-9]{64}\.json$/.test(f))), 'utf8')).v;
  const v1 = ver(); await settle(A.pg, B.pg, A.pg, B.pg); check('durulunca sunucu sürümü sabit', ver() === v1);

  // Sunucu yeniden başlar → veri duruyor; üçüncü cihaz kodu elle yazarak bağlanır
  srv.kill(); await new Promise(r => setTimeout(r, 400)); srv = await startServer();
  const C = await device('Rumeysa'); await C.pg.click('#gear'); await C.pg.waitForTimeout(300); await C.pg.click('[data-act="syncHave"]'); await C.pg.waitForTimeout(300);
  await C.pg.fill('#f_code', code.toUpperCase().replace(/-/g, ' ')); await C.pg.click('#modal .save'); await C.pg.waitForTimeout(2200);
  check('sunucu yeniden başladıktan sonra üçüncü cihaz her şeyi aldı', await notes(C.pg) === 'Ekmek,Market,Simit,Taksi');

  // Yanlış kod boş hesap açar, başkasının verisini göstermez
  const D = await device('Yabancı'); await D.pg.click('#gear'); await D.pg.waitForTimeout(300); await D.pg.click('[data-act="syncHave"]'); await D.pg.waitForTimeout(300);
  await D.pg.fill('#f_code', 'aaaaa-bbbbb-ccccc-ddddd'); await D.pg.click('#modal .save'); await D.pg.waitForTimeout(1800);
  check('yanlış kod kimsenin verisini göstermiyor', await notes(D.pg) === '');

  console.log('errs:', JSON.stringify(errs));
  await b.close(); srv.kill(); fs.rmSync(DATA, {recursive: true, force: true});
  process.exit(fail.length ? 1 : 0);
})();
