const AUDIT_CONFIG = {
  spreadsheetId: "REPLACE_WITH_AUDIT_SPREADSHEET_ID",
  sheetName: "audit_trail",
  maxEventsPerRequest: 50,
  maxFieldLength: 1000,
  allowedSites: ["pplg-x3"],
};

function doPost(e) {
  try {
    const body = parseRequestBody_(e);
    const events = normalizeEvents_(body.events);

    if (!events.length) {
      return jsonResponse_({ ok: false, message: "No events received." }, 400);
    }

    const sheet = getAuditSheet_();
    const rows = [];

    events.forEach((event) => {
      if (!isAllowedSite_(event.site)) {
        return;
      }

      rows.push([
        asString_(event.createdAt),
        asString_(event.eventType),
        asString_(event.site),
        asString_(event.sessionId),
        asString_(event.ip),
        asString_(event.page),
        asString_(event.url),
        asString_(event.referrer),
        asString_(event.title),
        asString_(event.userAgent),
        asString_(event.language),
        asString_(event.timezone),
        asString_(event.screen),
        asString_(event.id),
        JSON.stringify(sanitizeObject_(event.details || {})),
      ]);
    });

    if (!rows.length) {
      return jsonResponse_({ ok: false, message: "No allowed events to save." }, 403);
    }

    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);

    return jsonResponse_({ ok: true, saved: rows.length }, 200);
  } catch (error) {
    return jsonResponse_({
      ok: false,
      message: error.message,
    }, 500);
  }
}

function doGet() {
  return jsonResponse_({
    ok: true,
    message: "Audit trail webhook is running.",
    sheetName: AUDIT_CONFIG.sheetName,
  }, 200);
}

function setupAuditSheet() {
  const sheet = getAuditSheet_();
  const headers = [[
    "timestamp",
    "event_type",
    "site",
    "session_id",
    "ip_raw",
    "page",
    "url",
    "referrer",
    "title",
    "user_agent",
    "language",
    "timezone",
    "screen",
    "event_id",
    "details_json",
  ]];

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
    sheet.setFrozenRows(1);
  }
}

function getAuditSheet_() {
  if (!AUDIT_CONFIG.spreadsheetId || AUDIT_CONFIG.spreadsheetId === "REPLACE_WITH_AUDIT_SPREADSHEET_ID") {
    throw new Error("Set AUDIT_CONFIG.spreadsheetId first.");
  }

  const spreadsheet = SpreadsheetApp.openById(AUDIT_CONFIG.spreadsheetId);
  const sheet = spreadsheet.getSheetByName(AUDIT_CONFIG.sheetName) || spreadsheet.insertSheet(AUDIT_CONFIG.sheetName);
  return sheet;
}

function parseRequestBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Missing POST body.");
  }

  return JSON.parse(e.postData.contents);
}

function normalizeEvents_(events) {
  if (!Array.isArray(events)) {
    return [];
  }

  return events.slice(0, AUDIT_CONFIG.maxEventsPerRequest).map((event) => ({
    id: asString_(event.id),
    createdAt: asString_(event.createdAt),
    eventType: asString_(event.eventType),
    site: asString_(event.site),
    sessionId: asString_(event.sessionId),
    ip: asString_(event.ip),
    page: asString_(event.page),
    url: asString_(event.url),
    referrer: asString_(event.referrer),
    title: asString_(event.title),
    userAgent: asString_(event.userAgent),
    language: asString_(event.language),
    timezone: asString_(event.timezone),
    screen: asString_(event.screen),
    details: sanitizeObject_(event.details || {}),
  }));
}

function sanitizeObject_(value) {
  const sanitized = {};

  Object.keys(value).slice(0, 30).forEach((key) => {
    const raw = value[key];

    if (raw === null || raw === undefined) {
      return;
    }

    if (typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean") {
      sanitized[key] = asString_(raw);
      return;
    }

    if (Array.isArray(raw)) {
      sanitized[key] = raw.slice(0, 20).map((item) => asString_(item));
      return;
    }

    sanitized[key] = asString_(JSON.stringify(raw));
  });

  return sanitized;
}

function asString_(value) {
  return String(value || "").trim().slice(0, AUDIT_CONFIG.maxFieldLength);
}

function isAllowedSite_(site) {
  if (!AUDIT_CONFIG.allowedSites.length) {
    return true;
  }

  return AUDIT_CONFIG.allowedSites.indexOf(site) !== -1;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
