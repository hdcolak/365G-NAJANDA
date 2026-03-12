# Password and Verification Strategy

Bu belge, otel operasyonunda e-posta dogrulama yerine daha uygulanabilir bir
kimlik dogrulama yaklasimini ozetler.

## Neden e-posta dogrulama ideal degil

Otel operasyonunda:

- ortak cihaz kullanimi olabilir
- departman mudurleri vardiyada hizli giris ister
- kurumsal e-posta her rolde duzenli takip edilmeyebilir
- cihaz degistirme ve vardiya devri hizli olur

Bu nedenle klasik "mail linki ile dogrula" modeli operasyon icin genelde yavas kalir.

## Onerilen daha kolay cozum

`Yonetici tarafindan verilen gecici sifre + ilk giriste sifre degistirme`

Bu modelin akisi:

1. Ust yonetim veya sistem yoneticisi kullaniciyi acar.
2. Sistem gecici sifre uretir.
3. Kullanici ilk giriste yeni sifresini belirler.
4. Gerekirse departman muduru icin PIN veya ikinci kurum kodu eklenir.

## Neden daha uygun

- e-posta zorunlu degil
- vardiya ortami icin hizli
- telefon, tablet ve ortak terminal kullanimina uygun
- reset sureci yonetim tarafindan kontrol edilir

## Voyage Kundu icin tavsiye edilen fazlar

### Faz 1

- rol secimi
- kullanici secimi
- sifre ile giris
- yonetici tarafindan gecici sifre dagitimi

### Faz 2

- ilk giriste sifre degistirme
- sifre reset flag
- son sifre degisim tarihi

### Faz 3

- tercihe bagli 4 haneli ikinci PIN
- belirli cihazlari guvenilir cihaz olarak isaretleme
- yonetici reset loglari

## Teknik öneri

Render ortaminda:

- `DEFAULT_LOGIN_PASSWORD` sadece ilk kurulum icin kullanilmali
- sonraki adimda kullanici bazli sifre hash saklanmali
- yonetici panelinden `temporary password reset` butonu eklenmeli

## Sonuc

Mail verification yerine otel operasyonuna en uygun model:

- username/title secimi
- sifre dogrulama
- yonetici kaynakli gecici sifre
- ilk giriste sifre yenileme

Bu model hem daha hizli hem de operasyonel olarak daha gercekcidir.
