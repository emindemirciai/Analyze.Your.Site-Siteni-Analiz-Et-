# Siteni Analiz Et

[Türkçe](README.md) | [English](README.en.md)

Kendi web siteniz için bağımsız dağıtabileceğiniz gerçek zamanlı trafik analiz uygulamasıdır. Ziyaretçi, oturum, sayfa yolu, yönlendiren kaynak, tarayıcı, ekran, dil, saat dilimi, ülke, şehir ve sayfada kalma süresi bilgilerini toplar.

## Özellikler

- Gerçek zamanlı ziyaret ve oturum takibi
- Sayfa, yönlendiren kaynak, cihaz ve tarayıcı kırılımları
- Ülke ve şehir bazlı konum görünümü
- Aktif ülkeleri kırmızı, ziyaretçi noktalarını beyaz ve panel vurgularını turuncu gösteren yüksek kontrastlı harita
- Türkçe ve İngilizce panel başlıkları
- Türkçe ve İngilizce içerikte farklı ekran genişliklerine uyum sağlayan panel başlığı ve denetimler
- Origin ve site adı doğrulaması
- İsteğe bağlı harici yönetici oturumu
- Her site için bağımsız veri alanı

## Kurulum Modeli

Her web sitesi için ayrı bir Dokploy Compose uygulaması oluşturulur. Uygulamaların tamamı aynı repoyu kullanabilir; ancak her uygulama yalnız kendi environment ayarına, domainine ve kalıcı volume'una sahip olur.

```text
Site: yourwebsite.com
Analiz paneli: analiz.yourwebsite.com
Service: analyze
Port: 3000
Path: /
```

Yeni bir kurulumda `yourwebsite` yer tutucularını yalnız ilgili sitenin bilgileriyle değiştirin. Public repoda gerçek site, müşteri veya deployment listesi tutulmamalıdır.

## Eksiksiz Environment

Her Dokploy Siteni Analiz Et uygulamasının Environment alanına siteye özel olarak aşağıdaki bloğun tamamını girin:

```env
NODE_ENV=production
ANALYZE_SITE_ID=yourwebsite.com
ANALYZE_SITE_NAME=YourWebsite.com
ANALYZE_TITLE_TR=YourWebsite.com Siteni Analiz Et
ANALYZE_TITLE_EN=YourWebsite.com Analyze Your Site
ANALYZE_METADATA_TITLE=YourWebsite.com Siteni Analiz Et | Trafik Paneli
ANALYZE_DESCRIPTION=YourWebsite.com için gerçek zamanlı trafik analiz paneli
ANALYZE_HEALTH_NAME=YourWebsite.com Siteni Analiz Et
ANALYZE_AUTH_MODE=platform-admin
ANALYZE_AUTH_API_URL=https://api.yourwebsite.com
ANALYZE_ALLOWED_ORIGINS=https://yourwebsite.com,https://www.yourwebsite.com,https://yourwebsite.com/play
ANALYZE_EVENT_SITES=yourwebsite.com,www.yourwebsite.com
ANALYZE_DATA_DIR=/app/data
ANALYZE_MAX_EVENTS=100000
ANALYZE_GEO_LOOKUP=true
```

Farklı bir site için aynı bloğu başka bir Dokploy projesindeki ayrı Siteni Analiz Et uygulamasına ekleyin. Birden fazla sitenin domainlerini tek uygulamanın environment alanında birleştirmeyin.

### Yönetici Girişi

Yukarıdaki örnek, paneli harici platformun yönetici oturumuyla korur:

```env
ANALYZE_AUTH_MODE=platform-admin
ANALYZE_AUTH_API_URL=https://api.yourwebsite.com
```

Giriş endpointi `/api/auth/login` olmalıdır. Yanıttaki `token`, `accessToken` veya `access_token` alanı otomatik algılanır. Yönetici yetkisi önce `/api/admin/session`, bu endpoint yoksa `/api/auth/me` üzerinden doğrulanır. `/api/auth/me` kullanıldığında kullanıcının yetkili bir yönetici rolüne sahip olması gerekir.

Desteklenen yönetici rolleri: `ADMIN`, `OWNER`, `SUPER_ADMIN`, `GAME_ADMIN`, `CONTENT_EDITOR`, `ANALYST`, `SUPPORT` ve `MODERATOR`.

Harici yönetici girişi kullanılmayacak bağımsız kurulumlarda `ANALYZE_AUTH_MODE=none` yazın ve `ANALYZE_AUTH_API_URL` değerini boş bırakın.

## Tracker

Takip edilecek sitenin ana layout veya HTML şablonuna ekleyin:

```html
<script defer src="https://analiz.yourwebsite.com/api/tracker" data-site="yourwebsite.com"></script>
```

`data-site` değeri `ANALYZE_EVENT_SITES` listesinde bulunmalıdır. Davet kodu ve sunucu kimliği içeren yollar kayıt öncesinde maskelenir.

## Yeni Bir Site Dağıtma

1. Dokploy'da bu GitHub reposunu kullanan yeni bir Compose uygulaması oluşturun.
2. Yalnız o siteye ait environment bloğunu uygulamaya girin.
3. `analiz.yourwebsite.com` domainini `analyze` servisine ve `3000` portuna bağlayın.
4. Tracker etiketini yalnız ilgili web sitesine ekleyin.
5. Uygulamayı deploy edin ve `/api/health` adresini doğrulayın.

> Dokploy'da `Autodeploy` açık, `Trigger Type` `On Push` olmalı. `Watch Paths` alanını boş bırakın; başlangıç komutu bu alana yazılmaz. Aksi halde GitHub pushları değişen dosya filtresine takılır ve dağıtım tetiklenmez.

Her Compose uygulamasının `analyze_data` volume'u Dokploy proje adıyla ayrı oluşturulur. Farklı sitelerin ziyaret kayıtları aynı volume'u kullanmaz.

## Environment Alanları

| Alan | Açıklama |
| --- | --- |
| `ANALYZE_SITE_ID` | Küçük harfli benzersiz site veya alan adı kimliği |
| `ANALYZE_SITE_NAME` | Panelde gösterilecek site adı |
| `ANALYZE_TITLE_TR`, `ANALYZE_TITLE_EN` | Panel başlıkları |
| `ANALYZE_METADATA_TITLE` | Tarayıcı sekmesi başlığı |
| `ANALYZE_DESCRIPTION` | Sayfa metadata açıklaması |
| `ANALYZE_HEALTH_NAME` | Sağlık kontrolünde gösterilecek ad |
| `ANALYZE_AUTH_MODE` | `none` veya `platform-admin` |
| `ANALYZE_AUTH_API_URL` | Yönetici girişini doğrulayan API adresi |
| `ANALYZE_ALLOWED_ORIGINS` | Tracker isteği gönderebilecek origin listesi |
| `ANALYZE_EVENT_SITES` | Bu panelde saklanıp gösterilecek `data-site` değerleri |
| `ANALYZE_DATA_DIR` | Kalıcı veri dizini |
| `ANALYZE_MAX_EVENTS` | Saklanacak azami olay sayısı |
| `ANALYZE_GEO_LOOKUP` | IP tabanlı konum çözümlemeyi açar veya kapatır |

## Yerel Geliştirme

```bash
npm install
npm run dev
```

`.env.local` dosyasında `.env.example` içeriğini kullanabilirsiniz.

## Doğrulama

```bash
npm run build
docker compose --env-file .env.example config
```

Sağlık kontrolü:

```text
https://analiz.yourwebsite.com/api/health
```

## Gizlilik

Bu public repoya gerçek müşteri adları, gerçek deployment domainleri, erişim anahtarları veya özel environment değerleri eklemeyin. Siteye özel ayarları yalnız ilgili Dokploy uygulamasında saklayın.

## Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.
