/* ============================================
   مجمع عناية الابتسامة الطبي — ملف التشغيل
   لا تحتاج تعديل هذا الملف — كل المحتوى في content.json
   وضع المالك (أزرار التعديل) في ملف admin.js
   ============================================ */

let siteData = null;

/* ===== مسارات قابلة للتعديل تُقرأ من localStorage (وضع المالك) ===== */
const OVERRIDES_KEY = 'smile_overrides';

function getOverrides() {
  try { return JSON.parse(localStorage.getItem(OVERRIDES_KEY)) || {}; }
  catch { return {}; }
}

function getDeep(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}

function setDeep(obj, path, value) {
  const keys = path.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (cur[keys[i]] == null) cur[keys[i]] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
}

function applyOverrides(data) {
  const overrides = getOverrides();
  Object.entries(overrides).forEach(([path, value]) => setDeep(data, path, value));
  return data;
}
window.applyOverrides = applyOverrides;

async function loadContent() {
  try {
    const response = await fetch('content.json');
    let data = await response.json();
    siteData = applyOverrides(data);
    renderSite(siteData);
    // إشعار وضع المالك بأن العرض اكتمل
    document.dispatchEvent(new CustomEvent('siteRendered'));
  } catch (error) {
    console.error('تعذر تحميل ملف المحتوى content.json', error);
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el && text != null && text !== '') el.textContent = text;
}

/* وسم عناصر قابلة للتعديل (تُستخدم بأزرار "تعديل" في وضع المالك) */
function editAttr(path) {
  return ` data-edit="${path}" data-edit-type="text"`;
}

/* كل قسم يُعرض داخل try/catch حتى لا يتوقف بقية الموقع عند أي خلل */
function safeRender(name, fn) {
  try { fn(); }
  catch (e) { console.error('خطأ أثناء عرض قسم: ' + name, e); }
}

function renderSite(data) {
  const { clinic, hero, offers, booking } = data;
  const testimonials = data.testimonials || data.reviews || [];
  const workingHours = data.workingHours || [];
  const bookingServices = data.bookingServices || [];

  document.title = clinic.name || document.title;

  safeRender('announcement', () => {
    if (data.announcement) {
      const bar = document.getElementById('announcementBar');
      bar.style.display = '';
      document.getElementById('announcementText').textContent = data.announcement;
      document.getElementById('announcementText2').textContent = data.announcement;
      bar.setAttribute('data-edit', 'announcement');
      bar.setAttribute('data-edit-type', 'text');
      bar.setAttribute('data-edit-label', 'نص الشريط المتحرك');
    } else {
      document.getElementById('announcementBar').style.display = 'none';
      document.getElementById('header').style.top = '0';
    }
  });

  safeRender('clinicIdentity', () => {
    setText('logoName', clinic.name);
    setText('logoTagline', clinic.tagline);
    setText('footerName', clinic.name);
    setText('footerTagline', clinic.tagline);
    setText('footerNameBottom', clinic.name);
    document.getElementById('logoName').setAttribute('data-edit', 'clinic.name');
    document.getElementById('logoTagline').setAttribute('data-edit', 'clinic.tagline');
  });

  safeRender('hero', () => {
    setText('heroBadge', hero.badge);
    const heroTitle = document.getElementById('heroTitle');
    heroTitle.innerHTML = `${hero.title || ''} <span class="highlight">${hero.titleHighlight || ''}</span>`;
    setText('heroSubtitle', hero.subtitle);
    setText('heroBtnMain', hero.buttonMain);
    setText('heroBtnSecondary', hero.buttonSecondary);
    ['heroBadge', 'heroSubtitle', 'heroBtnMain', 'heroBtnSecondary'].forEach((id, i) => {
      const paths = ['hero.badge', 'hero.subtitle', 'hero.buttonMain', 'hero.buttonSecondary'];
      document.getElementById(id).setAttribute('data-edit', paths[i]);
      document.getElementById(id).setAttribute('data-edit-type', 'text');
    });
    heroTitle.setAttribute('data-edit', 'hero.title');
    heroTitle.setAttribute('data-edit-type', 'text');
  });

  safeRender('heroImages', () => {
    ['image', 'image2'].forEach((key, idx) => {
      const num = idx + 1;
      const img = document.getElementById('heroImage' + num);
      const placeholder = document.getElementById('heroImagePlaceholder' + (idx === 0 ? '' : '2'));
      if (!img || !placeholder) return;
      img.setAttribute('data-edit', 'hero.' + key);
      img.setAttribute('data-edit-type', 'image');
      placeholder.setAttribute('data-edit', 'hero.' + key);
      placeholder.setAttribute('data-edit-type', 'image');
      if (hero[key]) {
        img.src = hero[key];
        img.style.display = 'block';
        placeholder.style.display = 'none';
      }
    });
  });

  safeRender('stats', () => {
    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = (data.stats || []).map((s, i) => `
      <div class="stat-item reveal">
        <div class="stat-number"${editAttr(`stats.${i}.number`)}>${s.number}</div>
        <div class="stat-label"${editAttr(`stats.${i}.label`)}>${s.label}</div>
      </div>
    `).join('');
  });

  safeRender('services', () => {
    const servicesGrid = document.getElementById('servicesGrid');
    servicesGrid.innerHTML = (data.serviceCategories || []).map((cat, ci) => `
      <div class="price-category reveal">
        <h3 class="price-cat-title">${cat.icon} ${cat.title}</h3>
        <ul class="price-items">
          ${cat.items.map((item, ii) => {
            const waMsg = encodeURIComponent(`مرحباً، أرغب بالاستفسار عن خدمة: ${item.name}`);
            const base = `serviceCategories.${ci}.items.${ii}`;
            return `<li class="price-item">
              <span class="price-item-name"${editAttr(base + '.name')}>${item.name}</span>
              <span class="price-item-prices">
                ${item.oldPrice ? `<span class="price-old">${item.oldPrice} ريال</span>` : ''}
                <span class="price-now"${editAttr(base + '.price')}>${item.price} ريال</span>
              </span>
              <a class="price-wa-btn" href="https://wa.me/${clinic.whatsapp}?text=${waMsg}" target="_blank" rel="noopener">💬 اطلبها</a>
            </li>`;
          }).join('')}
        </ul>
      </div>
    `).join('');
  });

  safeRender('dailyTips', () => {
    const dailyTipsList = document.getElementById('dailyTipsList');
    dailyTipsList.innerHTML = (data.dailyTips || []).map((tip, i) => `
      <li${editAttr('dailyTips.' + i)}><span class="daily-tip-num">${i + 1}</span>${tip}</li>
    `).join('');
  });

  safeRender('tips', () => {
    const tipsGrid = document.getElementById('tipsGrid');
    tipsGrid.innerHTML = (data.tips || []).map((t, i) => `
      <div class="tip-card reveal">
        <div class="tip-icon">${t.icon}</div>
        <h3${editAttr(`tips.${i}.title`)}>${t.title}</h3>
        <p${editAttr(`tips.${i}.description`)}>${t.description}</p>
      </div>
    `).join('');
  });

  safeRender('features', () => {
    const featuresGrid = document.getElementById('featuresGrid');
    featuresGrid.innerHTML = (data.features || []).map((f, i) => `
      <div class="feature-card reveal">
        <div class="feature-icon">${f.icon}</div>
        <div>
          <h3${editAttr(`features.${i}.title`)}>${f.title}</h3>
          <p${editAttr(`features.${i}.description`)}>${f.description}</p>
        </div>
      </div>
    `).join('');
  });

  safeRender('offers', () => {
    const offersSection = document.getElementById('offers');
    if (offers && offers.enabled && (offers.items || []).length > 0) {
      setText('offersTitle', offers.title);
      setText('offersSubtitle', offers.subtitle);
      const offersGrid = document.getElementById('offersGrid');
      offersGrid.innerHTML = offers.items.map((o, i) => `
        <div class="offer-card reveal">
          <span class="offer-note"${editAttr(`offers.items.${i}.note`)}>${o.note || ''}</span>
          <div class="offer-icon">${o.icon}</div>
          <h3${editAttr(`offers.items.${i}.title`)}>${o.title}</h3>
          <div class="offer-old-price"${editAttr(`offers.items.${i}.oldPrice`)}>${o.oldPrice} ريال</div>
          <div class="offer-price"${editAttr(`offers.items.${i}.price`)}>${o.price}</div>
          <a href="#booking" class="btn btn-primary btn-sm">احجز العرض</a>
        </div>
      `).join('');
    } else if (offersSection) {
      offersSection.style.display = 'none';
    }
  });

  safeRender('doctors', () => {
    const doctorsGrid = document.getElementById('doctorsGrid');
    doctorsGrid.innerHTML = (data.doctors || []).map((d, i) => `
      <div class="doctor-card reveal">
        <div class="doctor-avatar">${d.initial}</div>
        <h3${editAttr(`doctors.${i}.name`)}>${d.name}</h3>
        <p class="doctor-specialty"${editAttr(`doctors.${i}.specialty`)}>${d.specialty}</p>
        <span class="doctor-exp"${editAttr(`doctors.${i}.experience`)}>${d.experience}</span>
      </div>
    `).join('');
  });

  safeRender('testimonials', () => {
    const testimonialsGrid = document.getElementById('testimonialsGrid');
    testimonialsGrid.innerHTML = (testimonials || []).map((t, i) => `
      <div class="testimonial-card reveal">
        <div class="testimonial-stars">${'★'.repeat(t.rating || 5)}</div>
        <p class="testimonial-text"${editAttr(`reviews.${i}.text`)}>"${t.text}"</p>
        <p class="testimonial-name"${editAttr(`reviews.${i}.name`)}>${t.name}</p>
      </div>
    `).join('');
  });

  safeRender('booking', () => {
    setText('bookingTitle', booking ? booking.title : '');
    setText('bookingSubtitle', booking ? booking.subtitle : '');
    setText('submitBtn', booking ? booking.button : '');
    const serviceSelect = document.getElementById('service');
    serviceSelect.innerHTML = '<option value="">اختر الخدمة</option>' +
      bookingServices.map(s => `<option value="${s}">${s}</option>`).join('');
  });

  safeRender('contact', () => {
    setText('contactAddress', clinic.address);
    document.getElementById('contactAddress').setAttribute('data-edit', 'clinic.address');
    const phoneEl = document.getElementById('contactPhone');
    phoneEl.innerHTML = `جوال: <a href="tel:${clinic.phone}">${clinic.phone}</a>`;
    const emailEl = document.getElementById('contactEmail');
    emailEl.innerHTML = `بريد: <a href="mailto:${clinic.email}">${clinic.email}</a>`;
    const mapBtn = document.getElementById('mapBtn');
    mapBtn.href = clinic.mapUrl || ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(clinic.address || ''));
    setText('footerAddress', clinic.address);
    const footerPhoneEl = document.getElementById('footerPhone');
    footerPhoneEl.innerHTML = clinic.phone ? `جوال: <a href="tel:${clinic.phone}">${clinic.phone}</a>` : '';
    const footerEmailEl = document.getElementById('footerEmail');
    footerEmailEl.innerHTML = clinic.email ? `بريد: <a href="mailto:${clinic.email}">${clinic.email}</a>` : '';
  });

  safeRender('workingHours', () => {
    const hoursList = document.getElementById('hoursList');
    hoursList.innerHTML = workingHours.map((h, i) => `
      <li>
        <span${editAttr(`workingHours.${i}.days`)}>${h.days}</span>
        <span class="${h.open ? 'open' : 'closed'}"${editAttr(`workingHours.${i}.time`)}>${h.time}</span>
      </li>
    `).join('');
  });

  safeRender('social', () => {
    const socialLinks = document.getElementById('socialLinks');
    const socials = [
      { url: clinic.instagram, icon: '📸', name: 'انستقرام', path: 'clinic.instagram' },
      { url: clinic.snapchat, icon: '👻', name: 'سناب شات', path: 'clinic.snapchat' },
      { url: clinic.tiktok, icon: '🎵', name: 'تيك توك', path: 'clinic.tiktok' },
      { url: clinic.twitter, icon: '🐦', name: 'تويتر', path: 'clinic.twitter' }
    ];
    socialLinks.innerHTML = socials
      .filter(s => s.url)
      .map(s => `<a href="${s.url}" target="_blank" aria-label="${s.name}" title="${s.name}"${editAttr(s.path)}>${s.icon}</a>`)
      .join('');
  });

  safeRender('whatsapp', () => {
    const waMessage = encodeURIComponent('مرحباً، أرغب بحجز موعد في ' + clinic.name);
    document.getElementById('whatsappFloat').href =
      `https://wa.me/${clinic.whatsapp}?text=${waMessage}`;
  });

  safeRender('year', () => {
    document.getElementById('currentYear').textContent = new Date().getFullYear();
  });

  initScrollReveal();
}

// ===== وضع المالك: حفظ تعديل نص =====
window.saveOverride = function (path, value) {
  const overrides = getOverrides();
  overrides[path] = value;
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  if (siteData) setDeep(siteData, path, value);
};

window.getSiteData = () => siteData;
window.getOverrideValue = (path) => getDeep(siteData || {}, path);

// ===== نموذج الحجز → واتساب =====
document.getElementById('bookingForm').addEventListener('submit', function (e) {
  e.preventDefault();
  if (!siteData) return;

  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const service = document.getElementById('service').value;
  const date = document.getElementById('date').value;

  let message = `🦷 طلب حجز موعد جديد\n\n`;
  message += `👤 الاسم: ${name}\n`;
  message += `📱 الجوال: ${phone}\n`;
  message += `🩺 الخدمة: ${service}\n`;
  if (date) message += `📅 اليوم المفضل: ${date}\n`;

  const waUrl = `https://wa.me/${siteData.clinic.whatsapp}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
});

// ===== نموذج إضافة تعليق → واتساب =====
document.getElementById('reviewForm').addEventListener('submit', function (e) {
  e.preventDefault();
  if (!siteData) return;

  const name = document.getElementById('reviewName').value.trim();
  const text = document.getElementById('reviewText').value.trim();

  let message = `⭐ تعليق جديد من موقع المجمع\n\n`;
  message += `👤 الاسم: ${name}\n`;
  message += `💬 التعليق: ${text}\n`;

  const waUrl = `https://wa.me/${siteData.clinic.whatsapp}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');

  document.getElementById('reviewName').value = '';
  document.getElementById('reviewText').value = '';
  alert('شكراً لك! تم إرسال تعليقك، وسيظهر بعد المراجعة.');
});

// ===== قائمة الجوال =====
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ===== ظل الترويسة عند التمرير =====
window.addEventListener('scroll', () => {
  document.getElementById('header').classList.toggle('scrolled', window.scrollY > 30);
});

// ===== ظهور العناصر عند التمرير =====
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
}

loadContent();