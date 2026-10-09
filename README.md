# FareWatch — starter build

FareWatch is an early-stage custom website for collecting flight-watch preferences.

## What is implemented

- Responsive homepage and flight-watch form.
- Round-trip and one-way selection.
- Airport-code, date, monitoring-duration, frequency, and drop-threshold inputs.
- Server-side input validation.
- SQLite persistence for submitted watch settings.
- `GET /api/health` health endpoint.
- `GET /api/watches` development endpoint for viewing saved watches.
- Honest UI copy showing that live prices and alerts are not active yet.

## What is NOT implemented yet

- Live flight-price data/API connection.
- Scheduled recurring fare checks.
- Email verification, sign-in, unsubscribe, and privacy workflow.
- Email or push notifications.
- Affiliate tracking/booking links.
- Production-grade database, rate limiting, monitoring, security review, and deployment.

Do not collect real customer emails publicly until the privacy policy, consent, deletion, and unsubscribe workflows are in place. The current `GET /api/watches` endpoint is for development only and must be protected or removed before public deployment.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000.

On Windows, create `.env` by copying `.env.example` manually if `cp` is unavailable.

## Before public launch

1. Select and verify a flight data provider whose terms permit scheduled recurring price checks and affiliate links.
2. Add a real scheduler/worker and baseline-price model.
3. Add email delivery using a transactional email provider.
4. Replace local SQLite with a durable managed database before hosting on an ephemeral free filesystem.
5. Add authentication or secure access to watch records; remove or protect the development watch-list endpoint.
6. Add privacy policy, terms, consent, deletion, and unsubscribe support.
7. Register affiliate programs and use only approved links/creative assets.
8. Deploy and test in a staging environment before sharing with the public.

## Zero-budget deployment note

A free host can be useful for a preview, but free services may sleep and local files may be erased on restart/redeploy. That makes a free ephemeral host unsuitable for dependable background fare monitoring and durable SQLite data. Use it for a demo only until a persistent database and scheduled worker are configured.
