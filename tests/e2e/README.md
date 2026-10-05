# Uçtan uca testler (Playwright)

```
npm install
npx playwright install chromium
npm test            # hepsi
npm test -- -v      # ayrıntılı çıktı
node tests/e2e/t7.js   # tek test
```

Ekran görüntüleri `tests/e2e/out/` klasörüne yazılır (git'e girmez).

| Test | Neyi kontrol eder |
|---|---|
| t2b | Özet, rapor, hedefler, liste, kayıt ekranı, bütçe, koyu tema |
| t3b | Kategori detayı, PIN kilidi, yedek uyarısı, taşma (overflow) |
| t5 | Karşılama, kişi seçimi, birden fazla kişi |
| t6 | Sabit kalemler: ekle, sil, geri al, ödendi |
| t7 | Hatırlatmalar, devir, borç/alacak, kartlar, etiketler, döviz |
| t11 | Ayarlar açılır-kapanır bölümler, ad/başlık |
| tcal | Hareketler → Takvim |
| thero | Özet üst kart: gelir yok / gelir aşıldı / normal (klasik görünüm) |
| tpast | Geçmiş tarihli giriş ("3 gün önce", "2 ekim"), geçmişte başlayan taksit |
| tvar | Özet üst kart görünümleri (bugün, pay, alışkanlık, gizli) |
| t10 | Fiş fotoğrafı OCR akışı (Tesseract taklidiyle; eski yapay zeka bölümü kaldırıldığı için o kısmı başarısız olur, run-all'da yok) |

Not: Testler bugünün tarihine göre örnek veri üretir; tarih sabit seçici kullanmayın.
