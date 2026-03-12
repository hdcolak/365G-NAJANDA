# Deploy Checklist

Bu dosya, projeyi GitHub'a gönderip Render üzerinde canlıya almak için tek akış belgesidir.

## 1. Hazır Durum

Tamamlananlar:

- Frontend hazır
- Backend hazır
- Frontend backend API'ye bağlı
- Render blueprint dosyası hazır: `render.yaml`
- Proje içinde backend, frontend ve deploy tanımı var

Beklenen servisler:

- `voyage-kundu-ops` -> frontend
- `voyage-kundu-api` -> backend
- `voyage-kundu-db` -> postgres

## 2. GitHub Adımı

Hedef repo:

- `https://github.com/hdcolak/365G-NAJANDA`

GitHub repo dolu sayılabilmesi için ana sayfada şunlar görünmeli:

- `render.yaml`
- `package.json`
- `src/`
- `server/`

Eğer repo boş görünüyorsa push olmamıştır.

## 3. GitHub Push İçin En Kolay Yol

Önerilen yol:

1. GitHub Desktop kur
2. GitHub hesabıyla giriş yap
3. `File > Add Local Repository`
4. Klasör seç:
   - `/Users/deco/365 Gün ajanda`
5. `Push origin` veya `Publish repository`

## 4. Terminal İle Push

Eğer terminal kullanılacaksa:

```bash
cd "/Users/deco/365 Gün ajanda"
git status
git log --oneline -1
git remote -v
git push -u origin main
```

Kimlik doğrulama:

- Username: `hdcolak`
- Password: GitHub şifresi değil, token

Not:

- Terminal token yazarken hiçbir karakter göstermez
- Bu normaldir

## 5. Token Problemi Olursa

En sorunsuz çözüm:

1. GitHub
2. `Settings`
3. `Developer settings`
4. `Personal access tokens`
5. `Tokens (classic)`
6. `Generate new token (classic)`
7. Scope olarak sadece `repo`

Sonra tekrar:

```bash
git push -u origin main
```

## 6. Render Deploy

GitHub repo dolduktan sonra:

1. Render aç
2. `New +`
3. `Blueprint`
4. Repo seç: `365G-NAJANDA`
5. `render.yaml` algılanmalı
6. Aşağıdaki servisler görünmeli:
   - `voyage-kundu-ops`
   - `voyage-kundu-api`
   - `voyage-kundu-db`
7. `Apply` / `Create Resources`

## 7. Render Hata Kontrolü

Eğer Render `repository is empty` derse:

- GitHub repo hâlâ boş demektir
- Önce GitHub repo ana sayfasını kontrol et

Eğer GitHub dolu ama Render eskiyi gösteriyorsa:

1. Hatalı servisi sil
2. Tekrar `New + > Blueprint`
3. Repo'yu yeniden seç

## 8. Canlı Doğrulama

Deploy sonrası kontrol:

- frontend URL açılıyor mu
- giriş ekranı geliyor mu
- görev/şikayet/ajanda yükleniyor mu
- farklı cihazlarda aynı veri görünüyor mu

## 9. Son Hedef

Amaç:

- Mac bağımlılığı olmadan yayın
- ortak backend
- ortak veritabanı
- PC / iPhone / iPad / Android ortak kullanım
