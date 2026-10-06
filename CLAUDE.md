# Hesap Kitap: proje hafızası

Bu dosya Claude Code'un projeyi tanıması içindir. Her oturumda otomatik okunur. Yeni bir şey öğrenince ya da bir iş bitince **bu dosyayı güncelle** ("Yapılacaklar" ve "Kararlar" bölümleri).

## Ürün
- **Hesap Kitap**: Türkçe, telefon öncelikli, ücretsiz aylık gelir-gider takip uygulaması. Üyelik yok, sunucu yok; veriler cihazda (localStorage + IndexedDB).
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
npm test                            # 11 uçtan uca test
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
- **Dosyalar**: `Dockerfile` (nginx:alpine, yalnızca web dosyalarını kopyalar — yeni bir web dosyası eklenirse `COPY` satırına da ekle), `deploy/nginx.conf`, `scripts/deploy.mjs`.
- **Yönlendirme**: Coolify domain `https://abdurrahmankaya.com/takip` (+ `www`). Traefik `/takip` önekini siler; Nginx ikisini de kaldırır. `www.` → `abdurrahmankaya.com/takip/` 301 (veri origin'e bağlı, ikiye bölünmesin). Ana site (PHP, ayrı Coolify uygulaması) etkilenmez; ama `/takip` ile başlayan her yol (ör. `/takipci`) bu uygulamaya gelir, ana sitede öyle bir sayfa açma.
- **Önbellek**: html/js/manifest `no-cache`, png/svg 7 gün.
- **Token**: `~/.coolify-token` (chmod 600) ya da `COOLIFY_TOKEN`. Depoya/sohbete yazma. Yeni bilgisayarda: Coolify → Keys & Tokens → API tokens → `root` yetkili token → `pbpaste > ~/.coolify-token && chmod 600 ~/.coolify-token`.
- **Webhook**: GitHub deposunda push webhook'u → `…:8000/webhooks/source/github/events/manual` (gizli anahtar Coolify uygulamasında).
- VPS: Hostinger `srv1638664.hstgr.cloud`, IP `187.127.77.126`. DNS Hostinger'da, `A @` ve `A www` bu IP'ye gidiyor.

**Eski adres (github.io)**
- `MOVED` sabiti: `github.io`'da açılınca Özet'in üstünde "yeni adresine taşındı" bandı çıkar (yedeği indir → yeni adrese git). Veri kendiliğinden taşınmaz. Pages'i kapatma; kullanıcılar taşınınca kapatılabilir.
- Karekod `store/karekod.png` yeni adresi gösterir (3.5'te yenilendi).

## Kararlar (geçmiş)
- Ad "Kese" → "Hesap Kitap" oldu; iç anahtarlarda "kese" kaldı (veri uyumu için).
- Başlangıç şablonları (öğrenci/aile vb.) kaldırıldı; herkes "Hemen başla" ile boş başlar.
- Anthropic API ile fiş okuma kaldırıldı; yalnızca cihazda Tesseract (jsdelivr'den yüklenir).
- Uygulama içinde izinler ekranı yapıldı ama kullanıcı istemedi; kodu git stash'te / `_arsiv/` yamasında duruyor, kullanma.
- Yerel uygulamada (Capacitor) sesle giriş gizli; WebView'da çalışmıyor.

## Yapılacaklar / bekleyenler
- [x] VPS'e yayın (abdurrahmankaya.com/takip) + `npm run deploy` — kuruldu 2026-10-06.
- [x] 3.5 (2026-10-06): github.io'da "taşındık" bandı, yeni karekod, Ayarlar → Görünüm'de "Ana ekrandaki üst kart" seçimi, Yedek'te "Drive / iCloud'a gönder" (paylaşım ekranı; destekleyen cihazlarda görünür) ve "son yedek X gün önce", fişte e-Arşiv karekodu okuma (`BarcodeDetector`, yoksa jsdelivr'den jsQR), mağaza ekran görüntüleri yenilendi.
- [ ] **Telefon bildirimleri** kodu hazır (`@capacitor/local-notifications`, Ayarlar → Bildirimler yalnızca mağaza uygulamasında görünür) ama **gerçek telefonda denenmedi**; sahte eklentiyle test var (`tests/e2e/tyeni.js`). İlk test APK'sında dene: izin penceresi, saat 10/21 bildirimleri.
- [ ] Karekod okuma gerçek fişle denenmedi (test, üretilmiş e-Arşiv karekoduyla). Gerçek fişte alan adları farklı çıkarsa `parseQrText` içine ekle.
- [ ] (Vazgeçildi, isteğe bağlı) hesapkitap.abdurrahmankaya.com alt alan adı → GitHub Pages. Yapılacaksa DNS eklenmeden depoya `CNAME` dosyası gönderme.
- [ ] **Firebase ile bulut/ortak bütçe** (Abdurrahman + Rumeysa): kullanıcıdan `firebaseConfig` bekleniyor; Google girişi, `firestore.rules` hazır. KVKK/gizlilik metni güncellenmeli.
- [ ] **Mağazalar**: Google Play (25 $) ve Apple Developer (99 $/yıl) hesapları açılınca `MAGAZA.md`'ye göre ilerle. Play yükleme anahtarı kullanıcıda (`play-anahtari.txt`); GitHub Secrets'a eklenince Actions imzalı AAB üretir.
- [ ] Rakip araştırmasından öneriler (kalanlar): kategori öğrenme ve tekrarlayan harcama tespiti, Android banka bildirimi okuma, ana ekran widget'ı, Apple Pay/Kestirmeler, altın günü takibi, 12 aylık taksit yükü grafiği.
- [ ] `tests/e2e/t10.js` (fiş OCR) eski yapay zeka bölümünü test ediyor; güncellenip `run-all`'a eklenmeli.
