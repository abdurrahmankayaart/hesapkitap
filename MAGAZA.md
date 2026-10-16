# Hesap Kitap'ı App Store ve Google Play'e yüklemek

Uygulama, web sürümüyle aynı kodu kullanan gerçek bir iOS ve Android uygulaması olarak paketlendi (Capacitor). Kodu değiştirdiğin her seferde GitHub iki uygulamayı otomatik derler.

## Hazır olanlar

| | Durum |
|---|---|
| Uygulama adı | **Hesap Kitap** |
| Paket kimliği | `com.hesapkitap.app` (mağazaya ilk yüklemeden sonra değiştirilemez; değişmesini istersen şimdi söyle) |
| Simgeler | Android'in tüm boyutları, iOS 1024×1024 mağaza simgesi (`store-icon-1024.png`), açılış ekranları |
| İzin açıklamaları | Kamera ve fotoğraflar için Türkçe açıklamalar (iOS `Info.plist`, Android manifest) |
| Gizlilik politikası | `https://abdurrahmankaya.com/takip/privacy.html` (iki mağaza da zorunlu tutuyor) |
| Otomatik derleme | `.github/workflows/android.yml` (test APK'sı), `.github/workflows/ios.yml` (iOS derleme kontrolü) |

## Android telefonda hemen denemek
1. GitHub'da depo → **Actions** → "Android uygulaması" → en son yeşil çalıştırma.
2. Sayfanın altındaki **Artifacts** bölümünden `hesap-kitap-android-test` dosyasını indir, zip'i aç.
3. `app-debug.apk` dosyasını telefona gönderip aç ("bilinmeyen kaynaklardan yükleme" iznini onayla).

## Google Play'e yüklemek (bir kerelik 25 dolar)
1. https://play.google.com/console adresinde geliştirici hesabı aç (kimlik doğrulaması birkaç gün sürebilir).
2. **Uygulama oluştur** → ad: Hesap Kitap, dil: Türkçe, ücretsiz.
3. İmzalı paket (AAB): sana gönderilen `play-anahtari.txt` dosyasındaki 4 değeri GitHub → depo → Settings → Secrets and variables → Actions bölümüne ekle. Sonraki her derlemede Actions sayfasında `hesap-kitap-play-store` (içinde `app-release.aab`) çıkar; Play Console → Test → Kapalı test → Yeni sürüm'e bu dosyayı yükle. İlk yüklemede "Play Uygulama İmzalama"yı kabul et.
4. Mağaza sayfası: metinler `store/magaza-metinleri.md`, ekran görüntüleri `store/ekran-goruntuleri/android/`, öne çıkan görsel `store/play-one-cikan-gorsel.png`, simge `icon-512.png`.
5. Yeni kişisel hesaplarda Google, yayından önce **12 kişiyle 14 gün kapalı test** istiyor.

## App Store'a yüklemek (yıllık 99 dolar)
1. https://developer.apple.com/programs/ adresinden **Apple Developer Program**'a katıl.
2. App Store Connect'te **Yeni uygulama** → ad: Hesap Kitap, paket kimliği: `com.hesapkitap.app`, birincil dil: Türkçe.
3. Yükleme için iki yol var:
   - **Mac ile:** `npm install && npm run ios` → Xcode açılır → Product → Archive → Distribute App.
   - **Mac olmadan (önerilen, Xcode gerekmez):** App Store Connect → Kullanıcılar ve Erişim → Entegrasyonlar → App Store Connect API → yeni anahtar (rol: App Manager). GitHub → depo → Settings → Secrets and variables → Actions'a dört secret ekle: `APPLE_TEAM_ID` (developer.apple.com → Membership), `APPSTORE_KEY_ID`, `APPSTORE_ISSUER_ID`, `APPSTORE_KEY_P8` (.p8 dosyasının içeriği). Sonra Actions → **iOS → TestFlight** → Run workflow. Derleme TestFlight'a düşer (`.github/workflows/ios-release.yml`; gerçek hesapla henüz denenmedi).
4. Mağaza sayfası: metinler ve anahtar kelimeler `store/magaza-metinleri.md`, 6,9" iPhone ekran görüntüleri `store/ekran-goruntuleri/iphone/`. Gizlilik bölümü eşitleme yüzünden artık "veri toplanmıyor" değil; ne işaretleneceği `store/magaza-metinleri.md` → "Uygulama gizliliği" bölümünde.
5. Apple incelemesi genelde 1–3 gün sürer.

## Bilmen gerekenler
- Uygulama içinde **sesle giriş çalışmaz** (iOS ve Android uygulama içi tarayıcıları bunu desteklemiyor), mikrofon düğmesi kendiliğinden gizlenir. Yazarak, kamerayla ve + ekranıyla giriş çalışır.
- Web sürümü ile mağaza uygulamasının verileri **ayrı kopyalardır**; Ayarlar → Cihazlar arası eşitleme ile bağlanınca aynı kayıtları gösterir (ya da Yedek ile bir kez aktarılır).
- Yedek dosyası uygulamada telefonun **paylaş menüsüyle** kaydedilir (Dosyalar, Drive, WhatsApp vb.).

## Gönderimden önce kontrol listesi (app-store-review-playbook'tan, bize uyanlar)
Kaynak: github.com/dursunyartasi/app-store-review-playbook (8 uygulama, 15 red). Bizim duruma uyan maddeler:
- [x] **Hesap silme (5.1.1(v))**: hesap yok; eşitleme verisi Ayarlar → Eşitleme → "Sunucudan sil" ile uygulama içinden, anında ve kalıcı silinir.
- [x] **Gizlilik bağlantısı uygulama içinde tıklanabilir (2.1(a))**: Ayarlar'ın en altında, uygulamadan çıkmadan açılır. Adres 200 dönüyor.
- [x] **Satın alma izi yok (3.1.1)**: fiyat, plan, "Pro" yok; tamamen ücretsiz.
- [x] **Hesapsız gezilebilir**: açılışta ad sorar, "Önce örnek verilerle gezeyim" ile dolu ekran görülür; boş uygulama görmez.
- [x] **Yarım özellik yok (2.1)**: mağaza uygulamasında çalışmayan sesle giriş gizli.
- [x] **Gereksiz izin yok (5.1.1)**: galeri izni istenmiyor (sistem seçicisi izinsiz çalışır); kamera yalnızca fotoğraf çekerken, Türkçe açıklamayla.
- [x] **Yalnızca iPhone, yalnızca dikey**: iPad hedefi kapalı (iPad ekran görüntüsü ve iPad'de inceleme derdi yok; iPad'de iPhone sürümü açılır).
- [x] **Gizlilik beyanı gerçekle aynı**: `store/magaza-metinleri.md` → "Uygulama gizliliği". Sihirbazda her maddeyi kaydettikten sonra özet ekranından tek tek kontrol et.
- [x] **İnceleme notu**: "küçük, niş, aile için, davetli" gibi ifadeler YOK (4.2 reddi). "Herkese açık, ücretsiz" çerçevesi; hesapsız yol adım adım. 4000 karakter sınırı.
- [ ] **Gerçek iPhone'da TestFlight**: eşitleme, kamera, bildirim. Simülatörde çalışan mağaza derlemesinde çökebilir.
- [ ] **Yükleme "başarılı" ≠ kabul**: App Store Connect'te derleme "Ready to Submit / Geçerli" olana kadar bekle.
- [ ] **Sürüm**: ilk gönderim 1.0. Onaylanan sürüme yeni derleme yüklenemez (90062/90186); güncellemede `MARKETING_VERSION`'ı artır.
- [ ] **Yaş sınırı 4+** (2025'ten beri bantlar 4+, 9+, 13+, 16+, 18+).
- [ ] **Bireysel hesapta geliştirici adı** kayıt sırasında harf harf kontrol edilmeli; sonradan düzeltmek zor.
- [ ] **Yayın elle**: onaydan sonra "Yayınla"ya basmak gerekir.
- Google Play: reklam kimliği izni yok (beyan "kullanılmıyor" olmalı), yayın ülkeleri "tümü", gizlilik adresi 200.
