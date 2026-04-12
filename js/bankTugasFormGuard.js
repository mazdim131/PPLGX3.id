(function () {
  const STORAGE_KEYS = {
    failedAttempts: "pplg.bankTugas.failedAttempts",
    unlocks: "pplg.bankTugas.unlocks",
    blockedUntil: "pplg.bankTugas.blockedUntil",
    unlockedUntil: "pplg.bankTugas.unlockedUntil",
  };
  const FORM_URL_PARTS = [
    "https://docs.google.com/forms/d/e/1FAIpQLSeDfJxXOfsfyDXr18dyKUV49Zd-s5tWreLjbumgDsjNQ7fvOA",
    "/viewform?embedded=true",
  ];
  const FAILED_LIMIT = 5;
  const FAILED_WINDOW_MS = 15 * 60 * 1000;
  const BLOCK_MS = 30 * 60 * 1000;
  const UNLOCK_LIMIT = 3;
  const UNLOCK_WINDOW_MS = 30 * 60 * 1000;
  const MIN_GAP_BETWEEN_UNLOCKS_MS = 60 * 1000;
  const ACCESS_TTL_MS = 10 * 60 * 1000;

  const gate = document.getElementById("bankTugasFormGate");
  const iframe = document.getElementById("formInput");
  const status = document.getElementById("bankTugasFormStatus");
  const modal = document.getElementById("modalAdd");

  if (!gate || !iframe || !modal) {
    return;
  }

  function readList(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch (_) {
      return [];
    }
  }

  function writeList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
  }

  function trimRecent(list, windowMs) {
    const threshold = Date.now() - windowMs;
    return list.filter((value) => value >= threshold);
  }

  function setStatus(message, tone) {
    status.className = `small mb-3 ${tone || "text-muted"}`;
    status.textContent = message;
  }

  function logEvent(type, details) {
    if (window.PPLGSecurity && typeof window.PPLGSecurity.logEvent === "function") {
      window.PPLGSecurity.logEvent(type, details);
    }
  }

  function getBlockedUntil() {
    return Number(localStorage.getItem(STORAGE_KEYS.blockedUntil) || "0");
  }

  function isBlocked() {
    return getBlockedUntil() > Date.now();
  }

  function getAccessUntil() {
    return Number(localStorage.getItem(STORAGE_KEYS.unlockedUntil) || "0");
  }

  function hasActiveAccess() {
    return getAccessUntil() > Date.now();
  }

  function recordFailedAttempt() {
    const attempts = trimRecent(readList(STORAGE_KEYS.failedAttempts), FAILED_WINDOW_MS);
    attempts.push(Date.now());
    writeList(STORAGE_KEYS.failedAttempts, attempts);

    if (attempts.length >= FAILED_LIMIT) {
      const blockedUntil = Date.now() + BLOCK_MS;
      localStorage.setItem(STORAGE_KEYS.blockedUntil, String(blockedUntil));
      logEvent("bank_tugas_form_blocked", {
        reason: "too_many_failed_challenges",
        blockedUntil: new Date(blockedUntil).toISOString(),
      });
      return blockedUntil;
    }

    return 0;
  }

  function recordUnlock() {
    const unlocks = trimRecent(readList(STORAGE_KEYS.unlocks), UNLOCK_WINDOW_MS);
    unlocks.push(Date.now());
    writeList(STORAGE_KEYS.unlocks, unlocks);
    localStorage.setItem(STORAGE_KEYS.unlockedUntil, String(Date.now() + ACCESS_TTL_MS));
  }

  function canUnlock() {
    const unlocks = trimRecent(readList(STORAGE_KEYS.unlocks), UNLOCK_WINDOW_MS);
    writeList(STORAGE_KEYS.unlocks, unlocks);

    if (unlocks.length >= UNLOCK_LIMIT) {
      return {
        allowed: false,
        reason: "too_many_recent_unlocks",
        until: unlocks[0] + UNLOCK_WINDOW_MS,
      };
    }

    const lastUnlock = unlocks[unlocks.length - 1] || 0;
    if (lastUnlock && Date.now() - lastUnlock < MIN_GAP_BETWEEN_UNLOCKS_MS) {
      return {
        allowed: false,
        reason: "cooldown_active",
        until: lastUnlock + MIN_GAP_BETWEEN_UNLOCKS_MS,
      };
    }

    return { allowed: true, reason: "" };
  }

  function formatRemaining(until) {
    const remainingMs = Math.max(0, until - Date.now());
    const minutes = Math.ceil(remainingMs / 60000);
    return `${minutes} menit`;
  }

  function hideForm() {
    iframe.hidden = true;
    iframe.removeAttribute("src");
  }

  function showForm() {
    iframe.hidden = false;
    iframe.src = FORM_URL_PARTS.join("");
    gate.innerHTML = "";
    setStatus("Akses formulir dibuka sementara. Aktivitas ini sedang dicatat untuk audit.", "text-success");
    logEvent("bank_tugas_form_opened", {
      accessUntil: new Date(getAccessUntil()).toISOString(),
    });
  }

  function renderBlocked(until, reason) {
    hideForm();
    gate.innerHTML = `
      <div class="alert alert-danger mb-0" role="alert">
        Akses form ditahan sementara karena aktivitas terlalu cepat. Coba lagi dalam ${formatRemaining(until)}.
      </div>
    `;
    setStatus(`Proteksi aktif: ${reason}.`, "text-danger");
  }

  function buildChallenge() {
    const first = Math.floor(Math.random() * 6) + 2;
    const second = Math.floor(Math.random() * 5) + 3;
    const answer = first + second;

    gate.innerHTML = `
      <div class="card border-0 shadow-sm">
        <div class="card-body text-start">
          <h6 class="fw-bold">Verifikasi akses form</h6>
          <p class="small text-muted mb-3">Form publik paling sering disalahgunakan. Selesaikan verifikasi singkat ini untuk membuka input tugas.</p>
          <label class="form-label" for="bankTugasHumanCheck">Berapakah ${first} + ${second}?</label>
          <input id="bankTugasHumanCheck" class="form-control mb-3" inputmode="numeric" autocomplete="off" maxlength="2">
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" value="" id="bankTugasPolicyCheck">
            <label class="form-check-label small" for="bankTugasPolicyCheck">
              Saya mengirim tugas asli dan memahami bahwa percobaan akses ini dicatat bersama IP publik saya.
            </label>
          </div>
          <button type="button" class="btn btn-success w-100" id="bankTugasUnlockButton">Verifikasi & buka form</button>
          <p class="small text-muted mt-3 mb-0">Batas perangkat: maksimal 3 pembukaan form per 30 menit.</p>
        </div>
      </div>
    `;

    const input = document.getElementById("bankTugasHumanCheck");
    const checkbox = document.getElementById("bankTugasPolicyCheck");
    const button = document.getElementById("bankTugasUnlockButton");

    button.addEventListener("click", () => {
      const unlockState = canUnlock();
      if (!unlockState.allowed) {
        localStorage.setItem(STORAGE_KEYS.blockedUntil, String(unlockState.until));
        renderBlocked(unlockState.until, unlockState.reason);
        logEvent("bank_tugas_form_blocked", {
          reason: unlockState.reason,
          blockedUntil: new Date(unlockState.until).toISOString(),
        });
        return;
      }

      if (!checkbox.checked) {
        setStatus("Centang persetujuan sebelum membuka form.", "text-danger");
        logEvent("bank_tugas_form_failed", { reason: "policy_unchecked" });
        return;
      }

      if (Number(input.value) !== answer) {
        const blockedUntil = recordFailedAttempt();
        setStatus("Jawaban verifikasi salah. Coba lagi.", "text-danger");
        logEvent("bank_tugas_form_failed", { reason: "wrong_challenge_answer" });

        if (blockedUntil) {
          renderBlocked(blockedUntil, "too_many_failed_challenges");
        }
        return;
      }

      recordUnlock();
      setStatus("Verifikasi berhasil. Form dibuka.", "text-success");
      logEvent("bank_tugas_form_verified");
      showForm();
    });
  }

  function refreshGate() {
    if (isBlocked()) {
      renderBlocked(getBlockedUntil(), "temporary_device_block");
      return;
    }

    if (hasActiveAccess()) {
      showForm();
      return;
    }

    hideForm();
    buildChallenge();
    setStatus("Verifikasi diperlukan sebelum form dimuat.", "text-muted");
  }

  modal.addEventListener("show.bs.modal", () => {
    refreshGate();
    logEvent("bank_tugas_modal_opened");
  });

  modal.addEventListener("hidden.bs.modal", () => {
    hideForm();
    if (!hasActiveAccess()) {
      gate.innerHTML = "";
    }
  });
})();
