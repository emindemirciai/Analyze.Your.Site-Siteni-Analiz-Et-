# Analyze Your Site

[Türkçe](README.md) | [English](README.en.md)

A self-hosted, real-time traffic analysis application that can be deployed independently for each website. It records visitor, session, page path, referrer, browser, screen, language, time zone, country, city, and time-on-page information.

## Features

- Real-time visitor and session tracking
- Page, referrer, device, and browser breakdowns
- Country and city location views
- Turkish and English dashboard titles
- Origin and site-name validation
- Optional external administrator authentication
- Isolated data storage for every website

## Deployment Model

Create a separate Dokploy Compose application for every website. Every application may use this repository, but each deployment must have its own environment values, domain, and persistent volume.

```text
Website: yourwebsite.com
Analysis panel: analyze.yourwebsite.com
Service: analyze
Port: 3000
Path: /
```

Replace the `yourwebsite` placeholders only with the details of the website being deployed. Do not store real website, customer, or deployment lists in the public repository.

## Complete Environment

Add the entire site-specific block below to the Environment section of each Dokploy Analyze application:

```env
NODE_ENV=production
ANALYZE_SITE_ID=yourwebsite
ANALYZE_SITE_NAME=Your Website
ANALYZE_TITLE_TR=Your Website Analiz
ANALYZE_TITLE_EN=Your Website Analyze
ANALYZE_METADATA_TITLE=Your Website Analyze | Traffic Panel
ANALYZE_DESCRIPTION=Real-time traffic analysis panel for Your Website
ANALYZE_HEALTH_NAME=Your Website Analyze
ANALYZE_AUTH_MODE=none
ANALYZE_AUTH_API_URL=
ANALYZE_ALLOWED_ORIGINS=https://yourwebsite.com,https://www.yourwebsite.com
ANALYZE_EVENT_SITES=yourwebsite.com,www.yourwebsite.com
ANALYZE_DATA_DIR=/app/data
ANALYZE_MAX_EVENTS=100000
ANALYZE_GEO_LOOKUP=true
```

For another website, add a separate block to a separate Analyze application in that website's Dokploy project. Do not combine domains from multiple websites in one application's environment.

### Deployment With Administrator Authentication

Use these values when the panel should be protected by an external platform's administrator session:

```env
ANALYZE_AUTH_MODE=platform-admin
ANALYZE_AUTH_API_URL=https://api.yourwebsite.com
```

The authentication API must provide `/api/auth/login` and `/api/admin/session` endpoints.

## Tracker

Add this tag to the main layout or HTML template of the website being tracked:

```html
<script defer src="https://analyze.yourwebsite.com/api/tracker" data-site="yourwebsite.com"></script>
```

The `data-site` value must be included in `ANALYZE_EVENT_SITES`. Paths containing invite codes or server identifiers are masked before storage.

## Deploying Another Website

1. Create a new Dokploy Compose application using this GitHub repository.
2. Add only that website's environment block to the application.
3. Connect `analyze.yourwebsite.com` to the `analyze` service on port `3000`.
4. Add the tracker tag only to the related website.
5. Deploy the application and verify `/api/health`.

The `analyze_data` volume is scoped to the Dokploy Compose project. Visit records from different websites are never stored in the same volume.

## Environment Reference

| Variable | Description |
| --- | --- |
| `ANALYZE_SITE_ID` | Unique lowercase website identifier |
| `ANALYZE_SITE_NAME` | Website name displayed in the panel |
| `ANALYZE_TITLE_TR`, `ANALYZE_TITLE_EN` | Panel titles |
| `ANALYZE_METADATA_TITLE` | Browser tab title |
| `ANALYZE_DESCRIPTION` | Page metadata description |
| `ANALYZE_HEALTH_NAME` | Name returned by the health endpoint |
| `ANALYZE_AUTH_MODE` | `none` or `platform-admin` |
| `ANALYZE_AUTH_API_URL` | API URL used to verify administrator sessions |
| `ANALYZE_ALLOWED_ORIGINS` | Origins allowed to submit tracker requests |
| `ANALYZE_EVENT_SITES` | Accepted `data-site` values stored by this panel |
| `ANALYZE_DATA_DIR` | Persistent data directory |
| `ANALYZE_MAX_EVENTS` | Maximum number of stored events |
| `ANALYZE_GEO_LOOKUP` | Enables or disables IP-based location lookup |

## Local Development

```bash
npm install
npm run dev
```

You can copy the `.env.example` values into `.env.local`.

## Verification

```bash
npm run build
docker compose --env-file .env.example config
```

Health endpoint:

```text
https://analyze.yourwebsite.com/api/health
```

## Privacy

Do not add real customer names, deployment domains, access keys, or private environment values to this public repository. Keep site-specific configuration only in the corresponding Dokploy application.

## License

This project is licensed under the [MIT License](LICENSE).
