# Security Setup

## Audit log endpoint

Edit [js/security-config.js](/Users/ztrenggono/Library/Mobile%20Documents/com~apple~CloudDocs/Developer/experimentProject/PPLGX3.id/js/security-config.js) and fill `auditEndpoint` with your HTTPS webhook URL.

If you want to store logs in a dedicated spreadsheet, use the Google Apps Script webhook template in:

- [apps-script/audit-trail/Code.gs](/Users/ztrenggono/Library/Mobile%20Documents/com~apple~CloudDocs/Developer/experimentProject/PPLGX3.id/apps-script/audit-trail/Code.gs)
- [apps-script/audit-trail/README.md](/Users/ztrenggono/Library/Mobile%20Documents/com~apple~CloudDocs/Developer/experimentProject/PPLGX3.id/apps-script/audit-trail/README.md)

If the endpoint uses a different domain, also add that domain into `connect-src` inside [vercel.json](/Users/ztrenggono/Library/Mobile%20Documents/com~apple~CloudDocs/Developer/experimentProject/PPLGX3.id/vercel.json), otherwise the browser will block the request.

Expected request body:

```json
{
  "events": [
    {
      "id": "uuid",
      "eventType": "page_view",
      "createdAt": "2026-04-12T12:34:56.000Z",
      "sessionId": "uuid",
      "page": "/page/bankTugas.html",
      "url": "https://example.com/page/bankTugas.html",
      "referrer": "",
      "userAgent": "...",
      "ip": "203.0.113.10",
      "details": {}
    }
  ]
}
```

## Static-only limitation

This implementation can collect raw public IP from the browser and forward it to your endpoint, but the log is only trustworthy if the receiving endpoint is outside the browser, such as:

- Google Apps Script Web App
- Cloudflare Worker webhook
- Supabase Edge Function
- A logging SaaS webhook

If `auditEndpoint` is left empty, events stay in browser `localStorage` and will not give you central traceability.

## What is logged

- page view
- external link click
- form submit attempt
- frontend error
- CSP violation
- connection online/offline
- Bank Tugas form open, fail, block, and verify

## Google Apps Script path

Recommended path for your current stack:

1. Create a new spreadsheet for audit logs.
2. Create a new Apps Script project.
3. Paste the files from [apps-script/audit-trail](/Users/ztrenggono/Library/Mobile%20Documents/com~apple~CloudDocs/Developer/experimentProject/PPLGX3.id/apps-script/audit-trail).
4. Set your spreadsheet ID in `Code.gs`.
5. Run `setupAuditSheet()` once.
6. Deploy as Web App and copy the `/exec` URL.
7. Put that URL into `auditEndpoint` in [js/security-config.js](/Users/ztrenggono/Library/Mobile%20Documents/com~apple~CloudDocs/Developer/experimentProject/PPLGX3.id/js/security-config.js).
