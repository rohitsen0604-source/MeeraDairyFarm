import sys

with open('src/main.ts', 'r', encoding='utf-8') as f:
    content = f.read()

target = """    // Footer navigation links
    document.querySelectorAll('.products-page-footer .about-nav-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        const target = link.getAttribute('data-target');
        if (target === 'about') {
          e.preventDefault();
          window.location.hash = '#about';
          this.navigateTo('about');
        } else if (target === 'products') {
          e.preventDefault();
          window.location.hash = '#products';
          this.navigateTo('products');
        } else if (target === 'home') {
          e.preventDefault();
          window.location.hash = '#home';
          this.navigateTo('home');
        } else if (target) {
          e.preventDefault();
          window.location.hash = '#' + target;
          this.navigateTo('home', target);
        }
      });
    });
  }
}"""

replacement = """  }

  private renderOurFarmPageHTML(): string {
    return `
      <div class="farm-page-view">
        <!-- Farm Background Layer with ourfarm.png and Soft Blur Overlay -->
        <div class="farm-page-bg-wrapper">
          <img src="/image/ourfarm.png" alt="Meera Dairy Farm Pasture" class="farm-page-bg-img" />
          <div class="farm-page-bg-overlay"></div>
        </div>

        <div class="farm-page-container">
          <!-- Page Header -->
          <div class="farm-page-header">
            <div class="farm-page-pill-badge">
              <span>🌾 ACRES OF GREEN · SANCTUARY OF PURITY</span>
            </div>
            <h1 class="farm-page-title">Our Farm & Pastures</h1>
            <p class="farm-page-subtitle">
              Situated by the peaceful waters of Yashwant Sagar Dam in Indore, Meera Dairy Farm is a sanctuary where desi cows graze freely on organic pastures and dairy is crafted with Vedic purity.
            </p>

            <!-- Key Farm Metrics -->
            <div class="farm-key-stats-row">
              <div class="farm-stat-card glass-panel">
                <span class="stat-card-icon">🐄</span>
                <div class="stat-card-info">
                  <span class="stat-card-num">50+</span>
                  <span class="stat-card-lbl">Happy Desi Cows</span>
                </div>
              </div>
              <div class="farm-stat-card glass-panel">
                <span class="stat-card-icon">🌱</span>
                <div class="stat-card-info">
                  <span class="stat-card-num">100%</span>
                  <span class="stat-card-lbl">Organic Green Feed</span>
                </div>
              </div>
              <div class="farm-stat-card glass-panel">
                <span class="stat-card-icon">🏡</span>
                <div class="stat-card-info">
                  <span class="stat-card-num">10+ Yrs</span>
                  <span class="stat-card-lbl">Farming Experience</span>
                </div>
              </div>
              <div class="farm-stat-card glass-panel">
                <span class="stat-card-icon">❤️</span>
                <div class="stat-card-info">
                  <span class="stat-card-num">0%</span>
                  <span class="stat-card-lbl">Chemicals or Hormones</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 1: Why Choose Meera Dairy Farm? (6 Purity Promise Features) -->
          <section class="farm-inner-section">
            <div class="section-header-box">
              <div class="section-tag-pill">
                <span>✨ PURITY PROMISE</span>
              </div>
              <h2 class="section-main-title">
                Why Choose Meera Dairy Farm?
              </h2>
              <p class="section-main-subtitle">
                Join 1,000+ families in Indore who trust our organic principles and animal welfare standards.
              </p>
            </div>

            <div class="features-section-grid">
              <div class="glass-panel feature-card">
                <div class="feature-icon-box">🥛</div>
                <h3 class="feature-title">Fresh Milk</h3>
                <p class="feature-desc">
                  Daily fresh collection from healthy, happy cows every morning at dawn.
                </p>
              </div>

              <div class="glass-panel feature-card">
                <div class="feature-icon-box">🌾</div>
                <h3 class="feature-title">Organic Feed</h3>
                <p class="feature-desc">
                  Our cows are fed 100% organic, chemical-free natural green fodder.
                </p>
              </div>

              <div class="glass-panel feature-card">
                <div class="feature-icon-box">🐄</div>
                <h3 class="feature-title">Healthy Cows</h3>
                <p class="feature-desc">
                  Regular veterinary care and love ensure our cows are always healthy and happy.
                </p>
              </div>

              <div class="glass-panel feature-card">
                <div class="feature-icon-box">🍃</div>
                <h3 class="feature-title">No Preservatives</h3>
                <p class="feature-desc">
                  Absolutely zero preservatives, additives, or artificial ingredients added.
                </p>
              </div>

              <div class="glass-panel feature-card">
                <div class="feature-icon-box">🚜</div>
                <h3 class="feature-title">Farm Fresh</h3>
                <p class="feature-desc">
                  Direct from our farm to your home with no middlemen or delays.
                </p>
              </div>

              <div class="glass-panel feature-card">
                <div class="feature-icon-box">🚚</div>
                <h3 class="feature-title">Daily Delivery</h3>
                <p class="feature-desc">
                  Fresh dairy products delivered to your doorstep every morning by 7 AM.
                </p>
              </div>
            </div>
          </section>

          <!-- Section 2: Virtual Farm Tour (Interactive Banner + A Day at Our Farm) -->
          <section class="farm-inner-section" id="experience-farm">
            <div class="section-header-box">
              <div class="section-tag-pill">
                <span>🌿 VIRTUAL FARM TOUR</span>
              </div>
              <h2 class="section-main-title">
                Experience Our Farm
              </h2>
              <p class="section-main-subtitle">
                Step into a day in the life of Meera Dairy Farm — from sunrise milking to your doorstep
              </p>
            </div>

            <div class="glass-panel farm-experience-banner" id="farm-experience-banner">
              <img src="/image/farm_sunrise.jpg" alt="Experience Meera Dairy Farm Landscape" class="farm-banner-img" />
              <div class="farm-banner-sky-overlay" id="farm-sky-overlay"></div>
              <div class="farm-animated-sun" id="farm-animated-sun"></div>
              <div class="farm-hotspot-pulse" id="farm-hotspot" style="top: 48%; left: 22%;">
                <span class="hotspot-inner-dot"></span>
                <div class="hotspot-tooltip" id="hotspot-tooltip">🌅 4:00 AM · Dawn at the Farm</div>
              </div>
              <div class="farm-banner-badges-container">
                <span class="farm-badge-pill">✓ 100% Organic</span>
                <span class="farm-badge-pill">✓ Desi Cow Breed</span>
                <span class="farm-badge-pill">✓ Village Mirjapur</span>
              </div>
              <div class="farm-banner-live-tag">
                <span class="live-dot"></span>
                <span id="farm-live-time-text">LIVE: 4:00 AM · Dawn at the Farm</span>
              </div>
            </div>

            <div style="margin-top: 3.8rem; text-align: center; margin-bottom: 2rem;">
              <h3 style="font-size: 2.2rem; font-weight: 800; color: #5c3d2e; font-family: var(--font-heading);">
                A Day at Our Farm
              </h3>
            </div>

            <div class="farm-day-grid" id="farm-day-grid">
              <div class="glass-panel farm-day-card active" data-step="0">
                <div class="card-auto-progress-bar"><div class="progress-fill"></div></div>
                <div class="farm-card-header">
                  <div class="farm-card-icon-box">🌅</div>
                  <span class="farm-card-time">4:00 AM</span>
                </div>
                <h4 class="farm-card-title">Dawn at the Farm</h4>
                <p class="farm-card-desc">
                  Our day starts before sunrise. Cows are awakened gently in our clean, spacious barn.
                </p>
              </div>

              <div class="glass-panel farm-day-card" data-step="1">
                <div class="card-auto-progress-bar"><div class="progress-fill"></div></div>
                <div class="farm-card-header">
                  <div class="farm-card-icon-box">🐄</div>
                  <span class="farm-card-time">5:00 AM</span>
                </div>
                <h4 class="farm-card-title">Morning Milking</h4>
                <p class="farm-card-desc">
                  Desi cows are milked hygienically by hand and machine under strict quality standards.
                </p>
              </div>

              <div class="glass-panel farm-day-card" data-step="2">
                <div class="card-auto-progress-bar"><div class="progress-fill"></div></div>
                <div class="farm-card-header">
                  <div class="farm-card-icon-box">🧪</div>
                  <span class="farm-card-time">6:00 AM</span>
                </div>
                <h4 class="farm-card-title">Quality Testing</h4>
                <p class="farm-card-desc">
                  Every batch is tested for purity, fat content and microbial safety before packaging.
                </p>
              </div>

              <div class="glass-panel farm-day-card" data-step="3">
                <div class="card-auto-progress-bar"><div class="progress-fill"></div></div>
                <div class="farm-card-header">
                  <div class="farm-card-icon-box">🥛</div>
                  <span class="farm-card-time">7:00 AM</span>
                </div>
                <h4 class="farm-card-title">Fresh Packaging</h4>
                <p class="farm-card-desc">
                  Milk is bottled in chilled, sealed containers to lock in freshness and nutrition.
                </p>
              </div>

              <div class="glass-panel farm-day-card" data-step="4">
                <div class="card-auto-progress-bar"><div class="progress-fill"></div></div>
                <div class="farm-card-header">
                  <div class="farm-card-icon-box">🌾</div>
                  <span class="farm-card-time">8:00 AM</span>
                </div>
                <h4 class="farm-card-title">Agro Processing</h4>
                <p class="farm-card-desc">
                  Our organic Vermishakti fertilizer and cow dung cakes are prepared and packed.
                </p>
              </div>

              <div class="glass-panel farm-day-card" data-step="5">
                <div class="card-auto-progress-bar"><div class="progress-fill"></div></div>
                <div class="farm-card-header">
                  <div class="farm-card-icon-box">🚚</div>
                  <span class="farm-card-time">9:00 AM</span>
                </div>
                <h4 class="farm-card-title">Doorstep Delivery</h4>
                <p class="farm-card-desc">
                  Fresh products reach your home within hours of production — pure and natural.
                </p>
              </div>
            </div>
          </section>

          <!-- Section 3: Delivery Timeline -->
          <section class="farm-inner-section" id="timeline">
            <div class="section-header-box">
              <div class="section-tag-pill">
                <span>⏰ DAILY FRESHNESS TIMELINE</span>
              </div>
              <h2 class="section-main-title">
                From Our Farm to Your Doorstep
              </h2>
              <p class="section-main-subtitle">
                Every bottle of milk follows a strict, hygienic journey to reach your breakfast table every morning.
              </p>
            </div>

            <div class="timeline-process-wrapper">
              <div class="timeline-progress-line-track">
                <div class="timeline-progress-line-fill"></div>
              </div>

              <div class="timeline-section-grid-horizontal">
                <div class="timeline-step-node">
                  <div class="timeline-step-circle">1</div>
                  <div class="glass-panel timeline-card-compact">
                    <span class="timeline-time-badge">🐄 Pasture Grazing</span>
                    <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--color-text-title); margin-bottom: 0.4rem;">Happy Cows</h4>
                    <p style="font-size: 0.85rem; color: var(--color-text-muted); line-height: 1.45;">Gir & Sahiwal cows graze freely on organic pastures with natural green fodder.</p>
                  </div>
                </div>

                <div class="timeline-step-node">
                  <div class="timeline-step-circle">2</div>
                  <div class="glass-panel timeline-card-compact">
                    <span class="timeline-time-badge">🥛 5:00 AM</span>
                    <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--color-text-title); margin-bottom: 0.4rem;">Fresh Milking</h4>
                    <p style="font-size: 0.85rem; color: var(--color-text-muted); line-height: 1.45;">Hygienic morning milking by hand & touchless equipment under supervision.</p>
                  </div>
                </div>

                <div class="timeline-step-node">
                  <div class="timeline-step-circle">3</div>
                  <div class="glass-panel timeline-card-compact">
                    <span class="timeline-time-badge">⚗️ 6:00 AM</span>
                    <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--color-text-title); margin-bottom: 0.4rem;">Quality Testing</h4>
                    <p style="font-size: 0.85rem; color: var(--color-text-muted); line-height: 1.45;">Every batch tested for fat content, zero-adulteration & microbial purity.</p>
                  </div>
                </div>

                <div class="timeline-step-node">
                  <div class="timeline-step-circle">4</div>
                  <div class="glass-panel timeline-card-compact">
                    <span class="timeline-time-badge">📦 7:00 AM</span>
                    <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--color-text-title); margin-bottom: 0.4rem;">Chilled Packaging</h4>
                    <p style="font-size: 0.85rem; color: var(--color-text-muted); line-height: 1.45;">Minimal processing, packed in chilled eco-friendly containers.</p>
                  </div>
                </div>

                <div class="timeline-step-node">
                  <div class="timeline-step-circle">5</div>
                  <div class="glass-panel timeline-card-compact">
                    <span class="timeline-time-badge">🚚 7:30 AM</span>
                    <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--color-text-title); margin-bottom: 0.4rem;">Doorstep Delivery</h4>
                    <p style="font-size: 0.85rem; color: var(--color-text-muted); line-height: 1.45;">Fresh milk delivered straight to your home in Indore before 8 AM daily.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Section 4: Farm Visit Invitation Card -->
          <div class="farm-visit-invitation-card glass-panel">
            <div class="visit-card-content">
              <span class="visit-tag">📍 INDORE SANCTUARY</span>
              <h3 class="visit-title">Come Visit Our Farm in Person!</h3>
              <p class="visit-desc">
                We invite families, children, and dairy lovers to meet our cows, see our hygienic milking parlour, and experience rural tranquility at Village Mirjapur, Near Yashwant Sagar Dam Hatod, Indore.
              </p>
              <div class="visit-cta-buttons">
                <a href="https://wa.me/919752127710?text=Hello%20Meera%20Dairy%20Farm,%20I%20would%20like%20to%20plan%20a%20farm%20visit." target="_blank" class="farm-cta-btn primary">
                  💬 Schedule a Farm Visit
                </a>
                <a href="tel:+919752127710" class="farm-cta-btn secondary">
                  📞 Call +91 97521 27710
                </a>
              </div>
            </div>
            <div class="visit-card-highlight">
              <div class="visit-time-box">
                <span class="time-title">Visiting Hours:</span>
                <span class="time-text">Mon - Sat: 5:00 AM - 11:00 AM & 4:00 PM - 7:00 PM</span>
                <span class="time-note">Free guided tours for school groups and families upon appointment.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Universal Global Footer -->
        ${this.renderFooterHTML()}
      </div>
    `;
  }

  private renderFooterHTML(): string {
    return `
      <!-- GLOBAL MEERA DAIRY FARM FOOTER -->
      <footer class="global-site-footer about-page-footer site-footer">
        <div class="footer-grid-container">
          <div class="footer-brand-column">
            <div class="footer-logo-row" data-target="home">
              <img src="/image/logo.jpeg" alt="Meera Dairy Farm" class="footer-logo-img" />
              <div>
                <h3 class="footer-brand-title">Meera Dairy Farm</h3>
                <span class="footer-brand-sub">& AGRO PRODUCTS</span>
              </div>
            </div>
            <p class="footer-hindi-motto">शुद्धता, प्रकृति और विश्वास साथ चलते हैं।</p>
            <p class="footer-english-motto">Pure • Natural • Trusted since generations.</p>
            <div class="footer-social-icons">
              <a href="https://instagram.com" target="_blank" class="footer-social-btn" title="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://facebook.com" target="_blank" class="footer-social-btn" title="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" class="footer-social-btn" title="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><polygon points="10 15 15 12 10 9 10 15"/></svg>
              </a>
              <a href="https://wa.me/919752127710" target="_blank" class="footer-social-btn" title="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </a>
            </div>
          </div>

          <div class="footer-links-column">
            <h4 class="footer-heading">Quick Links</h4>
            <ul class="footer-nav-list">
              <li><a href="#home" class="footer-link-action" data-target="home">Home</a></li>
              <li><a href="#about" class="footer-link-action" data-target="about">About Us</a></li>
              <li><a href="#products" class="footer-link-action" data-target="products">Our Products</a></li>
              <li><a href="#our-farm" class="footer-link-action" data-target="our-farm">Our Farm</a></li>
              <li><a href="#gallery" class="footer-link-action" data-target="gallery">Gallery</a></li>
              <li><a href="#contact" class="footer-link-action" data-target="contact">Contact Us</a></li>
            </ul>
          </div>

          <div class="footer-links-column">
            <h4 class="footer-heading">Our Products</h4>
            <ul class="footer-nav-list">
              <li><a href="#products" class="footer-link-action" data-target="products">Shri Dugdham Cow Milk</a></li>
              <li><a href="#products" class="footer-link-action" data-target="products">Fresh Desi Paneer</a></li>
              <li><a href="#products" class="footer-link-action" data-target="products">Buttermilk (Chaach) छाछ</a></li>
              <li><a href="#products" class="footer-link-action" data-target="products">Ghritam Desi Ghee</a></li>
              <li><a href="#products" class="footer-link-action" data-target="products">Vermishakti Fertilizer</a></li>
              <li><a href="#products" class="footer-link-action" data-target="products">Cow Dung Cakes</a></li>
            </ul>
          </div>

          <div class="footer-links-column">
            <h4 class="footer-heading">Contact Farm</h4>
            <div class="footer-contact-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#65a30d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; margin-top: 3px;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>Village Mirjapur, Near Yashwant Sagar Dam Hatod, Indore, Madhya Pradesh</span>
            </div>
            <div class="footer-contact-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#65a30d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; margin-top: 3px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <a href="tel:+919752127710">+91 97521 27710</a>
            </div>
            <div class="footer-contact-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#65a30d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; margin-top: 3px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <a href="tel:+918103289628">+91 81032 89628</a>
            </div>
            <div class="footer-contact-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#65a30d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; margin-top: 3px;"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <a href="mailto:moo@meeradairyfarm.com">moo@meeradairyfarm.com</a>
            </div>
            <div class="footer-contact-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#65a30d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; margin-top: 3px;"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <a href="mailto:hello@meeradairyfarm.com">hello@meeradairyfarm.com</a>
            </div>
          </div>
        </div>

        <div class="footer-bottom-bar">
          <span>© 2026 Meera Dairy Farm & Agro Products. All rights reserved.</span>
          <span>Made with 🐄 and ❤️ in Madhya Pradesh</span>
        </div>
      </footer>
    `;
  }

  private attachGlobalFooterEventListeners(): void {
    document.querySelectorAll('.footer-link-action, .footer-logo-row, .about-nav-link').forEach((el) => {
      el.addEventListener('click', (e) => {
        const target = el.getAttribute('data-target');
        if (target === 'about') {
          e.preventDefault();
          window.location.hash = '#about';
          this.navigateTo('about');
        } else if (target === 'products') {
          e.preventDefault();
          window.location.hash = '#products';
          this.navigateTo('products');
        } else if (target === 'our-farm') {
          e.preventDefault();
          window.location.hash = '#our-farm';
          this.navigateTo('our-farm');
        } else if (target === 'home') {
          e.preventDefault();
          window.location.hash = '#home';
          this.navigateTo('home');
        } else if (target) {
          e.preventDefault();
          window.location.hash = '#' + target;
          this.navigateTo('home', target);
        }
      });
    });
  }
}"""

content_norm = content.replace('\r\n', '\n')
target_norm = target.replace('\r\n', '\n')
replacement_norm = replacement.replace('\r\n', '\n')

if target_norm in content_norm:
    new_content = content_norm.replace(target_norm, replacement_norm)
    with open('src/main.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("SUCCESS")
else:
    print("TARGET NOT FOUND")
    sys.exit(1)
