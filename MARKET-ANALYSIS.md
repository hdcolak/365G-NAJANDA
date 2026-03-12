# Pazar Taramasi ve Eklenecek Moduller

Bu belge, aktif piyasadaki otel operasyon uygulamalarinin gunluk is akislarina gore
hazirlanmis bir urun karar ozetidir. Amac liste cikarmak degil, Voyage Kundu icin
mantiken hangi modullerin eklenmesi gerektigini onceliklendirmektir.

## Incelenen aktif urun kategorileri

Temel referanslar:

- hotelkit: ekip iletisim, housekeeping, guest request, maintenance, handover, PMS entegrasyonlari
- Actabl / Alice: guest service, housekeeping, service delivery, messaging, operasyon izlenebilirligi
- Amadeus HotSOS: housekeeping, engineering, PM, inspection, notification, cluster operasyonlari
- Quore: housekeeping, engineering, log book, inspection, guest messaging
- Mews / Flexkeeping: housekeeping mobil akisi, maintenance, checklists, AI destekli koordinasyon

## Pazarda tekrar eden cekirdek desenler

Piyasadaki urunlerin ortak mantigi su:

- Tum departmanlar tek task omurgasi uzerinde calisiyor.
- Housekeeping ve maintenance ayrik moduller ama ayni operasyon akisina bagli.
- Misafir talebi sadece kayit degil; SLA, oncelik, yonlendirme ve sonuc takibi ile yonetiliyor.
- PMS verisiyle oda durumu, gelen-giden misafir, VIP ve check-in onceligi otomatik akisa giriyor.
- Supervisor tarafinda canli verimlilik, room readiness, geciken is ve tekrar acilan kayitlar izleniyor.
- Shift handover ve logbook neredeyse her ciddi urunde merkezi bir moduldur.

## Voyage Kundu icin mevcut yapiya gore bosluk analizi

Mevcut uygulamada bulunanlar:

- rol bazli giris
- gorev yonetimi
- sikayet takibi
- A'la Carte operasyon paneli
- mudur ajandasi
- yetki yonetimi
- audit log

Eksik kalan kritik kisimlar:

1. housekeeping operasyon omurgasi
2. maintenance / preventive maintenance
3. shift handover / dijital logbook
4. guest request SLA ve escalation motoru
5. PMS tabanli oda ve rezervasyon baglami
6. supervisor verimlilik ve performans paneli

## Eklenmesi gereken moduller

### 1. Housekeeping paneli

Oncelik: Cok yuksek

Neden:

- hotelkit, Mews/Flexkeeping, HotSOS ve Quore tarafinda housekeeping ana omurgadir.
- Oda hazirlik sureci misafir memnuniyetini dogrudan etkiler.
- Front office, housekeeping ve teknik ekip arasindaki telefon/WhatsApp bagimliligini azaltir.

Eklenmesi gereken minimum alanlar:

- oda listesi
- kirli / temiz / inspect / out of order durumlari
- checkout / stayover / deep clean ayrimi
- kat gorevlisi atama
- supervisor inspection
- minibar / missing item / lost & found notlari
- rush room / VIP room onceligi
- oda hazir olma saati

Beklenen kazanc:

- check-in gecikmeleri azalir
- odanin gercek hazirlik durumu tek yerde gorulur
- housekeeping performansi sayisal olarak olculur

### 2. Maintenance ve preventive maintenance paneli

Oncelik: Cok yuksek

Neden:

- HotSOS, Quore ve hotelkit tarafinda maintenance sadece ariza degil, planli bakim motorudur.
- Mevcut sistemde sikayet var ama ariza omrune, cihaz gecmisine ve tekrar eden issue izine inilmiyor.

Eklenmesi gereken minimum alanlar:

- ariza kaydi
- lokasyon / oda / ekipman secimi
- trade type: elektrik, klima, minibar, TV, tesisat
- PM plani: haftalik, aylik, sezonluk
- SLA ve gecikme uyarisi
- tekrar eden ariza isareti
- vendor / dis servis takibi
- attachment / fotograf
- cozum suresi

Beklenen kazanc:

- ayni arizanin tekrar tekrar acilmasi gorunur olur
- odalar out-of-order veya riskli hale gelmeden aksiyon alinabilir
- teknik ekip performansi raporlanabilir

### 3. Shift handover ve dijital logbook

Oncelik: Yuksek

Neden:

- hotelkit ve Quore tarafinda vardiya devri temel operasyon modullerinden biri.
- Mudur ajandasi var ama vardiya seviyesi anlik operasyon devri ayri bir akisa donusmeli.

Eklenmesi gereken minimum alanlar:

- sabah / aksam / gece vardiya notu
- okunmadi / okundu takibi
- departman bazli handover
- kritik acik isler
- VIP / complaint / teknik risk bayraklari
- attachment ve mention
- zorunlu kapanis notlari

Beklenen kazanc:

- bilgi kisiye degil sisteme baglanir
- telefonla devir azalir
- gece gunduz kopuklugu azalir

### 4. Guest request + SLA + escalation modulu

Oncelik: Yuksek

Neden:

- Alice, hotelkit ve Quore guest request tarafini basit sikayet kaydindan ayiriyor.
- Misafir talepleri ile sikayetler ayni sey degil; towel, baby cot, late checkout, airport transfer gibi talepler ayri akista olmali.

Eklenmesi gereken minimum alanlar:

- request type library
- hedef departman
- hedef cevap suresi
- hedef tamamlama suresi
- escalation rule
- compensation / recovery kaydi
- guest mood / severity
- open -> assigned -> in progress -> delivered -> confirmed akisi

Beklenen kazanc:

- sikayet olusmadan once servis verisi yakalanir
- SLA sapmalari gorunur
- recovery maliyeti olculur

### 5. PMS entegrasyon katmani

Oncelik: Yuksek

Neden:

- hotelkit, Alice, Mews ve HotSOS'un hepsi oda, rezervasyon ve misafir bilgisini PMS'ten alarak is akisi kuruyor.
- PMS baglami olmadan housekeeping, VIP onceligi, early check-in, stayover servisi ve room readiness yarim kalir.

Ilk asamada gereken veri:

- oda numarasi
- check-in / check-out
- room status
- VIP flag
- arrival / departure listesi
- reservation notlari
- room move

Not:

Bu katman tam entegrasyon degilse bile once import/API adaptor mantigiyla tasarlanabilir.

### 6. Supervisor verimlilik paneli

Oncelik: Orta-Yuksek

Neden:

- HotSOS ve Quore tarafinda productivity dashboard yoneticinin gunluk kontrol araci.
- Mevcut audit log faydali ama operasyon verimliligini olcmuyor.

Eklenmesi gereken KPI'lar:

- oda hazir olma ortalama suresi
- geciken task sayisi
- departman bazli SLA kacirma orani
- tekrar acilan issue sayisi
- kisi bazli tamamlanan is
- inspection score
- open vs resolved by shift

## Simdilik eklenmemesi gerekenler

Bunlar pazarda var ama ilk faz icin zorunlu degil:

- AI voice task capture
- coklu otel / cluster yonetimi
- ileri seviye itinerary / guest journey modulu
- tam BI / butce / labor forecasting
- misafir tarafi self-service web concierge

Bunlar ikinci veya ucuncu faz icin daha dogru olur.

## Onerilen urun yol haritasi

### Faz 1

- Housekeeping
- Maintenance
- Shift handover / logbook

### Faz 2

- Guest request + SLA + escalation
- PMS integration layer
- Supervisor productivity dashboard

### Faz 3

- mobile-first housekeeping screen
- inspection scoring
- contractor/vendor workflow
- AI-assisted routing and summaries

## Net urun karari

Mantiken ilk eklenecek moduller:

1. Housekeeping
2. Maintenance / PM
3. Shift handover
4. Guest request + SLA

En kritik urun farki burada olusur.

Sebep:

- Mevcut sisteminizde yonetim, sikayet ve gorev omurgasi zaten var.
- Pazardaki olgun urunler asil farki housekeeping + maintenance + service delivery ucgeninde yaratiyor.
- Bu uc modulu eklemeden uygulama iyi bir kontrol paneli olur; bu uc modulle ise gercek operasyon sistemi olur.

## Kaynaklar

- hotelkit ana platform: https://hotelkit.net/de/
- hotelkit front office: https://hotelkit.net/solutions/front-office/
- hotelkit guest services: https://hotelkit.net/solutions/guest-services/
- hotelkit PMS/housekeeping entegrasyon ornekleri: https://hotelkit.net/integrations/mews/ , https://hotelkit.net/integrations/ohip/
- Quore cleanings plus: https://www.quore.com/products/cleanings-plus/
- Quore support feature summary: https://www.quore.com/support
- Quore guest messaging: https://www.quore.com/product-premium/guest-messaging
- Actabl platform: https://actabl.com/
- Alice operations overview: https://actabl.com/alice/
- Alice service delivery: https://actabl.com/operations-software/service-delivery/
- Alice housekeeping refresh: https://actabl.com/news/actabl-introduces-alice-housekeeping-refresh/
- Amadeus HotSOS overview: https://www.amadeus-hospitality.com/service-optimization-software/hotsos
- HotSOS 2025 release notes: https://help.amadeus-hospitality.com/operations/service-optimization/content/release_notes/2025-release-notes.html
- HotSOS mobile notifications: https://help.amadeus-hospitality.com/operations/service-optimization/content/hskp-mobile-notifications.html
- HotSOS schedules: https://help.amadeus-hospitality.com/operations/service-optimization/content/schedules-list.html
- Mews operations: https://www.mews.com/en/products/operations
- Mews housekeeping: https://www.mews.com/en/products/housekeeping-software
- Mews guest intelligence: https://www.mews.com/en/products/hotel-guest-management-software

## Not

Bu belge urunlerin resmi sayfalarina gore hazirlanmistir. "Hangi modulu once
eklemeliyiz?" karari, bu kaynaklar uzerinden yapilan urun cikarimi ve mevcut
Voyage Kundu kapsamiyla yapilan mantiksal onceliklendirmedir.
