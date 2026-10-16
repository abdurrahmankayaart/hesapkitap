# Hesap Kitap: proje hafızası

Bu dosya Claude Code'un projeyi tanıması içindir. Her oturumda otomatik okunur. Yeni bir şey öğrenince ya da bir iş bitince **bu dosyayı güncelle** ("Yapılacaklar" ve "Kararlar" bölümleri).

## Ürün
- **Hesap Kitap**: Türkçe, telefon öncelikli, ücretsiz aylık gelir-gider takip uygulaması. Üyelik yok; veriler cihazda (localStorage + IndexedDB). İsteğe bağlı **cihazlar arası eşitleme** açılırsa veriler ayrıca kendi sunucumuzda durur (aşağıda "Eşitleme").
- Sahibi: Abdurrahman Kaya (abdurrahmankayaart@gmail.com). Kendisi, eşi Rumeysa ve arkadaşları kullanacak. Kullanıcıyla **Türkçe** konuş, teknik terimleri sade anlat.
- **Yayın adresi: https://abdurrahmankaya.com/takip/** — kullanıcının kendi VPS'i (Coolify). Kuruldu (2026-10-06), aşağıdaki "VPS'e yayın" bölümüne bak.
- Eski yayın (hâlâ açık): GitHub Pages → https://abdurrahmankayaart.github.io/hesapkitap/ (depo: `abdurrahmankayaart/hesapkitap`, eski adı `Gelir---Gider-Tablosu`). Buraya "yeni adrese taşındık" bandı konacak (yapılmadı).
- Ayrıca Capacitor ile iOS/Android uygulaması olarak paketli (`ios/`, `android/`), mağazaya henüz yüklenmedi.

## Kullanıcının tercihleri (önemli)
- Görsel/büyük değişikliklerde **önce önizleme göster** (ekran görüntüsü), onay gelince yayına al.
- "Yapay zekayla yapılmış" hissi vermesin; kişisel, sıcak dil ("Merhaba Abdurrahman").
- **Moral bozmayan tasarım**: Özet'te kırmızı eksi bakiye gösterme. Açılış kartı (`heroStyle = 'bugun'`) bugünkü günlük harcamayı gösterir; aylık toplam göz düğmesiyle açılır. Harcama geliri aşınca suçlamayan, yol gösteren yazı.
- Özet kartının altında A'râf 31 ayeti var; kullanıcı istedi, kaldırma.
- Sabit giderler (kira, fatura, abonelik, taksit) günlük harcamalardan ayrı: Hareketler → Sabit sekmesi.
- Ücretli API / API anahtarı istemez (fiş okuma cihazda Tesseract ile, ücretsiz). Ücretli push bildirim istemez.
- Türkçe ekler: "%96'i" gibi yüzdeye ek getirme; ekten bağımsız cümle kur.

## Dosyalar
| Dosya | Ne |
|---|---|
| `index.html` | Uygulamanın tamamı (~2250 satır: CSS + HTML + JS, framework yok). `<!-- APP START -->` / `<!-- APP END -->` arası önizleme için ayrıca kesilip yayınlanabilir. |
| `sw.js` | Service worker, network-first. **Her yayında `CACHE = 'kese-vN'` sayısını 1 artır.** |
| `manifest.webmanifest` | PWA ayarları, kısayollar (`#ekle`, `#yaz`) |
| `privacy.html` | Gizlilik politikası (mağazalar için zorunlu) |
| `icon.svg`, `icon-*.png`, `store-icon-1024.png`, `og.png` | Simgeler, WhatsApp/sosyal önizleme görseli |
| `capacitor.config.json`, `ios/`, `android/` | Yerel uygulama projeleri (appId `com.hesapkitap.app`) |
| `scripts/build-web.mjs` | Web dosyalarını `www/`'ya kopyalar (Capacitor için) |
| `scripts/make-icons.js` | Tüm simge/açılış PNG'lerini yeniden üretir (`npm run icons`) |
| `scripts/store-screenshots.js` | Mağaza ekran görüntüleri (`npm run store-shots`, çıktı `store/ekran-goruntuleri/_yeni/`) |
| `store/` | Mağaza metinleri, ekran görüntüleri, Play öne çıkan görsel, karekod |
| `MAGAZA.md` | App Store / Google Play yükleme rehberi |
| `firestore.rules` | İleride ortak bütçe (Firebase) için hazır güvenlik kuralları, henüz kullanılmıyor |
| `tests/e2e/` | Playwright testleri (`npm test`), ayrıntı `tests/e2e/README.md` |
| `.github/workflows/` | `android.yml` (test APK + Secrets varsa imzalı AAB), `ios.yml` (simülatör derlemesi) |

## index.html içinde bölümler (yorum başlıklarıyla aranır: `/* ===...`)
helpers · categories · starter templates (`PROFILES`, sadece örnek veri için) · sample data (`makeSample`) · storage (kişiler) · state (`S`) · currencies & gold · credit card statements · reminders · frame · **ÖZET** (`renderOzet`, `heroAlt`, `heroMain`) · quick text (`parseQuick`) · records · charts · **HAREKETLER** (`renderList`, `ltabs`, `calHtml`, `fixedPageHtml`, `txRow`) · category detail · BÜTÇE · HEDEFLER (goals/debts/assets) · REPORT · AYARLAR (`fold()` açılır-kapanır kartlar) · import/export · receipt photos (IndexedDB `kese-photos`, `readReceipt`, `parseReceipt`, `autoReceipt`; karekod: `readQr`, `parseQrText`, `extractReceipt` ikisini birleştirir) · tags · add/edit sheet (`openSheet`) · modal · actions (tek `click` dinleyicisi, `data-act` / `data-*`) · toast · phone notifications (`notifList`, `planNotifs`, `toggleNotifs`; her `save()` sonrası yeniden zamanlanır) · backup + lock (PIN) · welcome (`askName`, `askStart`, `pickPerson`, tur).

## Veri (localStorage anahtarları — ADLARINI DEĞİŞTİRME, kullanıcı verisi kaybolur)
- `kese.people` kişi listesi; ilk kişi (`p0`) verisi `kese.v1`, diğerleri `kese.<id>`.
- `kese.notify` (`1` = telefon bildirimleri açık; yalnızca mağaza uygulaması), `<anahtar>.pin`, `<anahtar>.ui`, `kese.tour`, `kese.perms`, `kese.rates`, `kese.notified`, `kese.hero` (açılış kartı görünümü: `bugun` varsayılan, `klasik`, `pay`, `aliskanlik`, `gizli`).
- `S` şeması `v: 3`: `tx[]` (id, type gelir/gider, amount, cat, date `YYYY-MM-DD`, note, method kart/nakit, card, tags[], fixedId, inst{g,i,n,total}, photo), `budgets{total,cats}`, `fixed[]`, `quick[]`, `customCats[]`, `goals[]`, `cards[]`, `debts[]`, `assets[]`, `rollover`, `dismissed`, `sample`, ayrıca `since`, `autoDone`, `lastBackup`…
- Veri adrese (origin) bağlı: domain değişirse kullanıcı Ayarlar → Yedek ile taşımalı.

## Tasarım
- Palet: gece mavisi `#212C46`, bordo `#932C2E`, tik `#A66540`, yosun `#606A5F`, kanvas `#D4C4B0`. Token'lar `:root` ve iki koyu tema bloğunda (`--bg`, `--surface`, `--ink`, `--accent`, `--teak`, `--in`, `--out`, `--save`…). Renkleri doğrudan yazma, token kullan.
- Fontlar: Bricolage Grotesque (başlık), Figtree (metin), ayet için Georgia italik.
- Telefon genişliği 360–440px'te taşma olmamalı (testler `overflow 0` kontrol eder).

## Çalıştırma ve test
```
npm install
npx playwright install chromium     # ilk seferde
npm run serve                       # http://localhost:8000
npm test                            # 13 uçtan uca test
PORT=8000 DATA_DIR=/tmp/hk WEB_ROOT=. node server.js   # eşitlemeyi yerelde denemek için (npm run serve eşitlemeyi sunmaz)
```
- Testler örnek veriyi bugünün tarihine göre üretir; testte sabit tarih seçici kullanma.
- Service worker `file://` altında çalışmaz; SW denemesi gerekirse `npm run serve` ile.

## Yayın akışı
1. Değişiklik → `sw.js` CACHE +1 → (gerekirse Ayarlar'daki sürüm yazısı "Hesap Kitap 3.x") → commit (Türkçe, açıklayıcı).
2. **`npm run deploy`**: testleri çalıştırır → `git push` → Coolify deploy'unu izler (webhook başlatmadıysa API ile tetikler) → `https://abdurrahmankaya.com/takip/sw.js` içindeki CACHE sürümünü doğrular. Yaklaşık 1 dk. Testsiz: `npm run deploy -- --no-test`.
3. Yalnızca `git push` da yeter: GitHub webhook'u Coolify'ı tetikler (buluttaki oturumlar için). GitHub Pages de aynı daldan güncellenir.
4. GitHub Actions: Android APK ve iOS derlemesi her push'ta çalışır; sonucu kontrol et.
5. Telefonda eski sürüm görünürse uygulamayı kapatıp aç.

## VPS'e yayın: abdurrahmankaya.com/takip (KURULDU 2026-10-06)
- **Coolify**: panel `http://187.127.77.126:8000`, proje "Kisisel web sitem" / production, uygulama adı `hesapkitap`, UUID `lgclgpmzb2kcdk4w1wdm58bg`. Kaynak: public GitHub deposu, dal `claude/monthly-expense-tracker-3cktrg`, build pack **Dockerfile**.
- **Dosyalar**: `Dockerfile` (node:22-alpine), `server.js` (bağımlılıksız: web dosyalarını sunar + `/api/sync`), `scripts/deploy.mjs`. Yeni bir web dosyası eklenirse hem `Dockerfile` `COPY` satırına hem `server.js` içindeki `FILES` listesine ekle.
- **Yönlendirme**: Coolify domain `https://abdurrahmankaya.com/takip` (+ `www`). Traefik `/takip` önekini siler; Nginx ikisini de kaldırır. `www.` → `abdurrahmankaya.com/takip/` 301 (veri origin'e bağlı, ikiye bölünmesin). Ana site (PHP, ayrı Coolify uygulaması) etkilenmez; ama `/takip` ile başlayan her yol (ör. `/takipci`) bu uygulamaya gelir, ana sitede öyle bir sayfa açma.
- **Önbellek**: html/js/manifest `no-cache`, png/svg 7 gün. `sw.js` `/api/` isteklerine hiç dokunmaz.
- **Kalıcı disk**: Coolify'da `/data` (Storages → `hesapkitap-data`). Eşitleme verisi burada; bu disk silinirse herkesin eşitlenen verisi gider. Dockerfile ya da Coolify ayarı değişirken `/data` bağlantısını koru.
- **Token**: `~/.coolify-token` (chmod 600) ya da `COOLIFY_TOKEN`. Depoya/sohbete yazma. Yeni bilgisayarda: Coolify → Keys & Tokens → API tokens → `root` yetkili token → `pbpaste > ~/.coolify-token && chmod 600 ~/.coolify-token`.
- **Webhook**: GitHub deposunda push webhook'u → `…:8000/webhooks/source/github/events/manual` (gizli anahtar Coolify uygulamasında).
- VPS: Hostinger `srv1638664.hstgr.cloud`, IP `187.127.77.126`. DNS Hostinger'da, `A @` ve `A www` bu IP'ye gidiyor.

**Eski adres (github.io)**
- `MOVED` sabiti: `github.io`'da açılınca Özet'in üstünde "yeni adresine taşındı" bandı çıkar (yedeği indir → yeni adrese git). Veri kendiliğinden taşınmaz. Pages'i kapatma; kullanıcılar taşınınca kapatılabilir.
- Karekod `store/karekod.png` yeni adresi gösterir (3.5'te yenilendi).

## Eşitleme (2026-10-11)
Kullanıcı "site her cihazda aynı veriyi göstersin" istedi; telefon ile bilgisayarın ayrı veri tutması onu şaşırttı.
- **Sunucu** (`server.js`): `GET/PUT /api/sync/<sha256(kod)>`. Dosya: `/data/<id>.json` = `{v, t, data}`; her yazmada `.prev` kopyası. `PUT {base, data}`: `base` sunucudaki `v` değilse **409** + güncel belge döner.
- **İstemci** (`index.html`, "sync" bölümü): `SY` (`<anahtar>.sync` = `{code, id, v, dirty, last}`), `syncNow` (al → `mergeState` → gerekirse gönder; 409'da baştan), `syncTouch` (her `save()` sonrası 1,2 sn), 20 sn'de bir ve sekme öne gelince yoklama.
- **Birleştirme** kayıt bazında: `COLS` dizilerinde id ile birleşim; aynı id'de `ts`'si büyük olan; skaler alanlarda `S.mt`'si yeni olan taraf. **Silmeler** `S.del {id: zaman}` ile taşınır (`trackDeletes`, `save()` içinde önceki id kümesiyle fark alır); geri alma `S.rev`. `S`'yi topluca değiştiren her yerde `knownIds = allIds()` yapılmalı, yoksa her şey "silindi" sayılır.
- `save()` = kullanıcı değişikliği (silme izi + `mt` + eşitleme). `localSave()` = yalnızca yaz (eşitlemeden gelen veri için). Karıştırma.
- `canon()` karşılaştırması sıradan bağımsız; yoksa iki cihaz birbirini sonsuza kadar tetikler (testte "durulunca sunucu sürümü sabit").
- Bağlama: Ayarlar → kod, ya da `…/takip/#bagla=<kod>` bağlantısı. Boş/örnek verili cihaz sunucudakini olduğu gibi alır; dolu cihaz birleştirir.
- PIN unutma sıfırlaması eşitlemeyi önce kapatır (sunucudaki veri silinmesin). "Tüm verileri sil" eşitleme açıkken her yerden siler.
- Fiş fotoğrafları (IndexedDB) eşitlenmez. Veri sunucuda şifresiz durur; koruma kodun tahmin edilemezliği.
- Test: `tests/e2e/tsync.js` kendi `server.js`'ini geçici klasörle başlatır (iki-üç cihaz, çevrimdışı çakışma, sunucu yeniden başlatma).

## Kararlar (geçmiş)
- Ad "Kese" → "Hesap Kitap" oldu; iç anahtarlarda "kese" kaldı (veri uyumu için).
- Başlangıç şablonları (öğrenci/aile vb.) kaldırıldı; herkes "Hemen başla" ile boş başlar.
- Anthropic API ile fiş okuma kaldırıldı; yalnızca cihazda Tesseract (jsdelivr'den yüklenir).
- Uygulama içinde izinler ekranı yapıldı ama kullanıcı istemedi; kodu git stash'te / `_arsiv/` yamasında duruyor, kullanma.
- Yerel uygulamada (Capacitor) sesle giriş gizli; WebView'da çalışmıyor.

## Yapılacaklar / bekleyenler
- [x] VPS'e yayın (abdurrahmankaya.com/takip) + `npm run deploy` — kuruldu 2026-10-06.
- [x] 3.5 (2026-10-06): github.io'da "taşındık" bandı, yeni karekod, Ayarlar → Görünüm'de "Ana ekrandaki üst kart" seçimi, Yedek'te "Drive / iCloud'a gönder" (paylaşım ekranı; destekleyen cihazlarda görünür) ve "son yedek X gün önce", fişte e-Arşiv karekodu okuma (`BarcodeDetector`, yoksa jsdelivr'den jsQR), mağaza ekran görüntüleri yenilendi.
- [x] 3.5 (2026-10-08): açılış kartı (`bugun`) sadeleşti — tek rakam + ince bütçe çizgisi (`.hbar`), aylık toplam kutuları yalnızca göze basınca çıkar. Koyu tema koyulaştı (`--bg:#0B0F18`). Kullanıcı halka + hafta şeridi ve tam bordo zeminli denemeleri beğenmedi; **sade ve koyu** istiyor.
- [x] 2026-10-09: kullanıcı isteğiyle Özet'teki "Günlük harcama" çubuk grafiği kaldırıldı, yerine takvim (`calHtml`) geldi; takvim kutularında tutar yazmaz (yalnızca renk). 1 milyon ve üstü tutarda onay sorulur (`BIG`). Kayıt düzenlerken ilk rakam eski tutarın yerine geçer (`F.fresh`), tutara dokununca temizlenir; tuş takımında `167,765` ve hızlı yazmada `2,450` binlik sayılır.
- [x] 2026-10-10: **Sabit sekmesi** yeniden düzenlendi. `S.fixed[]` kalemi artık `amount: 0` olabilir (tutar ödeyince sorulur, `famt`), `multi: true` olabilir (ayrı kart, ay içinde isim+tarihli birçok kayıt; ör. Düğün Gram çekimleri). Düzenli gelirler ve sabit giderler ayrı kartlarda; ödenen düğme yeşil (`--paid`); kalemin altında önceki ayların tutarı (`fhist`). `storage` olayıyla sekmeler arası eşitleme var (iki sekme birbirinin üstüne yazmasın).
- Kullanıcının kendi verisi masaüstü Chrome'da (abdurrahmankaya.com/takip). Claude in Chrome ile `localStorage['kese.v1']` okunup yazılarak toplu kayıt girildi; yazdıktan sonra sayfa yenilenmeli.
- [ ] Hızlı yazmada `kahve 12.5` tarihi 12 Mayıs sanıyor (tutar bulunamıyor); `12.50` doğru çalışıyor.
- [ ] `tests/e2e/t7.js` fiş adımı (OCR, internetten Tesseract) ara sıra zaman aşımına düşüyor; tek başına geçiyor. Bekleme süresi uzatılmalı.
- [ ] **Telefon bildirimleri** kodu hazır (`@capacitor/local-notifications`, Ayarlar → Bildirimler yalnızca mağaza uygulamasında görünür) ama **gerçek telefonda denenmedi**; sahte eklentiyle test var (`tests/e2e/tyeni.js`). İlk test APK'sında dene: izin penceresi, saat 10/21 bildirimleri.
- [ ] Karekod okuma gerçek fişle denenmedi (test, üretilmiş e-Arşiv karekoduyla). Gerçek fişte alan adları farklı çıkarsa `parseQrText` içine ekle.
- [ ] (Vazgeçildi, isteğe bağlı) hesapkitap.abdurrahmankaya.com alt alan adı → GitHub Pages. Yapılacaksa DNS eklenmeden depoya `CNAME` dosyası gönderme.
- [ ] **Firebase ile bulut/ortak bütçe** (Abdurrahman + Rumeysa): kullanıcıdan `firebaseConfig` bekleniyor; Google girişi, `firestore.rules` hazır. KVKK/gizlilik metni güncellenmeli.
- [ ] **App Store (2026-10-16 durumu)**: kod tarafı hazır (MAGAZA.md sonundaki kontrol listesi, `.github/workflows/ios-release.yml`, `store/magaza-metinleri.md` gizlilik beyanı ve inceleme notu, 6,9" + 6,7" ekran görüntüleri, yalnızca iPhone + dikey). **Bekleyen: kullanıcının Apple Developer hesabı** (bütçe gelince açacak). Sonra sırayla: App Store Connect'te uygulama kaydı (tarayıcıdan) → API anahtarı + 4 secret → iş akışını ilk kez çalıştır (imza ayarı çıkabilir) → gerçek iPhone'da TestFlight → formlar → inceleme.
- [ ] **Mağazalar**: Google Play (25 $) ve Apple Developer (99 $/yıl) hesapları açılınca `MAGAZA.md`'ye göre ilerle. Play yükleme anahtarı kullanıcıda (`play-anahtari.txt`); GitHub Secrets'a eklenince Actions imzalı AAB üretir.
- [ ] Rakip araştırmasından öneriler (kalanlar): kategori öğrenme ve tekrarlayan harcama tespiti, Android banka bildirimi okuma, ana ekran widget'ı, Apple Pay/Kestirmeler, altın günü takibi, 12 aylık taksit yükü grafiği.
- [ ] `tests/e2e/t10.js` (fiş OCR) eski yapay zeka bölümünü test ediyor; güncellenip `run-all`'a eklenmeli.
