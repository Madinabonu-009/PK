/**
 * Play Kids - Professional Landing Page
 * Modern JavaScript with ES6+ features
 * Accessibility-focused, performance-optimized
 */

'use strict';

// ========================================
// DOM Ready
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    Preloader.init();
    Header.init();
    MobileMenu.init();
    SmoothScroll.init();
    Animations.init();
    Counter.init();
    Gallery.init();
    FAQ.init();
    Testimonials.init();
    ContactForm.init();
    FloatingButtons.init();
});

// ========================================
// Preloader Module
// ========================================
const Preloader = {
    init() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;

        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('hidden');
                document.body.classList.remove('no-scroll');
                
                // Trigger initial animations
                setTimeout(() => {
                    Animations.triggerInitial();
                }, 100);
            }, 500);
        });

        // Fallback: hide preloader after 3 seconds
        setTimeout(() => {
            preloader.classList.add('hidden');
            document.body.classList.remove('no-scroll');
        }, 3000);
    }
};

// ========================================
// Header Module
// ========================================
const Header = {
    header: null,
    lastScrollY: 0,
    
    init() {
        this.header = document.getElementById('header');
        if (!this.header) return;

        this.handleScroll();
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    },

    handleScroll() {
        const scrollY = window.scrollY;
        
        // Add scrolled class
        if (scrollY > 50) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }

        // Update active nav link
        this.updateActiveLink();
        
        this.lastScrollY = scrollY;
    },

    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.header__link');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
};

// ========================================
// Mobile Menu Module
// ========================================
const MobileMenu = {
    toggle: null,
    menu: null,
    links: null,

    init() {
        this.toggle = document.querySelector('.header__mobile-toggle');
        this.menu = document.querySelector('.header__mobile-menu');
        this.links = document.querySelectorAll('.header__mobile-list a');

        if (!this.toggle || !this.menu) return;

        this.toggle.addEventListener('click', () => this.toggleMenu());
        this.links.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!this.toggle.contains(e.target) && !this.menu.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeMenu();
        });
    },

    toggleMenu() {
        const isActive = this.toggle.classList.contains('active');
        
        this.toggle.classList.toggle('active');
        this.menu.classList.toggle('active');
        this.toggle.setAttribute('aria-expanded', !isActive);
        
        // Prevent body scroll when menu is open
        document.body.classList.toggle('no-scroll', !isActive);
    },

    closeMenu() {
        this.toggle.classList.remove('active');
        this.menu.classList.remove('active');
        this.toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
    }
};

// ========================================
// Smooth Scroll Module
// ========================================
const SmoothScroll = {
    init() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();
                
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = target.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            });
        });
    }
};

// ========================================
// Scroll Animations Module
// ========================================
const Animations = {
    observer: null,

    init() {
        const elements = document.querySelectorAll('[data-animate]');
        if (!elements.length) return;

        const options = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);

        elements.forEach(el => this.observer.observe(el));
    },

    triggerInitial() {
        // Trigger animations for elements in viewport on load
        const elements = document.querySelectorAll('[data-animate]');
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('animated');
            }
        });
    }
};

// ========================================
// Counter Animation Module
// ========================================
const Counter = {
    init() {
        const counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        const options = {
            root: null,
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        counters.forEach(counter => observer.observe(counter));
    },

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'), 10);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += step;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target + '+';
            }
        };

        requestAnimationFrame(updateCounter);
    }
};

// ========================================
// Gallery Module
// ========================================
const Gallery = {
    modal: null,
    modalImage: null,
    items: null,
    currentIndex: 0,
    tabs: null,

    init() {
        this.modal = document.getElementById('galleryModal');
        this.modalImage = this.modal?.querySelector('.modal__image');
        this.items = document.querySelectorAll('.gallery__item');
        this.tabs = document.querySelectorAll('.gallery__tab');

        if (!this.modal || !this.items.length) return;

        // Tab filtering
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.filterGallery(tab));
        });

        // Open modal
        this.items.forEach((item, index) => {
            item.addEventListener('click', () => this.openModal(index));
        });

        // Close modal
        this.modal.querySelector('.modal__close')?.addEventListener('click', () => this.closeModal());
        this.modal.querySelector('.modal__backdrop')?.addEventListener('click', () => this.closeModal());

        // Navigation
        this.modal.querySelector('.modal__nav-btn--prev')?.addEventListener('click', () => this.navigate(-1));
        this.modal.querySelector('.modal__nav-btn--next')?.addEventListener('click', () => this.navigate(1));

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.modal.classList.contains('active')) return;
            
            if (e.key === 'Escape') this.closeModal();
            if (e.key === 'ArrowLeft') this.navigate(-1);
            if (e.key === 'ArrowRight') this.navigate(1);
        });
    },

    filterGallery(activeTab) {
        const filter = activeTab.getAttribute('data-filter');
        
        // Update active tab
        this.tabs.forEach(tab => tab.classList.remove('gallery__tab--active'));
        activeTab.classList.add('gallery__tab--active');

        // Filter items
        this.items.forEach(item => {
            const category = item.getAttribute('data-category');
            if (filter === 'all' || category === filter) {
                item.style.display = '';
                item.style.animation = 'fadeIn 0.3s ease';
            } else {
                item.style.display = 'none';
            }
        });
    },

    openModal(index) {
        this.currentIndex = index;
        this.updateModalContent();
        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
    },

    closeModal() {
        this.modal.classList.remove('active');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
    },

    navigate(direction) {
        const visibleItems = Array.from(this.items).filter(item => item.style.display !== 'none');
        const currentVisibleIndex = visibleItems.findIndex(item => 
            parseInt(item.getAttribute('data-index')) === this.currentIndex
        );
        
        let newIndex = currentVisibleIndex + direction;
        if (newIndex < 0) newIndex = visibleItems.length - 1;
        if (newIndex >= visibleItems.length) newIndex = 0;
        
        this.currentIndex = parseInt(visibleItems[newIndex].getAttribute('data-index'));
        this.updateModalContent();
    },

    updateModalContent() {
        const item = this.items[this.currentIndex];
        const img = item.querySelector('.gallery__img');
        
        if (img) {
            this.modalImage.innerHTML = `<img src="${img.src}" alt="${img.alt}" style="max-width: 100%; max-height: 80vh; border-radius: 12px;">`;
        } else {
            const text = item.querySelector('.gallery__placeholder-text')?.textContent || 'Rasm';
            const icon = item.querySelector('.gallery__placeholder-icon')?.textContent || '📷';
            this.modalImage.innerHTML = `<span style="font-size: 4rem;">${icon}</span><br>${text}`;
        }
    }
};

// ========================================
// FAQ Accordion Module
// ========================================
const FAQ = {
    init() {
        const items = document.querySelectorAll('.faq__item');
        if (!items.length) return;

        items.forEach(item => {
            const question = item.querySelector('.faq__question');
            
            question?.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                const expanded = question.getAttribute('aria-expanded') === 'true';
                
                // Close all other items (accordion behavior)
                items.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        otherItem.querySelector('.faq__question')?.setAttribute('aria-expanded', 'false');
                    }
                });

                // Toggle current item
                item.classList.toggle('active', !isActive);
                question.setAttribute('aria-expanded', !expanded);
            });
        });
    }
};


// ========================================
// Testimonials Slider Module
// ========================================
const Testimonials = {
    track: null,
    cards: null,
    dotsContainer: null,
    currentSlide: 0,
    slidesPerView: 1,
    autoplayInterval: null,

    init() {
        this.track = document.querySelector('.testimonials__track');
        this.cards = document.querySelectorAll('.testimonials__card');
        this.dotsContainer = document.querySelector('.testimonials__dots');
        
        if (!this.track || !this.cards.length) return;

        this.updateSlidesPerView();
        this.createDots();
        this.bindEvents();
        this.startAutoplay();

        window.addEventListener('resize', () => {
            this.updateSlidesPerView();
            this.goToSlide(0);
        });
    },

    updateSlidesPerView() {
        if (window.innerWidth >= 1024) {
            this.slidesPerView = 3;
        } else if (window.innerWidth >= 768) {
            this.slidesPerView = 2;
        } else {
            this.slidesPerView = 1;
        }
    },

    createDots() {
        if (!this.dotsContainer) return;
        
        const totalSlides = Math.ceil(this.cards.length / this.slidesPerView);
        this.dotsContainer.innerHTML = '';
        
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = `testimonials__dot${i === 0 ? ' active' : ''}`;
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotsContainer.appendChild(dot);
        }
    },

    bindEvents() {
        const prevBtn = document.querySelector('.testimonials__nav-btn--prev');
        const nextBtn = document.querySelector('.testimonials__nav-btn--next');

        prevBtn?.addEventListener('click', () => this.navigate(-1));
        nextBtn?.addEventListener('click', () => this.navigate(1));

        // Pause autoplay on hover
        this.track.addEventListener('mouseenter', () => this.stopAutoplay());
        this.track.addEventListener('mouseleave', () => this.startAutoplay());

        // Touch support
        let touchStartX = 0;
        let touchEndX = 0;

        this.track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.navigate(1);
                } else {
                    this.navigate(-1);
                }
            }
        }, { passive: true });
    },

    navigate(direction) {
        const totalSlides = Math.ceil(this.cards.length / this.slidesPerView);
        let newSlide = this.currentSlide + direction;
        
        if (newSlide < 0) newSlide = totalSlides - 1;
        if (newSlide >= totalSlides) newSlide = 0;
        
        this.goToSlide(newSlide);
    },

    goToSlide(index) {
        this.currentSlide = index;
        
        const cardWidth = this.cards[0].offsetWidth;
        const gap = 24; // var(--spacing-6)
        const offset = index * (cardWidth + gap) * this.slidesPerView;
        
        this.track.style.transform = `translateX(-${offset}px)`;
        
        // Update dots
        const dots = this.dotsContainer?.querySelectorAll('.testimonials__dot');
        dots?.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    },

    startAutoplay() {
        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => this.navigate(1), 5000);
    },

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
};

// ========================================
// Contact Form Module
// ========================================
const ContactForm = {
    form: null,
    inputs: {},
    errors: {},
    successMessage: null,

    init() {
        this.form = document.getElementById('contactForm');
        if (!this.form) return;

        this.inputs = {
            name: document.getElementById('name'),
            phone: document.getElementById('phone'),
            childAge: document.getElementById('childAge'),
            message: document.getElementById('message')
        };

        this.errors = {
            name: document.getElementById('nameError'),
            phone: document.getElementById('phoneError')
        };

        this.successMessage = document.getElementById('formSuccess');

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        this.inputs.name?.addEventListener('input', () => this.validateField('name'));
        this.inputs.phone?.addEventListener('input', () => this.validateField('phone'));

        // Phone formatting
        this.inputs.phone?.addEventListener('input', (e) => this.formatPhone(e));
    },

    async handleSubmit(e) {
        e.preventDefault();
        
        const isNameValid = this.validateField('name');
        const isPhoneValid = this.validateField('phone');

        if (isNameValid && isPhoneValid) {
            // Send to Telegram
            await this.sendToTelegram();
            this.showSuccess();
        }
    },
    
    async sendToTelegram() {
        // Backend API orqali yuborish (xavfsiz)
        const name = this.inputs.name?.value || '';
        const phone = this.inputs.phone?.value || '';
        const childAge = this.inputs.childAge?.value || 'Ko\'rsatilmagan';
        const message = this.inputs.message?.value || 'Yo\'q';
        
        try {
            const response = await fetch('/api/contact/telegram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    phone,
                    childAge,
                    message
                })
            });
            
            if (!response.ok) {
                throw new Error('Xabar yuborishda xatolik');
            }
            
            const result = await response.json();
            if (!result.ok) {
                // Telegram API error - silently fail
            }
        } catch (error) {
            // Telegram send error - silently fail
        }
    },

    validateField(field) {
        const input = this.inputs[field];
        const error = this.errors[field];
        
        if (!input || !error) return true;

        let isValid = true;
        let message = '';

        switch (field) {
            case 'name':
                if (!input.value.trim()) {
                    isValid = false;
                    message = 'Iltimos, ismingizni kiriting';
                } else if (input.value.trim().length < 2) {
                    isValid = false;
                    message = 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak';
                }
                break;

            case 'phone':
                const phoneRegex = /^[\+]?[0-9\s\-\(\)]{9,}$/;
                if (!input.value.trim()) {
                    isValid = false;
                    message = 'Iltimos, telefon raqamingizni kiriting';
                } else if (!phoneRegex.test(input.value.replace(/\s/g, ''))) {
                    isValid = false;
                    message = 'Telefon raqamini to\'g\'ri kiriting';
                }
                break;
        }

        input.classList.toggle('error', !isValid);
        error.textContent = message;

        return isValid;
    },

    formatPhone(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.startsWith('998')) {
            value = '+' + value;
        } else if (value.startsWith('8') && value.length > 1) {
            value = '+998' + value.substring(1);
        } else if (!value.startsWith('+')) {
            value = '+998' + value;
        }

        // Format: +998 XX XXX XX XX
        if (value.length > 4) {
            value = value.substring(0, 4) + ' ' + value.substring(4);
        }
        if (value.length > 7) {
            value = value.substring(0, 7) + ' ' + value.substring(7);
        }
        if (value.length > 11) {
            value = value.substring(0, 11) + ' ' + value.substring(11);
        }
        if (value.length > 14) {
            value = value.substring(0, 14) + ' ' + value.substring(14);
        }
        if (value.length > 17) {
            value = value.substring(0, 17);
        }

        e.target.value = value;
    },

    showSuccess() {
        this.successMessage?.classList.add('active');
        this.form.reset();

        // Clear errors
        Object.values(this.inputs).forEach(input => {
            input?.classList.remove('error');
        });
        Object.values(this.errors).forEach(error => {
            if (error) error.textContent = '';
        });

        // Hide success message after 5 seconds
        setTimeout(() => {
            this.successMessage?.classList.remove('active');
        }, 5000);
    }
};

// ========================================
// Floating Buttons Module
// ========================================
const FloatingButtons = {
    scrollTopBtn: null,

    init() {
        this.scrollTopBtn = document.getElementById('scrollTop');
        if (!this.scrollTopBtn) return;

        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
        this.scrollTopBtn.addEventListener('click', () => this.scrollToTop());
    },

    handleScroll() {
        if (window.scrollY > 500) {
            this.scrollTopBtn.classList.add('visible');
        } else {
            this.scrollTopBtn.classList.remove('visible');
        }
    },

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
};

// ========================================
// Utility Functions
// ========================================
const Utils = {
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// ========================================
// CSS Animation Helper
// ========================================
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// ========================================
// Performance: Lazy load images
// ========================================
if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

// ========================================
// Console Branding (only in development)
// ========================================
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log(
        '%c🌱 Play Kids',
        'font-size: 24px; font-weight: bold; color: #22C55E;'
    );
    console.log(
        '%cFarzandingiz uchun bilim va mehr maskani',
        'font-size: 14px; color: #6B7280;'
    );
    console.log(
        '%c📞 +998 94 514 09 49 | 📱 @BMM_dina09',
        'font-size: 12px; color: #9CA3AF;'
    );
}


// ========================================
// Cookie Consent Module
// ========================================
const CookieConsent = {
    init() {
        const consent = document.getElementById('cookieConsent');
        const acceptBtn = document.getElementById('acceptCookies');
        const declineBtn = document.getElementById('declineCookies');
        
        if (!consent) return;
        
        // Check if already accepted
        if (!localStorage.getItem('cookieConsent')) {
            setTimeout(() => {
                consent.classList.add('active');
            }, 2000);
        }
        
        acceptBtn?.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            consent.classList.remove('active');
            // Enable analytics
            if (typeof gtag === 'function') {
                gtag('consent', 'update', {
                    'analytics_storage': 'granted'
                });
            }
        });
        
        declineBtn?.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'declined');
            consent.classList.remove('active');
        });
    }
};

// ========================================
// Theme Toggle (Dark Mode) Module
// ========================================
const ThemeToggle = {
    init() {
        const toggles = document.querySelectorAll('.theme-toggle, #themeToggle');
        
        // Check saved preference or system preference
        const savedTheme = localStorage.getItem('theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
        
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => this.toggle());
        });
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        });
    },
    
    toggle() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
};

// ========================================
// Language Switcher Module
// ========================================
const LanguageSwitcher = {
    currentLang: 'uz',
    
    translations: {
        uz: {
            'hero.badge': 'G\'ijduvondagi eng ishonchli bog\'cha',
            'hero.slogan': 'Farzandingiz uchun bilim va mehr maskani',
            'hero.description': '2-6 yoshli bolalar uchun zamonaviy ta\'lim, xavfsiz muhit va professional tarbiyachilar.',
            'hero.stat1': 'Baxtli oila',
            'hero.stat2': 'Yillik tajriba',
            'hero.stat3': 'Professional',
            'hero.cta1': 'Bepul konsultatsiya',
            'hero.cta2': 'Virtual tur',
            'hero.trust': '127+ ota-onalar ishonchi',
            'about.badge': 'Nima uchun biz?',
            'about.title': 'Ota-onalar savollari — Bizning yechimlarimiz',
            'about.q1': 'Bolam xavfsizmi?',
            'about.a1': '24/7 videokuzatuv, kirish-chiqish nazorati, malakali xodimlar.',
            'about.q2': 'Bolam nima o\'rganadi?',
            'about.a2': 'O\'zbek va ingliz tillari, matematika, ijodiy san\'at, musiqa.',
            'about.q3': 'Ovqat sifati qanday?',
            'about.a3': 'Kuniga 4 mahal sog\'lom, uy taomi. Allergiya uchun alohida menyu.',
            'about.q4': 'Tarbiyachilar tajribalimi?',
            'about.a4': '5+ yillik tajribaga ega, sertifikatlangan mutaxassislar.',
            'teachers.badge': 'Bizning jamoa',
            'teachers.title': 'Professional va g\'amxo\'r tarbiyachilar'
        },
        ru: {
            'hero.badge': 'Самый надежный детский сад в Гиждуване',
            'hero.slogan': 'Дом знаний и заботы для вашего ребенка',
            'hero.description': 'Современное образование, безопасная среда и профессиональные воспитатели для детей 2-6 лет.',
            'hero.stat1': 'Счастливых семей',
            'hero.stat2': 'Лет опыта',
            'hero.stat3': 'Профессионалов',
            'hero.cta1': 'Бесплатная консультация',
            'hero.cta2': 'Виртуальный тур',
            'hero.trust': '127+ родителей доверяют нам',
            'about.badge': 'Почему мы?',
            'about.title': 'Вопросы родителей — Наши решения',
            'about.q1': 'Мой ребенок в безопасности?',
            'about.a1': 'Видеонаблюдение 24/7, контроль входа-выхода, квалифицированный персонал.',
            'about.q2': 'Чему научится мой ребенок?',
            'about.a2': 'Узбекский и английский языки, математика, творчество, музыка.',
            'about.q3': 'Какое качество питания?',
            'about.a3': '4-разовое здоровое домашнее питание. Отдельное меню при аллергии.',
            'about.q4': 'Опытные ли воспитатели?',
            'about.a4': 'Сертифицированные специалисты с опытом 5+ лет.',
            'teachers.badge': 'Наша команда',
            'teachers.title': 'Профессиональные и заботливые воспитатели'
        }
    },
    
    init() {
        const buttons = document.querySelectorAll('.lang-switcher__btn');
        
        // Check saved language
        const savedLang = localStorage.getItem('language') || 'uz';
        this.setLanguage(savedLang);
        
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                this.setLanguage(lang);
                
                // Update active state
                buttons.forEach(b => b.classList.remove('lang-switcher__btn--active'));
                document.querySelectorAll(`[data-lang="${lang}"]`).forEach(b => {
                    b.classList.add('lang-switcher__btn--active');
                });
            });
        });
    },
    
    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        document.documentElement.setAttribute('lang', lang);
        
        // Update all translatable elements
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (this.translations[lang] && this.translations[lang][key]) {
                el.textContent = this.translations[lang][key];
            }
        });
    }
};

// TelegramForm integrated into ContactForm module above

// ========================================
// Initialize New Modules
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    CookieConsent.init();
    ThemeToggle.init();
    LanguageSwitcher.init();
});

// ========================================
// Accessibility: Keyboard Navigation for FAQ
// ========================================
document.querySelectorAll('.faq__question').forEach(btn => {
    btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btn.click();
        }
    });
});

// ========================================
// Accessibility: Gallery Keyboard Navigation
// ========================================
document.querySelectorAll('.gallery__item').forEach(item => {
    item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            item.click();
        }
    });
});
