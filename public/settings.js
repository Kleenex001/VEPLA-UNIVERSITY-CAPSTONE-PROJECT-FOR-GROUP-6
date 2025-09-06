// ==================== Sidebar navigation ====================
function setActivePage(page) {
  document.querySelectorAll('.nav-link').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.querySelector(`.nav-link[data-target="${page}"]`);
  if (activeBtn) activeBtn.classList.add('active');
}

// ==================== Go Back button ====================
document.getElementById('goBackBtn')?.addEventListener('click', () => {
  window.history.back();
});

// ==================== Toast Notification ====================
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => toast.classList.add("show"), 100);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==================== Modal functions ====================
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

// Close modal when clicking outside content
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
});

// ==================== Sync Status ====================
const syncStatusEl = document.getElementById("syncStatus");
function toggleSync() {
  if (syncStatusEl.textContent === "Online") {
    syncStatusEl.textContent = "Offline";
    syncStatusEl.style.color = "red";
    showToast("⚠️ You are now offline", "error");
  } else {
    syncStatusEl.textContent = "Online";
    syncStatusEl.style.color = "green";
    showToast("✅ You are back online", "success");
  }
}
setInterval(toggleSync, 12000); // every 12s (demo)

// ==================== Notifications toggle ====================
const notificationCheck = document.querySelector('input[type="checkbox"][name="notifications"]');
if (notificationCheck) {
  notificationCheck.addEventListener("change", e => {
    if (e.target.checked) {
      showToast("🔔 Notifications enabled", "success");
    } else {
      showToast("🔕 Notifications disabled", "info");
    }
  });
}

// ==================== Preferences preview ====================
const currencySelect = document.querySelector("select[name='currency']");
const dateFormatSelect = document.querySelector("select[name='dateFormat']");

if (currencySelect) {
  currencySelect.addEventListener("change", () => {
    showToast(`💱 Currency changed to: ${currencySelect.value}`, "info");
  });
}

if (dateFormatSelect) {
  dateFormatSelect.addEventListener("change", () => {
    showToast(`📅 Date format set to: ${dateFormatSelect.value}`, "info");
  });
}

// ==================== Export / Sync actions ====================
function downloadReceipt() {
  const link = document.createElement("a");
  link.href = "Assets/sample-receipt.pdf"; // example path
  link.download = "Receipt.pdf";
  link.click();
  showToast("📄 Receipt downloaded", "success");
}

function manualSync() {
  showToast("🔄 Sync started...", "info");
  setTimeout(() => {
    showToast("✅ Sync completed!", "success");
  }, 2000);
}

// Bind modal buttons
document.querySelector("#receiptModal .btn.primary")?.addEventListener("click", downloadReceipt);
document.querySelector("#exportModal .btn.primary")?.addEventListener("click", manualSync);

// ==================== Save + Logout ====================
document.querySelector(".btn.primary")?.addEventListener("click", () => {
  showToast("✅ Settings saved successfully!", "success");
});

document.querySelector(".btn.secondary")?.addEventListener("click", () => {
  if (confirm("Are you sure you want to logout?")) {
    showToast("👋 Logged out", "info");
    window.location.href = "login.html"; // redirect
  }
});
// ==================== Initialize Page ====================
document.addEventListener("DOMContentLoaded", () => {
  setActivePage(location.hash.replace("#", "") || "dashboard");
});
window.addEventListener("hashchange", () => {
  setActivePage(location.hash.replace("#", "") || "dashboard");
}); 
// ==================== Sidebar navigation ====================
function setActivePage(page) {
  document.querySelectorAll('.nav-link').forEach(btn => {   
    btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`.nav-link[data-target="${page}"]`);
    if (activeBtn) activeBtn.classList.add('active');
}

// ==================== Go Back button ====================
document.getElementById('goBackBtn')?.addEventListener('click', () => {
  window.history.back();
});
// ==================== Toast Notification ====================
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
    // Animate in
    setTimeout(() => toast.classList.add("show"), 100);
    // Auto remove
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== Modal functions ====================
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}
// Close modal when clicking outside content
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      closeModal(modal.id);
    }
  });
});
