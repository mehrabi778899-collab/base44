# Road freight company website

Persian-first, RTL trucking website with an English LTR version. Domestic road transport throughout Iran and international road transport to/from neighboring countries, Central Asia, and Europe. No air or sea freight.

## Development preview

```sh
docker compose -f docker-compose.base44.yml up -d
```

The preview is served on port 3000 from live source. The container installs locked dependencies and runs both a watched Express API and the Vite development server. SQLite data persists in the `freight_data` Docker volume. No external service credentials are required for quote storage, contact forms, or shipment tracking.

The platform-managed `/run/base44/app.env` must contain `ADMIN_PASSWORD`. Base44 can generate a development value. Replace it with your own strong password in the secure Secrets dashboard; do not commit credentials.

## Company setup

1. Set `ADMIN_PASSWORD` in Secrets to a strong password (at least 12 characters).
2. Open `/admin` and sign in with username `admin`.
3. In Company settings, enter real Persian/English brand names and contact details. Address enables the contact map; phone enables click-to-call; WhatsApp needs country code and digits only. Social profiles require HTTPS URLs.
4. Review incoming quotes and contact messages. Quote statuses are New, Contacted, and Closed.
5. Create shipments with unique tracking codes (6–64 letters, digits, or hyphens), origins, destinations, and statuses. Customers can enter the codes at `/track`.

Quote submissions are stored in `QuoteRequest`; shipment records and status history in `Shipment`; contact submissions in `ContactMessage`. Forms store requests in the database; they do not send email or integrate with live fleet GPS. Tracking reflects statuses entered by administrators. The customer portal entry currently leads to admin sign-in; individual customer accounts are not implemented.

The website includes service details, routes, company information, a bilingual educational journal, contact forms, privacy/terms starter content, animated figures, and responsive navigation. Brand names, company contacts, illustrative testimonials, user-requested marketing statistics, stock photography, and policy copy should be reviewed before commercial use. The placeholder name remains `[BRAND NAME]` until configured.

## Verification

```sh
curl -f http://localhost:3000/
curl -f http://localhost:3000/api/posts
docker compose -f docker-compose.base44.yml ps
docker compose -f docker-compose.base44.yml exec -T app npm run build
```

The preview serves source modules with hot reload. `npm run build` is a build check only. No production deployment workflow is configured; the development Compose stack is not a production deployment.
