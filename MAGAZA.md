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
