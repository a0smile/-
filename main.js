/* ============================================
   مجمع عناية الابتسامة الطبي — ملف التشغيل
   ⚠️ لا تحتاج تعديل هذا الملف أبداً
   كل تعديلاتك تكون في content.json فقط
   ============================================ */

let siteData = null;

async function loadContent() {
  try {
    const response = await fetch('content.json');
    siteData = await response.json();
    renderSite(siteData);
  } catch (error) {
    console.error('تعذر تحميل ملف المحتوى content.json', error);
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el && text) el.textContent = text;
}

function renderSite(data) {
  const { clinic, announcement, hero, stats, services, tips, features, offers, doctors, testimonials, workingHours, bookingServices, booking } = data;

  // ===== شريط الإعلانات =====
  if (announcement) {
    document.getElementById('announcementText').textContent = announcement;
    document.getElementById('announcementText2').textContent = announcement;
  } else {
    document.getElementById('announcementBar').style.display = 'none';
    document.getElementById('header').style.top = '0';
  }

  // ===== الهوية والترويسة =====
  document.title = clinic.name;
  setText('logoName', clinic.name);
  setText('logoTagline', clinic.tagline);
  setText('footerName', clinic.name);
  setText('footerTagline', clinic.tagline);
  setText('footerNameBottom', clinic.name);

  // ===== قسم البطل =====
  setText('heroBadge', hero.badge);
  const heroTitle = document.getElementById('heroTitle');
  heroTitle.innerHTML = `${hero.title} <span class="highlight">${hero.titleHighlight}</span>`;
  setText('heroSubtitle', hero.subtitle);
  setText('heroBtnMain', hero.buttonMain);
  setText('heroBtnSecondary', hero.buttonSecondary);

  // ===== صورة الـ Hero =====
  if (hero.image) {
    const img = document.getElementById('heroImage');
    img.src = hero.image;
    img.style.display = 'block';
    document.getElementById('heroImagePlaceholder').style.display = 'none';
  }

  // ===== الأرقام =====
  const statsGrid = document.getElementById('statsGrid');
  statsGrid.innerHTML = stats.map(s => `
    <div class="stat-item reveal">
      <div class="stat-number">${s.number}</div>
      <div class="stat-label">${s.label}</div>
    </div>
  `).join('');

  // ===== الخدمات والأسعار =====
  const servicesGrid = document.getElementById('servicesGrid');
  servicesGrid.innerHTML = (data.serviceCategories || []).map(cat => `
    <div class="price-category reveal">
      <h3 class="price-cat-title">${cat.icon} ${cat.title}</h3>
      <ul class="price-items">
        ${cat.items.map(item => {
          const waMsg = encodeURIComponent(`مرحباً، أرغب بالاستفسار عن خدمة: ${item.name}`);
          return `<li class="price-item">
            <span class="price-item-name">${item.name}</span>
            <span class="price-item-prices">
              ${item.oldPrice ? `<span class="price-old">${item.oldPrice} ريال</span>` : ''}
              <span class="price-now">${item.price} ريال</span>
            </span>
            <a class="price-wa-btn" href="https://wa.me/${clinic.whatsapp}?text=${waMsg}" target="_blank" rel="noopener">💬 اطلبها</a>
          </li>`;
        }).join('')}
      </ul>
    </div>
  `).join('');

  // ===== نصائح يومية =====
  const dailyTipsList = document.getElementById('dailyTipsList');
  dailyTipsList.innerHTML = (data.dailyTips || []).map((tip, i) => `
    <li><span class="daily-tip-num">${i + 1}</span>${tip}</li>
  `).join('');

  // ===== نصائح =====
  const tipsGrid = document.getElementById('tipsGrid');
  tipsGrid.innerHTML = tips.map(t => `
    <div class="tip-card reveal">
      <div class="tip-icon">${t.icon}</div>
      <h3>${t.title}</h3>
      <p>${t.description}</p>
    </div>
  `).join('');

  // ===== لماذا نحن =====
  const featuresGrid = document.getElementById('featuresGrid');
  featuresGrid.innerHTML = features.map(f => `
    <div class="feature-card reveal">
      <div class="feature-icon">${f.icon}</div>
      <div>
        <h3>${f.title}</h3>
        <p>${f.description}</p>
      </div>
    </div>
  `).join('');

  // ===== العروض =====
  const offersSection = document.getElementById('offers');
  if (offers.enabled && offers.items.length > 0) {
    setText('offersTitle', offers.title);
    setText('offersSubtitle', offers.subtitle);
    const offersGrid = document.getElementById('offersGrid');
    offersGrid.innerHTML = offers.items.map(o => `
      <div class="offer-card reveal">
        <span class="offer-note">${o.note}</span>
        <div class="offer-icon">${o.icon}</div>
        <h3>${o.title}</h3>
        <div class="offer-old-price">${o.oldPrice} ريال</div>
        <div class="offer-price">${o.price}</div>
        <a href="#booking" class="btn btn-primary btn-sm">احجز العرض</a>
      </div>
    `).join('');
  } else {
    offersSection.style.display = 'none';
  }

  // ===== الأطباء =====
  const doctorsGrid = document.getElementById('doctorsGrid');
  doctorsGrid.innerHTML = doctors.map(d => `
    <div class="doctor-card reveal">
      <div class="doctor-avatar">${d.initial}</div>
      <h3>${d.name}</h3>
      <p class="doctor-specialty">${d.specialty}</p>
      <span class="doctor-exp">${d.experience}</span>
    </div>
  `).join('');

  // ===== آراء المراجعين =====
  const testimonialsGrid = document.getElementById('testimonialsGrid');
  testimonialsGrid.innerHTML = testimonials.map(t => `
    <div class="testimonial-card reveal">
      <div class="testimonial-stars">${'★'.repeat(t.rating)}</div>
      <p class="testimonial-text">"${t.text}"</p>
      <p class="testimonial-name">${t.name}</p>
    </div>
  `).join('');

  // ===== الحجز =====
  setText('bookingTitle', booking.title);
  setText('bookingSubtitle', booking.subtitle);
  setText('submitBtn', booking.button);
  const serviceSelect = document.getElementById('service');
  serviceSelect.innerHTML = '<option value="">اختر الخدمة</option>' +
    bookingServices.map(s => `<option value="${s}">${s}</option>`).join('');

  // ===== التواصل =====
  setText('contactAddress', clinic.address);
  const phoneEl = document.getElementById('contactPhone');
  phoneEl.innerHTML = `جوال: <a href="tel:${clinic.phone}">${clinic.phone}</a>`;
  const emailEl = document.getElementById('contactEmail');
  emailEl.innerHTML = `بريد: <a href="mailto:${clinic.email}">${clinic.email}</a>`;
  document.getElementById('mapBtn').href = clinic.mapUrl;
  setText('footerAddress', clinic.address);
  const footerPhoneEl = document.getElementById('footerPhone');
  footerPhoneEl.innerHTML = `جوال: <a href="tel:${clinic.phone}">${clinic.phone}</a>`;
  const footerEmailEl = document.getElementById('footerEmail');
  footerEmailEl.innerHTML = `بريد: <a href="mailto:${clinic.email}">${clinic.email}</a>`;

  // ===== أوقات الدوام =====
  const hoursList = document.getElementById('hoursList');
  hoursList.innerHTML = workingHours.map(h => `
    <li>
      <span>${h.days}</span>
      <span class="${h.open ? 'open' : 'closed'}">${h.time}</span>
    </li>
  `).join('');

  // ===== روابط التواصل الاجتماعي =====
  const socialLinks = document.getElementById('socialLinks');
  const socials = [
    { url: clinic.instagram, icon: '📸', name: 'انستقرام' },
    { url: clinic.snapchat, icon: '👻', name: 'سناب شات' },
    { url: clinic.tiktok, icon: '🎵', name: 'تيك توك' },
    { url: clinic.twitter, icon: '🐦', name: 'تويتر' }
  ];
  socialLinks.innerHTML = socials
    .filter(s => s.url)
    .map(s => `<a href="${s.url}" target="_blank" aria-label="${s.name}" title="${s.name}">${s.icon}</a>`)
    .join('');

  // ===== زر الواتساب العائم =====
  const waMessage = encodeURIComponent('مرحباً، أرغب بحجز موعد في ' + clinic.name);
  document.getElementById('whatsappFloat').href =
    `https://wa.me/${clinic.whatsapp}?text=${waMessage}`;

  // ===== السنة الحالية =====
  document.getElementById('currentYear').textContent = new Date().getFullYear();

  initScrollReveal();
}

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

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

loadContent();
