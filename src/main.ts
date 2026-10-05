import './style.css';
import * as THREE from 'three';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

class DairyScene {
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private heroGroup: THREE.Group;
  private particleSystem: THREE.Points;
  private clock: THREE.Clock;
  private progress: number = 0;
  private lastScrollY: number = 0;
  private isDarkTheme: boolean = false;
  private cartCount: number = 2;

  constructor() {
    this.canvas = document.querySelector('#webgl-canvas') as HTMLCanvasElement;
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.heroGroup = new THREE.Group();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 7);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    this.setupLights();
    
    // Create 3D Hero Scene
    this.particleSystem = this.createParticles();
    this.scene.add(this.heroGroup);

    // Render UI in DOM immediately behind preloader
    this.renderUI();

    // Event Listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('scroll', this.onWindowScroll.bind(this));

    // Start 3D Render Loop
    this.animate();

    // Start Bulletproof Preloader Counter
    this.initPreloader();
  }

  private setupLights(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(5, 8, 5);
    this.scene.add(mainLight);

    const accentLight = new THREE.DirectionalLight(0x65a30d, 1.8);
    accentLight.position.set(-5, -3, -2);
    this.scene.add(accentLight);

    const organicPointLight = new THREE.PointLight(0x059669, 2.2, 10);
    organicPointLight.position.set(0, 4, 3);
    this.scene.add(organicPointLight);
  }

  private createParticles(): THREE.Points {
    const count = 350;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = (Math.random() - 0.5) * 16;
      positions[i + 2] = (Math.random() - 0.5) * 16;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x65a30d,
      size: 0.08,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
    return points;
  }

  private initPreloader(): void {
    const loaderBar = document.getElementById('loader-bar');
    const ringProgress = document.getElementById('ring-progress');
    const loaderPercent = document.getElementById('loader-percent');
    const loaderText = document.getElementById('loader-text');
    const preloader = document.getElementById('preloader');

    const statusMessages = [
      'Connecting to Meera Dairy Farm...',
      'Testing Milk Purity & A2 Quality...',
      'Loading Fresh 3D Experience...',
      'Pure Desi Cow Milk & Agro Products Ready!'
    ];

    const maxDash = 289;
    let currentProgress = 0;

    const interval = setInterval(() => {
      currentProgress += 2;
      this.progress = Math.min(currentProgress, 100);

      if (loaderBar) loaderBar.style.width = `${this.progress}%`;
      if (ringProgress) {
        const offset = maxDash - (maxDash * this.progress) / 100;
        ringProgress.style.strokeDashoffset = `${offset}`;
      }
      if (loaderPercent) loaderPercent.innerText = `${this.progress}%`;

      if (loaderText) {
        if (this.progress < 30) loaderText.innerText = statusMessages[0];
        else if (this.progress < 65) loaderText.innerText = statusMessages[1];
        else if (this.progress < 95) loaderText.innerText = statusMessages[2];
        else loaderText.innerText = statusMessages[3];
      }

      if (this.progress >= 100) {
        clearInterval(interval);
        
        setTimeout(() => {
          if (preloader) {
            gsap.to('.loader-content-wrapper', {
              scale: 0.9,
              opacity: 0,
              duration: 0.4,
              ease: 'power2.in'
            });

            gsap.to(preloader, {
              opacity: 0,
              duration: 0.6,
              delay: 0.1,
              onComplete: () => {
                preloader.classList.add('loaded');
                this.onPreloaderComplete();
              }
            });
          } else {
            this.onPreloaderComplete();
          }
        }, 200);
      }
    }, 25);
  }

  private onPreloaderComplete(): void {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#65a30d', '#10b981', '#eab308', '#ffffff']
    });

    gsap.from(this.heroGroup.position, {
      y: -3,
      duration: 1.5,
      ease: 'back.out(1.4)'
    });
    gsap.from(this.heroGroup.rotation, {
      y: Math.PI * 2,
      duration: 1.8,
      ease: 'power3.out'
    });

    setTimeout(() => {
      this.togglePromoModal(true);
    }, 400);
  }

  private onMouseMove(event: MouseEvent): void {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    gsap.to(this.heroGroup.rotation, {
      x: mouseY * 0.3,
      y: mouseX * 0.4,
      duration: 1,
      ease: 'power2.out'
    });
  }

  private onWindowScroll(): void {
    const header = document.querySelector('header.navbar-glass');
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    const currentScrollY = window.scrollY;

    // Navbar Auto-Hide
    if (header) {
      if (currentScrollY > 40 && currentScrollY > this.lastScrollY) {
        header.classList.add('nav-hidden');
      } else {
        header.classList.remove('nav-hidden');
      }
    }

    // Scroll To Top Floating Button Visibility
    if (scrollTopBtn) {
      if (currentScrollY > 200) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }

    this.lastScrollY = currentScrollY;
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    const elapsedTime = this.clock.getElapsedTime();

    if (this.heroGroup) {
      this.heroGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.15;
    }
    if (this.particleSystem) {
      this.particleSystem.rotation.y = elapsedTime * 0.04;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    document.body.classList.toggle('dark-theme', this.isDarkTheme);

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.innerHTML = this.isDarkTheme 
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
    }
  }

  private toggleCartDrawer(open: boolean): void {
    const backdrop = document.getElementById('cart-backdrop');
    const drawer = document.getElementById('cart-drawer');
    if (open) {
      backdrop?.classList.add('open');
      drawer?.classList.add('open');
    } else {
      backdrop?.classList.remove('open');
      drawer?.classList.remove('open');
    }
  }

  private togglePromoModal(open: boolean): void {
    const promoBackdrop = document.getElementById('promo-modal-backdrop');
    if (open) {
      promoBackdrop?.classList.add('open');
    } else {
      promoBackdrop?.classList.remove('open');
    }
  }

  private renderUI(): void {
    const ui = document.getElementById('ui-container');
    if (!ui) return;

    ui.innerHTML = `
      <!-- Top Fixed White Frosted Glass Blur Navbar -->
      <header class="navbar-glass interactive">
        <div style="display: flex; align-items: center; gap: 0.9rem;">
          <img src="/image/logo.jpeg" alt="Logo" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid #65a30d; box-shadow: 0 4px 12px rgba(101, 163, 13, 0.3);" />
          <div>
            <h2 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: var(--color-text-title); margin: 0; line-height: 1.1;">
              Meera Dairy Farm
            </h2>
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--color-text-muted); letter-spacing: 0.08em; text-transform: uppercase; display: block; margin-top: 1px;">
              & AGRO PRODUCTS
            </span>
          </div>
        </div>

        <ul class="nav-links">
          <li><a href="#home" class="nav-link-item active">Home</a></li>
          <li><a href="#about" class="nav-link-item">About</a></li>
          <li><a href="#products" class="nav-link-item">Products</a></li>
          <li><a href="#our-farm" class="nav-link-item">Our Farm</a></li>
          <li><a href="#gallery" class="nav-link-item">Gallery</a></li>
          <li><a href="#contact" class="nav-link-item">Contact</a></li>
        </ul>

        <div class="nav-actions">
          <button id="cart-btn" class="icon-btn" title="Shopping Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
            <span class="cart-badge">${this.cartCount}</span>
          </button>

          <button id="theme-toggle-btn" class="icon-btn" title="Toggle Light/Dark Theme">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- Shopping Cart Drawer Overlay -->
      <div id="cart-backdrop" class="cart-drawer-backdrop interactive"></div>
      <div id="cart-drawer" class="cart-drawer interactive">
        <div class="cart-drawer-header">
          <div class="cart-drawer-title">
            🛒 Your Shopping Cart
          </div>
          <button id="close-cart-btn" class="close-btn">&times;</button>
        </div>

        <div class="cart-items-list">
          <div class="cart-item">
            <img src="/image/farm_sunrise.jpg" alt="A2 Cow Milk" class="cart-item-img" />
            <div class="cart-item-details">
              <div class="cart-item-name">A2 Desi Cow Milk (1 Litre)</div>
              <div class="cart-item-price">₹90 × 1</div>
            </div>
          </div>

          <div class="cart-item">
            <img src="/image/cows_bg.jpg" alt="Organic Desi Ghee" class="cart-item-img" />
            <div class="cart-item-details">
              <div class="cart-item-name">Pure Vedic Desi Ghee (500g)</div>
              <div class="cart-item-price">₹750 × 1</div>
            </div>
          </div>
        </div>

        <div class="cart-drawer-footer">
          <div class="cart-total">
            <span>Total Amount:</span>
            <span>₹840</span>
          </div>
          <a href="https://wa.me/919752127710?text=Hello%20Meera%20Dairy%20Farm,%20I%20want%20to%20order%20A2%20Desi%20Cow%20Milk%20and%20Ghee." target="_blank" style="padding: 1rem; background: #65a30d; color: white; border-radius: var(--radius-md); font-weight: 800; text-align: center; text-decoration: none; display: flex; justify-content: center; align-items: center; gap: 0.5rem; box-shadow: 0 10px 20px rgba(101, 163, 13, 0.4);">
            📱 Order via WhatsApp
          </a>
        </div>
      </div>

      <!-- Hero Section -->
      <main class="hero-grid interactive" id="home">
        <div class="glass-panel" style="padding: 2.8rem; border-radius: 28px;">
          <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.45rem 1.2rem; background: rgba(101, 163, 13, 0.12); border: 1.5px solid rgba(101, 163, 13, 0.35); border-radius: 999px; font-size: 0.85rem; font-weight: 800; color: #4d7c0f; margin-bottom: 1.2rem;">
            <span>🐄 FARM TO YOUR FAMILY</span>
          </div>

          <h1 style="font-size: 3.4rem; font-weight: 800; line-height: 1.12; color: var(--color-text-title); margin-bottom: 0.8rem;">
            Pure Desi <br/>
            <span style="color: #65a30d;">Cow</span><span style="color: #eab308;">Milk</span> <br/>
            & Agro Products
          </h1>

          <p style="color: var(--color-text); font-size: 1.1rem; font-weight: 600; margin-bottom: 0.4rem; line-height: 1.4;">
            Village Mirjapur, Near Yashwant Sagar Dam Hatod, Indore
          </p>
          <p style="color: #059669; font-size: 1.05rem; font-weight: 700; margin-bottom: 0.4rem;">
            🍃 शुद्धता, प्रकृति और विश्वास साथ चलते हैं।
          </p>
          <p style="color: var(--color-text-muted); font-size: 0.95rem; font-weight: 600; margin-bottom: 1.5rem;">
            100% natural desi cow milk · No preservatives · Available on order
          </p>

          <div style="margin-bottom: 1.8rem; padding: 0.9rem 1.2rem; background: rgba(255, 255, 255, 0.7); border: 1.5px solid rgba(101, 163, 13, 0.35); border-radius: 20px; display: flex; align-items: center; gap: 1.2rem; box-shadow: 0 8px 20px rgba(0,0,0,0.04);">
            <img src="/image/products-showcase.png" alt="Organic Products Showcase" style="height: 75px; max-width: 140px; object-fit: contain; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.12));" />
            <div>
              <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--color-text-title); margin-bottom: 0.2rem;">
                ✨ Fresh Organic Product Range
              </h4>
              <p style="font-size: 0.82rem; font-weight: 600; color: #4d7c0f; margin: 0;">
                A2 Desi Cow Milk · Vedic Ghee · Fresh Paneer · Butter & Agro Products
              </p>
            </div>
          </div>

          <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; margin-bottom: 1.8rem;">
            <a href="tel:+919752127710" style="padding: 0.95rem 2.2rem; background: #65a30d; border: none; border-radius: 999px; color: white; font-weight: 800; font-size: 1.05rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.6rem; box-shadow: 0 10px 22px -4px rgba(101, 163, 13, 0.4); transition: var(--transition);" class="interactive">
              🛒 Order Now
            </a>
            <a href="tel:+919752127710" style="padding: 0.95rem 1.8rem; background: rgba(255, 255, 255, 0.85); border: 1.5px solid rgba(101, 163, 13, 0.3); border-radius: 999px; color: #2d3748; font-weight: 800; font-size: 1.05rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.6rem; box-shadow: 0 4px 14px rgba(0,0,0,0.05);" class="interactive">
              📞 +91 97521 27710
            </a>
          </div>

          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; padding-top: 1.4rem; border-top: 1px solid rgba(101, 163, 13, 0.2);">
            <span style="padding: 0.45rem 1rem; background: rgba(101, 163, 13, 0.12); border: 1.2px solid rgba(101, 163, 13, 0.35); border-radius: 999px; font-size: 0.85rem; font-weight: 800; color: #4d7c0f;">
              ✓ 100% Natural
            </span>
            <span style="padding: 0.45rem 1rem; background: rgba(101, 163, 13, 0.12); border: 1.2px solid rgba(101, 163, 13, 0.35); border-radius: 999px; font-size: 0.85rem; font-weight: 800; color: #4d7c0f;">
              ✓ No Preservatives
            </span>
            <span style="padding: 0.45rem 1rem; background: rgba(101, 163, 13, 0.12); border: 1.2px solid rgba(101, 163, 13, 0.35); border-radius: 999px; font-size: 0.85rem; font-weight: 800; color: #4d7c0f;">
              ✓ Fresh Daily
            </span>
            <span style="padding: 0.45rem 1rem; background: rgba(101, 163, 13, 0.12); border: 1.2px solid rgba(101, 163, 13, 0.35); border-radius: 999px; font-size: 0.85rem; font-weight: 800; color: #4d7c0f;">
              ✓ Desi Cow Milk
            </span>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
          <div class="hero-video-card">
            <video 
              src="/vedios/10041402-hd_1080_1920_24fps.mp4" 
              autoplay 
              loop 
              muted 
              playsinline 
              class="hero-video-element"
            ></video>

            <div class="video-bottom-caption">
              <h4>🌿 Pure Desi Cow Milk</h4>
              <p>& Agro Products · Indore</p>
            </div>
          </div>
        </div>
      </main>

      <!-- Scroll Down Callout Hint -->
      <div style="display: flex; justify-content: center; margin: 1rem 0 3rem 0;" class="interactive">
        <a href="#about" style="display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.75rem 1.8rem; background: rgba(255, 255, 255, 0.88); border: 1.5px solid rgba(101, 163, 13, 0.4); border-radius: 999px; color: #4d7c0f; font-weight: 800; font-size: 0.95rem; text-decoration: none; box-shadow: 0 8px 20px rgba(101, 163, 13, 0.2); transition: var(--transition);" class="interactive">
          <span>👇 Scroll Down For Our Story & Products</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </a>
      </div>

      <!-- ============================================================
           OUR STORY SECTION (Matching SS1 & SS2)
           ============================================================ -->
      <section class="story-section-grid interactive" id="about">
        <!-- Story Text Card (Right/Left Split) -->
        <div class="glass-panel story-card-container">
          <h2 style="font-size: 3.2rem; font-weight: 800; color: #65a30d; margin-bottom: 1.8rem; font-family: var(--font-heading);">
            Our Story
          </h2>

          <p style="font-size: 1.08rem; line-height: 1.7; color: var(--color-text); margin-bottom: 1.4rem; font-weight: 500;">
            In 2016, we had nothing — no land, no money, no guarantee. Just a dream, a deep faith, and the courage to begin. With everything on the line, we took a leap and brought home our very first cow. We named her <strong style="color: #65a30d; font-weight: 800;">Meera</strong> — after the divine, because she is our everything.
          </p>

          <p style="font-size: 1.08rem; line-height: 1.7; color: var(--color-text); margin-bottom: 1.4rem; font-weight: 500;">
            Those early mornings were hard. Waking before dawn, worrying about tomorrow, wondering if the dream would hold. But Meera gave us more than milk — she gave us hope. Every day with her reminded us why we had started: to give families something truly pure, something honest, something straight from the heart.
          </p>

          <p style="font-size: 1.08rem; line-height: 1.7; color: var(--color-text); margin-bottom: 2rem; font-weight: 500;">
            With her blessings and your trust, that one cow became two, then ten, then many more. Today, our family has grown to <strong style="color: #65a30d; font-weight: 800;">50+ beautiful cows</strong>, each with a name, each loved like family — and we are still growing. From Village Mirjapur, near Yashwant Sagar Dam Hatod, Indore, Madhya Pradesh, this is our story. It is still being written.
          </p>

          <a href="#products" style="color: #65a30d; font-size: 1.1rem; font-weight: 800; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; transition: var(--transition);" class="interactive">
            Explore Our Products &rarr;
          </a>
        </div>

        <!-- Story Side Image Card (Matching Screenshot SS2) -->
        <div class="story-image-card">
          <img src="/image/farm_sunrise.jpg" alt="Our Story - Meera Cow Farm" class="story-img-element" />
          
          <div class="story-img-badge">
            <div style="width: 44px; height: 44px; background: rgba(101, 163, 13, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
              🐄
            </div>
            <div>
              <h4 style="font-size: 1rem; font-weight: 800; color: #5c3d2e; margin-bottom: 0.1rem;">
                Meera - Our First Cow
              </h4>
              <p style="font-size: 0.8rem; font-weight: 700; color: #65a30d; margin: 0;">
                Est. 2016 · 50+ Cows Today in Indore
              </p>
            </div>
      </section>

      <!-- ============================================================
           STATS COUNTER SECTION (Scroll Counter Animation)
           ============================================================ -->
      <section class="stats-counter-section interactive" id="stats-counter">
        <div class="glass-panel stats-container">
          <div class="stat-box">
            <div class="stat-number" data-target="1000" data-suffix="+">0+</div>
            <div class="stat-label">Happy Families</div>
          </div>

          <div class="stat-box">
            <div class="stat-number" data-target="50" data-suffix="+">0+</div>
            <div class="stat-label">Healthy Cows</div>
          </div>

          <div class="stat-box">
            <div class="stat-number" data-target="10" data-suffix="+">0+</div>
            <div class="stat-label">Years Experience</div>
          </div>

          <div class="stat-box">
            <div class="stat-number" data-target="100" data-suffix="%">0%</div>
            <div class="stat-label">Organic Feed</div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           PURITY TICKER MARQUEE
           ============================================================ -->
      <div class="ticker-marquee-wrapper interactive">
        <div class="ticker-marquee-track">
          <div class="ticker-item"><span>🐄</span> 100% Desi Cow Milk</div>
          <div class="ticker-item"><span>🌿</span> Organic Feed Only</div>
          <div class="ticker-item"><span>📅</span> Est. 2016 in Indore</div>
          <div class="ticker-item"><span>👨‍👩‍👧‍👦</span> 1,000+ Happy Families</div>
          <div class="ticker-item"><span>🧪</span> Purity Tested Daily</div>
          <div class="ticker-item"><span>❤️</span> Made with Love</div>

          <!-- Duplicated for continuous marquee -->
          <div class="ticker-item"><span>🐄</span> 100% Desi Cow Milk</div>
          <div class="ticker-item"><span>🌿</span> Organic Feed Only</div>
          <div class="ticker-item"><span>📅</span> Est. 2016 in Indore</div>
          <div class="ticker-item"><span>👨‍👩‍👧‍👦</span> 1,000+ Happy Families</div>
          <div class="ticker-item"><span>🧪</span> Purity Tested Daily</div>
          <div class="ticker-item"><span>❤️</span> Made with Love</div>
        </div>
      </div>

      <!-- ============================================================
           WHY CHOOSE MEERA? (6 Feature Cards from meeradairyfarm.in)
           ============================================================ -->
      <section class="interactive" id="our-farm">
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

      <!-- ============================================================
           PRODUCTS SECTION (6 Exact Products from meeradairyfarm.in)
           ============================================================ -->
      <section class="interactive" id="products">
        <div class="section-header-box">
          <div class="section-tag-pill">
            <span>🍃 FARM FRESH & ORGANIC</span>
          </div>
          <h2 class="section-main-title">
            Our Pure Dairy & Agro Range
          </h2>
          <p class="section-main-subtitle">
            100% Raw, Unprocessed & Freshly Delivered Desi Cow Dairy Range directly from our Indore Farm.
          </p>
        </div>

        <div class="products-section-grid">
          <!-- Product 1: Shri Dugdham Cow Milk -->
          <div class="glass-panel product-card">
            <span class="product-badge-tag">🔥 Best Seller</span>
            <div class="product-img-wrapper">
              <img src="/image/cows_bg.jpg" alt="Shri Dugdham Cow Milk" class="product-img" />
            </div>
            <div class="product-info-box">
              <h3 class="product-card-title">Shri Dugdham Cow Milk</h3>
              <p class="product-card-desc">
                100% pure desi cow milk — fresh from farm. Rich in calcium & protein. No preservatives. Available on order.
              </p>
              <div class="product-price-row">
                <span class="product-price-value">₹65</span>
                <span class="product-unit-text">/ Litre</span>
              </div>
            </div>
            <button class="add-cart-btn">
              🛒 Add To Cart
            </button>
          </div>

          <!-- Product 2: Paneer -->
          <div class="glass-panel product-card">
            <span class="product-badge-tag" style="background: #eab308;">⭐ Most Loved</span>
            <div class="product-img-wrapper">
              <img src="/image/farm_sunrise.jpg" alt="Fresh Paneer" class="product-img" />
            </div>
            <div class="product-info-box">
              <h3 class="product-card-title">Fresh Desi Paneer</h3>
              <p class="product-card-desc">
                Made from pure desi cow milk. Fresh · Soft · Nutritious. High in protein & calcium. Perfect for every meal.
              </p>
              <div class="product-price-row">
                <span class="product-price-value">₹400</span>
                <span class="product-unit-text">/ KG</span>
              </div>
            </div>
            <button class="add-cart-btn">
              🛒 Add To Cart
            </button>
          </div>

          <!-- Product 3: Buttermilk Chaach -->
          <div class="glass-panel product-card">
            <span class="product-badge-tag" style="background: #059669;">✨ Fresh Daily</span>
            <div class="product-img-wrapper">
              <img src="/image/logo.jpeg" alt="Buttermilk Chaach" class="product-img" style="object-fit: contain; padding: 12px;" />
            </div>
            <div class="product-info-box">
              <h3 class="product-card-title">Buttermilk (Chaach) छाछ</h3>
              <p class="product-card-desc">
                Natural, refreshing & healthy. Made from pure cow milk. Great for digestion. Rich in calcium & electrolytes.
              </p>
              <div class="product-price-row">
                <span class="product-price-value">₹35</span>
                <span class="product-unit-text">/ Litre</span>
              </div>
            </div>
            <button class="add-cart-btn">
              🛒 Add To Cart
            </button>
          </div>

          <!-- Product 4: Ghritam Shuddh Desi Ghee -->
          <div class="glass-panel product-card">
            <span class="product-badge-tag" style="background: #8b5cf6;">👑 Premium Bilona</span>
            <div class="product-img-wrapper">
              <img src="/image/products-showcase.png" alt="Ghritam Shuddh Desi Ghee" class="product-img" />
            </div>
            <div class="product-info-box">
              <h3 class="product-card-title">Ghritam Shuddh Desi Ghee</h3>
              <p class="product-card-desc">
                100% pure cow ghee made by the Bilona method. Hand-churned from desi cow milk. Vedic purity in every drop.
              </p>
              <div class="product-price-row">
                <span class="product-price-value">₹2,500</span>
                <span class="product-unit-text">/ KG Glass Jar</span>
              </div>
            </div>
            <button class="add-cart-btn">
              🛒 Add To Cart
            </button>
          </div>

          <!-- Product 5: Vermishakti Organic Fertilizer -->
          <div class="glass-panel product-card">
            <span class="product-badge-tag" style="background: #16a34a;">🌿 100% Organic</span>
            <div class="product-img-wrapper">
              <img src="/image/cows_bg.jpg" alt="Vermishakti Organic Fertilizer" class="product-img" />
            </div>
            <div class="product-info-box">
              <h3 class="product-card-title">Vermishakti Organic Fertilizer</h3>
              <p class="product-card-desc">
                100% organic · Cow dung + earthworm processed. Enriches soil and boosts crop health. Ideal for vegetables & plants.
              </p>
              <div class="product-price-row">
                <span class="product-price-value">₹100</span>
                <span class="product-unit-text">/ 5 KG Bag</span>
              </div>
            </div>
            <button class="add-cart-btn">
              🛒 Add To Cart
            </button>
          </div>

          <!-- Product 6: Cow Dung Cakes -->
          <div class="glass-panel product-card">
            <span class="product-badge-tag" style="background: #ea580c;">🔱 Havan Special</span>
            <div class="product-img-wrapper">
              <img src="/image/farm_sunrise.jpg" alt="Cow Dung Cakes" class="product-img" />
            </div>
            <div class="product-info-box">
              <h3 class="product-card-title">Cow Dung Cakes (6-Pack)</h3>
              <p class="product-card-desc">
                Naturally dried · Ideal for Havan & Puja. Chemical-free & sustainably farm-sourced. Traditional & eco-friendly.
              </p>
              <div class="product-price-row">
                <span class="product-price-value">₹25</span>
                <span class="product-unit-text">/ 6-Pack</span>
              </div>
            </div>
            <button class="add-cart-btn">
              🛒 Add To Cart
            </button>
          </div>
        </div>
      </section>

      <!-- ============================================================
           DELIVERY TIMELINE SECTION ("From Our Farm to Your Doorstep")
           ============================================================ -->
      <section class="interactive" id="timeline">
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
          <!-- Animated Progress Bar Line passing behind step nodes -->
          <div class="timeline-progress-line-track">
            <div class="timeline-progress-line-fill"></div>
          </div>

          <div class="timeline-section-grid-horizontal">
            <!-- Step 1 -->
            <div class="timeline-step-node">
              <div class="timeline-step-circle">1</div>
              <div class="glass-panel timeline-card-compact">
                <span class="timeline-time-badge">🐄 Pasture Grazing</span>
                <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--color-text-title); margin-bottom: 0.4rem;">Happy Cows</h4>
                <p style="font-size: 0.85rem; color: var(--color-text-muted); line-height: 1.45;">Gir & Sahiwal cows graze freely on organic pastures with natural green fodder.</p>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="timeline-step-node">
              <div class="timeline-step-circle">2</div>
              <div class="glass-panel timeline-card-compact">
                <span class="timeline-time-badge">🥛 5:00 AM</span>
                <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--color-text-title); margin-bottom: 0.4rem;">Fresh Milking</h4>
                <p style="font-size: 0.85rem; color: var(--color-text-muted); line-height: 1.45;">Hygienic morning milking by hand & touchless equipment under supervision.</p>
              </div>
            </div>

            <!-- Step 3 -->
            <div class="timeline-step-node">
              <div class="timeline-step-circle">3</div>
              <div class="glass-panel timeline-card-compact">
                <span class="timeline-time-badge">⚗️ 6:00 AM</span>
                <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--color-text-title); margin-bottom: 0.4rem;">Quality Testing</h4>
                <p style="font-size: 0.85rem; color: var(--color-text-muted); line-height: 1.45;">Every batch tested for fat content, zero-adulteration & microbial purity.</p>
              </div>
            </div>

            <!-- Step 4 -->
            <div class="timeline-step-node">
              <div class="timeline-step-circle">4</div>
              <div class="glass-panel timeline-card-compact">
                <span class="timeline-time-badge">📦 7:00 AM</span>
                <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--color-text-title); margin-bottom: 0.4rem;">Chilled Packaging</h4>
                <p style="font-size: 0.85rem; color: var(--color-text-muted); line-height: 1.45;">Minimal processing, packed in chilled eco-friendly containers.</p>
              </div>
            </div>

            <!-- Step 5 -->
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

      <!-- ============================================================
           EXPERIENCE OUR FARM & A DAY AT OUR FARM (Fully Automated Section)
           ============================================================ -->
      <section class="interactive" id="experience-farm" style="padding: 4rem 0;">
        <div class="section-header-box">
          <div class="section-tag-pill">
            <span>🌿 VIRTUAL FARM TOUR</span>
          </div>
          <h2 class="section-main-title" style="color: #65a30d; font-size: 3rem; font-weight: 800; font-family: var(--font-heading);">
            Experience Our Farm
          </h2>
          <p class="section-main-subtitle" style="font-size: 1.1rem; color: var(--color-text-muted); max-width: 680px; margin: 0 auto 2.5rem auto;">
            Step into a day in the life of Meera Dairy Farm — from sunrise milking to your doorstep
          </p>
        </div>

        <!-- Automated Farm Landscape Hero Card with Animated Sun & Hotspots -->
        <div class="glass-panel farm-experience-banner" id="farm-experience-banner">
          <img src="/image/farm_sunrise.jpg" alt="Experience Meera Dairy Farm Landscape" class="farm-banner-img" />
          
          <!-- Dynamic Animated Sky Overlay -->
          <div class="farm-banner-sky-overlay" id="farm-sky-overlay"></div>

          <!-- Animated Golden Sun in Top Right -->
          <div class="farm-animated-sun" id="farm-animated-sun"></div>

          <!-- Dynamic Hotspot Pulse Pointer -->
          <div class="farm-hotspot-pulse" id="farm-hotspot" style="top: 48%; left: 22%;">
            <span class="hotspot-inner-dot"></span>
            <div class="hotspot-tooltip" id="hotspot-tooltip">🌅 4:00 AM · Dawn at the Farm</div>
          </div>

          <!-- Bottom-Left Floating Badges -->
          <div class="farm-banner-badges-container">
            <span class="farm-badge-pill">✓ 100% Organic</span>
            <span class="farm-badge-pill">✓ Desi Cow Breed</span>
            <span class="farm-badge-pill">✓ Village Mirjapur</span>
          </div>

          <!-- Top-Left Live Status Badge -->
          <div class="farm-banner-live-tag">
            <span class="live-dot"></span>
            <span id="farm-live-time-text">LIVE: 4:00 AM · Dawn at the Farm</span>
          </div>
        </div>

        <!-- Subtitle Header: A Day at Our Farm -->
        <div style="margin-top: 3.8rem; text-align: center; margin-bottom: 2rem;">
          <h3 style="font-size: 2.2rem; font-weight: 800; color: #5c3d2e; font-family: var(--font-heading);">
            A Day at Our Farm
          </h3>
        </div>

        <!-- 6 Step Cards Grid (3 Columns x 2 Rows) -->
        <div class="farm-day-grid" id="farm-day-grid">
          <!-- Step 1: 4:00 AM -->
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

          <!-- Step 2: 5:00 AM -->
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

          <!-- Step 3: 6:00 AM -->
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

          <!-- Step 4: 7:00 AM -->
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

          <!-- Step 5: 8:00 AM -->
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

          <!-- Step 6: 9:00 AM -->
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

        <!-- Book a Farm Visit CTA Button -->
        <div style="display: flex; justify-content: center; margin-top: 3.2rem;">
          <a href="#contact" id="book-farm-visit-btn" class="cta-primary-btn" style="display: inline-flex; align-items: center; gap: 0.6rem; padding: 1rem 2.8rem; font-size: 1.15rem; font-weight: 800; background: linear-gradient(135deg, #65a30d 0%, #4d7c0f 100%); color: #ffffff; text-decoration: none; border-radius: 999px; box-shadow: 0 10px 25px rgba(101, 163, 13, 0.4); transition: var(--transition);">
            <span>🌿 Book a Farm Visit</span>
          </a>
        </div>
      </section>

      <!-- ============================================================
           WHAT OUR FAMILIES SAY (Testimonials Grid)
           ============================================================ -->
      <section class="interactive" id="testimonials">
        <div class="section-header-box">
          <div class="section-tag-pill">
            <span>💬 CUSTOMER REVIEWS</span>
          </div>
          <h2 class="section-main-title">
            What Our Families Say
          </h2>
          <p class="section-main-subtitle">
            Join thousands of happy families in Indore who trust Meera Dairy Farm every day.
          </p>
        </div>

        <div class="testimonials-section-grid">
          <!-- Review 1 -->
          <div class="glass-panel testimonial-card">
            <div>
              <div style="color: #eab308; font-size: 1.2rem; margin-bottom: 0.8rem;">★★★★★</div>
              <p class="testimonial-quote">
                "The milk quality is outstanding! My children love the taste, and I love knowing it comes from healthy, well-cared-for cows. Meera Dairy Farm has become a trusted part of our family."
              </p>
            </div>
            <div class="testimonial-author">
              <div class="avatar-circle">RS</div>
              <div>
                <h4 style="font-size: 1rem; font-weight: 800; color: var(--color-text-title); margin: 0;">Rajesh Sharma</h4>
                <span style="font-size: 0.8rem; font-weight: 700; color: #65a30d;">Indore, Madhya Pradesh</span>
              </div>
            </div>
          </div>

          <!-- Review 2 -->
          <div class="glass-panel testimonial-card">
            <div>
              <div style="color: #eab308; font-size: 1.2rem; margin-bottom: 0.8rem;">★★★★★</div>
              <p class="testimonial-quote">
                "After switching to Meera Dairy Farm, I can taste the difference. The paneer is incredibly fresh, and the ghee has that authentic aroma you just can't find in stores."
              </p>
            </div>
            <div class="testimonial-author">
              <div class="avatar-circle">PP</div>
              <div>
                <h4 style="font-size: 1rem; font-weight: 800; color: var(--color-text-title); margin: 0;">Priya Patel</h4>
                <span style="font-size: 0.8rem; font-weight: 700; color: #65a30d;">Indore, Madhya Pradesh</span>
              </div>
            </div>
          </div>

          <!-- Review 3 -->
          <div class="glass-panel testimonial-card">
            <div>
              <div style="color: #eab308; font-size: 1.2rem; margin-bottom: 0.8rem;">★★★★★</div>
              <p class="testimonial-quote">
                "As a grandmother, I appreciate knowing exactly where our milk comes from. The farm visit was wonderful — seeing the happy cows and clean facilities gave me complete confidence."
              </p>
            </div>
            <div class="testimonial-author">
              <div class="avatar-circle">SJ</div>
              <div>
                <h4 style="font-size: 1rem; font-weight: 800; color: var(--color-text-title); margin: 0;">Savita Joshi</h4>
                <span style="font-size: 0.8rem; font-weight: 700; color: #65a30d;">Indore, Madhya Pradesh</span>
              </div>
            </div>
          </div>

          <!-- Review 4 -->
          <div class="glass-panel testimonial-card">
            <div>
              <div style="color: #eab308; font-size: 1.2rem; margin-bottom: 0.8rem;">★★★★★</div>
              <p class="testimonial-quote">
                "The morning delivery service is impeccable! Fresh milk at my doorstep by 7 AM every single day. The dahi is thick and creamy, just like my mother used to make."
              </p>
            </div>
            <div class="testimonial-author">
              <div class="avatar-circle">ND</div>
              <div>
                <h4 style="font-size: 1rem; font-weight: 800; color: var(--color-text-title); margin: 0;">Neha Dubey</h4>
                <span style="font-size: 0.8rem; font-weight: 700; color: #65a30d;">Indore, Madhya Pradesh</span>
              </div>
            </div>
          </div>

          <!-- Review 5 -->
          <div class="glass-panel testimonial-card">
            <div>
              <div style="color: #eab308; font-size: 1.2rem; margin-bottom: 0.8rem;">★★★★★</div>
              <p class="testimonial-quote">
                "I've tried many dairy brands, but Meera Dairy Farm stands out. The commitment to organic practices and animal welfare shows in every product. Worth every rupee!"
              </p>
            </div>
            <div class="testimonial-author">
              <div class="avatar-circle">AT</div>
              <div>
                <h4 style="font-size: 1rem; font-weight: 800; color: var(--color-text-title); margin: 0;">Amit Tiwari</h4>
                <span style="font-size: 0.8rem; font-weight: 700; color: #65a30d;">Indore, Madhya Pradesh</span>
              </div>
            </div>
          </div>

          <!-- Review 6 -->
          <div class="glass-panel testimonial-card">
            <div>
              <div style="color: #eab308; font-size: 1.2rem; margin-bottom: 0.8rem;">★★★★★</div>
              <p class="testimonial-quote">
                "The chaach is phenomenal! Refreshing, smooth, and perfectly tangy. My whole family has switched to Meera Dairy Farm and we couldn't be happier."
              </p>
            </div>
            <div class="testimonial-author">
              <div class="avatar-circle">KM</div>
              <div>
                <h4 style="font-size: 1rem; font-weight: 800; color: var(--color-text-title); margin: 0;">Karan Mishra</h4>
                <span style="font-size: 0.8rem; font-weight: 700; color: #65a30d;">Indore, Madhya Pradesh</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           CONTACT & FARM VISIT BOOKING FORM SECTION (From meeradairyfarm.in)
           ============================================================ -->
      <section class="interactive" id="contact">
        <div class="section-header-box">
          <div class="section-tag-pill">
            <span>📞 GET IN TOUCH & VISIT US</span>
          </div>
          <h2 class="section-main-title">
            Book a Farm Visit & Contact Us
          </h2>
          <p class="section-main-subtitle">
            Visitors are always welcome at Meera Dairy Farm! Send us a message or schedule a guided morning farm visit in Indore.
          </p>
        </div>

        <div class="contact-section-grid">
          <!-- Left: Farm Contact Details -->
          <div class="glass-panel" style="padding: 2.8rem; border-radius: 28px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <h3 style="font-size: 1.8rem; font-weight: 800; color: var(--color-text-title); margin-bottom: 1rem;">
                Meera Dairy Farm & Agro Products
              </h3>
              
              <div style="display: flex; flex-direction: column; gap: 1.2rem; margin-bottom: 2rem;">
                <div style="display: flex; align-items: flex-start; gap: 0.8rem; font-weight: 600; color: var(--color-text);">
                  <span style="font-size: 1.2rem;">📍</span>
                  <div>
                    <strong style="color: var(--color-text-title); display: block;">Address:</strong>
                    Village Mirjapur, Near Yashwant Sagar Dam Hatod, Indore, Madhya Pradesh
                  </div>
                </div>

                <div style="display: flex; align-items: flex-start; gap: 0.8rem; font-weight: 600; color: var(--color-text);">
                  <span style="font-size: 1.2rem;">📱</span>
                  <div>
                    <strong style="color: var(--color-text-title); display: block;">Phone Numbers:</strong>
                    <a href="tel:+919752127710" style="color: #65a30d; text-decoration: none;">+91 97521 27710</a> / 
                    <a href="tel:+918103289628" style="color: #65a30d; text-decoration: none;">+91 81032 89628</a>
                  </div>
                </div>

                <div style="display: flex; align-items: flex-start; gap: 0.8rem; font-weight: 600; color: var(--color-text);">
                  <span style="font-size: 1.2rem;">✉️</span>
                  <div>
                    <strong style="color: var(--color-text-title); display: block;">Email:</strong>
                    moo@meeradairyfarm.com / hello@meeradairyfarm.com
                  </div>
                </div>

                <div style="display: flex; align-items: flex-start; gap: 0.8rem; font-weight: 600; color: var(--color-text);">
                  <span style="font-size: 1.2rem;">⏰</span>
                  <div>
                    <strong style="color: var(--color-text-title); display: block;">Hours:</strong>
                    Mon-Sat: 5:00 AM - 8:00 PM | Sun: 6:00 AM - 2:00 PM
                  </div>
                </div>
              </div>
            </div>

            <a href="https://wa.me/919752127710?text=Hello%20Meera%20Dairy%20Farm,%20I%20want%20to%20book%20a%20farm%20visit%20and%20order%20pure%20milk." target="_blank" style="padding: 1.1rem 2rem; background: #65a30d; border-radius: 999px; color: white; font-weight: 800; font-size: 1.05rem; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 0.8rem; box-shadow: 0 10px 22px rgba(101, 163, 13, 0.4);" class="interactive">
              💬 Direct WhatsApp Order & Inquiry (+91 97521 27710)
            </a>
          </div>

          <!-- Right: Interactive Contact & Farm Visit Booking Form -->
          <div class="glass-panel" style="padding: 2.8rem; border-radius: 28px;">
            <h3 style="font-size: 1.6rem; font-weight: 800; color: var(--color-text-title); margin-bottom: 0.5rem;">
              Send Message / Request Visit
            </h3>
            <p style="font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 1.5rem; font-weight: 600;">
              Fill out the details below and our team will call you back shortly.
            </p>

            <form onsubmit="event.preventDefault(); alert('Thank you for contacting Meera Dairy Farm! We will reach out to you shortly.');">
              <div class="form-group">
                <label class="form-label">Your Name</label>
                <input type="text" class="form-input" placeholder="e.g. Ramesh Kumar" required />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label">Phone Number</label>
                  <input type="tel" class="form-input" placeholder="+91 98765 43210" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Email Address</label>
                  <input type="email" class="form-input" placeholder="yourname@gmail.com" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Subject / Purpose</label>
                <select class="form-input" required style="cursor: pointer;">
                  <option value="milk_subscription">🥛 Daily Milk Subscription</option>
                  <option value="farm_visit">🌾 Book a Farm Visit</option>
                  <option value="ghee_order">👑 Order Vedic Desi Ghee</option>
                  <option value="general_inquiry">💬 General Inquiry</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Your Message / Preferred Visit Date</label>
                <textarea class="form-textarea" rows="3" placeholder="Tell us how we can help you or when you'd like to visit our Indore farm..."></textarea>
              </div>

              <button type="submit" class="form-submit-btn">
                📩 Send Request To Meera Farm
              </button>
            </form>
          </div>
        </div>
      </section>

      <!-- ============================================================
           FOOTER (Matching meeradairyfarm.in)
           ============================================================ -->
      <footer class="site-footer interactive">
        <div class="footer-grid">
          <div>
            <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1rem;">
              <img src="/image/logo.jpeg" alt="Meera Dairy Farm" style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid #65a30d;" />
              <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--color-text-title); margin: 0;">Meera Dairy Farm</h3>
            </div>
            <p style="font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.6; margin-bottom: 1.2rem;">
              Pure A2 desi cow milk & dairy products from Meera Dairy Farm, Indore. Farm-fresh ghee, paneer, curd & more — delivered with love from our family to yours.
            </p>
            <span style="font-size: 0.85rem; font-weight: 800; color: #65a30d;">🍃 100% Pure · Zero Preservatives</span>
          </div>

          <div>
            <h4 class="footer-col-title">Quick Links</h4>
            <ul class="footer-links-list">
              <li><a href="#home" class="footer-link">Home</a></li>
              <li><a href="#about" class="footer-link">Our Story</a></li>
              <li><a href="#products" class="footer-link">Our Products</a></li>
              <li><a href="#timeline" class="footer-link">Delivery Process</a></li>
              <li><a href="#our-farm" class="footer-link">Why Choose Us</a></li>
              <li><a href="#testimonials" class="footer-link">Customer Reviews</a></li>
              <li><a href="#contact" class="footer-link">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 class="footer-col-title">Our Products</h4>
            <ul class="footer-links-list">
              <li><a href="#products" class="footer-link">Shri Dugdham Cow Milk</a></li>
              <li><a href="#products" class="footer-link">Fresh Desi Paneer</a></li>
              <li><a href="#products" class="footer-link">Buttermilk (Chaach) छाछ</a></li>
              <li><a href="#products" class="footer-link">Ghritam Shuddh Desi Ghee</a></li>
              <li><a href="#products" class="footer-link">Vermishakti Fertilizer</a></li>
              <li><a href="#products" class="footer-link">Cow Dung Cakes</a></li>
            </ul>
          </div>

          <div>
            <h4 class="footer-col-title">Contact Farm</h4>
            <p style="font-size: 0.88rem; color: var(--color-text-muted); line-height: 1.6; margin-bottom: 0.8rem;">
              📍 Village Mirjapur, Near Yashwant Sagar Dam Hatod, Indore, MP
            </p>
            <p style="font-size: 0.88rem; color: #65a30d; font-weight: 800; margin-bottom: 0.8rem;">
              📞 +91 97521 27710 / +91 81032 89628
            </p>
            <p style="font-size: 0.88rem; color: var(--color-text-muted);">
              ✉️ moo@meeradairyfarm.com
            </p>
          </div>
        </div>

        <div class="footer-bottom">
          © ${new Date().getFullYear()} Meera Dairy Farm & Agro Products. All rights reserved. Made with ❤️ in Indore.
        </div>
      </footer>
    `;

    // Attach Event Listeners
    document.getElementById('theme-toggle-btn')?.addEventListener('click', () => this.toggleTheme());
    document.getElementById('cart-btn')?.addEventListener('click', () => this.toggleCartDrawer(true));
    document.getElementById('close-cart-btn')?.addEventListener('click', () => this.toggleCartDrawer(false));
    document.getElementById('cart-backdrop')?.addEventListener('click', () => this.toggleCartDrawer(false));
    
    // Promo Popup Event Listeners
    document.getElementById('close-promo-btn')?.addEventListener('click', () => this.togglePromoModal(false));
    document.getElementById('promo-modal-backdrop')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('promo-modal-backdrop')) {
        this.togglePromoModal(false);
      }
    });

    // Scroll To Top Floating Button Action
    document.getElementById('scroll-top-btn')?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Initialize Animations
    this.initStatsCounter();
    this.initTimelineProgressAnimation();
    this.initAutomatedFarmTour();
  }

  private initTimelineProgressAnimation(): void {
    const timelineSection = document.getElementById('timeline');
    const fillLine = document.querySelector('.timeline-progress-line-fill') as HTMLElement;
    const stepCircles = document.querySelectorAll('.timeline-step-circle');

    if (!timelineSection || !fillLine) return;

    let hasStarted = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            hasStarted = true;
            this.runTimelineProgress(fillLine, stepCircles);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(timelineSection);
  }

  private runTimelineProgress(fillLine: HTMLElement, stepCircles: NodeListOf<Element>): void {
    const duration = 9000; // 9 seconds slow motion progress bar fill
    const startTime = performance.now();

    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const fillPercent = progress * 100;
      fillLine.style.width = `${fillPercent}%`;

      const thresholds = [5, 25, 50, 75, 95];
      stepCircles.forEach((circle, idx) => {
        if (fillPercent >= thresholds[idx]) {
          circle.classList.add('active');
        } else {
          circle.classList.remove('active');
        }
      });

      if (progress < 1) {
        requestAnimationFrame(updateProgress);
      } else {
        fillLine.style.width = '100%';
        stepCircles.forEach((circle) => circle.classList.add('active'));

        // Start slow continuous step highlight loop
        this.startContinuousStepLoop(stepCircles);
      }
    };

    requestAnimationFrame(updateProgress);
  }

  private startContinuousStepLoop(stepCircles: NodeListOf<Element>): void {
    let currentActive = 0;
    setInterval(() => {
      stepCircles.forEach((circle, idx) => {
        if (idx === currentActive) {
          circle.classList.add('active');
        } else {
          circle.classList.remove('active');
        }
      });
      currentActive = (currentActive + 1) % stepCircles.length;
    }, 3200); // 3.2 seconds per step pulse loop
  }

  private initStatsCounter(): void {
    const statsSection = document.getElementById('stats-counter');
    if (!statsSection) return;

    let hasAnimated = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            hasAnimated = true;
            this.animateCounters();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(statsSection);
  }

  private animateCounters(): void {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach((el) => {
      const target = parseInt(el.getAttribute('data-target') || '0', 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 2000;
      const startTime = performance.now();

      const updateCount = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (easeOutCubic)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.floor(easeOut * target);

        el.textContent = `${currentVal}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          el.textContent = `${target}${suffix}`;
        }
      };

      requestAnimationFrame(updateCount);
    });
  }

  private initAutomatedFarmTour(): void {
    const cards = document.querySelectorAll('.farm-day-card');
    const hotspot = document.getElementById('farm-hotspot');
    const tooltip = document.getElementById('hotspot-tooltip');
    const liveTimeText = document.getElementById('farm-live-time-text');
    const skyOverlay = document.getElementById('farm-sky-overlay');
    const animatedSun = document.getElementById('farm-animated-sun');

    if (!cards.length || !hotspot || !tooltip || !liveTimeText) return;

    const stepData = [
      { time: '4:00 AM', title: 'Dawn at the Farm', icon: '🌅', left: '22%', top: '48%', sunOpacity: 0.4, skyFilter: 'rgba(255, 140, 0, 0.22)' },
      { time: '5:00 AM', title: 'Morning Milking', icon: '🐄', left: '40%', top: '45%', sunOpacity: 0.65, skyFilter: 'rgba(251, 191, 36, 0.18)' },
      { time: '6:00 AM', title: 'Quality Testing', icon: '🧪', left: '55%', top: '50%', sunOpacity: 0.8, skyFilter: 'rgba(234, 179, 8, 0.14)' },
      { time: '7:00 AM', title: 'Fresh Packaging', icon: '🥛', left: '68%', top: '55%', sunOpacity: 0.9, skyFilter: 'rgba(16, 185, 129, 0.1)' },
      { time: '8:00 AM', title: 'Agro Processing', icon: '🌾', left: '78%', top: '60%', sunOpacity: 0.95, skyFilter: 'rgba(101, 163, 13, 0.08)' },
      { time: '9:00 AM', title: 'Doorstep Delivery', icon: '🚚', left: '85%', top: '68%', sunOpacity: 1.0, skyFilter: 'rgba(0, 0, 0, 0)' }
    ];

    let currentStep = 0;
    let timerId: any = null;
    const intervalDuration = 4000; // 4 seconds per step auto progression

    const setActiveStep = (stepIdx: number) => {
      currentStep = stepIdx;
      const data = stepData[stepIdx];

      // Update cards
      cards.forEach((card, idx) => {
        if (idx === stepIdx) {
          card.classList.add('active');
          const fill = card.querySelector('.progress-fill') as HTMLElement;
          if (fill) {
            fill.style.transition = 'none';
            fill.style.width = '0%';
            setTimeout(() => {
              fill.style.transition = `width ${intervalDuration}ms linear`;
              fill.style.width = '100%';
            }, 50);
          }
        } else {
          card.classList.remove('active');
          const fill = card.querySelector('.progress-fill') as HTMLElement;
          if (fill) {
            fill.style.transition = 'none';
            fill.style.width = '0%';
          }
        }
      });

      // Update Hotspot Pointer position & tooltip
      hotspot.style.left = data.left;
      hotspot.style.top = data.top;
      tooltip.innerHTML = `${data.icon} ${data.time} · ${data.title}`;

      // Update Live Header Tag
      liveTimeText.textContent = `LIVE: ${data.time} · ${data.title}`;

      // Update Sky & Sun Overlays
      if (skyOverlay) {
        skyOverlay.style.background = data.skyFilter;
      }
      if (animatedSun) {
        animatedSun.style.opacity = `${data.sunOpacity}`;
      }
    };

    const startAutoLoop = () => {
      stopAutoLoop();
      setActiveStep(currentStep);
      timerId = setInterval(() => {
        currentStep = (currentStep + 1) % stepData.length;
        setActiveStep(currentStep);
      }, intervalDuration);
    };

    const stopAutoLoop = () => {
      if (timerId) clearInterval(timerId);
    };

    // User Click Interaction on cards
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const stepIdx = parseInt(card.getAttribute('data-step') || '0', 10);
        currentStep = stepIdx;
        startAutoLoop(); // Jump to selected step and restart auto loop
      });
    });

    // Start auto loop when section scrolls into view
    const section = document.getElementById('experience-farm');
    if (section) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startAutoLoop();
          }
        });
      }, { threshold: 0.15 });
      observer.observe(section);
    } else {
      startAutoLoop();
    }
  }
}

// Initialize Application
new DairyScene();


