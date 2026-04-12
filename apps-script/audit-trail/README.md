# Google Apps Script Audit Trail

Folder ini berisi webhook penerima event audit dari frontend statis.

## Yang perlu Anda siapkan

1. Buat spreadsheet baru untuk audit trail.
2. Salin isi [Code.gs](/Users/ztrenggono/Library/Mobile%20Documents/com~apple~CloudDocs/Developer/experimentProject/PPLGX3.id/apps-script/audit-trail/Code.gs) ke project Apps Script baru.
3. Salin isi [appsscript.json](/Users/ztrenggono/Library/Mobile%20Documents/com~apple~CloudDocs/Developer/experimentProject/PPLGX3.id/apps-script/audit-trail/appsscript.json) ke manifest Apps Script.
4. Ganti `AUDIT_CONFIG.spreadsheetId` dengan ID spreadsheet audit Anda.
5. Jalankan fungsi `setupAuditSheet()` sekali dari editor Apps Script.
6. Deploy sebagai `Web app`.

## Deploy Web App

- Execute as: `Me`
- Who has access: `Anyone`

Setelah deploy, ambil URL `.../exec` lalu isi ke:

- [js/security-config.js](/Users/ztrenggono/Library/Mobile%20Documents/com~apple~CloudDocs/Developer/experimentProject/PPLGX3.id/js/security-config.js)

## Kolom audit trail

- `timestamp`
- `event_type`
- `site`
- `session_id`
- `ip_raw`
- `page`
- `url`
- `referrer`
- `title`
- `user_agent`
- `language`
- `timezone`
- `screen`
- `event_id`
- `details_json`

## Event yang masuk

- `page_view`
- `external_link_click`
- `form_submit_attempt`
- `frontend_error`
- `unhandled_rejection`
- `csp_violation`
- `connection_online`
- `connection_offline`
- `bank_tugas_modal_opened`
- `bank_tugas_form_failed`
- `bank_tugas_form_verified`
- `bank_tugas_form_opened`
- `bank_tugas_form_blocked`
