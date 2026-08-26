/* ============================================
   وضع مالك الموقع — أزرار التعديل
   تعمل الأزرار فقط بعد إدخال كود الدخول
   التعديلات تُحفظ في localStorage وتُطبق فور العرض
   زر التحميل ينتج نسخة content.json كاملة بالتعديلات
   ============================================ */

const ADMIN_SESSION_KEY = 'smile_admin_active';
/* OVERRIDES_KEY معرّف في main.js — متاح هنا عبر النطاق العام */

let adminActive = false;

/* كود الدخول: يُتحقق منه من جهة الخادم (Cloudflare Pages Function)
   كلمة المرور محفوظة في المتغير البيئي ADMIN_PASSWORD بموقع Cloudflare
   ولا توجد في أي ملف من ملفات الموقع، فتبقى سرية عن الزوار */
async function verifyAdminCode(code) {
  try {
    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data && data.ok === true;
  } catch (e) {
    console.error('تعذر التحقق من كود المالك', e);
    return false;
  }
}

/* ===== الدخول / الخروج ===== */
async function enterAdminMode() {
  if (adminActive) return;
  const code = prompt('🔐 أدخل كود المالك لتفعيل وضع التعديل:');
  if (code === null) return;

  const ok = await verifyAdminCode(code);
  if (!ok) {
    alert('❌ الكود غير صحيح. فقط مالك الموقع يستطيع التعديل.');
    return;
  }

  adminActive = true;
  sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
  document.body.classList.add('admin-mode');
  document.getElementById('adminToolbar').hidden = false;
  attachEditButtons();
}

function exitAdminMode() {
  adminActive = false;
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  document.body.classList.remove('admin-mode');
  document.getElementById('adminToolbar').hidden = true;
  removeEditButtons();
}

/* ===== أزرار التعديل بجانب العناصر ===== */
function attachEditButtons() {
  removeEditButtons();
  document.querySelectorAll('[data-edit]').forEach(el => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'edit-btn';
    btn.textContent = '✏️ تعديل';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleEdit(el);
    });
    el.style.position = el.style.position || 'relative';
    if (el.dataset.editType === 'image') {
      el.appendChild(btn);
    } else {
      el.parentElement.appendChild(btn);
      moveButtonNearElement(el, btn);
    }
  });
}

function moveButtonNearElement(el, btn) {
  btn.style.position = 'absolute';
  btn.style.top = '-12px';
  btn.style.left = '-4px';
  const parent = el.parentElement;
  if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
  parent.appendChild(btn);
}

function removeEditButtons() {
  document.querySelectorAll('.edit-btn').forEach(b => b.remove());
}

/* ===== تنفيذ التعديل ===== */
function handleEdit(el) {
  const path = el.dataset.edit;
  const type = el.dataset.editType;
  const label = el.dataset.editLabel || path;

  if (type === 'image') {
    openImageUploader(path);
    return;
  }

  const current = window.getOverrideValue(path);

  if (type === 'list') {
    const arr = Array.isArray(current) ? current : [];
    const value = prompt(`✏️ تعديل: ${label}\n\nكل بند في سطر مستقل:\n(احذف سطراً لحذف البند وأضف سطراً لإضافة بند)`, arr.join('\n'));
    if (value === null) return;
    const items = value.split(/[\n,،]/).map(s => s.trim()).filter(Boolean);
    window.saveOverride(path, items);
    rerender();
    showSavedToast();
    return;
  }

  const value = prompt(`✏️ تعديل: ${label}\n\nالقيمة الحالية:`, current != null ? String(current) : '');
  if (value === null) return;

  let finalValue = value;
  if (value === 'true' || value === 'false') finalValue = value === 'true';
  else if (/^\d+$/.test(value)) finalValue = Number(value);
  window.saveOverride(path, finalValue);

  rerender();
  showSavedToast();
}

/* إشعار حفظ صغير أسفل الشاشة */
function showSavedToast() {
  let toast = document.getElementById('smileToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'smileToast';
    document.body.appendChild(toast);
  }
  toast.textContent = '✅ تم حفظ التعديل';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1400);
}

/* ===== رفع الصور ===== */
const fileInput = document.getElementById('adminFileInput');
let pendingImagePath = null;

function openImageUploader(path) {
  pendingImagePath = path;
  fileInput.value = '';
  fileInput.click();
}

fileInput.addEventListener('change', () => {
  const file = fileInput.files && fileInput.files[0];
  if (!file || !pendingImagePath) return;
  if (!file.type.startsWith('image/')) {
    alert('❌ الرجاء اختيار ملف صورة صحيح.');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    window.saveOverride(pendingImagePath, reader.result);
    pendingImagePath = null;
    rerender();
  };
  reader.readAsDataURL(file);
});

/* ===== إعادة العرض بعد التعديل ===== */
function rerender() {
  const data = window.getSiteData();
  if (!data) return;
  if (typeof renderSite === 'function') {
    renderSite(data);
    document.dispatchEvent(new CustomEvent('siteRendered'));
  }
  if (adminActive) attachEditButtons();
}

/* ===== تحميل content.json بالتعديلات ===== */
function downloadUpdatedJson() {
  const data = window.getSiteData();
  if (!data) return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'content.json';
  a.click();
  URL.revokeObjectURL(a.href);
  alert('✅ تم تحميل content.json بالتعديلات.\nارفعها على استضافتك حتى تظهر للزوار كلهم.');
}

/* ===== التراجع عن كل التعديلات ===== */
function resetOverrides() {
  if (!confirm('هل تريد التراجع عن كل التعديلات المحفوظة في هذا المتصفح؟')) return;
  localStorage.removeItem(OVERRIDES_KEY);
  location.reload();
}

/* ===== ربط الأزرار ===== */
document.getElementById('adminEntryBtn').addEventListener('click', enterAdminMode);
document.getElementById('adminExitBtn').addEventListener('click', exitAdminMode);
document.getElementById('adminDownloadBtn').addEventListener('click', downloadUpdatedJson);
document.getElementById('adminResetBtn').addEventListener('click', resetOverrides);

/* ===== استعادة الجلسة ===== */
if (sessionStorage.getItem(ADMIN_SESSION_KEY) === '1') {
  adminActive = true;
  document.body.classList.add('admin-mode');
  document.getElementById('adminToolbar').hidden = false;
}

document.addEventListener('siteRendered', () => {
  if (adminActive) attachEditButtons();
});
