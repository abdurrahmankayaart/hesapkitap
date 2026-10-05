# Hesap Kitap'ı bilgisayarda Claude Code ile geliştirmek

Bu rehber, buluttaki çalışmayı kendi laptopuna taşıyıp Claude Code ile kaldığın yerden devam etmen için. Proje klasöründeki `CLAUDE.md` dosyası Claude'a projeyi, verdiğin kararları ve yapılacakları anlatır; Claude her açılışta onu kendiliğinden okur.

## 1. Bir kere kurulacaklar

| Program | Neden | Nereden |
|---|---|---|
| **Git** | Kodu GitHub'dan çekip göndermek için | Mac: Terminal'de `git --version` yaz, yoksa kurmayı teklif eder. Windows: https://git-scm.com |
| **Node.js 22** (LTS) | Testler ve uygulama paketleme için | https://nodejs.org → "LTS" sürümü |
| **Python 3** | Yerel sunucu (`npm run serve`) | Mac'te hazır gelir. Windows: https://python.org |
| **Claude Code** | Claude'un bilgisayarda çalışması | Terminal'de: `npm install -g @anthropic-ai/claude-code` ya da https://claude.ai/download (masaüstü uygulamasındaki **Code** sekmesi) |

İsteğe bağlı: **VS Code** (https://code.visualstudio.com) — dosyalara bakmak için rahat. iPhone uygulamasını derlemek için **Xcode** (yalnızca Mac), Android için **Android Studio**.

## 2. Projeyi bilgisayara al

**Yol A — GitHub'dan (önerilen, her zaman en güncel):**
```bash
cd ~/Desktop            # ya da projeyi koymak istediğin klasör
git clone https://github.com/abdurrahmankayaart/hesapkitap.git
cd hesapkitap
```
İlk seferde GitHub kullanıcı adı / şifre isterse: şifre yerine GitHub → Settings → Developer settings → **Personal access tokens** → "Generate new token (classic)", `repo` kutusunu işaretle, çıkan kodu şifre yerine yapıştır. (Ya da `gh auth login` / GitHub Desktop kullan.)

**Yol B — zip'ten:** `hesapkitap-yerel.zip` dosyasını aç. İçindeki `hesapkitap` klasörü git geçmişiyle birlikte gelir; GitHub'a bağlı. Klasöre girip `git pull` yaparak en güncel hale getir.

## 3. Hazırla ve çalıştır
```bash
npm install
npx playwright install chromium     # testler için tarayıcı (ilk seferde)
npm test                            # 10 test, hepsi ✓ olmalı
npm run serve                       # tarayıcıda http://localhost:8000
```
Telefonda denemek için yayındaki adres: https://abdurrahmankayaart.github.io/hesapkitap/

## 4. Claude Code'u başlat
Proje klasöründeyken:
```bash
claude
```
İlk mesaj olarak şunu yazabilirsin:

> CLAUDE.md'yi oku. Projenin durumunu ve "Yapılacaklar" listesini bana özetle, sonra ilk iş olarak ne yapmamızı önerirsin söyle.

Sonra her zamanki gibi Türkçe iste: "Takvime haftalık görünüm ekle", "Ayarlara ana ekran görünümü seçeneği koy", "alt alan adını bağlayalım, DNS'i ekledim" gibi.

**İşe yarayan alışkanlıklar:**
- Bir iş bitince: "Testleri çalıştır, CLAUDE.md'yi güncelle, commit edip gönder" de. Gönderince site 1–2 dakikada güncellenir.
- Görsel değişikliklerde: "Önce ekran görüntüsüyle önizleme göster" de.
- Claude'un her komutta izin sormasını azaltmak için: Claude Code'da `/permissions` ya da ilk açılışta "bu klasörde düzenlemelere izin ver" seçeneği.

## 5. Yayın nasıl çalışıyor
- Kod GitHub'da `claude/monthly-expense-tracker-3cktrg` dalında (deponun varsayılan dalı). Bu dala her gönderimde GitHub Pages siteyi yeniler.
- Aynı anda GitHub Actions Android test APK'sını ve iOS derlemesini yapar: GitHub → depo → **Actions**.
- Dal adını değiştirmek istersen (ör. `main`): GitHub → Settings → Pages'ten yayın dalını da değiştirmen gerekir; Claude'a "yayını main dalına taşıyalım" demen yeterli.

## 6. Bilmen gerekenler
- **Veriler**: Uygulama verisi kullanıcının telefonunda/tarayıcısında durur, GitHub'da ya da bu klasörde değil. `localhost:8000`'de denerken girdiğin kayıtlar da sadece o tarayıcıda kalır.
- **Gizli dosyalar**: `play-anahtari.txt` (Google Play imza anahtarı) depoda yok ve olmamalı; sende güvenli bir yerde dursun. GitHub Secrets'a nasıl ekleneceği `MAGAZA.md`'de.
- **Bulut oturumu**: Buluttaki Claude oturumu ile yerel çalışma aynı GitHub deposunu kullanır. İkisinde aynı anda değişiklik yapma; geçmeden önce `git pull`.

## 7. Bekleyen işler (özet — ayrıntı `CLAUDE.md`'de)
1. **hesapkitap.abdurrahmankaya.com** alt alan adı: sen DNS'e `CNAME hesapkitap → abdurrahmankayaart.github.io` ekle, sonra Claude'a "DNS'i ekledim, alt alan adını bağla" de.
2. Mağaza ekran görüntülerini yeni açılış ekranıyla yenile.
3. Ayarlara "Ana ekran görünümü" seçeneği.
4. Firebase ile Rumeysa'yla ortak bütçe (Firebase ayar bilgisi gerekiyor).
5. Google Play / App Store hesapları açılınca mağazaya yükleme (`MAGAZA.md`).
6. Telefon bildirimleri, e-Arşiv karekod okuma, Drive/iCloud yedek gibi iyileştirmeler.
