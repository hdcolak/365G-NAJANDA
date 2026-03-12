# Hotel Department Managers and Titles

Bu belge, otel ve resort operasyonlarinda sik kullanilan departman mudurluklerini
ve Voyage Kundu icin tavsiye edilen title yapisini ozetler.

## Operasyonel olarak en yaygin departman basliklari

Ana operasyon departmanlari:

- Front Office Manager
- Executive Housekeeper / Housekeeping Manager
- Food and Beverage Manager
- Chief Engineer / Engineering Manager
- Guest Relations Manager
- Security Manager

Resort tipinde sik eklenen departmanlar:

- Entertainment Manager / Animation Manager
- Spa Manager
- Kids Club / Recreation Manager

Ticari ve destek departmanlari:

- Sales and Marketing Manager
- Revenue Manager
- Human Resources Manager

## Voyage Kundu icin önerilen ilk title seti

Sisteme ilk fazda eklenmesi mantikli title'lar:

- Resepsiyon Muduru
- Housekeeping Muduru
- Yiyecek ve Icecek Muduru
- Teknik Muduru
- Misafir Iliskileri Muduru
- Guvenlik Muduru
- Animasyon Muduru

Sebep:

- Bunlar gunluk misafir operasyonuna dogrudan dokunan cekirdek departmanlardir.
- Gorev, sikayet, operasyon devirleri ve A'la Carte surecinde veri ureten ana ekipler bunlardir.

## Uygulama icindeki karsiliklari

Title key -> Department

- `frontOfficeManager` -> `frontOffice`
- `executiveHousekeeper` -> `housekeeping`
- `foodBeverageManager` -> `fb`
- `chiefEngineer` -> `technical`
- `guestRelationsManager` -> `guestRelations`
- `securityManager` -> `security`
- `entertainmentManager` -> `entertainment`

## Organizasyon kuralı

- Her departman muduru sadece kendi departman datalarini gorur.
- Genel mudur rolunde olmayan hicbir departman muduru tum task ve complaint datasina erisemez.
- Audit log ve yetki yonetimi sadece en ust yonetim katmaninda kalir.
- A'la Carte erisimi departman bazli karar ile verilir.
  - Front Office
  - Guest Relations
  - F&B
  bu modulu gormesi mantikli departmanlardir.

## Kaynaklar

- Les Roches hotel departments overview: https://lesroches.edu/blog/hotel-departments/
- EHL hospitality org chart and roles: https://hospitalityinsights.ehl.edu/hotel-organization-chart
- Indeed Front Office Manager description: https://www.indeed.com/hire/job-description/front-office-manager
- Indeed Executive Housekeeper description: https://www.indeed.com/hire/job-description/executive-housekeeper
- Indeed Chief Engineer description: https://www.indeed.com/hire/job-description/chief-engineer
- Betterteam F&B Manager description: https://www.betterteam.com/food-and-beverage-manager-job-description
- Jooble Guest Relations Manager description: https://jooble.org/job-description/hospitality-and-catering/guest-relations-manager/
- Jooble Security Manager description: https://jooble.org/job-description/protective-service/security-manager/
- Jooble Entertainment Manager description: https://jooble.org/job-description/business-services/entertainment-manager/

## Sonuc

Genel title arastirmasina gore departman bazli rol modelini kurmak dogru karar.
Ozellikle resort operasyonunda `animation/entertainment` title'inin de title setine
eklenmesi gerekir.
