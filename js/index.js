// ========== CONFIGURACIÓN DEL SLIDER ==========
// Modificar estos valores para personalizar el comportamiento
const SLIDER_CONFIG = {
  autoPlay: true,           // true/false - Reproducción automática
  interval: 3000,           // 3000ms = 3s - Intervalo entre slides
  pauseOnHover: true,       // true/false - Pausar al hacer hover
  pauseOnInteraction: true, // true/false - Pausar al interactuar manualmente
  infinite: true,           // true/false - Loop infinito
  animationDuration: 600,   // 600ms - Duración de las animaciones
  touchThreshold: 50,       // 50px - Sensibilidad para touch swipe
  keyboardNavigation: true, // true/false - Navegación con teclado
  showProgressBar: true     // true/false - Mostrar barra de progreso
};

// Datos de los slides - MODIFICAR AQUÍ EL CONTENIDO
const SLIDES_DATA = [
  {
    id: 1,
    title: "Bienvenidos",
    description: "Bienvenido a nuestra empresa líder en soluciones industriales. Con más de 20 años de experiencia, ofrecemos calidad y innovación en cada proyecto que emprendemos junto a nuestros clientes.",
    buttonText: "Comenzar",
    buttonUrl: "default.html",
    backgroundImage: "img/heroes/hero-bg-bienvenida.jpg" // Ruta de la imagen de fondo
  },
  {
    id: 2,
    title: "Quiénes Somos",
    description: "Somos un equipo de profesionales apasionados por la excelencia industrial. Nuestra misión es proporcionar soluciones innovadoras que impulsen el crecimiento y éxito de nuestros clientes.",
    buttonText: "Conócenos",
    buttonUrl: "nosotros.html",
    backgroundImage: "img/heroes/hero-bg-nosotros.jpg"
  },
  {
    id: 3,
    title: "Productos",
    description: "Descubre nuestra amplia gama de productos industriales de alta calidad. Desde componentes básicos hasta soluciones personalizadas, tenemos todo lo que necesitas para tu proyecto.",
    buttonText: "Ver Productos",
    buttonUrl: "catalogo.html",
    backgroundImage: "img/heroes/hero-bg-catalogo.jpg"
  },
  {
    id: 4,
    title: "Servicios",
    description: "Ofrecemos servicios especializados en consultoría, mantenimiento e implementación de soluciones industriales. Nuestro enfoque personalizado garantiza resultados excepcionales.",
    buttonText: "Nuestros Servicios",
    buttonUrl: "#servicios",
    backgroundImage: "img/heroes/hero-bg-servicios.jpg"
  },
  {
    id: 5,
    title: "Marcas",
    description: "Trabajamos con las marcas más reconocidas y confiables del sector industrial. Garantizamos calidad, durabilidad y soporte técnico especializado para todos nuestros productos.",
    buttonText: "Ver Marcas",
    buttonUrl: "#marcas",
    backgroundImage: "img/heroes/hero-bg-marcas.jpg"
  }
];

// ========== VARIABLES GLOBALES ==========
let currentSlide = 0;
let autoPlayInterval;
let isPaused = false;
let touchStartX = 0;
let touchEndX = 0;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
  // Esperar a que el DOM esté completamente cargado
  setTimeout(initializeSlider, 100);
});

function initializeSlider() {
  createSliderHTML();
  setupEventListeners();
  preloadImages();
  showSlide(0);
  
  if (SLIDER_CONFIG.autoPlay) {
    startAutoPlay();
  }
}

// ========== CREACIÓN DEL HTML ==========
function createSliderHTML() {
  const mainContent = document.getElementById('main-content');
  
  if (!mainContent) {
    console.error('No se encontró el elemento #main-content');
    return;
  }
  
  const sliderHTML = `
    <section class="hero-slider" aria-label="Carrusel de presentación">
      <div class="slider-container">
        ${createSlidesHTML()}
        ${createNavigationHTML()}
        ${SLIDER_CONFIG.showProgressBar ? createProgressBarHTML() : ''}
      </div>
    </section>
  `;
  
  mainContent.innerHTML = sliderHTML;
}

function createSlidesHTML() {
  return SLIDES_DATA.map(slide => `
    <div class="slide" data-slide-id="${slide.id}" aria-hidden="true">
      <img class="slide__bg" src="${slide.backgroundImage}" alt="Fondo ${slide.title}" loading="lazy">
      <div class="slide__overlay"></div>
      <div class="slide__content">
        <div class="slide__inner">
          <div class="slide__header">
            <h2 class="slide__title">${slide.title}</h2>
            <p class="slide__description">${slide.description}</p>
          </div>
          <div class="slide__button-container">
            <a href="${slide.buttonUrl}" class="slide__button">${slide.buttonText}</a>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function createNavigationHTML() {
  return `
    <button class="slider-arrow slider-arrow--prev" aria-label="Slide anterior">←</button>
    <button class="slider-arrow slider-arrow--next" aria-label="Slide siguiente">→</button>
    <div class="slider-indicators" aria-label="Indicadores de slides">
      ${SLIDES_DATA.map((_, index) => `
        <button class="slider-indicator" data-slide="${index}" aria-label="Ir al slide ${index + 1}"></button>
      `).join('')}
    </div>
  `;
}

function createProgressBarHTML() {
  return `
    <div class="slider-progress" aria-hidden="true">
      <div class="slider-progress__bar"></div>
    </div>
  `;
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
  // Flechas de navegación
  const prevArrow = document.querySelector('.slider-arrow--prev');
  const nextArrow = document.querySelector('.slider-arrow--next');
  
  if (prevArrow) prevArrow.addEventListener('click', () => navigate('prev'));
  if (nextArrow) nextArrow.addEventListener('click', () => navigate('next'));
  
  // Indicadores
  const indicators = document.querySelectorAll('.slider-indicator');
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => goToSlide(index));
  });
  
  // Eventos de touch para móviles
  const slider = document.querySelector('.hero-slider');
  if (slider) {
    slider.addEventListener('touchstart', handleTouchStart, { passive: true });
    slider.addEventListener('touchend', handleTouchEnd, { passive: true });
  }
  
  // Eventos de teclado
  if (SLIDER_CONFIG.keyboardNavigation) {
    document.addEventListener('keydown', handleKeyDown);
  }
  
  // Pausar al hacer hover (si está configurado)
  if (SLIDER_CONFIG.pauseOnHover && slider) {
    slider.addEventListener('mouseenter', pauseAutoPlay);
    slider.addEventListener('mouseleave', resumeAutoPlay);
  }
  
  // Pausar al interactuar manualmente
  if (SLIDER_CONFIG.pauseOnInteraction) {
    const interactiveElements = document.querySelectorAll('.slider-arrow, .slider-indicator');
    interactiveElements.forEach(el => {
      el.addEventListener('click', () => {
        pauseAutoPlay();
        // Reanudar después de un tiempo si está configurado
        if (SLIDER_CONFIG.autoPlay) {
          setTimeout(resumeAutoPlay, SLIDER_CONFIG.interval * 2);
        }
      });
    });
  }
}

// ========== FUNCIONALIDADES DEL SLIDER ==========
function showSlide(index) {
  const slides = document.querySelectorAll('.slide');
  const indicators = document.querySelectorAll('.slider-indicator');
  const progressBar = document.querySelector('.slider-progress__bar');
  
  // Validar índice
  if (index < 0) {
    index = SLIDER_CONFIG.infinite ? SLIDES_DATA.length - 1 : 0;
  } else if (index >= SLIDES_DATA.length) {
    index = SLIDER_CONFIG.infinite ? 0 : SLIDES_DATA.length - 1;
  }
  
  // Ocultar slide actual
  slides.forEach(slide => {
    slide.classList.remove('active');
    slide.setAttribute('aria-hidden', 'true');
  });
  
  indicators.forEach(indicator => indicator.classList.remove('active'));
  
  // Mostrar nuevo slide
  slides[index].classList.add('active');
  slides[index].setAttribute('aria-hidden', 'false');
  indicators[index].classList.add('active');
  
  // Reiniciar barra de progreso
  if (progressBar) {
    progressBar.style.width = '0%';
  }
  
  currentSlide = index;
  
  // Disparar evento personalizado
  document.dispatchEvent(new CustomEvent('slideChanged', { 
    detail: { currentSlide: index, totalSlides: SLIDES_DATA.length }
  }));
}

function navigate(direction) {
  const newIndex = direction === 'next' ? currentSlide + 1 : currentSlide - 1;
  goToSlide(newIndex);
}

function goToSlide(index) {
  showSlide(index);
  
  // Reiniciar auto-play si estaba activo
  if (SLIDER_CONFIG.autoPlay && !isPaused) {
    restartAutoPlay();
  }
}

// ========== AUTO-PLAY ==========
function startAutoPlay() {
  if (autoPlayInterval) clearInterval(autoPlayInterval);
  
  autoPlayInterval = setInterval(() => {
    if (!isPaused) {
      navigate('next');
    }
  }, SLIDER_CONFIG.interval);
  
  // Animar barra de progreso
  const progressBar = document.querySelector('.slider-progress__bar');
  if (progressBar && SLIDER_CONFIG.showProgressBar) {
    progressBar.style.transition = `width ${SLIDER_CONFIG.interval}ms linear`;
    progressBar.style.width = '100%';
  }
}

function pauseAutoPlay() {
  isPaused = true;
  const progressBar = document.querySelector('.slider-progress__bar');
  if (progressBar) {
    progressBar.style.transition = 'none';
  }
}

function resumeAutoPlay() {
  isPaused = false;
  restartAutoPlay();
}

function restartAutoPlay() {
  if (autoPlayInterval) clearInterval(autoPlayInterval);
  startAutoPlay();
}

// ========== TOUCH EVENTS ==========
function handleTouchStart(event) {
  touchStartX = event.changedTouches[0].screenX;
}

function handleTouchEnd(event) {
  touchEndX = event.changedTouches[0].screenX;
  handleSwipe();
}

function handleSwipe() {
  const swipeThreshold = SLIDER_CONFIG.touchThreshold;
  const difference = touchStartX - touchEndX;
  
  if (Math.abs(difference) > swipeThreshold) {
    if (difference > 0) {
      navigate('next'); // Swipe izquierda
    } else {
      navigate('prev'); // Swipe derecha
    }
  }
}

// ========== KEYBOARD NAVIGATION ==========
function handleKeyDown(event) {
  if (event.key === 'ArrowRight') {
    navigate('next');
    event.preventDefault();
  } else if (event.key === 'ArrowLeft') {
    navigate('prev');
    event.preventDefault();
  } else if (event.key === ' ' || event.key === 'Spacebar') {
    // Pausar/reanudar con espacio
    isPaused = !isPaused;
    if (isPaused) {
      pauseAutoPlay();
    } else {
      resumeAutoPlay();
    }
    event.preventDefault();
  }
}

// ========== OPTIMIZACIONES ==========
function preloadImages() {
  SLIDES_DATA.forEach(slide => {
    const img = new Image();
    img.src = slide.backgroundImage;
  });
}

// ========== EVENTOS PÚBLICOS ==========
// Exponer funciones globalmente para posible uso externo
window.sliderAPI = {
  next: () => navigate('next'),
  prev: () => navigate('prev'),
  goTo: (index) => goToSlide(index),
  pause: pauseAutoPlay,
  resume: resumeAutoPlay,
  getCurrentSlide: () => currentSlide,
  getTotalSlides: () => SLIDES_DATA.length
};

// ========== CLEANUP ==========
// Limpiar intervalos cuando la página se descarga
window.addEventListener('beforeunload', () => {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
  }
});