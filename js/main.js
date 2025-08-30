// main.js - Funcionalidades principales del sitio

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar todas las funcionalidades
  initLoader();
  initNavigation();
  initWhatsApp();
  initScrollToTop();
  initNewsletter();
  initAnalytics();
});

// ========== LOADER GLOBAL ==========
function initLoader() {
  const loader = document.getElementById('globalLoader');
  
  // Ocultar loader cuando la página esté completamente cargada
  window.addEventListener('load', function() {
    setTimeout(function() {
      loader.classList.add('loader--hidden');
    }, 500); // Pequeño delay para suavizar la transición
  });
  
  // Backup: Ocultar loader después de 5 segundos máximo
  setTimeout(function() {
    loader.classList.add('loader--hidden');
  }, 5000);
}

// ========== NAVEGACIÓN MOBILE ==========
function initNavigation() {
  const menuToggle = document.getElementById('menuToggle');
  const menuClose = document.getElementById('menuClose');
  const mobileMenu = document.getElementById('mobileMenu');
  
  // Abrir menú mobile
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      mobileMenu.classList.add('mobile-menu--open');
      document.body.style.overflow = 'hidden'; // Prevenir scroll
    });
  }
  
  // Cerrar menú mobile
  if (menuClose) {
    menuClose.addEventListener('click', function() {
      mobileMenu.classList.remove('mobile-menu--open');
      document.body.style.overflow = ''; // Restaurar scroll
    });
  }
  
  // Cerrar menú al hacer clic fuera
  mobileMenu.addEventListener('click', function(e) {
    if (e.target === mobileMenu) {
      mobileMenu.classList.remove('mobile-menu--open');
      document.body.style.overflow = '';
    }
  });
  
  // Cerrar menú al hacer clic en un enlace
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', function() {
      mobileMenu.classList.remove('mobile-menu--open');
      document.body.style.overflow = '';
    });
  });
}

// ========== WHATSAPP MODAL ==========
function initWhatsApp() {
  const whatsappButton = document.getElementById('whatsappButton');
  const whatsappModal = document.getElementById('whatsappModal');
  const closeWhatsappModal = document.getElementById('closeWhatsappModal');
  const sendWhatsapp = document.getElementById('sendWhatsapp');
  const whatsappMessage = document.getElementById('whatsappMessage');
  
  // Abrir modal de WhatsApp
  if (whatsappButton) {
    whatsappButton.addEventListener('click', function() {
      whatsappModal.classList.add('modal--open');
      document.body.style.overflow = 'hidden'; // Prevenir scroll
      
      // Enfocar el textarea después de una pequeña pausa
      setTimeout(function() {
        if (whatsappMessage) whatsappMessage.focus();
      }, 100);
    });
  }
  
  // Cerrar modal de WhatsApp
  if (closeWhatsappModal) {
    closeWhatsappModal.addEventListener('click', function() {
      whatsappModal.classList.remove('modal--open');
      document.body.style.overflow = ''; // Restaurar scroll
    });
  }
  
  // Cerrar modal al hacer clic fuera
  whatsappModal.addEventListener('click', function(e) {
    if (e.target === whatsappModal) {
      whatsappModal.classList.remove('modal--open');
      document.body.style.overflow = '';
    }
  });
  
  // Enviar mensaje de WhatsApp
  if (sendWhatsapp) {
    sendWhatsapp.addEventListener('click', function() {
      let message = whatsappMessage.value.trim();
      
      // Usar mensaje por defecto si no hay texto
      if (!message) {
        message = CONFIG.WHATSAPP.DEFAULT_MSG;
      }
      
      // Codificar mensaje para URL
      const encodedMessage = encodeURIComponent(message);
      
      // Crear URL de WhatsApp
      const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP.NUMBER}?text=${encodedMessage}`;
      
      // Redirigir a WhatsApp
      window.open(whatsappUrl, '_blank');
      
      // Cerrar modal
      whatsappModal.classList.remove('modal--open');
      document.body.style.overflow = '';
      
      // Limpiar textarea
      whatsappMessage.value = '';
    });
  }
  
  // Enviar mensaje al presionar Enter (pero permitir nueva línea con Shift+Enter)
  if (whatsappMessage) {
    whatsappMessage.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendWhatsapp.click();
      }
    });
  }
}

// ========== SCROLL TO TOP ==========
function initScrollToTop() {
  const topButton = document.getElementById('topButton');
  
  // Mostrar/ocultar botón based on scroll position
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      topButton.classList.add('visible');
    } else {
      topButton.classList.remove('visible');
    }
  });
  
  // Scroll to top cuando se hace clic
  if (topButton) {
    topButton.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

// ========== NEWSLETTER FORM ==========
function initNewsletter() {
  const newsletterForm = document.getElementById('newsletterForm');
  const formMessage = document.getElementById('formMessage');
  
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const emailInput = this.querySelector('input[type="email"]');
      const email = emailInput.value.trim();
      
      // Validación básica
      if (!email) {
        showFormMessage('Por favor ingresa un email válido', 'error');
        return;
      }
      
      // Simular envío (en producción, aquí se haría fetch a CONFIG.ENDPOINTS.NEWSLETTER)
      showFormMessage(TEXT.SENT, 'success');
      
      // Limpiar formulario después de éxito
      emailInput.value = '';
      
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        hideFormMessage();
      }, 3000);
    });
  }
  
  function showFormMessage(message, type) {
    if (!formMessage) return;
    
    formMessage.textContent = message;
    formMessage.className = `form__message form__message--${type}`;
    formMessage.style.display = 'block';
  }
  
  function hideFormMessage() {
    if (!formMessage) return;
    
    formMessage.textContent = '';
    formMessage.style.display = 'none';
  }
}

// ========== HEADER SCROLL BEHAVIOR ==========
/*
  Funcionalidad para que el menú de navegación se vuelva fijo al scrollear
  y regrese a su posición normal al volver al top
*/

class HeaderScroll {
  constructor() {
    this.header = document.querySelector('.header');
    this.nav = document.querySelector('.nav');
    this.navHeight = 0;
    this.lastScrollY = window.scrollY;
    this.isFixed = false;
    
    this.init();
  }
  
  init() {
    // Calcular altura del nav después de que se cargue la página
    window.addEventListener('load', () => {
      this.navHeight = this.nav.offsetHeight;
      this.setupScrollBehavior();
    });
  }
  
  setupScrollBehavior() {
    let ticking = false;
    
    const updateHeaderState = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > this.navHeight && !this.isFixed) {
        // Activar fixed
        this.activateFixedNav();
      } else if (currentScrollY <= this.navHeight && this.isFixed) {
        // Desactivar fixed
        this.deactivateFixedNav();
      }
      
      this.lastScrollY = currentScrollY;
      ticking = false;
    };
    
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateHeaderState);
        ticking = true;
      }
    };
    
    // Usar Intersection Observer para mejor performance
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting && window.scrollY > this.navHeight) {
            this.activateFixedNav();
          } else if (entry.isIntersecting || window.scrollY <= this.navHeight) {
            this.deactivateFixedNav();
          }
        });
      },
      { threshold: 0.1, rootMargin: `-${this.navHeight}px 0px 0px 0px` }
    );
    
    // Observar el elemento que marca el inicio del contenido principal
    const targetElement = document.getElementById('main-content') || document.querySelector('main');
    if (targetElement) {
      observer.observe(targetElement);
    }
    
    // Backup con scroll event para navegadores antiguos
    window.addEventListener('scroll', requestTick, { passive: true });
  }
  
  activateFixedNav() {
    if (this.isFixed) return;
    
    this.nav.style.position = 'fixed';
    this.nav.style.top = '0';
    this.nav.style.right = '0';
    this.nav.style.background = 'var(--color-surface)';
    this.nav.style.zIndex = '1000';
    this.nav.style.boxShadow = 'var(--shadow-md)';
    this.nav.style.transition = 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out';
    this.nav.style.transform = 'translateY(0)';
    this.nav.style.padding = '1rem';
    this.nav.style.width = '100%';
    
    // Agregar padding al body para compensar la altura fija
    document.body.style.paddingTop = `${this.navHeight}px`;
    
    this.isFixed = true;
  }
  
  deactivateFixedNav() {
    if (!this.isFixed) return;
    
    this.nav.style.position = '';
    this.nav.style.top = '';
    this.nav.style.right = '';
    this.nav.style.background = '';
    this.nav.style.zIndex = '';
    this.nav.style.boxShadow = '';
    this.nav.style.transform = '';
    this.nav.style.padding = '';
    this.nav.style.width = '';

    // Remover padding del body
    document.body.style.paddingTop = '';
    
    this.isFixed = false;
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new HeaderScroll();
});

// ========== ANALYTICS ==========
function initAnalytics() {
  // En un entorno real, aquí se inicializarían los pixels de analytics
  // usando los IDs de CONFIG.ANALYTICS
  
  // Ejemplo para Facebook Pixel:
  /*
  if (CONFIG.ANALYTICS.FB_PIXEL_ID && CONFIG.ANALYTICS.FB_PIXEL_ID !== 'DEVELOPMENT_PIXEL_ID') {
    // Código de Facebook Pixel
  }
  */
  
  // Ejemplo para Google Analytics:
  /*
  if (CONFIG.ANALYTICS.GA_ID && CONFIG.ANALYTICS.GA_ID !== 'G-DEVELOPMENT_ID') {
    // Código de Google Analytics
  }
  */
  
/*  console.log('Analytics configurados para:', {
    fbPixel: CONFIG.ANALYTICS.FB_PIXEL_ID,
    gaId: CONFIG.ANALYTICS.GA_ID
  });*/
}