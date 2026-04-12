(function () {
  const DEFAULT_CONFIG = {
    auditEndpoint: "",
    ipLookupUrl: "https://api.ipify.org?format=json",
    maxQueueSize: 200,
    requestTimeoutMs: 4000,
    flushIntervalMs: 15000,
    siteName: "site",
  };

  const config = Object.assign({}, DEFAULT_CONFIG, window.PPLGSecurityConfig || {});
  const queueKey = "pplg.security.queue";
  const sessionKey = "pplg.security.session";
  const ipCacheKey = "pplg.security.ip";
  let flushTimer = null;
  let flushInFlight = false;
  let ipPromise = null;

  function safeJsonParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (_) {
      return fallback;
    }
  }

  function randomId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function getSessionId() {
    const existing = sessionStorage.getItem(sessionKey);
    if (existing) {
      return existing;
    }

    const created = randomId();
    sessionStorage.setItem(sessionKey, created);
    return created;
  }

  function trimValue(value, maxLength) {
    const normalized = String(value ?? "").trim();
    return normalized.length > maxLength ? normalized.slice(0, maxLength) : normalized;
  }

  function sanitizeDetails(details) {
    if (!details || typeof details !== "object") {
      return {};
    }

    const sanitized = {};

    Object.entries(details).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return;
      }

      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        sanitized[key] = trimValue(value, 500);
        return;
      }

      if (Array.isArray(value)) {
        sanitized[key] = value.slice(0, 20).map((item) => trimValue(item, 200));
        return;
      }

      sanitized[key] = trimValue(JSON.stringify(value), 500);
    });

    return sanitized;
  }

  function getQueue() {
    const parsed = safeJsonParse(localStorage.getItem(queueKey), []);
    return Array.isArray(parsed) ? parsed : [];
  }

  function saveQueue(queue) {
    localStorage.setItem(queueKey, JSON.stringify(queue.slice(-config.maxQueueSize)));
  }

  async function getClientIp() {
    if (!config.ipLookupUrl) {
      return null;
    }

    const cached = sessionStorage.getItem(ipCacheKey);
    if (cached) {
      return cached;
    }

    if (!ipPromise) {
      ipPromise = fetch(config.ipLookupUrl, {
        method: "GET",
        cache: "no-store",
        credentials: "omit",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`IP lookup failed with status ${response.status}`);
          }

          return response.json();
        })
        .then((payload) => {
          const ip = trimValue(payload.ip || "", 80);
          if (ip) {
            sessionStorage.setItem(ipCacheKey, ip);
            return ip;
          }

          return null;
        })
        .catch(() => null);
    }

    return ipPromise;
  }

  async function enqueueEvent(eventType, details) {
    const event = {
      id: randomId(),
      site: config.siteName,
      eventType,
      createdAt: new Date().toISOString(),
      sessionId: getSessionId(),
      page: location.pathname,
      url: location.href,
      title: trimValue(document.title || "", 180),
      referrer: trimValue(document.referrer || "", 500),
      userAgent: trimValue(navigator.userAgent || "", 500),
      language: trimValue(navigator.language || "", 40),
      timezone: trimValue(Intl.DateTimeFormat().resolvedOptions().timeZone || "", 80),
      screen: `${window.screen.width}x${window.screen.height}`,
      ip: await getClientIp(),
      details: sanitizeDetails(details),
    };

    const queue = getQueue();
    queue.push(event);
    saveQueue(queue);
    flushQueue();

    return event;
  }

  function flushWithBeacon(queue) {
    if (!navigator.sendBeacon || !config.auditEndpoint) {
      return false;
    }

    const payload = JSON.stringify({ events: queue });
    const blob = new Blob([payload], { type: "application/json" });
    return navigator.sendBeacon(config.auditEndpoint, blob);
  }

  async function flushQueue() {
    if (flushInFlight || !config.auditEndpoint) {
      return;
    }

    const queue = getQueue();
    if (!queue.length) {
      return;
    }

    flushInFlight = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);

    try {
      const response = await fetch(config.auditEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: queue }),
        signal: controller.signal,
        keepalive: true,
        credentials: "omit",
      });

      if (!response.ok) {
        throw new Error(`Audit endpoint returned ${response.status}`);
      }

      localStorage.removeItem(queueKey);
    } catch (_) {
      // Keep queue for next retry.
    } finally {
      clearTimeout(timeout);
      flushInFlight = false;
    }
  }

  function scheduleFlush() {
    if (flushTimer) {
      clearInterval(flushTimer);
    }

    flushTimer = setInterval(flushQueue, config.flushIntervalMs);
  }

  function isExternalLink(anchor) {
    try {
      return new URL(anchor.href, location.origin).origin !== location.origin;
    } catch (_) {
      return false;
    }
  }

  function hardenExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach((anchor) => {
      const rel = new Set((anchor.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
      rel.add("noopener");
      rel.add("noreferrer");
      anchor.setAttribute("rel", Array.from(rel).join(" "));
    });
  }

  function setupEventHooks() {
    document.addEventListener("click", (event) => {
      const anchor = event.target.closest("a[href]");
      if (!anchor) {
        return;
      }

      if (isExternalLink(anchor)) {
        enqueueEvent("external_link_click", {
          href: anchor.href,
          text: trimValue(anchor.textContent || "", 120),
        });
      }
    });

    document.addEventListener("submit", (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) {
        return;
      }

      enqueueEvent("form_submit_attempt", {
        action: form.action || location.href,
        id: form.id || "",
        method: form.method || "get",
      });
    });

    window.addEventListener("error", (event) => {
      enqueueEvent("frontend_error", {
        message: event.message || "Unknown error",
        source: event.filename || "",
        line: event.lineno || 0,
        column: event.colno || 0,
      });
    });

    window.addEventListener("unhandledrejection", (event) => {
      enqueueEvent("unhandled_rejection", {
        reason: trimValue(event.reason && event.reason.message ? event.reason.message : event.reason, 500),
      });
    });

    document.addEventListener("securitypolicyviolation", (event) => {
      enqueueEvent("csp_violation", {
        blockedUri: event.blockedURI || "",
        effectiveDirective: event.effectiveDirective || "",
        violatedDirective: event.violatedDirective || "",
      });
    });

    window.addEventListener("online", () => enqueueEvent("connection_online"));
    window.addEventListener("offline", () => enqueueEvent("connection_offline"));
    window.addEventListener("pagehide", () => {
      const queue = getQueue();
      if (queue.length) {
        flushWithBeacon(queue);
      }
    });
  }

  scheduleFlush();
  hardenExternalLinks();
  setupEventHooks();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      enqueueEvent("page_view");
      hardenExternalLinks();
    });
  } else {
    enqueueEvent("page_view");
  }

  window.PPLGSecurity = {
    flushQueue,
    getClientIp,
    logEvent: enqueueEvent,
  };
})();
