# Hesap Kitap: proje hafızası

Bu dosya Claude Code'un projeyi tanıması içindir. Her oturumda otomatik okunur. Yeni bir şey öğrenince ya da bir iş bitince **bu dosyayı güncelle** ("Yapılacaklar" ve "Kararlar" bölümleri).

## Ürün
- **Hesap Kitap**: Türkçe, telefon öncelikli, ücretsiz aylık gelir-gider takip uygulaması. Üyelik yok, sunucu yok; veriler cihazda (localStorage + IndexedDB).
- Sahibi: Abdurrahman Kaya (abdurrahmankayaart@gmail.com). Kendisi, eşi Rumeysa ve arkadaşları kullanacak. Kullanıcıyla **Türkçe** konuş, teknik terimleri sade anlat.
- **Hedef yayın adresi: https://abdurrahmankaya.com/takip/** — kullanıcının kendi VPS'i (Coolify). Kurulumu henüz yapılmadı, aşağıdaki "VPS'e yayın" bölümüne bak.
- Şu anki yayın: GitHub Pages → https://abdurrahmankayaart.github.io/hesapkitap/ (depo: `abdurrahmankayaart/hesapkitap`, eski adı `Gelir---Gider-Tablosu`). VPS yayını çalışınca bu adres yeni adrese yönlendirilecek.
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
helpers · categories · starter templates (`PROFILES`, sadece örnek veri için) · sample data (`makeSample`) · storage (kişiler) · state (`S`) · currencies & gold · credit card statements · reminders · frame · **ÖZET** (`renderOzet`, `heroAlt`, `heroMain`) · quick text (`parseQuick`) · records · charts · **HAREKETLER** (`renderList`, `ltabs`, `calHtml`, `fixedPageHtml`, `txRow`) · category detail · BÜTÇE · HEDEFLER (goals/debts/assets) · REPORT · AYARLAR (`fold()` açılır-kapanır kartlar) · import/export · receipt photos (IndexedDB `kese-photos`, `readReceipt`, `parseReceipt`, `autoReceipt`) · tags · add/edit sheet (`openSheet`) · modal · actions (tek `click` dinleyicisi, `data-act` / `data-*`) · toast · backup + lock (PIN) · welcome (`askName`, `askStart`, `pickPerson`, tur).

## Veri (localStorage anahtarları — ADLARINI DEĞİŞTİRME, kullanıcı verisi kaybolur)
- `kese.people` kişi listesi; ilk kişi (`p0`) verisi `kese.v1`, diğerleri `kese.<id>`.
- `<anahtar>.pin`, `<anahtar>.ui`, `kese.tour`, `kese.perms`, `kese.rates`, `kese.notified`, `kese.hero` (açılış kartı görünümü: `bugun` varsayılan, `klasik`, `pay`, `aliskanlik`, `gizli`).
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
npm test                            # 10 uçtan uca test
```
- Testler örnek veriyi bugünün tarihine göre üretir; testte sabit tarih seçici kullanma.
- Service worker `file://` altında çalışmaz; SW denemesi gerekirse `npm run serve` ile.

## Yayın akışı
1. Değişiklik → `npm test` → `sw.js` CACHE +1 → (gerekirse Ayarlar'daki sürüm yazısı "Hesap Kitap 3.x").
2. Commit (Türkçe, açıklayıcı) → `git push origin claude/monthly-expense-tracker-3cktrg`.
3. Pages bu daldan yayınlar (depo varsayılan dalı da bu). 1–2 dk sonra canlı. VPS/Coolify kurulunca o da aynı push ile yayınlayacak (ya da `npm run deploy`).
4. GitHub Actions: Android APK ve iOS derlemesi her push'ta çalışır; sonucu kontrol et.
5. Telefonda eski sürüm görünürse uygulamayı kapatıp aç.

## VPS'e yayın: abdurrahmankaya.com/takip (YAPILACAK — ilk büyük iş)
Kullanıcının isteği: Bilgisayarda Claude Code ile düzenle → değişiklik **hemen** https://abdurrahmankaya.com/takip/ adresinde yayına girsin.

**Bilinenler**
- Hostinger VPS: `srv1638664.hstgr.cloud`, IP `187.127.77.126`, KVM 2, bitiş 2027-05-03. Üzerinde **Coolify** kurulu (ayrıca n8n, OpenClaw vb.).
- Alan adları Hostinger'da, DNS Hostinger'ın ad sunucularında (`byte/pixel.dns-parking.com` — bu "park" demek değil, Hostinger'ın varsayılan DNS'i). dugungram.com'un `A @` ve `A www` kayıtları bu VPS'e gidiyor; abdurrahmankaya.com'un A kaydı henüz kontrol edilmedi (hPanel'deki alan adı kontrol listesinde "web sitesi oluşturun" işaretsizdi — ana sitenin yayında olup olmadığını önce doğrula).
- GitHub'da `abdurrahmankayaart/abdurrahmankaya-website` (PHP + MySQL) deposu var; ana sitenin bu olup olmadığını ve Coolify'da nasıl yayınlandığını kullanıcıya sor/kontrol et.
- Uygulama alt klasörde çalışmaya hazır: tüm yollar göreli (`sw.js`, `manifest.webmanifest`, `start_url: "./"`, `scope: "./"`), `index.html` başındaki küçük betik `/takip` → `/takip/` yönlendirmesi yapar. Service worker yalnızca https'te kaydolur.

**Kullanıcıdan istenecek bilgiler** (şifreyi sohbete yapıştırmasını isteme; SSH anahtarı / API token tercih et)
1. Coolify panel adresi (ör. `http://187.127.77.126:8000` ya da bir alan adı).
2. Coolify API token'ı: Coolify → **Keys & Tokens → API tokens** → yeni token (yetki: read + write + deploy). Ortam değişkenine koy (`COOLIFY_URL`, `COOLIFY_TOKEN`), dosyaya yazma, git'e girmesin.
3. abdurrahmankaya.com Coolify'da hangi proje/uygulama olarak duruyor (statik / PHP / Dockerfile / Nixpacks), hangi repodan. Ana alan adı DNS'i VPS'e gidiyor mu (`A @ → 187.127.77.126`).
4. Gerekirse SSH: `ssh root@187.127.77.126` için kullanıcının bilgisayarındaki SSH anahtarı (`ssh-copy-id`), parola değil.
5. Coolify'ın GitHub bağlantısı var mı (Sources → GitHub App). Yoksa `abdurrahmankayaart/hesapkitap` için kurulacak.

**Önerilen kurulum (Coolify, path tabanlı yönlendirme)**
- Coolify'da yeni uygulama: kaynak GitHub `abdurrahmankayaart/hesapkitap`, dal `claude/monthly-expense-tracker-3cktrg` (ileride `main`), build pack **Static** (Nginx), yayın klasörü depo kökü (ya da `npm run build:web` → `www/`).
- Domains alanına `https://abdurrahmankaya.com/takip` yaz (Coolify/Traefik `PathPrefix(/takip)` kuralı üretir). "Strip prefix" açık olsun ki Nginx dosyaları kökten sunsun; `/takip` → `/takip/` yönlendirmesini Traefik ya da Nginx'te de ekle.
- **Auto Deploy on push** açık: her `git push` sonrası Coolify ~30–60 sn'de yayınlar. "Anında" isteği için ayrıca `npm run deploy` betiği yazılabilir: testleri çalıştırır → commit → push → Coolify API ile deploy'u tetikler (`POST /api/v1/deploy?uuid=<app>&force=false`, `Authorization: Bearer $COOLIFY_TOKEN`) ve bitince adresi kontrol eder.
- Alternatif (ana site PHP ise ve aynı container'dan sunuluyorsa): hesapkitap dosyalarını ana sitenin `public/takip/` klasörüne kopyalayan bir adım. Path yönlendirmesi daha temiz, önce onu dene.
- Önbellek: `sw.js` ve `index.html` için `Cache-Control: no-cache`; simge/PNG için uzun önbellek. Her yayında `sw.js` CACHE sayısı yine +1.

**Yayına geçince yapılacaklar**
- `index.html` og:url / og:image → `https://abdurrahmankaya.com/takip/…`; README, MAGAZA.md, `store/magaza-metinleri.md` gizlilik linki → `https://abdurrahmankaya.com/takip/privacy.html`; karekod `store/karekod.png` yeni adresle (Python `qrcode`, okutup doğrula).
- GitHub Pages: eski adresteki kullanıcılar için github.io'da açılınca "Hesap Kitap artık abdurrahmankaya.com/takip adresinde; önce Ayarlar → Yedek ile kayıtlarını indir" bandı göster (veri origin'e bağlı, kendiliğinden taşınmaz). Pages'i hemen kapatma.
- Alt alan adı (hesapkitap.abdurrahmankaya.com) planı bununla değişti; kullanıcı isterse ileride ikisi birden olabilir.

## Kararlar (geçmiş)
- Ad "Kese" → "Hesap Kitap" oldu; iç anahtarlarda "kese" kaldı (veri uyumu için).
- Başlangıç şablonları (öğrenci/aile vb.) kaldırıldı; herkes "Hemen başla" ile boş başlar.
- Anthropic API ile fiş okuma kaldırıldı; yalnızca cihazda Tesseract (jsdelivr'den yüklenir).
- Uygulama içinde izinler ekranı yapıldı ama kullanıcı istemedi; kodu git stash'te / `_arsiv/` yamasında duruyor, kullanma.
- Yerel uygulamada (Capacitor) sesle giriş gizli; WebView'da çalışmıyor.

## Yapılacaklar / bekleyenler
- [ ] **VPS'e yayın (abdurrahmankaya.com/takip) + bilgisayardan anında yayın** — yukarıdaki bölüm. İlk iş bu.
- [ ] (Vazgeçildi, isteğe bağlı) hesapkitap.abdurrahmankaya.com alt alan adı → GitHub Pages. Yapılacaksa DNS eklenmeden depoya `CNAME` dosyası gönderme.
- [ ] **Mağaza ekran görüntüleri** eski açılış kartını gösteriyor → `npm run store-shots` ile yenile, `store/ekran-goruntuleri/{iphone,android}/` içine taşı.
- [ ] **Ayarlar'a "Ana ekran görünümü" seçeneği** (bugun / klasik / pay / aliskanlik / gizli) — kod hazır (`heroAlt`), sadece arayüz yok.
- [ ] **Firebase ile bulut/ortak bütçe** (Abdurrahman + Rumeysa): kullanıcıdan `firebaseConfig` bekleniyor; Google girişi, `firestore.rules` hazır. KVKK/gizlilik metni güncellenmeli.
- [ ] **Mağazalar**: Google Play (25 $) ve Apple Developer (99 $/yıl) hesapları açılınca `MAGAZA.md`'ye göre ilerle. Play yükleme anahtarı kullanıcıda (`play-anahtari.txt`); GitHub Secrets'a eklenince Actions imzalı AAB üretir.
- [ ] Rakip araştırmasından öneriler (öncelik sırası): telefon bildirimleri (Capacitor LocalNotifications), e-Arşiv fatura karekodu okuma, tek dokunuşla Drive/iCloud yedek + "son yedek X gün önce", kategori öğrenme ve tekrarlayan harcama tespiti, Android banka bildirimi okuma, ana ekran widget'ı, Apple Pay/Kestirmeler, altın günü takibi, 12 aylık taksit yükü grafiği.
- [ ] `tests/e2e/t10.js` (fiş OCR) eski yapay zeka bölümünü test ediyor; güncellenip `run-all`'a eklenmeli.
