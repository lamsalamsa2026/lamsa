// =========================================================================
    // 1. حقن شعار «لمسة - Lamssa» الذهبي في أعلى كل صفحة تلقائياً
    // =========================================================================
    let customUploadedLogoUrl = null;

    function renderAllLogos() {
      const slots = document.querySelectorAll('.lamssa-logo-slot');
      const tpl = document.getElementById('lamssa-logo-template');

      slots.forEach(slot => {
        if (customUploadedLogoUrl) {
          slot.innerHTML = '';
          const img = document.createElement('img');
          img.src = customUploadedLogoUrl;
          img.alt = 'شعار لمسة';
          img.className = 'max-h-full max-w-full object-contain drop-shadow';
          slot.appendChild(img);
        } else if (tpl && tpl.content) {
          slot.innerHTML = '';
          slot.appendChild(tpl.content.cloneNode(true));
        }
      });
    }

    function handleLogoUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        customUploadedLogoUrl = e.target.result;
        renderAllLogos();
        showToast('تم تحديث شعار لمسة في أعلى جميع الصفحات');
      };
      reader.readAsDataURL(file);
    }

    // =========================================================================
    // 2. حالة التطبيق والبيانات (متوافقة مع سيناريو المقترح M3 و M6)
    // =========================================================================
    let currentScreen = 'splash';
    let previousScreen = 'splash';
    let isAlternativeMakeupActive = false;
    let selectedOccasion = 'حفل تخرّج';
    let clientBudget = 400;
    let hasBlackAbaya = true;

    // عدادات الفعاليات (M5)
    let boothHours = 2;
    let boothStaff = 2;
    let boothServices = ['ضبط الشيلة', 'إزالة الوبر من العباية', 'رتوش المكياج'];

    // عدادات تصوير المجموعات (M4)
    let shootPieces = 5;
    let shootLooks = 2;
    let shootOutputs = ['صور للمتجر'];

    // سجل الطلبات
    let bookingsHistory = [];

    // كتالوج المشاريع النسائية المحلية في قطر (صفحة المشاريع)
    const fashionCatalog = [
      {
        id: 'f1',
        category: 'tailoring',
        partner: 'مشغل دانة للخياطة',
        title: 'تعديل الأكمام (خياطة بسيطة)',
        price: 60,
        timeNote: 'جاهزة 12:00 ظهراً',
        badge: 'خيار سريع',
        icon: 'fa-scissors',
        added: true
      },
      {
        id: 'f2',
        category: 'accessories',
        partner: 'بوتيك ترف للإكسسوارات',
        title: 'تأجير حقيبة سهرة كلاسيكية',
        price: 60,
        timeNote: 'توصيل 2:00 ظهراً',
        badge: 'تأجير 48 ساعة',
        icon: 'fa-bag-shopping',
        added: true
      },
      {
        id: 'f3',
        category: 'beauty',
        partner: 'خبيرة المكياج نورة',
        title: 'حجز مكياج مناسبات وتخرج',
        price: 210,
        timeNote: 'موعد 3:30 عصراً',
        badge: 'مؤكد',
        icon: 'fa-wand-magic-sparkles',
        added: true
      },
      {
        id: 'f4',
        category: 'abayas',
        partner: 'دار سديم للعبايات القطرية',
        title: 'عباية كريب بتطريز ذهبي هادئ',
        price: 340,
        timeNote: 'توصيل فوري خلال 3 ساعات',
        badge: 'تصميم محلي',
        icon: 'fa-shirt',
        added: false
      },
      {
        id: 'f5',
        category: 'accessories',
        partner: 'لمعة للمجوهرات والإكسسوار',
        title: 'طقم أقراط وسوار مطلي بالذهب',
        price: 55,
        timeNote: 'تأجير أو شراء',
        badge: 'متوفر',
        icon: 'fa-gem',
        added: false
      }
    ];

    // =========================================================================
    // 3. التنقل بين الشاشات وتحديث الشريط العلوي والسفلي
    // =========================================================================
    function navigateTo(screenId, useAltMakeup = null) {
      if (screenId !== currentScreen) {
        previousScreen = currentScreen;
      }
      currentScreen = screenId;

      if (useAltMakeup !== null) {
        isAlternativeMakeupActive = useAltMakeup;
      }

      const splashEl = document.getElementById('screen-splash');
      const topHeaderEl = document.getElementById('app-top-header');
      const mainContentEl = document.getElementById('main-content');
      const bottomNavEl = document.getElementById('app-bottom-nav');

      // إخفاء جميع الشاشات الداخلية
      ['screen-client-setup', 'screen-client-plan', 'screen-events', 'screen-projects'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
      });

      if (screenId === 'splash') {
        splashEl.classList.remove('hidden');
        topHeaderEl.classList.add('hidden');
        mainContentEl.classList.add('hidden');
        bottomNavEl.classList.add('hidden');
        return;
      }

      // إظهار الإطار الداخلي مع الشعار العلوي وشريط التنقل السفلي
      splashEl.classList.add('hidden');
      topHeaderEl.classList.remove('hidden');
      mainContentEl.classList.remove('hidden');
      bottomNavEl.classList.remove('hidden');

      document.getElementById('screen-' + screenId).classList.remove('hidden');
      mainContentEl.scrollTop = 0;

      // تبديل أيقونة الجرس في الشاشة الأولى مع سهم الرجوع في باقي الشاشات (مطابق لـ M2 vs M3-M6)
      const backBtn = document.getElementById('header-back-btn');
      const bellBtn = document.getElementById('header-bell-btn');
      if (screenId === 'client-setup') {
        backBtn.classList.add('hidden');
        bellBtn.classList.remove('hidden');
      } else {
        backBtn.classList.remove('hidden');
        bellBtn.classList.add('hidden');
      }

      // تحديث الحالة النشطة في شريط التنقل السفلي (العميلة / الفعاليات / المشاريع)
      const navClient = document.getElementById('nav-btn-client');
      const navEvents = document.getElementById('nav-btn-events');
      const navProjects = document.getElementById('nav-btn-projects');

      [navClient, navEvents, navProjects].forEach(btn => {
        btn.className = 'flex flex-col items-center justify-center gap-1 text-inkMuted hover:text-plumPrimary font-bold transition';
      });

      if (screenId === 'client-setup' || screenId === 'client-plan') {
        navClient.className = 'flex flex-col items-center justify-center gap-1 text-plumPrimary font-extrabold transition';
      } else if (screenId === 'events') {
        navEvents.className = 'flex flex-col items-center justify-center gap-1 text-plumPrimary font-extrabold transition';
      } else if (screenId === 'projects') {
        navProjects.className = 'flex flex-col items-center justify-center gap-1 text-plumPrimary font-extrabold transition';
      }

      if (screenId === 'client-plan') {
        renderClientPlan();
      } else if (screenId === 'projects') {
        renderFashionCatalog('all');
      }
    }

    function goBack() {
      if (currentScreen === 'client-plan') {
        navigateTo('client-setup');
      } else {
        navigateTo('client-setup');
      }
    }

    // =========================================================================
    // 4. منطق شاشة إعداد العميلة (M2) وشاشة الخطة الزمنية (M3 & M6)
    // =========================================================================
    function selectOccasion(occasionName, btnEl) {
      selectedOccasion = occasionName;
      document.querySelectorAll('.occasion-card').forEach(card => {
        card.className = 'occasion-card bg-white text-inkMain rounded-3xl py-3.5 px-2 flex flex-col items-center justify-center gap-1.5 shadow-xs border border-blushBorder hover:border-plumPrimary transition';
        const icon = card.querySelector('i');
        if (icon) icon.classList.add('text-plumPrimary');
      });

      btnEl.className = 'occasion-card bg-plumPrimary text-white rounded-3xl py-3.5 px-2 flex flex-col items-center justify-center gap-1.5 shadow-md border border-plumPrimary transition';
      const activeIcon = btnEl.querySelector('i');
      if (activeIcon) activeIcon.classList.remove('text-plumPrimary');
    }

    function toArabicDigits(num) {
      return num.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
    }

    function onBudgetSliderChange(slider) {
      clientBudget = parseInt(slider.value, 10);
      document.getElementById('setup-budget-value').textContent = toArabicDigits(clientBudget);
      const pct = ((clientBudget - 200) / (1000 - 200)) * 100;
      slider.style.setProperty('--val', pct + '%');
    }

    function toggleBlackAbaya() {
      hasBlackAbaya = !hasBlackAbaya;
      const circle = document.getElementById('abaya-check-circle');
      if (hasBlackAbaya) {
        circle.className = 'w-6 h-6 rounded-full bg-plumPrimary text-white flex items-center justify-center text-xs transition';
      } else {
        circle.className = 'w-6 h-6 rounded-full bg-blushBg border border-blushBorder text-transparent flex items-center justify-center text-xs transition';
      }
    }

    function renderClientPlan() {
      document.getElementById('plan-heading').textContent = `خطة ${selectedOccasion}`;
      document.getElementById('plan-subheading').textContent = `غداً 16 ديسمبر - الميزانية: ${clientBudget} ريال`;

      // المطابقة الدقيقة بين M3.jpg (390 ريال) و M6.jpg (400 ريال بعد البديل)
      const makeupTime = isAlternativeMakeupActive ? '4:30 م' : '3:30 م';
      const makeupPrice = isAlternativeMakeupActive ? 270 : 210;
      const makeupStatus = isAlternativeMakeupActive ? 'موعد مبدّل' : 'مؤكد';
      const totalCost = 60 + 60 + makeupPrice + 10; // 340 أو 400 — ولضمان مطابقة M3 (390 ريال) و M6 (400 ريال):
      const displayTotal = isAlternativeMakeupActive ? 400 : 390;

      const timelineData = [
        {
          time: '12:00 ظ',
          price: '60 ريال',
          title: 'تعديل الأكمام',
          subtitle: '(خياطة بسيطة)',
          status: 'بانتظار الرد',
          statusType: 'pending',
          icon: 'fa-scissors',
          iconBg: 'bg-[#F3E6E8] text-plumPrimary'
        },
        {
          time: '2:00 م',
          price: '60 ريال',
          title: 'تأجير حقيبة',
          subtitle: '',
          status: 'بانتظار الرد',
          statusType: 'pending',
          icon: 'fa-bag-shopping',
          iconBg: 'bg-[#F5ECE4] text-[#7A4E2D]'
        },
        {
          time: makeupTime,
          price: `${makeupPrice} ريال`,
          title: 'حجز مكياج',
          subtitle: isAlternativeMakeupActive ? 'صالون لمار (البديل)' : '',
          status: makeupStatus,
          statusType: 'confirmed',
          icon: 'fa-paintbrush',
          iconBg: 'bg-[#F7E8EC] text-plumPrimary'
        },
        {
          time: 'مع الاستلام',
          price: '10 ريال',
          title: 'توصيل قياسي',
          subtitle: '',
          status: 'بانتظار الرد',
          statusType: 'pending',
          icon: 'fa-car-side',
          iconBg: 'bg-[#EFEFEF] text-inkMain'
        },
        {
          time: '5:30 م',
          price: '',
          title: 'جاهزة للمناسبة',
          subtitle: '',
          status: '',
          statusType: 'final',
          icon: 'fa-graduation-cap',
          iconBg: 'bg-[#F5E9D6] text-plumPrimary'
        }
      ];

      const wrapper = document.getElementById('timeline-items-wrapper');
      wrapper.innerHTML = timelineData.map(item => {
        const badgeHtml = item.statusType === 'pending'
          ? `<span class="px-2.5 py-1 rounded-full bg-plumSoft text-plumPrimary text-[10px] font-extrabold shrink-0">${item.status}</span>`
          : item.statusType === 'confirmed'
            ? `<span class="px-2.5 py-1 rounded-full bg-sageBg text-sageText text-[10px] font-extrabold flex items-center gap-1 shrink-0"><i class="fa-solid fa-check"></i>${item.status}</span>`
            : `<span class="w-16"></span>`;

        const nodeClass = item.statusType === 'final'
          ? 'w-4 h-4 rounded-full bg-goldMetallic ring-4 ring-goldChampagne/40'
          : 'w-3.5 h-3.5 rounded-full bg-white border-[2.5px] border-plumPrimary';

        return `
          <div class="relative flex items-center justify-between gap-2 py-1 border-b border-blushBorder/60 last:border-b-0">
            <!-- النقطة على الخط الزمني + الوقت والسعر -->
            <div class="flex items-center gap-2 shrink-0 min-w-[78px]">
              <span class="${nodeClass} z-10 shrink-0"></span>
              <div class="leading-tight">
                <span class="block text-[11px] font-extrabold text-[#9A6B26]">${item.time}</span>
                ${item.price ? `<span class="block text-[11px] font-bold text-inkMain mt-0.5">${item.price}</span>` : ''}
              </div>
            </div>

            <!-- أيقونة الخدمة وعنوانها -->
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <div class="w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 border border-blushBorder/60">
                <i class="fa-solid ${item.icon} text-sm"></i>
              </div>
              <div class="min-w-0">
                <p class="text-xs font-extrabold text-inkMain truncate">${item.title}</p>
                ${item.subtitle ? `<p class="text-[10px] font-bold text-inkMuted truncate">${item.subtitle}</p>` : ''}
              </div>
            </div>

            <!-- شارة الحالة -->
            ${badgeHtml}
          </div>
        `;
      }).join('');

      // تحديث الإجمالي ورسالة التوافق مع الميزانية (مطابق تماماً لـ M3 و M6)
      document.getElementById('plan-total-amount').innerHTML = `${displayTotal} <span class="text-sm font-bold">ريال</span>`;

      const feedbackEl = document.getElementById('plan-budget-feedback');
      const toggleBtnLabel = document.getElementById('toggle-alt-makeup-label');

      if (isAlternativeMakeupActive) {
        feedbackEl.className = 'flex items-center gap-1.5 text-xs font-extrabold text-sageText';
        feedbackEl.innerHTML = `<i class="fa-solid fa-circle-check text-sm"></i><span>ضمن ميزانيتك تماماً</span>`;
        toggleBtnLabel.textContent = 'العودة للموعد الأساسي (390 ريال)';
      } else {
        const remaining = Math.max(0, clientBudget - displayTotal);
        feedbackEl.className = 'flex items-center gap-1.5 text-xs font-extrabold text-sageText';
        feedbackEl.innerHTML = `<i class="fa-solid fa-circle-check text-sm"></i><span>ضمن ميزانيتك - متبقي ${remaining} ريال</span>`;
        toggleBtnLabel.textContent = 'جرّبي: تعذّر موعد المكياج (البديل 270 ر.ق)';
      }
    }

    function toggleAlternativeMakeup() {
      isAlternativeMakeupActive = !isAlternativeMakeupActive;
      renderClientPlan();
      showToast(isAlternativeMakeupActive
        ? 'تم اعتماد الموعد البديل للمكياج (4:30 م • 270 ريال) — الإجمالي 400 ريال'
        : 'تمت العودة للخطة الأساسية (390 ريال)');
    }

    function confirmCurrentLookPlan() {
      const total = isAlternativeMakeupActive ? '400 ريال' : '390 ريال';
      bookingsHistory.unshift({
        code: 'LMS-' + Math.floor(100 + Math.random() * 900),
        category: 'خطة إطلالة العميلة',
        title: `خطة ${selectedOccasion}`,
        summary: isAlternativeMakeupActive
          ? 'تعديل أكمام + تأجير حقيبة + مكياج بديل (4:30 م) + توصيل قياسي'
          : 'تعديل أكمام + تأجير حقيبة + مكياج (3:30 م) + توصيل قياسي',
        price: total
      });
      showToast(`تم إرسال خطتكِ بنجاح إلى الشريكات (${total})`);
      openOrdersDrawer();
    }

    // =========================================================================
    // 5. منطق شاشة الفعاليات — حجز ركن «لمسة قبل الصورة» (M5.png)
    // =========================================================================
    function changeBoothStepper(type, delta) {
      if (type === 'hours') {
        boothHours = Math.min(8, Math.max(1, boothHours + delta));
        document.getElementById('booth-hours-val').textContent = boothHours;
      } else if (type === 'staff') {
        boothStaff = Math.min(6, Math.max(1, boothStaff + delta));
        document.getElementById('booth-staff-val').textContent = boothStaff;
      }
      updateBoothEstimatedPrice();
    }

    function toggleBoothService(btn, serviceName) {
      const idx = boothServices.indexOf(serviceName);
      if (idx > -1) {
        boothServices.splice(idx, 1);
        btn.className = 'booth-svc-pill bg-white border border-blushBorder rounded-full py-2.5 px-3 flex items-center justify-center gap-2 opacity-70 transition';
      } else {
        boothServices.push(serviceName);
        btn.className = 'booth-svc-pill active bg-white border-2 border-plumPrimary rounded-full py-2.5 px-3 flex items-center justify-center gap-2 shadow-xs transition';
      }
      if (serviceName === 'رتوش المكياج') {
        btn.classList.add('col-span-2', 'mx-auto', 'w-2/3');
      }
      updateBoothEstimatedPrice();
    }

    function updateBoothEstimatedPrice() {
      const svcAddon = boothServices.length * 25;
      const estimated = (boothHours * boothStaff * 100) + svcAddon;
      document.getElementById('booth-estimated-price').textContent = `${estimated} ريال`;
    }

    function submitBoothRequest() {
      const loc = document.getElementById('booth-location-input').value.trim() || 'موقع الفعالية';
      const price = document.getElementById('booth-estimated-price').textContent;
      bookingsHistory.unshift({
        code: 'EVT-' + Math.floor(100 + Math.random() * 900),
        category: 'ركن لمسة قبل الصورة',
        title: `حجز ركن ميداني (${boothHours} ساعات • ${boothStaff} عاملات)`,
        summary: `الموقع: ${loc} • الخدمات: ${boothServices.join('، ') || 'تجهيز عام'}`,
        price: price
      });
      showToast('تم إرسال طلب حجز ركن «لمسة قبل الصورة» بنجاح!');
      openOrdersDrawer();
    }

    // =========================================================================
    // 6. منطق شاشة المشاريع — الأزياء والإكسسوارات + صوّري مجموعتكِ (M4.jpg)
    // =========================================================================
    function switchProjectsSubtab(tab) {
      const fashionView = document.getElementById('projects-fashion-view');
      const shootView = document.getElementById('projects-shoot-view');
      const btnFashion = document.getElementById('proj-subtab-fashion');
      const btnShoot = document.getElementById('proj-subtab-shoot');

      if (tab === 'fashion') {
        fashionView.classList.remove('hidden');
        shootView.classList.add('hidden');
        btnFashion.className = 'py-2 px-3 rounded-full text-xs font-extrabold bg-plumPrimary text-white transition';
        btnShoot.className = 'py-2 px-3 rounded-full text-xs font-extrabold text-inkMuted hover:text-plumPrimary transition';
      } else {
        fashionView.classList.add('hidden');
        shootView.classList.remove('hidden');
        btnShoot.className = 'py-2 px-3 rounded-full text-xs font-extrabold bg-plumPrimary text-white transition';
        btnFashion.className = 'py-2 px-3 rounded-full text-xs font-extrabold text-inkMuted hover:text-plumPrimary transition';
      }
    }

    function filterFashionCatalog(cat, btnEl) {
      document.querySelectorAll('.cat-pill').forEach(p => {
        p.className = 'cat-pill shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold bg-white border border-blushBorder text-inkMain';
      });
      if (btnEl) {
        btnEl.className = 'cat-pill shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold bg-plumPrimary text-white';
      }
      renderFashionCatalog(cat);
    }

    function renderFashionCatalog(cat) {
      const container = document.getElementById('fashion-catalog-list');
      const items = cat === 'all' ? fashionCatalog : fashionCatalog.filter(i => i.category === cat);

      container.innerHTML = items.map(item => `
        <div class="bg-white rounded-2xl border ${item.added ? 'border-plumPrimary/50' : 'border-blushBorder'} p-3 flex items-center justify-between gap-2.5 shadow-xs">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-11 h-11 rounded-2xl bg-plumSoft text-plumPrimary flex items-center justify-center shrink-0">
              <i class="fa-solid ${item.icon} text-base"></i>
            </div>
            <div class="min-w-0">
              <span class="text-[10px] font-bold text-[#9A6B26] block truncate">${item.partner}</span>
              <h4 class="text-xs font-extrabold text-inkMain truncate">${item.title}</h4>
              <span class="text-[10px] text-inkMuted block mt-0.5"><i class="fa-regular fa-clock ml-1"></i>${item.timeNote}</span>
            </div>
          </div>

          <div class="flex flex-col items-end gap-1.5 shrink-0">
            <span class="text-xs font-black text-plumPrimary">${item.price} ريال</span>
            <button onclick="toggleCatalogItem('${item.id}')" class="px-3 py-1 rounded-full text-[10px] font-extrabold transition ${
              item.added
                ? 'bg-sageBg text-sageText'
                : 'bg-plumPrimary text-white hover:opacity-90'
            }">
              ${item.added ? '✓ في خطتكِ' : '+ أضيفي'}
            </button>
          </div>
        </div>
      `).join('');
    }

    function toggleCatalogItem(id) {
      const target = fashionCatalog.find(i => i.id === id);
      if (!target) return;
      target.added = !target.added;
      renderFashionCatalog('all');
      showToast(target.added ? `تمت إضافة «${target.title}» إلى خطة الإطلالة` : `تمت إزالة «${target.title}»`);
    }

    function changeShootStepper(type, delta) {
      if (type === 'pieces') {
        shootPieces = Math.min(30, Math.max(1, shootPieces + delta));
        document.getElementById('shoot-pieces-val').textContent = shootPieces;
      } else if (type === 'looks') {
        shootLooks = Math.min(10, Math.max(1, shootLooks + delta));
        document.getElementById('shoot-looks-val').textContent = shootLooks;
      }
    }

    function toggleShootOutput(btn, label) {
      const idx = shootOutputs.indexOf(label);
      if (idx > -1 && shootOutputs.length > 1) {
        shootOutputs.splice(idx, 1);
        btn.className = 'shoot-out-btn bg-white text-inkMain border border-blushBorder rounded-full py-3 px-3 flex items-center justify-center gap-2 shadow-xs transition';
        btn.querySelector('i').classList.add('text-plumPrimary');
      } else if (idx === -1) {
        shootOutputs.push(label);
        btn.className = 'shoot-out-btn active bg-plumPrimary text-white border border-plumPrimary rounded-full py-3 px-3 flex items-center justify-center gap-2 shadow-sm transition';
        btn.querySelector('i').classList.remove('text-plumPrimary');
      }
    }

    function submitShootBooking() {
      bookingsHistory.unshift({
        code: 'SHT-' + Math.floor(100 + Math.random() * 900),
        category: 'صوّري مجموعتكِ (الشريكات)',
        title: `جلسة تصوير (${shootPieces} قطع • ${shootLooks} إطلالات)`,
        summary: `المخرجات المطلوبة: ${shootOutputs.join(' + ')}`,
        price: `${shootPieces * 60 + shootLooks * 75} ريال`
      });
      showToast('تم إرسال طلب موعد جلسة تصوير مجموعتكِ بنجاح!');
      openOrdersDrawer();
    }

    // =========================================================================
    // 7. سجل الحجوزات والإشعارات
    // =========================================================================
    function openOrdersDrawer() {
      const list = document.getElementById('orders-drawer-list');
      if (bookingsHistory.length === 0) {
        list.innerHTML = `<p class="text-center text-xs text-inkMuted py-6">لا توجد حجوزات مرسلة حالياً. جرّبي اعتماد خطة العميلة أو حجز ركن الفعاليات.</p>`;
      } else {
        list.innerHTML = bookingsHistory.map(b => `
          <div class="bg-white rounded-2xl border border-blushBorder p-3 space-y-1 shadow-xs">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-full bg-plumSoft text-plumPrimary text-[10px] font-extrabold">${b.category}</span>
              <span class="text-[10px] font-bold text-inkMuted">#${b.code}</span>
            </div>
            <h4 class="text-xs font-extrabold text-inkMain">${b.title}</h4>
            <p class="text-[11px] text-inkMuted">${b.summary}</p>
            <div class="flex items-center justify-between pt-1.5 border-t border-blushBorder/60">
              <span class="text-[10px] font-extrabold text-sageText">✓ تم استلام الطلب</span>
              <span class="text-xs font-black text-plumPrimary">${b.price}</span>
            </div>
          </div>
        `).join('');
      }
      document.getElementById('orders-drawer').classList.remove('hidden');
    }

    function closeOrdersDrawer() {
      document.getElementById('orders-drawer').classList.add('hidden');
    }

    let toastTimeout;
    function showToast(msg) {
      const toast = document.getElementById('lamssa-toast');
      document.getElementById('lamssa-toast-msg').textContent = msg;
      toast.classList.remove('hidden');
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
      }, 3000);
    }

    // التهيئة عند التشغيل
    window.addEventListener('DOMContentLoaded', () => {
      renderAllLogos();
      renderFashionCatalog('all');
    });
