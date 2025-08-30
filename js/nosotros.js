class NosotrosSection {
  constructor() {
    this.navLinks = [];
    this.currentSection = 0;
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      setTimeout(() => this.init(), 100);
    }
  }
  
  init() {
    this.setupElements();
    this.setupNavigation();
    this.setupHoverEffects();
  }
  
  setupElements() {
    this.navLinks = Array.from(document.querySelectorAll('.nav-nosotros a'));
  }
  
  setupNavigation() {
    if (this.navLinks.length > 0) {
      this.navLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.navigateToSection(index);
        });
      });
    }
  }
  
  navigateToSection(index) {
    if (index === this.currentSection) return;
    
    this.currentSection = index;
    
    const targetSection = document.getElementById(
      this.navLinks[index].getAttribute('href').substring(1)
    );
    
    if (targetSection) {
      window.scrollTo({
        top: targetSection.offsetTop,
        behavior: 'smooth'
      });
    }
    
    this.updateActiveNav();
  }
  
  updateActiveNav() {
    if (this.navLinks.length > 0) {
      this.navLinks.forEach(link => link.classList.remove('active'));
      this.navLinks[this.currentSection].classList.add('active');
    }
  }
  
  setupHoverEffects() {
    const cards = document.querySelectorAll('.nosotros-card');
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px)';
        card.style.boxShadow = 'var(--shadow-card-hover)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = 'var(--shadow-card)';
      });
    });

    const images = document.querySelectorAll('.nosotros-imagen__img, .nosotros-card__img');
    images.forEach(img => {
      img.addEventListener('mouseenter', () => {
        img.style.transform = 'scale(1.1)';
      });
      
      img.addEventListener('mouseleave', () => {
        img.style.transform = 'scale(1)';
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new NosotrosSection();
});

window.NosotrosSection = NosotrosSection;