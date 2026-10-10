// 3.5: Ayarlar'da ana ekran görünümü seçimi, eski adreste "taşındık" bandı, fişteki karekoddan tutar okuma.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, {recursive: true}); process.chdir(OUT);
const OLD = 'https://abdurrahmankayaart.github.io/hesapkitap/';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, colorScheme: 'light', locale: 'tr-TR'});
  await ctx.addInitScript(() => { localStorage.setItem('kese.tour', '1'); });
  await ctx.route(OLD + '**', r => { const f = new URL(r.request().url()).pathname.replace('/hesapkitap/', '') || 'index.html'; const p = path.join(ROOT, f); return fs.existsSync(p) ? r.fulfill({path: p}) : r.fulfill({status: 404, body: ''}); });
  const errs = [], fail = [];
  const check = (name, ok) => { console.log(ok ? 'ok ' : 'FAIL', name); if (!ok) fail.push(name); };
  const start = async (pg, url) => { pg.on('pageerror', e => errs.push(e.message)); await pg.goto(url); await pg.waitForTimeout(400);
    await pg.fill('#wn', 'Abdurrahman'); await pg.click('#wName .save'); await pg.waitForTimeout(500); await pg.click('[data-wstart="blank"]'); await pg.waitForTimeout(800); };
  const add = async (pg, t) => { await pg.fill('#qtext', t); await pg.press('#qtext', 'Enter'); await pg.waitForTimeout(400); };

  // 1) yeni adres (burada dosyadan): bant yok, ana ekran görünümü seçilebiliyor ve kalıcı
  const pg = await ctx.newPage(); await start(pg, pathToFileURL(path.join(ROOT, 'index.html')).href + '#ozet');
  await add(pg, 'market 1200');
  check('yeni adreste taşındık bandı yok', !(await pg.textContent('#view')).includes('yeni adresine taşındı'));
  await pg.click('#gear'); await pg.waitForTimeout(400);
  check('varsayılan görünüm Bugün', await pg.getAttribute('[data-heroset="bugun"]', 'aria-pressed') === 'true');
  await pg.locator('[data-heroset="bugun"]').scrollIntoViewIfNeeded(); await pg.screenshot({path: 'yeni-ayarlar-gorunum.png'});
  for (const k of ['klasik', 'pay', 'aliskanlik', 'gizli']) {
    await pg.click(`[data-heroset="${k}"]`); await pg.waitForTimeout(200);
    check(`${k} seçildi ve kaydedildi`, await pg.getAttribute(`[data-heroset="${k}"]`, 'aria-pressed') === 'true' && await pg.evaluate(() => localStorage.getItem('kese.hero')) === k);
  }
  await pg.click('#gear'); await pg.waitForTimeout(400);
  check('gizli görünümde tutar kapalı', (await pg.textContent('.hero')).includes('• • • •'));
  check('taşma yok', await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0);

  // 1b) çok büyük tutar: sormadan kaydetmez
  const txN = () => pg.evaluate(() => JSON.parse(localStorage.getItem('kese.v1')).tx.length);
  const n0 = await txN(); await pg.fill('#qtext', 'hediye 167.765.000'); await pg.press('#qtext', 'Enter'); await pg.waitForTimeout(400);
  check('milyonluk tutar onay soruyor, kaydetmiyor', await txN() === n0 && (await pg.textContent('#modal')).includes('doğru mu?'));
  await pg.click('#modal [data-mclose]'); await pg.waitForTimeout(300);
  check('vazgeçince kayıt yok, yazı duruyor', await txN() === n0 && (await pg.inputValue('#qtext')).includes('167.765.000'));
  await pg.fill('#qtext', ''); await add(pg, 'hediye 167.765'); check('167.765 sorusuz kaydedilir', await txN() === n0 + 1);

  // 1c) düzenleme: ilk rakam eski tutarın yerine geçer; "167,765" binlik sayılır
  const amtOf = note => pg.evaluate(n => (JSON.parse(localStorage.getItem('kese.v1')).tx.find(t => t.note === n) || {}).amount, note);
  const tap = async ks => { for (const k of ks) await pg.click(`#keypad button:text-is("${k}")`); };
  await pg.click('.nav a[data-v="hareketler"]'); await pg.waitForTimeout(400); await pg.click('[data-tx]:has-text("Hediye")'); await pg.waitForTimeout(400);
  await tap(['1', '6', '7', ',', '7', '6', '5']); check('düzenlemede yeni tutar eskisini siler', (await pg.textContent('#amtDisp')).trim() === '₺167.765');
  await pg.click('#txSave'); await pg.waitForTimeout(400); check('düzeltilen tutar kaydedildi', await amtOf('Hediye') === 167765);
  await pg.click('[data-tx]:has-text("Hediye")'); await pg.waitForTimeout(400); await pg.click('#amtDisp'); await tap(['4', '5', ',', '5']);
  check('tutara dokununca temizlenir', (await pg.textContent('#amtDisp')).trim() === '₺45,5'); await pg.click('#txSave'); await pg.waitForTimeout(400);
  await pg.click('.nav a[data-v="ozet"]'); await pg.waitForTimeout(400);
  await add(pg, 'ayakkabı 2,450'); check('hızlı yazmada 2,450 = 2450', await amtOf('Ayakkabı') === 2450);
  await add(pg, 'simit 12,50'); check('hızlı yazmada 12,50 = 12,5', await amtOf('Simit') === 12.5);

  // 1d) tarih: ileri ve geçmiş güne kayıt
  const dOf = note => pg.evaluate(n => (JSON.parse(localStorage.getItem('kese.v1')).tx.find(t => t.note === n) || {}).date, note);
  const iso = k => { const d = new Date(Date.now() + k * 864e5); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const addOn = async (note, pick) => { await pg.click('#fab'); await pg.waitForTimeout(400); await tap(['5', '0']); await pg.click('[data-c="market"]'); await pg.fill('#txNote', note); await pick(); await pg.click('#txSave'); await pg.waitForTimeout(400); };
  await addOn('Yarınki', () => pg.click('#sheet [data-d="1"]')); check('Yarın düğmesi ileri tarihe kaydeder', await dOf('Yarınki') === iso(1));
  await addOn('Eski', async () => { await pg.fill('#txDate', iso(-20)); check('tarih kutusu görünür, seçilen gün yanında yazıyor', await pg.isVisible('#txDate') && await pg.getAttribute('#txDateL', 'aria-pressed') === 'true' && /\d+ \S+ \S+/.test(await pg.textContent('#txDateT'))); await pg.locator('.opts').first().screenshot({path: 'yeni-tarih-kutusu.png'}); });
  check('geçmiş güne kaydeder', await dOf('Eski') === iso(-20));

  // 1e) tutarı değişen sabit kalem: boş tutarla eklenir, "Ödendi" tutarı sorar, kaydı kaleme bağlar; geçen ayların tutarı görünür
  await pg.evaluate(() => { const S = JSON.parse(localStorage.getItem('kese.v1')); S.fixed.push({id: 'fxel', name: 'Ev elektrik', type: 'gider', amount: 0, day: 28, cat: 'fatura', auto: false});
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    S.tx.push({id: 'old1', type: 'gider', cat: 'fatura', amount: 790, note: 'Ev elektrik', date: k + '-27', method: 'kart', fixedId: 'fxel', ts: 1}); localStorage.setItem('kese.v1', JSON.stringify(S)); });
  await pg.reload(); await pg.waitForTimeout(900); await pg.evaluate(() => { document.getElementById('welcome').hidden = true; });
  await pg.click('.nav a[data-v="hareketler"]'); await pg.waitForTimeout(300); await pg.click('[data-ltab="sabit"]'); await pg.waitForTimeout(300);
  const fx = await pg.textContent('#view');
  check('tutarsız kalem "ödeyince sorulur" yazıyor', fx.includes('tutar ödeyince sorulur'));
  check('geçen ay ödenen tutar görünüyor', fx.includes('₺790'));
  await pg.click('[data-pay="fxel"]'); await pg.waitForTimeout(400); await tap(['8', '4', '5']); await pg.click('#txSave'); await pg.waitForTimeout(400);
  check('ödenince tutar soruldu ve kaleme bağlandı', await pg.evaluate(() => JSON.parse(localStorage.getItem('kese.v1')).tx.some(t => t.fixedId === 'fxel' && t.amount === 845 && t.note === 'Ev elektrik')));
  check('ödenen kalemde beyaz Ödendi kalmadı, yalnızca + var', (await pg.textContent('[data-pay="fxel"]')).trim() === '+');
  check('ödenen kalemin düğmesi yeşil ve tutarı yazıyor', await pg.evaluate(() => { const b = document.querySelector('.btn.paid'); return !!b && /✓ Ödendi/.test(b.textContent) && getComputedStyle(b).backgroundColor === 'rgb(47, 125, 85)' && b.closest('.li').textContent.includes('₺845 ödendi'); }));
  await pg.locator('.card:has(.btn.paid)').first().screenshot({path: 'yeni-odendi-yesil.png'});
  // 1f) düzenli gelir ayrı kartta; "Geldi" tutarı sorar, gelir olarak kaydeder
  await pg.evaluate(() => { const S = JSON.parse(localStorage.getItem('kese.v1')); S.fixed.push({id: 'fxmu', name: 'Makro Stüdyo', type: 'gelir', amount: 0, day: 28, cat: 'ek', auto: false}); localStorage.setItem('kese.v1', JSON.stringify(S)); });
  await pg.reload(); await pg.waitForTimeout(900); await pg.evaluate(() => { document.getElementById('welcome').hidden = true; });
  await pg.click('[data-ltab="sabit"]'); await pg.waitForTimeout(300);
  check('gelir ve gider ayrı kartlarda', await pg.evaluate(() => { const hs = [...document.querySelectorAll('#view h2')].map(h => h.textContent); const inc = [...document.querySelectorAll('#view .card')].find(c => c.querySelector('h2') && c.querySelector('h2').textContent === 'Düzenli gelirler'); return hs.includes('Sabit giderler') && !!inc && inc.textContent.includes('Makro Stüdyo') && !inc.textContent.includes('Ev elektrik'); }));
  await pg.click('[data-pay="fxmu"]'); await pg.waitForTimeout(400); await tap(['1', '5', '0', '0', '0']); await pg.click('#txSave'); await pg.waitForTimeout(400);
  check('Geldi: gelir olarak kaydedildi', await pg.evaluate(() => JSON.parse(localStorage.getItem('kese.v1')).tx.some(t => t.fixedId === 'fxmu' && t.amount === 15000 && t.type === 'gelir')));
  check('gelir kartında toplam yazıyor', (await pg.textContent('#view')).includes('1/1 geldi · bu ay ₺15.000'));
  await pg.click('[data-pay="fxmu"]'); await pg.waitForTimeout(400); await tap(['5', '0', '0', '0']); await pg.click('#txSave'); await pg.waitForTimeout(400);
  check('aynı ay ikinci ödeme eklenir ve toplanır', (await pg.textContent('#view')).includes('₺20.000 geldi · 2 ödeme'));
  await pg.locator('#view').screenshot({path: 'yeni-sabit-ayri.png'});
  await pg.click('.nav a[data-v="ozet"]'); await pg.waitForTimeout(300);

  // 1h) "birçok kayıt" kalemi: ayrı kart, isim + tarih + tutar, ay toplamı
  await pg.evaluate(() => { const S = JSON.parse(localStorage.getItem('kese.v1')); S.fixed.push({id: 'fxdg', name: 'Düğün Gram', type: 'gelir', amount: 0, day: 28, cat: 'ek', auto: false, multi: true}); localStorage.setItem('kese.v1', JSON.stringify(S)); });
  await pg.reload(); await pg.waitForTimeout(900); await pg.evaluate(() => { document.getElementById('welcome').hidden = true; });
  await pg.click('.nav a[data-v="hareketler"]'); await pg.waitForTimeout(300); await pg.click('[data-ltab="sabit"]'); await pg.waitForTimeout(300);
  const shoot = async (name, digits) => { await pg.click('[data-multi="fxdg"] [data-pay="fxdg"]'); await pg.waitForTimeout(400); await pg.fill('#txNote', name); await tap(digits); await pg.click('#txSave'); await pg.waitForTimeout(400); };
  await shoot('Ayşe & Mehmet', ['2', '5', '0', '0', '0']); await shoot('Elif & Can', ['3', '0', '0', '0', '0']);
  const mc = await pg.textContent('[data-multi="fxdg"]');
  check('çekimler ayrı kartta isimle listeleniyor', mc.includes('Ayşe & Mehmet') && mc.includes('Elif & Can') && mc.includes('2 kayıt') && mc.includes('₺55.000'));
  check('çekim kartı düzenli gelirler listesine karışmıyor', await pg.evaluate(() => { const inc = [...document.querySelectorAll('#view .card')].find(c => c.querySelector('h2') && c.querySelector('h2').textContent === 'Düzenli gelirler'); return !!inc && !inc.textContent.includes('Düğün Gram'); }));
  check('taşma yok (sabit)', await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0);
  await pg.locator('[data-multi="fxdg"]').screenshot({path: 'yeni-dugungram-kart.png'});
  await pg.click('.nav a[data-v="ozet"]'); await pg.waitForTimeout(300);

  // 1j) Günlük → Gelirler: sabit kaleme bağlı gelirler de listelenir
  await pg.click('.nav a[data-v="hareketler"]'); await pg.waitForTimeout(300); await pg.click('[data-ltab="gunluk"]'); await pg.waitForTimeout(300); await pg.click('[data-ft="gelir"]'); await pg.waitForTimeout(300);
  const gl = await pg.textContent('#view');
  check('Gelirler filtresi müşteri ve çekim gelirlerini gösteriyor', gl.includes('Ayşe & Mehmet') && gl.includes('Elif & Can') && gl.includes('Makro Stüdyo'));
  await pg.click('[data-ft="gider"]'); await pg.waitForTimeout(300);
  check('Giderler filtresinde sabit ödeme yok', !(await pg.textContent('#view')).includes('Ev elektrik'));
  await pg.click('[data-ft="all"]'); await pg.waitForTimeout(200);

  // 1i) notlar: tutarlı not eklenir, gelir-gider toplamı değişmez
  await pg.click('.nav a[data-v="hareketler"]'); await pg.waitForTimeout(300); await pg.click('[data-ltab="sabit"]'); await pg.waitForTimeout(300);
  const totals = () => pg.evaluate(() => { const t = JSON.parse(localStorage.getItem('kese.v1')).tx; return t.length + ':' + t.reduce((a, x) => a + x.amount, 0); });
  const tb = await totals();
  await pg.click('[data-act="newNote"]'); await pg.waitForTimeout(300); await pg.fill('#f_text', 'Hyundai i20 satıldı'); await pg.fill('#f_amount', '370000'); await pg.click('#modal .save'); await pg.waitForTimeout(400);
  const nc = await pg.textContent('[data-notes]');
  check('not eklendi, tutarıyla görünüyor', nc.includes('Hyundai i20 satıldı') && nc.includes('₺370.000'));
  check('not gelir-gidere katılmadı', await totals() === tb && await pg.evaluate(() => JSON.parse(localStorage.getItem('kese.v1')).notes.length === 1));
  await pg.click('.nav a[data-v="ozet"]'); await pg.waitForTimeout(300);

  // 1g) iki sekme: diğer sekmede eklenen kayıt bu sekmeye gelir, sonraki kayıt onu silmez
  const pg2 = await ctx.newPage(); await pg2.goto(pg.url()); await pg2.waitForTimeout(900); await pg2.evaluate(() => { document.getElementById('welcome').hidden = true; });
  await add(pg2, 'ikincisekme 77'); await pg.waitForTimeout(400); await add(pg, 'birincisekme 33');
  check('iki sekme birbirinin kaydını silmiyor', await pg.evaluate(() => { const t = JSON.parse(localStorage.getItem('kese.v1')).tx; return t.some(x => x.amount === 77) && t.some(x => x.amount === 33); }));
  await pg2.close();

  // 2) karekod: e-Arşiv karekodlu fotoğraftan tutar okunur (OCR bir şey bulamasa da)
  await pg.setInputFiles('#qcamFile', path.join(__dirname, 'fixtures', 'earsiv-karekod.png'));
  await pg.waitForFunction(() => { try { return JSON.parse(localStorage.getItem('kese.v1')).tx.some(t => t.amount === 1249.5); } catch (e) { return false; } }, null, {timeout: 120000}).then(() => check('karekoddan 1.249,50 okundu', true), () => check('karekoddan 1.249,50 okundu', false));
  await pg.close();

  // 3) eski adres (github.io): bant görünür, yedek indirme ve yeni adres bağlantısı var
  const old = await ctx.newPage(); await start(old, OLD + '#ozet');
  let t = await old.textContent('#view');
  check('eski adreste kayıt yokken bant: yeni adrese git', t.includes('yeni adresine taşındı') && !t.includes('Yedeğimi indir'));
  await add(old, 'kahve 120'); t = await old.textContent('#view');
  check('kayıt varken yedek indirme adımı', t.includes('1. Yedeğimi indir') && t.includes('2. Yeni adrese git'));
  check('bağlantı yeni adrese', await old.getAttribute('.banner a', 'href') === 'https://abdurrahmankaya.com/takip/');
  check('taşma yok (eski adres)', await old.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0);
  await old.screenshot({path: 'yeni-tasindi-bandi.png'});

  // 4) bildirimler (mağaza uygulaması taklidi): açınca zamanlanır, kayıt girince bu akşamki hatırlatma kalkar, kapatınca hepsi iptal
  const nctx = await b.newContext({viewport: {width: 390, height: 844}, locale: 'tr-TR'});
  await nctx.addInitScript(() => { localStorage.setItem('kese.tour', '1'); const st = window.__ln = {pending: [], perm: 0};
    window.Capacitor = {isNativePlatform: () => true, Plugins: {LocalNotifications: {
      requestPermissions: async () => { st.perm++; return {display: 'granted'}; }, getPending: async () => ({notifications: st.pending.map(x => ({id: x.id}))}),
      cancel: async o => { const ids = o.notifications.map(x => x.id); st.pending = st.pending.filter(x => !ids.includes(x.id)); }, schedule: async o => { st.pending.push(...o.notifications); }}}}; });
  const np = await nctx.newPage(); await start(np, pathToFileURL(path.join(ROOT, 'index.html')).href + '#ozet');
  const pend = () => np.evaluate(() => window.__ln.pending.map(x => ({t: x.title, b: x.body, at: +new Date(x.schedule.at)})));
  await np.waitForTimeout(1200); check('kapalıyken bildirim zamanlanmaz', (await pend()).length === 0);
  await np.click('#gear'); await np.waitForTimeout(300); await np.click('[data-act="toggleNotifs"]'); await np.waitForTimeout(1300);
  let pl = await pend(); const evening = new Date().getHours() < 21 ? 7 : 6;
  check(`açınca ${evening} akşam hatırlatması`, pl.length === evening && pl.every(x => x.at > Date.now() && new Date(x.at).getHours() === 21));
  await np.click('#gear'); await np.waitForTimeout(300); await add(np, 'kahve 120'); await np.waitForTimeout(1300);
  pl = await pend(); check('bugün kayıt girince bu akşamki kalkar', pl.length === 6 && pl.every(x => new Date(x.at).getDate() !== new Date().getDate()));
  await np.evaluate(() => { document.querySelector('#gear').click(); }); await np.waitForTimeout(300);
  await np.click('[data-act="toggleNotifs"]'); await np.waitForTimeout(1300);
  check('kapatınca hepsi iptal', (await pend()).length === 0);
  await nctx.close();

  console.log('errs:', JSON.stringify(errs));
  await b.close();
  process.exit(fail.length ? 1 : 0);
})();
