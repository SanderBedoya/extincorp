// ========== CATÁLOGO INTERACTIVO ==========
/*
  Funcionalidades:
  1. Búsqueda por nombre y descripción (al hacer click)
  2. Filtrado por categoría (dropdown)
  3. Ordenamiento por nombre (A-Z, Z-A)
  4. Limpieza de filtros
  5. Persistencia en URL
  6. Contador de resultados
*/

// Configuración - CAMBIAR NOMBRE DE VARIABLE
const CATALOG_CONFIG = {
  searchDebounce: 300, // ms para debounce de búsqueda
  persistInURL: true, // Persistir filtros en URL
  animationDuration: 300 // ms para animaciones
};

// Estado global
let currentCatalogState = {
  searchTerm: '',
  category: 'all',
  sort: {} // { category: sortType }
};

// Elementos DOM
const catalogElements = {
  searchInput: null,
  searchButton: null,
  categoryFilter: null,
  clearFiltersBtn: null,
  resultsInfo: null,
  resultsCount: null,
  totalCount: null,
  noResults: null,
  resetSearchBtn: null,
  categories: [],
  products: []
};

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
  initializeCatalog();
});

function initializeCatalog() {
  // Guardar referencias DOM
  cacheDOMElements();
  
  // Configurar event listeners
  setupEventListeners();
  
  // Cargar estado desde URL si está persistido
  loadStateFromURL();
  
  // Contar productos totales
  updateTotalCount();
  
  // Aplicar estado inicial
  applyCurrentState();

  optimizeImages();
}

function cacheDOMElements() {
  catalogElements.searchInput = document.getElementById('catalogSearch');
  catalogElements.searchButton = document.getElementById('searchButton');
  catalogElements.categoryFilter = document.getElementById('categoryFilter');
  catalogElements.clearFiltersBtn = document.getElementById('clearFilters');
  catalogElements.resultsInfo = document.getElementById('resultsInfo');
  catalogElements.resultsCount = document.getElementById('resultsCount');
  catalogElements.totalCount = document.getElementById('totalCount');
  catalogElements.noResults = document.getElementById('noResults');
  catalogElements.resetSearchBtn = document.getElementById('resetSearch');
  
  // Obtener todas las categorías y productos
  catalogElements.categories = Array.from(document.querySelectorAll('.category'));
  catalogElements.products = Array.from(document.querySelectorAll('.product-card'));
}

function setupEventListeners() {
  // Búsqueda al hacer click
  catalogElements.searchButton.addEventListener('click', handleSearch);
  
  // Búsqueda al presionar Enter
  catalogElements.searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });
  
  // Filtro por categoría
  catalogElements.categoryFilter.addEventListener('change', handleCategoryFilter);
  
  // Limpiar filtros
  catalogElements.clearFiltersBtn.addEventListener('click', clearAllFilters);
  catalogElements.resetSearchBtn.addEventListener('click', clearAllFilters);
  
  // Ordenamiento por categoría
  document.querySelectorAll('.sort-dropdown').forEach(dropdown => {
    dropdown.addEventListener('change', handleSorting);
  });
}

// ========== MANEJO DE BÚSQUEDA ==========
function handleSearch() {
  const searchTerm = catalogElements.searchInput.value.trim().toLowerCase();
  currentCatalogState.searchTerm = searchTerm;
  
  applyCurrentState();
  updateURLState();
}

// ========== MANEJO DE FILTROS ==========
function handleCategoryFilter() {
  const category = catalogElements.categoryFilter.value;
  currentCatalogState.category = category;
  
  applyCurrentState();
  updateURLState();
}

function clearAllFilters() {
  // Resetear estado
  currentCatalogState = {
    searchTerm: '',
    category: 'all',
    sort: {}
  };
  
  // Resetear UI
  catalogElements.searchInput.value = '';
  catalogElements.categoryFilter.value = 'all';
  
  // Resetear ordenamiento
  document.querySelectorAll('.sort-dropdown').forEach(dropdown => {
    dropdown.value = 'original';
  });
  
  applyCurrentState();
  updateURLState();
}

// ========== MANEJO DE ORDENAMIENTO ==========
function handleSorting(event) {
  const dropdown = event.target;
  const category = dropdown.dataset.category;
  const sortType = dropdown.value;
  
  // Guardar preferencia de ordenamiento
  currentCatalogState.sort[category] = sortType;
  
  applySortingToCategory(category);
  updateURLState();
}

function applySortingToCategory(category) {
  const sortType = currentCatalogState.sort[category] || 'original';
  const categoryElement = document.getElementById(`category-${category}`);
  
  if (!categoryElement) return;
  
  const products = Array.from(categoryElement.querySelectorAll('.product-card:not(.hidden)'));
  
  if (sortType === 'original') {
    // Restaurar orden original
    const container = categoryElement.querySelector('.category-grid');
    products.sort((a, b) => {
      return Array.from(container.children).indexOf(a) - Array.from(container.children).indexOf(b);
    });
  } else if (sortType === 'name-asc') {
    // Orden A-Z
    products.sort((a, b) => {
      const nameA = a.dataset.name.toLowerCase();
      const nameB = b.dataset.name.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  } else if (sortType === 'name-desc') {
    // Orden Z-A
    products.sort((a, b) => {
      const nameA = a.dataset.name.toLowerCase();
      const nameB = b.dataset.name.toLowerCase();
      return nameB.localeCompare(nameA);
    });
  }
  
  // Reordenar productos en el DOM
  const container = categoryElement.querySelector('.category-grid');
  products.forEach(product => container.appendChild(product));
}

// ========== APLICACIÓN DE FILTROS ==========
function applyCurrentState() {
  let visibleProductsCount = 0;
  
  catalogElements.products.forEach(product => {
    const matchesSearch = matchesSearchTerm(product);
    const matchesCategory = matchesCategoryFilter(product);
    
    if (matchesSearch && matchesCategory) {
      product.classList.remove('hidden');
      visibleProductsCount++;
    } else {
      product.classList.add('hidden');
    }
  });
  
  // Mostrar/ocultar categorías
  catalogElements.categories.forEach(category => {
    const categoryName = category.dataset.category;
    const hasVisibleProducts = category.querySelectorAll('.product-card:not(.hidden)').length > 0;
    
    if (currentCatalogState.category === 'all' || currentCatalogState.category === categoryName) {
      category.classList.remove('hidden');
      // Aplicar ordenamiento si hay productos visibles
      if (hasVisibleProducts) {
        applySortingToCategory(categoryName);
      }
    } else {
      category.classList.add('hidden');
    }
  });
  
  // Actualizar contador
  updateResultsCount(visibleProductsCount);
  
  // Mostrar/ocultar mensaje de no resultados
  toggleNoResultsMessage(visibleProductsCount === 0);
}

function matchesSearchTerm(product) {
  if (!currentCatalogState.searchTerm) return true;
  
  const searchText = currentCatalogState.searchTerm.toLowerCase();
  const productName = product.dataset.name.toLowerCase();
  const productDescription = product.dataset.description.toLowerCase();
  
  return productName.includes(searchText) || productDescription.includes(searchText);
}

function matchesCategoryFilter(product) {
  if (currentCatalogState.category === 'all') return true;
  return product.dataset.category === currentCatalogState.category;
}

// ========== ACTUALIZACIÓN DE UI ==========
function updateResultsCount(visibleCount) {
  catalogElements.resultsCount.textContent = visibleCount;
  catalogElements.resultsInfo.style.display = 'block';
}

function updateTotalCount() {
  catalogElements.totalCount.textContent = catalogElements.products.length;
}

function toggleNoResultsMessage(show) {
  catalogElements.noResults.style.display = show ? 'block' : 'none';
  catalogElements.resultsInfo.style.display = show ? 'none' : 'block';
}

// ========== PERSISTENCIA EN URL ==========
function updateURLState() {
  if (!CATALOG_CONFIG.persistInURL) return;
  
  const params = new URLSearchParams();
  
  if (currentCatalogState.searchTerm) {
    params.set('search', currentCatalogState.searchTerm);
  }
  
  if (currentCatalogState.category !== 'all') {
    params.set('category', currentCatalogState.category);
  }
  
  if (Object.keys(currentCatalogState.sort).length > 0) {
    params.set('sort', JSON.stringify(currentCatalogState.sort));
  }
  
  const newURL = params.toString() ? `${window.location.pathname}?${params}` : window.location.pathname;
  window.history.replaceState({}, '', newURL);
}

function loadStateFromURL() {
  if (!CATALOG_CONFIG.persistInURL) return;
  
  const params = new URLSearchParams(window.location.search);
  
  // Cargar término de búsqueda
  if (params.has('search')) {
    currentCatalogState.searchTerm = params.get('search');
    catalogElements.searchInput.value = currentCatalogState.searchTerm;
  }
  
  // Cargar categoría
  if (params.has('category')) {
    currentCatalogState.category = params.get('category');
    catalogElements.categoryFilter.value = currentCatalogState.category;
  }
  
  // Cargar ordenamiento
  if (params.has('sort')) {
    try {
      currentCatalogState.sort = JSON.parse(params.get('sort'));
      
      // Aplicar ordenamiento guardado a los dropdowns
      Object.entries(currentCatalogState.sort).forEach(([category, sortType]) => {
        const dropdown = document.querySelector(`.sort-dropdown[data-category="${category}"]`);
        if (dropdown) {
          dropdown.value = sortType;
        }
      });
    } catch (error) {
      console.warn('Error parsing sort state:', error);
      currentCatalogState.sort = {};
    }
  }
}

// ========== UTILIDADES ==========
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ========== EXPOSICIÓN PÚBLICA ==========
window.catalogAPI = {
  search: function(term) {
    catalogElements.searchInput.value = term;
    currentCatalogState.searchTerm = term;
    applyCurrentState();
    updateURLState();
  },
  
  filterByCategory: function(category) {
    catalogElements.categoryFilter.value = category;
    currentCatalogState.category = category;
    applyCurrentState();
    updateURLState();
  },
  
  clearFilters: clearAllFilters,
  
  getState: function() {
    return { ...currentCatalogState };
  }
};

function optimizeImages() {
  const images = document.querySelectorAll('.product-image img');
  
  images.forEach(img => {
    // Agregar clase loaded cuando la imagen se carga
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', function() {
        this.classList.add('loaded');
      });
      
      img.addEventListener('error', function() {
        // Manejar error de carga de imagen
        this.style.display = 'none';
      });
    }
  });
}