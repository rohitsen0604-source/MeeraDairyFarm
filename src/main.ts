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
  private currentRoute: 'home' | 'about' | 'products' | 'our-farm' | 'contact' = 'home';

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

    // Routing setup
    const initialHash = window.location.hash.toLowerCase();
    if (initialHash === '#about') {
      this.currentRoute = 'about';
    } else if (initialHash === '#products') {
      this.currentRoute = 'products';
    } else if (initialHash === '#our-farm' || initialHash === '#farm') {
      this.currentRoute = 'our-farm';
    } else if (initialHash === '#contact') {
      this.currentRoute = 'contact';
    }

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#about') {
        this.navigateTo('about');
      } else if (hash === '#products') {
        this.navigateTo('products');
      } else if (hash === '#our-farm' || hash === '#farm') {
        this.navigateTo('our-farm');
      } else if (hash === '#contact') {
        this.navigateTo('contact');
      } else if (hash.startsWith('#')) {
        const target = hash.replace('#', '');
        this.navigateTo('home', target);
      } else {
        this.navigateTo('home');
      }
    });

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
        <div id="nav-brand-logo" style="display: flex; align-items: center; gap: 0.9rem; cursor: pointer;">
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
          <li><a href="#home" id="nav-link-home" class="nav-link-item ${this.currentRoute === 'home' ? 'active' : ''}" data-nav="home">Home</a></li>
          <li><a href="#about" id="nav-link-about" class="nav-link-item ${this.currentRoute === 'about' ? 'active' : ''}" data-nav="about">About</a></li>
          <li><a href="#products" id="nav-link-products" class="nav-link-item ${this.currentRoute === 'products' ? 'active' : ''}" data-nav="products">Products</a></li>
          <li><a href="#our-farm" id="nav-link-our-farm" class="nav-link-item ${this.currentRoute === 'our-farm' ? 'active' : ''}" data-nav="our-farm">Our Farm</a></li>
          <li><a href="#gallery" id="nav-link-gallery" class="nav-link-item" data-nav="gallery">Gallery</a></li>
          <li><a href="#contact" id="nav-link-contact" class="nav-link-item ${this.currentRoute === 'contact' ? 'active' : ''}" data-nav="contact">Contact</a></li>
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

      <!-- Main Content View Container -->
      <div id="main-content-view"></div>

      <!-- Global Floating WhatsApp Button (Visible on Home & About) -->
      <a href="https://wa.me/919752127710?text=Hello%20Meera%20Dairy%20Farm,%20I%20want%20to%20order%20pure%20milk%20and%20know%20more." target="_blank" class="floating-whatsapp-btn" title="Chat on WhatsApp">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.53c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z"/>
        </svg>
      </a>
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


    // Navbar Routing Event Listeners
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', (e) => {
        const nav = link.getAttribute('data-nav');
        if (nav === 'about') {
          e.preventDefault();
          window.location.hash = '#about';
          this.navigateTo('about');
        } else if (nav === 'products') {
          e.preventDefault();
          window.location.hash = '#products';
          this.navigateTo('products');
        } else if (nav === 'our-farm') {
          e.preventDefault();
          window.location.hash = '#our-farm';
          this.navigateTo('our-farm');
        } else if (nav === 'contact') {
          e.preventDefault();
          window.location.hash = '#contact';
          this.navigateTo('contact');
        } else if (nav === 'home') {
          e.preventDefault();
          window.location.hash = '#home';
          this.navigateTo('home');
        } else if (nav) {
          e.preventDefault();
          window.location.hash = '#' + nav;
          this.navigateTo('home', nav);
        }
      });
    });

    document.getElementById('nav-brand-logo')?.addEventListener('click', () => {
      window.location.hash = '#home';
      this.navigateTo('home');
    });

    // Render Initial View
    this.navigateTo(this.currentRoute);

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

  private navigateTo(route: 'home' | 'about' | 'products' | 'our-farm' | 'contact', scrollTarget?: string): void {
    this.currentRoute = route;
    const mainView = document.getElementById('main-content-view');
    const heroBgMotion = document.getElementById('hero-bg-motion-wrapper');
    const homeLink = document.getElementById('nav-link-home');
    const aboutLink = document.getElementById('nav-link-about');
    const productsLink = document.getElementById('nav-link-products');
    const ourFarmLink = document.getElementById('nav-link-our-farm');
    const contactLink = document.getElementById('nav-link-contact');

    if (homeLink) homeLink.classList.remove('active');
    if (aboutLink) aboutLink.classList.remove('active');
    if (productsLink) productsLink.classList.remove('active');
    if (ourFarmLink) ourFarmLink.classList.remove('active');
    if (contactLink) contactLink.classList.remove('active');

    if (route === 'contact') {
      if (contactLink) contactLink.classList.add('active');
      if (this.canvas) this.canvas.style.opacity = '0';
      if (heroBgMotion) heroBgMotion.style.display = 'none';

      if (mainView) {
        mainView.innerHTML = this.renderContactPageHTML();
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.attachContactEventListeners();
      this.attachGlobalFooterEventListeners();
    } else if (route === 'our-farm') {
      if (ourFarmLink) ourFarmLink.classList.add('active');
      if (this.canvas) this.canvas.style.opacity = '0';
      if (heroBgMotion) heroBgMotion.style.display = 'none';

      if (mainView) {
        mainView.innerHTML = this.renderOurFarmPageHTML();
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.initAutomatedFarmTour();
      this.initTimelineProgressAnimation();
      this.attachGlobalFooterEventListeners();
    } else if (route === 'products') {
      if (productsLink) productsLink.classList.add('active');
      if (this.canvas) this.canvas.style.opacity = '0';
      if (heroBgMotion) heroBgMotion.style.display = 'none';

      if (mainView) {
        mainView.innerHTML = this.renderProductsPageHTML();
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.attachProductsEventListeners();
      this.attachGlobalFooterEventListeners();
    } else if (route === 'about') {
      if (aboutLink) aboutLink.classList.add('active');
      if (this.canvas) this.canvas.style.opacity = '0';
      if (heroBgMotion) heroBgMotion.style.display = 'none';

      if (mainView) {
        mainView.innerHTML = this.renderAboutPageHTML();
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Ensure background video plays immediately
      const aboutVid = document.querySelector('.about-bg-video-element') as HTMLVideoElement;
      if (aboutVid) {
        aboutVid.muted = true;
        aboutVid.play().catch(() => {});
      }

      this.attachGlobalFooterEventListeners();
    } else {
      if (homeLink) homeLink.classList.add('active');
      if (this.canvas) this.canvas.style.opacity = '1';
      if (heroBgMotion) heroBgMotion.style.display = 'block';

      if (mainView) {
        mainView.innerHTML = this.renderHomePageHTML();
      }

      // Re-init Home animations
      this.initStatsCounter();
      this.initTimelineProgressAnimation();
      this.initAutomatedFarmTour();
      this.attachProductsEventListeners();
      this.attachGlobalFooterEventListeners();

      if (scrollTarget && scrollTarget !== 'home') {
        setTimeout(() => {
          const targetEl = document.getElementById(scrollTarget);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  private renderHomePageHTML(): string {
    return `
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

        <div class="products-grid-container">
          <!-- Card 1: Shri Dugdham Cow Milk -->
          <div class="prod-card">
            <div class="prod-card-top">
              <span class="prod-cat-badge">🥛 DAIRY</span>
              <button class="prod-wishlist-btn" title="Save to wishlist" aria-label="Wishlist">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              </button>
            </div>
            <div class="prod-img-box">
              <img src="/image/milk.png" alt="Shri Dugdham Cow Milk" class="prod-img" />
              <span class="prod-tag-badge tag-best-seller">🔥 Best Seller</span>
            </div>
            <div class="prod-content">
              <h3 class="prod-name">Shri Dugdham Cow Milk</h3>
              <p class="prod-desc">
                100% pure desi cow milk — fresh from farm. Rich in calcium & protein. No preservatives. Available on order.
              </p>
            </div>
            <div class="prod-footer">
              <div class="prod-price">
                <span class="currency">₹</span><span class="amount">65</span><span class="unit">/L</span>
              </div>
              <button class="prod-cart-btn" data-product="Shri Dugdham Cow Milk" data-price="65">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                </svg>
                Add
              </button>
            </div>
          </div>

          <!-- Card 2: Paneer -->
          <div class="prod-card">
            <div class="prod-card-top">
              <span class="prod-cat-badge">🥛 DAIRY</span>
              <button class="prod-wishlist-btn" title="Save to wishlist" aria-label="Wishlist">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              </button>
            </div>
            <div class="prod-img-box">
              <img src="/image/paneer.png" alt="Paneer" class="prod-img" />
              <span class="prod-tag-badge tag-most-loved">⭐ Most Loved</span>
            </div>
            <div class="prod-content">
              <h3 class="prod-name">Paneer</h3>
              <p class="prod-desc">
                Made from pure desi cow milk. Fresh · Soft · Nutritious. High in protein & calcium. Perfect for every meal.
              </p>
            </div>
            <div class="prod-footer">
              <div class="prod-price">
                <span class="currency">₹</span><span class="amount">400</span><span class="unit">/kg</span>
              </div>
              <button class="prod-cart-btn" data-product="Paneer" data-price="400">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                </svg>
                Add
              </button>
            </div>
          </div>

          <!-- Card 3: Buttermilk (Chaach) छाछ -->
          <div class="prod-card">
            <div class="prod-card-top">
              <span class="prod-cat-badge">🥤 DRINK</span>
              <button class="prod-wishlist-btn" title="Save to wishlist" aria-label="Wishlist">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              </button>
            </div>
            <div class="prod-img-box">
              <img src="/image/buttermilk.png" alt="Buttermilk (Chaach) छाछ" class="prod-img" />
              <span class="prod-tag-badge tag-fresh-daily">✨ Fresh Daily</span>
            </div>
            <div class="prod-content">
              <h3 class="prod-name">Buttermilk (Chaach) छाछ</h3>
              <p class="prod-desc">
                Natural, refreshing & healthy. Made from pure cow milk. Great for digestion. Rich in calcium & electrolytes.
              </p>
            </div>
            <div class="prod-footer">
              <div class="prod-price">
                <span class="currency">₹</span><span class="amount">35</span><span class="unit">/L</span>
              </div>
              <div class="prod-qty-selector">
                <button class="qty-control-btn minus" aria-label="Decrease quantity">−</button>
                <span class="qty-value">1</span>
                <button class="qty-control-btn plus" aria-label="Increase quantity">+</button>
              </div>
            </div>
          </div>

          <!-- Card 4: Ghritam Shuddh Desi Ghee -->
          <div class="prod-card">
            <div class="prod-card-top">
              <span class="prod-cat-badge">🥛 DAIRY</span>
              <button class="prod-wishlist-btn" title="Save to wishlist" aria-label="Wishlist">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              </button>
            </div>
            <div class="prod-img-box">
              <img src="/image/ghee.png" alt="Ghritam Shuddh Desi Ghee" class="prod-img" />
              <span class="prod-tag-badge tag-premium">👑 Premium</span>
            </div>
            <div class="prod-content">
              <h3 class="prod-name">Ghritam Shuddh Desi Ghee</h3>
              <p class="prod-desc">
                100% pure cow ghee made by the Bilona method. Hand-churned from desi cow milk. Vedic purity in every drop. No preservatives.
              </p>
            </div>
            <div class="prod-footer">
              <div class="prod-price">
                <span class="currency">₹</span><span class="amount">2500</span><span class="unit">/kg</span>
              </div>
              <button class="prod-cart-btn" data-product="Ghritam Shuddh Desi Ghee" data-price="2500">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                </svg>
                Add
              </button>
            </div>
          </div>

          <!-- Card 5: Vermishakti Organic Fertilizer -->
          <div class="prod-card">
            <div class="prod-card-top">
              <span class="prod-cat-badge">🌿 AGRO</span>
              <button class="prod-wishlist-btn" title="Save to wishlist" aria-label="Wishlist">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              </button>
            </div>
            <div class="prod-img-box">
              <img src="/image/vermishakti.png" alt="Vermishakti Organic Fertilizer" class="prod-img" />
              <span class="prod-tag-badge tag-organic">🌱 Organic</span>
            </div>
            <div class="prod-content">
              <h3 class="prod-name">Vermishakti Organic Fertilizer</h3>
              <p class="prod-desc">
                100% organic · Cow dung + earthworm processed. Enriches soil and boosts crop health. Ideal for vegetables, grains, fruits & flowers.
              </p>
            </div>
            <div class="prod-footer">
              <div class="prod-price">
                <span class="currency">₹</span><span class="amount">100</span><span class="unit">/5kg</span>
              </div>
              <button class="prod-cart-btn" data-product="Vermishakti Organic Fertilizer" data-price="100">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                </svg>
                Add
              </button>
            </div>
          </div>

          <!-- Card 6: Cow Dung Cakes (6-Pack) -->
          <div class="prod-card">
            <div class="prod-card-top">
              <span class="prod-cat-badge">🌿 AGRO</span>
              <button class="prod-wishlist-btn" title="Save to wishlist" aria-label="Wishlist">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              </button>
            </div>
            <div class="prod-img-box">
              <img src="/image/cowdungcakes.png" alt="Cow Dung Cakes (6-Pack)" class="prod-img" />
              <span class="prod-tag-badge tag-havan">🔥 Havan Special</span>
            </div>
            <div class="prod-content">
              <h3 class="prod-name">Cow Dung Cakes (6-Pack)</h3>
              <p class="prod-desc">
                Naturally dried · Ideal for Havan & Puja. Chemical-free & sustainably farm-sourced. Traditional & eco-friendly.
              </p>
            </div>
            <div class="prod-footer">
              <div class="prod-price">
                <span class="currency">₹</span><span class="amount">25</span><span class="unit">/pack</span>
              </div>
              <button class="prod-cart-btn" data-product="Cow Dung Cakes (6-Pack)" data-price="25">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                </svg>
                Add
              </button>
            </div>
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

      ${this.renderFooterHTML()}
    `;
  }

  private renderAboutPageHTML(): string {

    return `
      <div class="about-page-view">
        <!-- Cinematic Background Video Layer with White Blur -->
        <div class="about-bg-video-wrapper">
          <video 
            src="/vedios/10041402-hd_1080_1920_24fps.mp4" 
            autoplay 
            loop 
            muted 
            playsinline 
            class="about-bg-video-element"
          ></video>
          <div class="about-bg-glass-overlay"></div>
        </div>

        <div class="about-content-wrapper">
          <!-- About Hero Heading (Screenshot 1) -->
          <div class="about-hero-header">
            <h1 class="about-hero-title">About Meera Dairy Farm</h1>
            <p class="about-hero-subtitle">A vision, one cow named Meera, and a journey of faith</p>
          </div>

          <!-- MEERA'S CORNER CARD (Screenshot 1) -->
          <div class="meeras-corner-card">
            <div class="meera-cow-col">
              <div class="meera-cow-frame">
                <img src="/image/meera_cow.jpg" alt="Meera - Our First Cow" class="meera-cow-img" />
              </div>
              <h2 class="meera-cow-name">Meera</h2>
              <p class="meera-cow-sublabel">SINCE 2016 · STILL WITH US</p>
            </div>

            <div class="meera-text-col">
              <div class="meeras-corner-badge">MEERA'S CORNER</div>
              <blockquote class="meera-quote">
                "She is not just a cow. She is the reason this farm exists, the reason your milk is pure, and the reason we wake up every morning with gratitude."
              </blockquote>
              <p class="meera-story-text">
                In 2016, when we had nothing, we brought Meera home. She gave us more than milk — she gave us direction, hope, and a name. Today, she grazes freely in our farm, loved, healthy, and cherished as the eldest member of our family. Every product you receive carries a little of her spirit in it.
              </p>
            </div>
          </div>

          <!-- WHERE IT ALL BEGAN SECTION (Screenshot 1 Exact Replica) -->
          <div class="where-began-section">
            <div class="began-story-col">
              <h2 class="began-section-title">Where It All Began</h2>
              
              <p class="began-story-p">
                It was 2016. We had no savings to fall back on, no one to guarantee the future — only a quiet, burning belief that if we worked with honesty and love, something good would grow. So we took the risk that changed our lives. We brought home one cow. We named her <strong class="green-highlight">Meera</strong>.
              </p>

              <p class="began-story-p">
                She is more than livestock to us. Those early mornings — the cold air, the uncertainty, the silent prayers — Meera stood through all of it with us. She is our first employee, our first blessing, and our first lesson in what it means to truly care for something.
              </p>

              <p class="began-story-p">
                Slowly, through sheer faith and honest work, Meera's blessings multiplied. One cow became five. Five became twenty. And today, our family stands at <strong class="green-highlight">50+ cows and growing</strong> — each with a name, each nurtured with the same love we gave Meera on that very first day.
              </p>

              <p class="began-story-p">
                From a single dream in Village Mirjapur, near Yashwant Sagar Dam Hatod, Indore, Madhya Pradesh — we now serve 1,000+ families every day. Not because we chased scale, but because we never compromised on purity. This story is still being written, one drop of milk at a time.
              </p>
            </div>

            <!-- 2x2 Stat Cards Grid (Screenshot 1 Exact Alignment) -->
            <div class="began-stats-grid">
              <div class="began-stat-card">
                <div class="began-stat-icon">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="#65a30d" stroke="#65a30d" stroke-width="0.5">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="began-stat-value">100% Organic</div>
                <p class="began-stat-label">Chemical-free farming</p>
              </div>

              <div class="began-stat-card">
                <div class="began-stat-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#65a30d">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <div class="began-stat-value">Happy Cows</div>
                <p class="began-stat-label">50+ well-cared animals</p>
              </div>

              <div class="began-stat-card">
                <div class="began-stat-icon">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#65a30d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="8" r="6"/>
                    <path d="m15.4 12.5 1.6 8.5-5-3-5 3 1.6-8.5"/>
                  </svg>
                </div>
                <div class="began-stat-value">10+ Years</div>
                <p class="began-stat-label">Experience & trust</p>
              </div>

              <div class="began-stat-card">
                <div class="began-stat-icon">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="#65a30d">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                  </svg>
                </div>
                <div class="began-stat-value">1000+ Families</div>
                <p class="began-stat-label">Served daily</p>
              </div>
            </div>
          </div>
        </div>

        ${this.renderFooterHTML()}
      </div>
    `;
  }

  private renderProductsPageHTML(): string {
    return `
      <div class="products-page-view">
        <!-- Golden-Hour Farm Pasture Background with Soft White Blur Overlay -->
        <div class="products-bg-wrapper">
          <img src="/image/Golden-Hour Dairy Farm Pasture.png" alt="Golden Hour Dairy Farm Pasture" class="products-bg-img" />
          <div class="products-bg-overlay"></div>
        </div>

        <div class="products-page-container">
          <!-- Page Header (Matching Screenshot) -->
          <div class="products-header">
            <h1 class="products-title">Our Products</h1>
            <p class="products-subtitle">
              Pure farm-fresh dairy and agro products — made with care, delivered with love.
            </p>
          </div>

          <!-- 6 Products Grid (Screenshots 1 & 2 Exact Match) -->
          <div class="products-grid-container">
            
            <!-- Card 1: Shri Dugdham Cow Milk -->
            <div class="prod-card">
              <div class="prod-card-top">
                <span class="prod-cat-badge">🥛 DAIRY</span>
                <button class="prod-wishlist-btn" title="Save to wishlist" aria-label="Wishlist">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                </button>
              </div>

              <div class="prod-img-box">
                <img src="/image/milk.png" alt="Shri Dugdham Cow Milk" class="prod-img" />
                <span class="prod-tag-badge tag-best-seller">🔥 Best Seller</span>
              </div>

              <div class="prod-content">
                <h3 class="prod-name">Shri Dugdham Cow Milk</h3>
                <p class="prod-desc">
                  100% pure desi cow milk — fresh from farm. Rich in calcium & protein. No preservatives. Available on order.
                </p>
              </div>

              <div class="prod-footer">
                <div class="prod-price">
                  <span class="currency">₹</span><span class="amount">65</span><span class="unit">/L</span>
                </div>
                <button class="prod-cart-btn" data-product="Shri Dugdham Cow Milk" data-price="65">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                  </svg>
                  Add
                </button>
              </div>
            </div>

            <!-- Card 2: Paneer -->
            <div class="prod-card">
              <div class="prod-card-top">
                <span class="prod-cat-badge">🥛 DAIRY</span>
                <button class="prod-wishlist-btn" title="Save to wishlist" aria-label="Wishlist">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                </button>
              </div>

              <div class="prod-img-box">
                <img src="/image/paneer.png" alt="Paneer" class="prod-img" />
                <span class="prod-tag-badge tag-most-loved">⭐ Most Loved</span>
              </div>

              <div class="prod-content">
                <h3 class="prod-name">Paneer</h3>
                <p class="prod-desc">
                  Made from pure desi cow milk. Fresh · Soft · Nutritious. High in protein & calcium. Perfect for every meal.
                </p>
              </div>

              <div class="prod-footer">
                <div class="prod-price">
                  <span class="currency">₹</span><span class="amount">400</span><span class="unit">/kg</span>
                </div>
                <button class="prod-cart-btn" data-product="Paneer" data-price="400">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                  </svg>
                  Add
                </button>
              </div>
            </div>

            <!-- Card 3: Buttermilk (Chaach) छाछ -->
            <div class="prod-card">
              <div class="prod-card-top">
                <span class="prod-cat-badge">🥤 DRINK</span>
                <button class="prod-wishlist-btn" title="Save to wishlist" aria-label="Wishlist">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                </button>
              </div>

              <div class="prod-img-box">
                <img src="/image/buttermilk.png" alt="Buttermilk (Chaach) छाछ" class="prod-img" />
                <span class="prod-tag-badge tag-fresh-daily">✨ Fresh Daily</span>
              </div>

              <div class="prod-content">
                <h3 class="prod-name">Buttermilk (Chaach) छाछ</h3>
                <p class="prod-desc">
                  Natural, refreshing & healthy. Made from pure cow milk. Great for digestion. Rich in calcium & electrolytes.
                </p>
              </div>

              <div class="prod-footer">
                <div class="prod-price">
                  <span class="currency">₹</span><span class="amount">35</span><span class="unit">/L</span>
                </div>
                <div class="prod-qty-selector">
                  <button class="qty-control-btn minus" aria-label="Decrease quantity">−</button>
                  <span class="qty-value">1</span>
                  <button class="qty-control-btn plus" aria-label="Increase quantity">+</button>
                </div>
              </div>
            </div>

            <!-- Card 4: Ghritam Shuddh Desi Ghee -->
            <div class="prod-card">
              <div class="prod-card-top">
                <span class="prod-cat-badge">🥛 DAIRY</span>
                <button class="prod-wishlist-btn" title="Save to wishlist" aria-label="Wishlist">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                </button>
              </div>

              <div class="prod-img-box">
                <img src="/image/ghee.png" alt="Ghritam Shuddh Desi Ghee" class="prod-img" />
                <span class="prod-tag-badge tag-premium">👑 Premium</span>
              </div>

              <div class="prod-content">
                <h3 class="prod-name">Ghritam Shuddh Desi Ghee</h3>
                <p class="prod-desc">
                  100% pure cow ghee made by the Bilona method. Hand-churned from desi cow milk. Vedic purity in every drop. No preservatives.
                </p>
              </div>

              <div class="prod-footer">
                <div class="prod-price">
                  <span class="currency">₹</span><span class="amount">2500</span><span class="unit">/kg</span>
                </div>
                <button class="prod-cart-btn" data-product="Ghritam Shuddh Desi Ghee" data-price="2500">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                  </svg>
                  Add
                </button>
              </div>
            </div>

            <!-- Card 5: Vermishakti Organic Fertilizer -->
            <div class="prod-card">
              <div class="prod-card-top">
                <span class="prod-cat-badge">🌿 AGRO</span>
                <button class="prod-wishlist-btn" title="Save to wishlist" aria-label="Wishlist">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                </button>
              </div>

              <div class="prod-img-box">
                <img src="/image/vermishakti.png" alt="Vermishakti Organic Fertilizer" class="prod-img" />
                <span class="prod-tag-badge tag-organic">🌱 Organic</span>
              </div>

              <div class="prod-content">
                <h3 class="prod-name">Vermishakti Organic Fertilizer</h3>
                <p class="prod-desc">
                  100% organic · Cow dung + earthworm processed. Enriches soil and boosts crop health. Ideal for vegetables, grains, fruits & flowers.
                </p>
              </div>

              <div class="prod-footer">
                <div class="prod-price">
                  <span class="currency">₹</span><span class="amount">100</span><span class="unit">/5kg</span>
                </div>
                <button class="prod-cart-btn" data-product="Vermishakti Organic Fertilizer" data-price="100">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                  </svg>
                  Add
                </button>
              </div>
            </div>

            <!-- Card 6: Cow Dung Cakes (6-Pack) -->
            <div class="prod-card">
              <div class="prod-card-top">
                <span class="prod-cat-badge">🌿 AGRO</span>
                <button class="prod-wishlist-btn" title="Save to wishlist" aria-label="Wishlist">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                </button>
              </div>

              <div class="prod-img-box">
                <img src="/image/cowdungcakes.png" alt="Cow Dung Cakes (6-Pack)" class="prod-img" />
                <span class="prod-tag-badge tag-havan">🔥 Havan Special</span>
              </div>

              <div class="prod-content">
                <h3 class="prod-name">Cow Dung Cakes (6-Pack)</h3>
                <p class="prod-desc">
                  Naturally dried · Ideal for Havan & Puja. Chemical-free & sustainably farm-sourced. Traditional & eco-friendly.
                </p>
              </div>

              <div class="prod-footer">
                <div class="prod-price">
                  <span class="currency">₹</span><span class="amount">25</span><span class="unit">/pack</span>
                </div>
                <button class="prod-cart-btn" data-product="Cow Dung Cakes (6-Pack)" data-price="25">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                  </svg>
                  Add
                </button>
              </div>
            </div>

          </div>

          <!-- Bottom Notice Bar (Screenshot 2 Exact Replica) -->
          <div class="products-order-notice-bar">
            <p class="order-notice-text">
              <span class="notice-icon">📦</span> All products are <strong>available on order only</strong> — we serve fresh for maximum quality.
            </p>
            <div class="order-notice-buttons">
              <a href="tel:+919752127710" class="order-call-btn primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                +91 97521 27710
              </a>
              <a href="tel:+918103289628" class="order-call-btn secondary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                +91 81032 89628
              </a>
            </div>
          </div>
        </div>

        <!-- PRODUCTS PAGE FOOTER -->
        ${this.renderFooterHTML()}
      </div>
    `;
  }

  private attachProductsEventListeners(): void {
    // Add to cart buttons
    document.querySelectorAll('.prod-cart-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.cartCount++;
        const badge = document.querySelector('.cart-badge');
        if (badge) badge.textContent = `${this.cartCount}`;
        
        const originalContent = btn.innerHTML;
        btn.innerHTML = '✓ Added';
        (btn as HTMLElement).style.background = '#15803d';

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#65a30d', '#10b981', '#eab308']
        });

        setTimeout(() => {
          btn.innerHTML = originalContent;
          (btn as HTMLElement).style.background = '';
        }, 1500);
      });
    });

    // Wishlist buttons
    document.querySelectorAll('.prod-wishlist-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
      });
    });

    // Quantity selectors
    document.querySelectorAll('.prod-qty-selector').forEach((selector) => {
      const minus = selector.querySelector('.minus');
      const plus = selector.querySelector('.plus');
      const val = selector.querySelector('.qty-value');
      let count = 1;

      minus?.addEventListener('click', () => {
        if (count > 1) {
          count--;
          if (val) val.textContent = `${count}`;
        }
      });

      plus?.addEventListener('click', () => {
        count++;
        if (val) val.textContent = `${count}`;
      });
    });

    // Footer navigation links
    document.querySelectorAll('.products-page-footer .about-nav-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        const target = link.getAttribute('data-target');
        if (target === 'about') {
          e.preventDefault();
          this.navigateTo('about');
        } else if (target === 'products') {
          e.preventDefault();
          this.navigateTo('products');
        } else if (target === 'home') {
          e.preventDefault();
          this.navigateTo('home');
        } else if (target) {
          e.preventDefault();
          this.navigateTo('home', target);
        }
      });
    });
  }

  private renderOurFarmPageHTML(): string {
    return `
      <div class="farm-page-view">
        <!-- Farm Background Image Layer with soft white blur overlay -->
        <div class="farm-page-bg-wrapper">
          <img src="/image/ourfarm.png" alt="Meera Dairy Farm Pasture" class="farm-page-bg-img" />
          <div class="farm-page-bg-overlay"></div>
        </div>

        <div class="farm-page-container">
          <!-- Page Header -->
          <div class="farm-page-header">
            <div class="farm-page-pill-badge">
              <span>🌱 100% ETHICAL & ORGANIC DAIRY FARM</span>
            </div>
            <h1 class="farm-page-title">Welcome to Our Farm</h1>
            <p class="farm-page-subtitle">
              Located in Village Mirjapur near Yashwant Sagar Dam, Indore. A sanctuary where indigenous Desi cows graze freely on lush organic pastures, breathing clean air and drinking pure aquifer water.
            </p>

            <!-- Key Farm Stats Row -->
            <div class="farm-key-stats-row">
              <div class="farm-stat-card">
                <div class="stat-card-icon">🐄</div>
                <div class="stat-card-info">
                  <span class="stat-card-num">50+</span>
                  <span class="stat-card-lbl">Desi Gir & Sahiwal Cows</span>
                </div>
              </div>
              <div class="farm-stat-card">
                <div class="stat-card-icon">🌿</div>
                <div class="stat-card-info">
                  <span class="stat-card-num">100%</span>
                  <span class="stat-card-lbl">Organic Green Fodder</span>
                </div>
              </div>
              <div class="farm-stat-card">
                <div class="stat-card-icon">🏡</div>
                <div class="stat-card-info">
                  <span class="stat-card-num">10+ Yrs</span>
                  <span class="stat-card-lbl">Ethical Dairy Journey</span>
                </div>
              </div>
              <div class="farm-stat-card">
                <div class="stat-card-icon">✨</div>
                <div class="stat-card-info">
                  <span class="stat-card-num">0%</span>
                  <span class="stat-card-lbl">Hormones or Preservatives</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 1: Virtual Farm Tour Banner & 6-Step Daily Routine -->
          <section class="interactive farm-inner-section" id="experience-farm">
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
          </section>

          <!-- Section 2: Farm Freshness Journey / Delivery Timeline -->
          <section class="interactive farm-inner-section" id="timeline">
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

          <!-- Section 3: Farm Visit Invitation Card -->
          <div class="farm-visit-invitation-card">
            <div>
              <span class="visit-tag">🌿 EXPERIENCE THE PURITY FIRSTHAND</span>
              <h3 class="visit-title">Come Visit Meera Dairy Farm</h3>
              <p class="visit-desc">
                We warmly welcome families, children, and wellness enthusiasts to our farm in Village Mirjapur. Experience open pastures, observe Vedic care, and taste milk right from the source!
              </p>
              <div class="visit-cta-buttons">
                <a href="https://wa.me/919752127710?text=Hello%20Meera%20Dairy%20Farm,%20I%20would%20like%20to%20schedule%20a%20farm%20visit." target="_blank" rel="noopener noreferrer" class="farm-cta-btn primary">
                  <span>💬 Book Farm Visit on WhatsApp</span>
                </a>
                <a href="tel:+919752127710" class="farm-cta-btn secondary">
                  <span>📞 Call +91 97521 27710</span>
                </a>
              </div>
            </div>

            <div class="visit-card-highlight">
              <div class="visit-time-box">
                <span class="time-title">📅 Visiting Schedule</span>
                <div class="time-text">Mon - Sun: 6:00 AM - 11:00 AM & 4:00 PM - 7:00 PM</div>
                <p class="time-note">
                  📍 Village Mirjapur, Near Yashwant Sagar Dam Hatod, Indore (M.P.)
                </p>
              </div>
            </div>
          </div>

        </div>

        <!-- Universal Global Site Footer -->
        ${this.renderFooterHTML()}
      </div>
    `;
  }

  private renderContactPageHTML(): string {
    return `
      <div class="contact-page-view">
        <!-- Rustic Farm Background with Soft Frosted White Blur Overlay -->
        <div class="contact-page-bg-wrapper">
          <img src="/image/89bd20a2-c890-4076-a8ca-7f7148fdb3ba.png" alt="Meera Dairy Farm Contact Us Pasture" class="contact-page-bg-img" />
          <div class="contact-page-bg-overlay"></div>
        </div>

        <div class="contact-page-container">
          <!-- Page Header (Screenshot 1) -->
          <div class="contact-header">
            <h1 class="contact-main-title">Get in Touch</h1>
            <p class="contact-subtitle">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <!-- Main 2-Column Content Grid (Form Left, Info Right) -->
          <div class="contact-grid-card">
            <!-- Left Column: Interactive Contact Form -->
            <form id="contact-form" class="contact-form-col">
              <div class="contact-input-group">
                <input type="text" id="contact-name" class="contact-input-field" placeholder="Your Name" required />
              </div>
              <div class="contact-input-group">
                <input type="email" id="contact-email" class="contact-input-field" placeholder="Your Email" required />
              </div>
              <div class="contact-input-group">
                <input type="tel" id="contact-phone" class="contact-input-field" placeholder="Your Phone" />
              </div>
              <div class="contact-input-group">
                <input type="text" id="contact-subject" class="contact-input-field" placeholder="Subject" />
              </div>
              <div class="contact-input-group">
                <textarea id="contact-message" class="contact-textarea-field" rows="6" placeholder="Your Message" required></textarea>
              </div>
              <button type="submit" id="contact-submit-btn" class="contact-submit-btn">
                <span>Send Message</span>
              </button>
            </form>

            <!-- Right Column: Contact Info Cards + CTAs -->
            <div class="contact-info-col">
              <div class="contact-info-list">
                <!-- Address -->
                <div class="contact-info-item">
                  <div class="contact-icon-box">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#65a30d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div class="contact-info-content">
                    <h3 class="contact-info-title">Address</h3>
                    <p class="contact-info-desc">
                      Meera Dairy Farm & Agro Products, Village Mirjapur, Near Yashwant Sagar Dam Hatod, Indore, Madhya Pradesh
                    </p>
                  </div>
                </div>

                <!-- Phone -->
                <div class="contact-info-item">
                  <div class="contact-icon-box">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#65a30d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div class="contact-info-content">
                    <h3 class="contact-info-title">Phone</h3>
                    <p class="contact-info-desc">
                      <a href="tel:+919752127710">+91 97521 27710</a> / <a href="tel:+918103289628">+91 81032 89628</a>
                    </p>
                  </div>
                </div>

                <!-- Email -->
                <div class="contact-info-item">
                  <div class="contact-icon-box">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#65a30d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </div>
                  <div class="contact-info-content">
                    <h3 class="contact-info-title">Email</h3>
                    <p class="contact-info-desc">
                      <a href="mailto:moo@meeradairyfarm.com">moo@meeradairyfarm.com</a><br/>
                      <a href="mailto:hello@meeradairyfarm.com">hello@meeradairyfarm.com</a>
                    </p>
                  </div>
                </div>

                <!-- Hours -->
                <div class="contact-info-item">
                  <div class="contact-icon-box">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#65a30d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div class="contact-info-content">
                    <h3 class="contact-info-title">Hours</h3>
                    <p class="contact-info-desc">
                      Mon-Sat: 5am - 8pm<br/>
                      Sun: 6am - 2pm
                    </p>
                  </div>
                </div>
              </div>

              <!-- Quick CTAs (WhatsApp & Call Now) -->
              <div class="contact-cta-block">
                <a href="https://wa.me/919752127710?text=Hello%20Meera%20Dairy%20Farm,%20I%20have%20an%20inquiry." target="_blank" rel="noopener noreferrer" class="contact-btn-whatsapp">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.53c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z"/>
                  </svg>
                  <span>Chat on WhatsApp</span>
                </a>

                <a href="tel:+919752127710" class="contact-btn-call">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <span>Call Now</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Section: Find Us at the Farm (Screenshot 2) -->
          <div class="contact-map-section">
            <div class="map-section-header">
              <h2 class="map-main-title">📍 Find Us at the Farm</h2>
              <p class="map-subtitle">Village Mirjapur, Near Yashwant Sagar Dam Hatod, Indore, Madhya Pradesh</p>
            </div>

            <div class="map-container-card">
              <iframe 
                title="Meera Dairy Farm Location Map"
                src="https://maps.google.com/maps?q=Yashwant+Sagar+Dam+Hatod+Indore+Madhya+Pradesh&t=&z=13&ie=UTF8&iwloc=&output=embed" 
                class="contact-map-iframe"
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div class="map-action-wrapper">
              <a 
                href="https://maps.google.com/?q=Village+Mirjapur+Near+Yashwant+Sagar+Dam+Hatod+Indore+Madhya+Pradesh" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="map-open-btn"
              >
                <span>📍 Open in Google Maps</span>
              </a>
            </div>
          </div>

        </div>

        <!-- Universal Global Site Footer -->
        ${this.renderFooterHTML()}
      </div>
    `;
  }

  private attachContactEventListeners(): void {
    const form = document.getElementById('contact-form') as HTMLFormElement;
    const submitBtn = document.getElementById('contact-submit-btn') as HTMLButtonElement;

    if (form && submitBtn) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const originalContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '✓ Message Sent Successfully!';
        submitBtn.style.background = '#15803d';

        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#65a30d', '#22c55e', '#f59e0b', '#10b981']
        });

        setTimeout(() => {
          form.reset();
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalContent;
          submitBtn.style.background = '';
        }, 3000);
      });
    }
  }

  private renderFooterHTML(): string {
    return `
      <footer class="global-site-footer">
        <div class="footer-grid-container">
          <!-- Brand Column -->
          <div class="footer-brand-column">
            <div class="footer-logo-row global-footer-nav" data-nav="home">
              <img src="/image/logo.jpeg" alt="Meera Dairy Farm Logo" class="footer-logo-img" />
              <div>
                <h3 class="footer-brand-title">Meera Dairy Farm</h3>
                <span class="footer-brand-sub">& Agro Products</span>
              </div>
            </div>
            <p class="footer-hindi-motto">
              "एक गाय, एक विश्वास, और एक पावन शुरुआत"
            </p>
            <p class="footer-english-motto">
              Pure, unadulterated Desi cow milk and organic farm fresh products straight from Village Mirjapur, Indore.
            </p>
            <div class="footer-social-icons">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="footer-social-btn" title="Instagram" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="footer-social-btn" title="Facebook" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://wa.me/919752127710" target="_blank" rel="noopener noreferrer" class="footer-social-btn" title="WhatsApp" aria-label="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              </a>
            </div>
          </div>

          <!-- Quick Navigation Column -->
          <div class="footer-links-column">
            <h4 class="footer-heading">Quick Links</h4>
            <ul class="footer-nav-list">
              <li><a class="footer-link-action global-footer-nav" data-nav="home">Home</a></li>
              <li><a class="footer-link-action global-footer-nav" data-nav="about">About Us</a></li>
              <li><a class="footer-link-action global-footer-nav" data-nav="products">Our Products</a></li>
              <li><a class="footer-link-action global-footer-nav" data-nav="our-farm">Our Farm</a></li>
              <li><a class="footer-link-action global-footer-nav" data-nav="contact">Contact & Visit</a></li>
            </ul>
          </div>

          <!-- Dairy & Agro Products Column -->
          <div class="footer-links-column">
            <h4 class="footer-heading">Fresh Products</h4>
            <ul class="footer-nav-list">
              <li><a class="footer-link-action global-footer-nav" data-nav="products">Shri Dugdham Cow Milk</a></li>
              <li><a class="footer-link-action global-footer-nav" data-nav="products">Fresh Paneer</a></li>
              <li><a class="footer-link-action global-footer-nav" data-nav="products">Pure Bilona Ghee</a></li>
              <li><a class="footer-link-action global-footer-nav" data-nav="products">Fresh Buttermilk (Chaach)</a></li>
              <li><a class="footer-link-action global-footer-nav" data-nav="products">Vermishakti Fertilizer</a></li>
              <li><a class="footer-link-action global-footer-nav" data-nav="products">Cow Dung Cakes (Havan)</a></li>
            </ul>
          </div>

          <!-- Contact & Farm Address Column -->
          <div class="footer-links-column">
            <h4 class="footer-heading">Farm Address</h4>
            <div class="footer-contact-item">
              <span>📍</span>
              <span>Village Mirjapur, Near Yashwant Sagar Dam Hatod, Indore, M.P. - 453111</span>
            </div>
            <div class="footer-contact-item">
              <span>📞</span>
              <div>
                <a href="tel:+919752127710">+91 97521 27710</a><br/>
                <a href="tel:+918103289628">+91 81032 89628</a>
              </div>
            </div>
            <div class="footer-contact-item">
              <span>✉️</span>
              <a href="mailto:moo@meeradairyfarm.com">moo@meeradairyfarm.com</a>
            </div>
            <div class="footer-contact-item">
              <span>⏰</span>
              <span>Open Daily: 5:00 AM - 8:00 PM</span>
            </div>
          </div>
        </div>

        <div class="footer-bottom-bar">
          <div>© 2026 Meera Dairy Farm & Agro Products. All Rights Reserved.</div>
          <div>Village Mirjapur, Indore · 100% Organic & Ethical Dairy</div>
        </div>
      </footer>
    `;
  }

  private attachGlobalFooterEventListeners(): void {
    document.querySelectorAll('.global-footer-nav').forEach((elem) => {
      elem.addEventListener('click', (e) => {
        e.preventDefault();
        const nav = elem.getAttribute('data-nav') as 'home' | 'about' | 'products' | 'our-farm' | 'contact' | null;
        const target = elem.getAttribute('data-target');
        if (nav === 'about') {
          window.location.hash = '#about';
          this.navigateTo('about');
        } else if (nav === 'products') {
          window.location.hash = '#products';
          this.navigateTo('products');
        } else if (nav === 'our-farm') {
          window.location.hash = '#our-farm';
          this.navigateTo('our-farm');
        } else if (nav === 'contact' || target === 'contact') {
          window.location.hash = '#contact';
          this.navigateTo('contact');
        } else if (nav === 'home') {
          if (target) {
            window.location.hash = '#' + target;
            this.navigateTo('home', target);
          } else {
            window.location.hash = '#home';
            this.navigateTo('home');
          }
        }
      });
    });
  }
}

// Initialize Application
new DairyScene();


