# A'la Carte Sistem Pazar Analizi ve Uygulanacak Calisma Plani

Bu belge, aktif piyasadaki restoran rezervasyon ve dining operasyon urunlerine
gore Voyage Kundu icindeki A'la Carte sisteminde hangi kabiliyetlerin eklenmesi
gerektigini belirlemek icin hazirlanmistir.

Amac:

- mevcut A'la Carte panelini gercek operasyon sistemine donusturmek
- no-show, kapasite, servis akisi ve misafir deneyimini tek omurgada yonetmek
- resort otel mantigina uygun bir dining reservation motoru cikarmak

## Incelenen aktif urun kategorileri

Referans olarak bakilan aktif urunler:

- SevenRooms
- OpenTable for Restaurants
- TheFork Manager
- iResort
- hotel dijital dining/menu cozumleri

Bu urunler restoran ve resort dining tarafinda su ortak deseni tekrar ediyor:

- rezervasyon + waitlist + kapasite yonetimi ayni akista
- misafir profili ve tercih bilgisi rezervasyona bagli
- no-show azaltma akislari sistemin merkezinde
- servis slot pacing ve floor/table yonetimi onemli
- otomatik bildirim ve hatirlatmalar standart
- yuksek talep saatleri icin kural motoru bulunuyor

## Mevcut A'la Carte panelinin guclu tarafi

Su an sistemde olanlar:

- restoran/lokasyon listesi
- aktif/pasif durumu
- fiyat
- servis slot bilgisi
- doluluk
- kural notlari
- yetki kontrollu erisim

Bu iyi bir yonetim ozetidir. Ama pazardaki olgun urunlerle karsilastirinca
hala rezervasyon operasyon motoru seviyesinde degildir.

## Su an eksik olan kritik kabiliyetler

### 1. Gercek rezervasyon kaydi ve rezervasyon omru

Oncelik: Cok yuksek

Su an panel daha cok "restoran tanimi ve genel kapasite" mantiginda.
Piyasadaki urunlerde esas deger, her rezervasyonun ayri yasam dongusune
sahip olmasinda.

Eklenmesi gereken alanlar:

- rezervasyon numarasi
- misafir adi
- oda numarasi
- kisi sayisi
- tarih
- servis slotu
- restoran
- durum: booked / confirmed / arrived / seated / completed / cancelled / no-show
- kanal: app / guest relations / front office / call / manager
- not / alerji / kutlama / diyet

## 2. Kapasite ve pacing motoru

Oncelik: Cok yuksek

OpenTable ve benzeri sistemlerde sadece toplam kapasite degil, ayni zaman
araliginda kac rezervasyon alinacagi ve servis akisinin mutfagi ezmemesi
temel konudur.

Eklenmesi gerekenler:

- slot bazli kapasite
- slot bazli doluluk
- kisi bazli degil masa bazli inventory
- buyuk grup limiti
- ayni saatte alinabilecek maksimum covers
- mutfak pacing limiti
- shift bazli kural seti

Beklenen kazanc:

- ayni saate yigilma azalir
- servis kalitesi korunur
- son dakika kapasite kontrolu saglanir

## 3. Waitlist ve bosluk doldurma akisi

Oncelik: Yuksek

OpenTable ve TheFork tarafinda waitlist, iptal ve no-show kaybini kapatan
ana arac. Resort A'la Carte icin de bu cok degerli.

Eklenmesi gerekenler:

- waitlist kaydi
- tercih edilen restoran ve saat
- otomatik bosluk eslestirme
- oncelik mantigi: VIP, tekrar gelen, cocuklu aile, kutlama
- rezervasyon dusunce bekleyen misafire teklif

Beklenen kazanc:

- iptal olan masa tekrar satilir
- doluluk artar
- manuel telefon trafigi azalir

## 4. No-show koruma ve hatirlatma akisi

Oncelik: Yuksek

TheFork ve OpenTable tarafinda bu kisim cok merkezi. Reminder, reconfirmation,
riskli rezervasyon isaretleme ve no-show takibi standart hale gelmis.

Eklenmesi gerekenler:

- otomatik hatirlatma
- tekrar teyit akisi
- no-show sayaci
- guest reliability / risk skoru
- gec iptal penceresi
- room charge penalty ya da booking limit kural mantigi

Resort ortami icin mantikli kurallar:

- tekrarlayan no-show yapan misafire ayni hafta sinir
- son dakika iptal limiti
- guest relations override yetkisi

## 5. Masa plani ve seating yonetimi

Oncelik: Yuksek

Piyasadaki urunler restoran operasyonunu sade bir listeyle birakmiyor;
masa turu, alan tipi ve seating mantigi da onemli.

Eklenmesi gerekenler:

- masa plani
- alan tipi: indoor / terrace / family / adults / chef table
- masa birlestirme
- wheelchair / stroller uygunlugu
- smoking / non-smoking
- seat assignment
- turn time

Beklenen kazanc:

- kapasite gercege daha yakin yonetilir
- misafir tercihi ile masa eslesir
- on ofis ve restoran host ekibi ayni ekran uzerinden calisir

## 6. Misafir profili ve dining preference katmani

Oncelik: Yuksek

SevenRooms'un en guclu yani guest profile tarafidir. Resort mantiginda bu,
fidelik ve servis kalitesini ciddi yukariya tasir.

Eklenmesi gereken alanlar:

- onceki rezervasyon gecmisi
- sevdigi restoranlar
- alerjiler
- dogum gunu / ozel gun
- cocuk sandalyesi ihtiyaci
- favori saat
- VIP / repeat guest etiketi

Beklenen kazanc:

- tekrar gelen misafir daha iyi taninir
- servis kisisellestirilir
- upsell ve memnuniyet artar

## 7. Menu, quota ve kural motoru

Oncelik: Orta-Yuksek

Resort A'la Carte sisteminde restoranin sadece masa degil, menu ve quota
kurallari da olabilir.

Eklenmesi gerekenler:

- sabit menu / ozel gece / tasting menu gunleri
- kisi basi quota
- oda tipi bazli hak
- stay length bazli hak
- ayni restorana haftada kac kez gidilebilir
- cocuk menusu / adults only gunleri
- blackout tarihleri

Bu kisim resort mantiginda klasik sehir restoran yazilimlarindan daha kritik.

## 8. Charge-to-room ve PMS baglami

Oncelik: Orta-Yuksek

Hotel dining cozumlerinde oda ile bag kurulmasi cok degerli.

Gerekli alanlar:

- oda numarasi dogrulamasi
- rezervasyon sahibi eslestirme
- charge to room
- meal plan kontrolu
- pakete dahil / extra charge ayrimi
- reservation status from PMS

Not:

Tam entegrasyon sonradan yapilabilir ama veri modeli simdiden buna uygun kurulmalidir.

## 9. Operasyon KPI ve servis raporlama

Oncelik: Orta

Gerekli KPI'lar:

- restoran bazli doluluk
- slot bazli doluluk
- no-show orani
- cancellation rate
- ortalama kisi sayisi
- table turn time
- waitlist conversion
- VIP reservation count
- outlet revenue proxy

## Voyage Kundu icin net urun onceligi

Mevcut panelinizi gercek A'la Carte operasyon motoruna cevirmek icin en once
eklenmesi gerekenler:

### Faz 1

- rezervasyon kaydi listesi
- rezervasyon durum akisi
- slot bazli kapasite
- waitlist
- no-show / cancellation takibi
- otomatik hatirlatma durumlari

### Faz 2

- masa plani
- guest profile ve preference
- oda numarasi / rezervasyon baglami
- quota ve hak kurallari

### Faz 3

- PMS entegrasyonu
- charge-to-room
- menu/experience bazli rezervasyon
- gelismis dining analytics

## Uygulama icin dogrudan gelistirme karari

Su anki A'la Carte panelinde sadece "venue config" var.
Mantiken bir sonraki development adimi su olmali:

1. `A'la Carte Reservations` tablosu
2. `Waitlist` tablosu
3. `Service Slots` kapasite editoru
4. `Reservation Status Board`
5. `No-show ve cancellation kurallari`

Bu besli eklenmeden sistem restoran tanim paneli olarak kalir.
Bu besli geldikten sonra ise gercek operasyon urunu olur.

## Ornek veri modeli onerisi

### Venues

- id
- name
- cuisine
- active
- seatingAreas[]
- slots[]
- rules{}

### Reservations

- id
- venueId
- guestName
- roomNumber
- partySize
- reservationDate
- slotTime
- status
- source
- tags[]
- note
- createdBy

### Waitlist

- id
- venueId
- guestName
- roomNumber
- partySize
- preferredWindow
- priority
- status

### Service Slots

- id
- venueId
- date
- time
- maxCovers
- maxTables
- bookedCovers
- waitlistCount

## Kaynaklar

- SevenRooms platform: https://sevenrooms.com/en/platform/engage/
- SevenRooms reservation and waitlist: https://sevenrooms.com/platform/reservations-waitlist/
- SevenRooms CRM: https://sevenrooms.com/platform/crm/
- OpenTable solutions overview: https://www.opentable.com/restaurant-solutions/our-solutions/
- OpenTable waitlist: https://www.opentable.com/restaurant-solutions/products/features/opentable-waitlist/
- OpenTable table management: https://www.opentable.com/restaurant-solutions/products/table-management/
- OpenTable availability controls: https://www.opentable.com/restaurant-solutions/products/features/availability-controls/
- OpenTable SMS messaging: https://www.opentable.com/restaurant-solutions/products/features/premium-sms-messaging/
- OpenTable owner app: https://www.opentable.com/restaurant-solutions/products/features/owner-app/
- TheFork Manager overview: https://www.theforkmanager.com/fr-be/accueil
- TheFork no-show controls: https://www.theforkmanager.com/plans
- TheFork no-show article: https://www.theforkmanager.com/en/blog/thefork-reduces-the-number-shows-your-restaurant
- iResort features: https://iresort.net/en/iresort-features/
- Menuthere hotel dining: https://menuthere.com/solutions/hotels

## Sonuc

Pazardaki aktif urunlere gore Voyage Kundu icin A'la Carte tarafinda en mantikli
gelistirme sirasi su:

1. Reservation engine
2. Waitlist and cancellation recovery
3. Slot capacity and pacing
4. No-show protection
5. Guest preference and room context

Yani bir sonraki kod fazinda yapilmasi gereken sey yeni restoran ekleme kartlari
degil, rezervasyon yasam dongusunu sisteme sokmaktir.
