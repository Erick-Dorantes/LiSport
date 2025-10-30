// Toggle Dark/Light Mode
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle?.querySelector('i');

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        }
    });
}

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const closeMenu = document.getElementById('closeMenu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.add('active');
    });
}

if (closeMenu) {
    closeMenu.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
}

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (mobileMenu) mobileMenu.classList.remove('active');
        }
    });
});

// Load theme from localStorage
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeIcon) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
}

// API Base URL
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// Load Featured Products
async function loadFeaturedProducts() {
    try {
        const response = await fetch(`${API_BASE}/products/featured`);
        const products = await response.json();
        
        const productsGrid = document.getElementById('featuredProducts');
        if (productsGrid) {
            productsGrid.innerHTML = products.map(product => `
                <div class="product-card">
                    <div class="product-img" style="background-image: url('${product.image || 'https://via.placeholder.com/300'}')">
                        ${!product.image ? '<i class="fas fa-tshirt"></i>' : ''}
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <div class="product-price">$${product.price}</div>
                        <div class="product-meta">
                            <span>Tallas: ${product.sizes.join(', ')}</span>
                            <span>Disponible: ${product.stock}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading featured products:', error);
    }
}

// Load Products by Category
async function loadProductsByCategory(category = '') {
    try {
        const url = category 
            ? `${API_BASE}/products/category/${category}`
            : `${API_BASE}/products`;
        
        const response = await fetch(url);
        const products = await response.json();
        
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.innerHTML = products.map(product => `
                <div class="product-card">
                    <div class="product-img" style="background-image: url('${product.image || 'https://via.placeholder.com/300'}')">
                        ${!product.image ? '<i class="fas fa-tshirt"></i>' : ''}
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <div class="product-price">$${product.price}</div>
                        <div class="product-meta">
                            <span>Tallas: ${product.sizes.join(', ')}</span>
                            <span>Disponible: ${product.stock}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Funcionalidad para los filtros modernos
function setupModernFilters() {
    // Limpiar todos los filtros
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }

    // Ver más categorías
    const viewMoreBtn = document.getElementById('viewMoreCategories');
    if (viewMoreBtn) {
        viewMoreBtn.addEventListener('click', toggleMoreCategories);
    }

    // Aplicar filtros en tiempo real
    const filterInputs = document.querySelectorAll('input[type="checkbox"], input[type="number"]');
    filterInputs.forEach(input => {
        input.addEventListener('change', applyFilters);
    });

    // Aplicar filtro de precio
    const applyPriceBtn = document.querySelector('.apply-price');
    if (applyPriceBtn) {
        applyPriceBtn.addEventListener('click', applyPriceFilter);
    }

    // Ordenar productos
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', applySorting);
    }
}

// Limpiar todos los filtros
function clearAllFilters() {
    // Desmarcar todos los checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Limpiar inputs de precio
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    
    // Aplicar filtros (recargar productos)
    applyFilters();
    
    // Mostrar mensaje de confirmación
    showFilterMessage('Filtros limpiados correctamente');
}

// Alternar más categorías
function toggleMoreCategories() {
    const hiddenCategories = document.querySelectorAll('.filter-option:nth-child(n+4)');
    const viewMoreBtn = document.getElementById('viewMoreCategories');
    
    hiddenCategories.forEach(category => {
        if (category.style.display === 'none' || !category.style.display) {
            category.style.display = 'flex';
            viewMoreBtn.textContent = 'Ver Menos';
        } else {
            category.style.display = 'none';
            viewMoreBtn.textContent = 'Ver Más';
        }
    });
}

// Aplicar filtros
function applyFilters() {
    const selectedCategories = getSelectedValues('category');
    const selectedStyles = getSelectedValues('style');
    const selectedSizes = getSelectedValues('size');
    
    // Aquí iría la lógica para filtrar los productos
    console.log('Filtros aplicados:', {
        categories: selectedCategories,
        styles: selectedStyles,
        sizes: selectedSizes
    });
    
    // Actualizar contador de resultados
    updateResultsCount();
}

// Aplicar filtro de precio
function applyPriceFilter() {
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;
    
    if (minPrice || maxPrice) {
        console.log('Filtro de precio aplicado:', { minPrice, maxPrice });
        applyFilters();
        showFilterMessage('Filtro de precio aplicado');
    }
}

// Aplicar ordenamiento
function applySorting() {
    const sortBy = document.getElementById('sortSelect').value;
    console.log('Ordenar por:', sortBy);
    
    // Aquí iría la lógica para ordenar los productos
    // applyFilters(); // Recargar productos con nuevo orden
}

// Obtener valores seleccionados de un grupo de checkboxes
function getSelectedValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

// Actualizar contador de resultados
function updateResultsCount() {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        // En una implementación real, esto vendría del servidor
        const randomCount = Math.floor(Math.random() * 50) + 1;
        resultsCount.textContent = `${randomCount} productos encontrados`;
    }
}

// Mostrar mensaje de filtro
function showFilterMessage(message) {
    // Crear elemento de mensaje temporal
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        font-weight: 600;
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;
    messageEl.textContent = message;
    
    document.body.appendChild(messageEl);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

// Inicializar filtros cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.filters-section')) {
        setupModernFilters();
        updateResultsCount();
    }
});
// Funcionalidad para los filtros modernos (actualizada)
function setupModernFilters() {
    // Limpiar todos los filtros
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }

    // Ver más categorías
    const viewMoreBtn = document.getElementById('viewMoreCategories');
    if (viewMoreBtn) {
        viewMoreBtn.addEventListener('click', toggleMoreCategories);
    }

    // Aplicar filtros en tiempo real
    const filterInputs = document.querySelectorAll('input[type="checkbox"], input[type="number"]');
    filterInputs.forEach(input => {
        input.addEventListener('change', applyFilters);
    });

    // Aplicar filtro de precio
    const applyPriceBtn = document.querySelector('.apply-price');
    if (applyPriceBtn) {
        applyPriceBtn.addEventListener('click', applyPriceFilter);
    }

    // Ordenar productos
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', applySorting);
    }

    // Configurar búsqueda
    setupSearchFunctionality();
}

// Configurar funcionalidad de búsqueda
function setupSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    const searchInputMobile = document.getElementById('searchInputMobile');
    const searchClear = document.getElementById('searchClear');
    const searchClearMobile = document.getElementById('searchClearMobile');

    // Búsqueda en desktop
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('focus', showSearchSuggestions);
        searchInput.addEventListener('keydown', handleSearchKeydown);
    }

    // Búsqueda en móvil
    if (searchInputMobile) {
        searchInputMobile.addEventListener('input', handleSearchInput);
        searchInputMobile.addEventListener('focus', showSearchSuggestions);
        searchInputMobile.addEventListener('keydown', handleSearchKeydown);
    }

    // Botones de limpiar búsqueda
    if (searchClear) {
        searchClear.addEventListener('click', clearSearch);
    }
    if (searchClearMobile) {
        searchClearMobile.addEventListener('click', clearSearch);
    }

    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', closeSearchSuggestions);
}

// Manejar entrada de búsqueda
function handleSearchInput(e) {
    const searchTerm = e.target.value.trim();
    const searchClear = e.target.parentElement.querySelector('.search-clear');
    
    // Mostrar/ocultar botón de limpiar
    if (searchClear) {
        if (searchTerm.length > 0) {
            searchClear.classList.add('show');
            e.target.parentElement.classList.add('search-active');
        } else {
            searchClear.classList.remove('show');
            e.target.parentElement.classList.remove('search-active');
        }
    }
    
    // Aplicar búsqueda después de un delay (debounce)
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
        performSearch(searchTerm);
    }, 300);
    
    // Mostrar sugerencias si hay texto
    if (searchTerm.length > 0) {
        showSearchSuggestions(e);
    } else {
        hideSearchSuggestions();
    }
}

// Realizar búsqueda
function performSearch(searchTerm) {
    if (searchTerm.length === 0) {
        // Si no hay término de búsqueda, mostrar todos los productos
        applyFilters();
        hideSearchResultsInfo();
        return;
    }
    
    // Mostrar estado de carga
    const searchBoxes = document.querySelectorAll('.search-box');
    searchBoxes.forEach(box => box.classList.add('search-loading'));
    
    // Simular búsqueda (en una implementación real, esto haría una petición al servidor)
    setTimeout(() => {
        searchBoxes.forEach(box => box.classList.remove('search-loading'));
        
        // Aplicar filtros incluyendo la búsqueda
        applyFiltersWithSearch(searchTerm);
        
        // Mostrar información de resultados de búsqueda
        showSearchResultsInfo(searchTerm);
        
        // Ocultar sugerencias
        hideSearchSuggestions();
    }, 500);
}

// Aplicar filtros incluyendo búsqueda
function applyFiltersWithSearch(searchTerm) {
    const selectedCategories = getSelectedValues('category');
    const selectedStyles = getSelectedValues('style');
    const selectedSizes = getSelectedValues('size');
    
    console.log('Búsqueda y filtros aplicados:', {
        searchTerm,
        categories: selectedCategories,
        styles: selectedStyles,
        sizes: selectedSizes
    });
    
    // Aquí iría la lógica real para filtrar y buscar productos
    // Por ahora simulamos resultados
    updateResultsCount(searchTerm);
}

// Mostrar sugerencias de búsqueda
function showSearchSuggestions(e) {
    const searchTerm = e.target.value.trim();
    
    if (searchTerm.length === 0) {
        hideSearchSuggestions();
        return;
    }
    
    // Crear o obtener contenedor de sugerencias
    let suggestionsContainer = e.target.parentElement.querySelector('.search-suggestions');
    if (!suggestionsContainer) {
        suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'search-suggestions';
        e.target.parentElement.appendChild(suggestionsContainer);
    }
    
    // Generar sugerencias basadas en el término de búsqueda
    const suggestions = generateSearchSuggestions(searchTerm);
    
    if (suggestions.length > 0) {
        suggestionsContainer.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item" data-suggestion="${suggestion}">
                <i class="fas fa-search" style="margin-right: 8px; font-size: 0.9rem;"></i>
                ${suggestion}
            </div>
        `).join('');
        
        suggestionsContainer.classList.add('show');
        
        // Agregar event listeners a las sugerencias
        const suggestionItems = suggestionsContainer.querySelectorAll('.suggestion-item');
        suggestionItems.forEach(item => {
            item.addEventListener('click', () => {
                e.target.value = item.getAttribute('data-suggestion');
                performSearch(item.getAttribute('data-suggestion'));
                hideSearchSuggestions();
            });
            
            item.addEventListener('mouseenter', () => {
                suggestionItems.forEach(i => i.classList.remove('highlighted'));
                item.classList.add('highlighted');
            });
        });
    } else {
        hideSearchSuggestions();
    }
}

// Generar sugerencias de búsqueda
function generateSearchSuggestions(searchTerm) {
    const allSuggestions = [
        'Leggings deportivos',
        'Tops de compresión',
        'Conjuntos deportivos',
        'Enterizos de fitness',
        'Sudaderas con capucha',
        'Calcetas deportivas',
        'Ropa deportiva rosa',
        'Leggings negros',
        'Tops deportivos',
        'Conjuntos elegantes'
    ];
    
    return allSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5); // Máximo 5 sugerencias
}

// Ocultar sugerencias
function hideSearchSuggestions() {
    document.querySelectorAll('.search-suggestions').forEach(container => {
        container.classList.remove('show');
    });
}

// Cerrar sugerencias al hacer clic fuera
function closeSearchSuggestions(e) {
    if (!e.target.closest('.search-box')) {
        hideSearchSuggestions();
    }
}

// Manejar teclado en búsqueda
function handleSearchKeydown(e) {
    const suggestionsContainer = e.target.parentElement.querySelector('.search-suggestions');
    const highlightedSuggestion = suggestionsContainer?.querySelector('.suggestion-item.highlighted');
    const allSuggestions = suggestionsContainer?.querySelectorAll('.suggestion-item');
    
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (allSuggestions && allSuggestions.length > 0) {
            if (!highlightedSuggestion) {
                allSuggestions[0].classList.add('highlighted');
            } else {
                const nextIndex = Array.from(allSuggestions).indexOf(highlightedSuggestion) + 1;
                if (nextIndex < allSuggestions.length) {
                    highlightedSuggestion.classList.remove('highlighted');
                    allSuggestions[nextIndex].classList.add('highlighted');
                }
            }
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (highlightedSuggestion) {
            const prevIndex = Array.from(allSuggestions).indexOf(highlightedSuggestion) - 1;
            if (prevIndex >= 0) {
                highlightedSuggestion.classList.remove('highlighted');
                allSuggestions[prevIndex].classList.add('highlighted');
            }
        }
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedSuggestion) {
            e.target.value = highlightedSuggestion.getAttribute('data-suggestion');
            performSearch(highlightedSuggestion.getAttribute('data-suggestion'));
            hideSearchSuggestions();
        } else {
            performSearch(e.target.value.trim());
        }
    } else if (e.key === 'Escape') {
        hideSearchSuggestions();
    }
}

// Limpiar búsqueda
function clearSearch() {
    const searchInputs = document.querySelectorAll('.search-input');
    const searchClears = document.querySelectorAll('.search-clear');
    
    searchInputs.forEach(input => {
        input.value = '';
        input.parentElement.classList.remove('search-active');
    });
    
    searchClears.forEach(clear => {
        clear.classList.remove('show');
    });
    
    performSearch('');
    hideSearchSuggestions();
    hideSearchResultsInfo();
}

// Mostrar información de resultados de búsqueda
function showSearchResultsInfo(searchTerm) {
    let resultsInfo = document.querySelector('.search-results-info');
    
    if (!resultsInfo) {
        resultsInfo = document.createElement('div');
        resultsInfo.className = 'search-results-info';
        
        const productsMain = document.querySelector('.products-main');
        const productsGrid = document.getElementById('productsGrid');
        productsMain.insertBefore(resultsInfo, productsGrid);
    }
    
    resultsInfo.innerHTML = `
        <div>
            <strong>Resultados de búsqueda para:</strong>
            <span class="search-term">"${searchTerm}"</span>
        </div>
        <button class="clear-search" onclick="clearSearch()">
            <i class="fas fa-times" style="margin-right: 5px;"></i>
            Limpiar búsqueda
        </button>
    `;
}

// Ocultar información de resultados de búsqueda
function hideSearchResultsInfo() {
    const resultsInfo = document.querySelector('.search-results-info');
    if (resultsInfo) {
        resultsInfo.remove();
    }
}

// Actualizar contador de resultados (actualizada)
function updateResultsCount(searchTerm = '') {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        // En una implementación real, esto vendría del servidor
        const baseCount = searchTerm ? Math.floor(Math.random() * 20) + 1 : Math.floor(Math.random() * 50) + 1;
        resultsCount.textContent = `${baseCount} productos encontrados${searchTerm ? ` para "${searchTerm}"` : ''}`;
    }
}

function applyFilters() {
    // This would typically make an API call with filter parameters
    // For now, we'll just reload the products
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    loadProductsByCategory(category);
}

// Initialize based on current page
document.addEventListener('DOMContentLoaded', function() {
    // Load featured products on home page
    if (document.getElementById('featuredProducts')) {
        loadFeaturedProducts();
    }
    
    // Load category products on categories page
    if (document.getElementById('productsGrid')) {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        loadProductsByCategory(category);
        setupFilters();
    }
    
    // Handle category card clicks
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            window.location.href = `categories.html?category=${category}`;
        });
    });
});
// Handle category navigation clicks
function setupCategoryNavigation() {
    document.querySelectorAll('.category-nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const category = this.dataset.category;
            window.location.href = `categories.html?category=${category}`;
        });
    });
}

// Update category titles based on URL parameters
function updateCategoryTitle() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category && document.getElementById('categoryTitle')) {
        const categoryNames = {
            'leggins': 'LEGGINGS',
            'tops': 'TOPS DEPORTIVOS',
            'calcetas': 'CALCETAS',
            'sweaters': 'SUDADERAS',
            'conjuntos': 'CONJUNTOS',
            'enterizos': 'ENTERIZOS'
        };
        
        document.getElementById('categoryTitle').textContent = categoryNames[category] || 'PRODUCTOS';
    }
}

// Initialize enhanced functionality
document.addEventListener('DOMContentLoaded', function() {
    // Existing initialization code...
    
    // New initializations
    setupCategoryNavigation();
    updateCategoryTitle();
    
    // Load featured products on home page
    if (document.getElementById('featuredProducts')) {
        loadFeaturedProducts();
    }
    
    // Load category products on categories page
    if (document.getElementById('productsGrid')) {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        loadProductsByCategory(category);
        setupFilters();
    }
});
const heroSection = document.querySelector('.hero');

const heroImages = [
    "images/Portada.png"

];

let currentImage = 0;

function changeHeroBackground() {
    currentImage = (currentImage + 1) % heroImages.length;
    heroSection.style.backgroundImage = `
        linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
        url('${heroImages[currentImage]}')
    `;
}

// Imagen inicial
changeHeroBackground();

// Cambia cada 5 segundos
setInterval(changeHeroBackground, 5000);
