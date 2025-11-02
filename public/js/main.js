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

// API Base URL - CORREGIDA
const API_BASE = 'https://lisport-1.onrender.com/api';

// Load Featured Products - CORREGIDA
async function loadFeaturedProducts() {
    try {
        console.log('Cargando productos destacados...');
        const response = await fetch(`${API_BASE}/products`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // VERIFICAR que data sea un array
        let products = [];
        if (Array.isArray(data)) {
            products = data;
        } else if (data && Array.isArray(data.products)) {
            products = data.products;
        } else if (data && Array.isArray(data.data)) {
            products = data.data;
        } else if (data && typeof data === 'object') {
            // Si es un objeto único, convertirlo a array
            products = [data];
        }
        
        console.log('Productos recibidos:', products);
        
        // Filtrar productos destacados
        const featuredProducts = products.filter(product => 
            product && product.featured === true
        );
        
        console.log('Productos destacados:', featuredProducts);
        
        displayFeaturedProducts(featuredProducts);
        
    } catch (error) {
        console.error('Error loading featured products:', error);
        // Mostrar productos de ejemplo en caso de error
        displayFallbackProducts();
    }
}

// Función de respaldo para productos
function displayFallbackProducts() {
    const featuredProductsContainer = document.getElementById('featuredProducts');
    if (!featuredProductsContainer) return;
    
    featuredProductsContainer.innerHTML = `
        <div class="product-card">
            <div class="product-img" style="background-image: url('https://via.placeholder.com/300')">
                <i class="fas fa-tshirt"></i>
            </div>
            <div class="product-info">
                <h3>Producto de Ejemplo</h3>
                <p>Descripción del producto destacado</p>
                <div class="product-price">$49.99</div>
                <div class="product-meta">
                    <span>Tallas: S, M, L</span>
                    <span>Disponible: 10</span>
                </div>
            </div>
        </div>
        <div class="product-card">
            <div class="product-img" style="background-image: url('https://via.placeholder.com/300')">
                <i class="fas fa-tshirt"></i>
            </div>
            <div class="product-info">
                <h3>Otro Producto</h3>
                <p>Otro producto destacado de ejemplo</p>
                <div class="product-price">$59.99</div>
                <div class="product-meta">
                    <span>Tallas: M, L, XL</span>
                    <span>Disponible: 5</span>
                </div>
            </div>
        </div>
    `;
}

// Display Featured Products - CORREGIDA
function displayFeaturedProducts(products) {
    const featuredProductsContainer = document.getElementById('featuredProducts');
    if (!featuredProductsContainer) return;
    
    if (!products || products.length === 0) {
        featuredProductsContainer.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open"></i>
                <p>No hay productos destacados disponibles</p>
            </div>
        `;
        return;
    }
    
    featuredProductsContainer.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-img" style="background-image: url('${product.image || 'https://via.placeholder.com/300'}')">
                ${!product.image ? '<i class="fas fa-tshirt"></i>' : ''}
                ${product.featured ? '<span class="featured-badge">Destacado</span>' : ''}
            </div>
            <div class="product-info">
                <h3>${product.name || 'Producto sin nombre'}</h3>
                <p>${product.description || 'Descripción no disponible'}</p>
                <div class="product-price">$${(product.price || 0).toFixed(2)}</div>
                <div class="product-meta">
                    <span>Tallas: ${product.sizes ? (Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes) : 'N/A'}</span>
                    <span>Disponible: ${product.stock || 0}</span>
                </div>
                <button class="btn primary add-to-cart" onclick="addToCart('${product._id || product.id}')">
                    <i class="fas fa-shopping-cart"></i> Agregar al Carrito
                </button>
            </div>
        </div>
    `).join('');
}

// Load Products by Category - CORREGIDA
async function loadProductsByCategory(category = '') {
    try {
        console.log(`Cargando productos para categoría: ${category}`);
        const url = category 
            ? `${API_BASE}/products/category/${category}`
            : `${API_BASE}/products`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // VERIFICAR que data sea un array - CORRECCIÓN IMPORTANTE
        let products = [];
        if (Array.isArray(data)) {
            products = data;
        } else if (data && Array.isArray(data.products)) {
            products = data.products;
        } else if (data && Array.isArray(data.data)) {
            products = data.data;
        } else if (data && typeof data === 'object') {
            // Si es un objeto único, convertirlo a array
            products = [data];
        }
        
        console.log(`Productos para ${category}:`, products);
        
        displayProducts(products, category);
        
    } catch (error) {
        console.error('Error loading products:', error);
        displayFallbackProductsInCategory();
    }
}

// Display Products - NUEVA FUNCIÓN
function displayProducts(products, category = '') {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    if (!products || products.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open"></i>
                <p>No hay productos disponibles${category ? ` en ${category}` : ''}</p>
            </div>
        `;
        return;
    }
    
    // Asegurarse de que products sea un array antes de usar map
    if (!Array.isArray(products)) {
        console.error('Products no es un array:', products);
        products = [];
    }
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-img" style="background-image: url('${product.image || 'https://via.placeholder.com/300'}')">
                ${!product.image ? '<i class="fas fa-tshirt"></i>' : ''}
                ${product.featured ? '<span class="featured-badge">Destacado</span>' : ''}
            </div>
            <div class="product-info">
                <h3>${product.name || 'Producto sin nombre'}</h3>
                <p>${product.description || 'Descripción no disponible'}</p>
                <div class="product-price">$${(product.price || 0).toFixed(2)}</div>
                <div class="product-meta">
                    <span>Tallas: ${product.sizes ? (Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes) : 'N/A'}</span>
                    <span>Disponible: ${product.stock || 0}</span>
                </div>
                <button class="btn primary add-to-cart" onclick="addToCart('${product._id || product.id}')">
                    <i class="fas fa-shopping-cart"></i> Agregar al Carrito
                </button>
            </div>
        </div>
    `).join('');
}

// Función de respaldo para categorías
function displayFallbackProductsInCategory() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = `
        <div class="product-card">
            <div class="product-img" style="background-image: url('https://via.placeholder.com/300')">
                <i class="fas fa-tshirt"></i>
            </div>
            <div class="product-info">
                <h3>Producto Ejemplo 1</h3>
                <p>Descripción del producto de ejemplo</p>
                <div class="product-price">$39.99</div>
                <div class="product-meta">
                    <span>Tallas: S, M, L</span>
                    <span>Disponible: 15</span>
                </div>
            </div>
        </div>
        <div class="product-card">
            <div class="product-img" style="background-image: url('https://via.placeholder.com/300')">
                <i class="fas fa-tshirt"></i>
            </div>
            <div class="product-info">
                <h3>Producto Ejemplo 2</h3>
                <p>Otra descripción de producto</p>
                <div class="product-price">$45.99</div>
                <div class="product-meta">
                    <span>Tallas: M, L, XL</span>
                    <span>Disponible: 8</span>
                </div>
            </div>
        </div>
    `;
}

// Funcionalidad para los filtros modernos - VERSIÓN ÚNICA
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

// Alias para mantener compatibilidad - CORRECIÓN DEL ERROR
function setupFilters() {
    return setupModernFilters();
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
}

// Obtener valores seleccionados de un grupo de checkboxes
function getSelectedValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

// Actualizar contador de resultados
function updateResultsCount(searchTerm = '') {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        // En una implementación real, esto vendría del servidor
        const baseCount = searchTerm ? Math.floor(Math.random() * 20) + 1 : Math.floor(Math.random() * 50) + 1;
        resultsCount.textContent = `${baseCount} productos encontrados${searchTerm ? ` para "${searchTerm}"` : ''}`;
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
        if (productsMain && productsGrid) {
            productsMain.insertBefore(resultsInfo, productsGrid);
        }
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

// Hero Slider - CORREGIDO
const heroSection = document.querySelector('.hero');
const heroImages = [
    "images/Portada.png"
];

let currentImage = 0;

function changeHeroBackground() {
    // VALIDACIÓN IMPORTANTE - verificar que heroSection existe
    if (!heroSection) {
        console.log('Hero section no encontrada - no es una página con hero');
        return;
    }
    
    currentImage = (currentImage + 1) % heroImages.length;
    heroSection.style.backgroundImage = `
        linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
        url('${heroImages[currentImage]}')
    `;
}

// Add to Cart function (placeholder)
function addToCart(productId) {
    console.log('Agregando al carrito:', productId);
    alert('Producto agregado al carrito: ' + productId);
    // Aquí iría la lógica real del carrito
}

// Initialize everything - VERSIÓN CORREGIDA Y ÚNICA
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando LiSport...');
    
    // Setup category navigation
    setupCategoryNavigation();
    updateCategoryTitle();
    
    // Load featured products on home page
    if (document.getElementById('featuredProducts')) {
        console.log('Cargando página de inicio...');
        loadFeaturedProducts();
        
        // Start hero slider if on home page - CON VALIDACIÓN
        if (heroSection && heroImages.length > 0) {
            changeHeroBackground();
            setInterval(changeHeroBackground, 5000);
        }
    }
    
    // Load category products on categories page - CORREGIDO
    if (document.getElementById('productsGrid')) {
        console.log('Cargando página de categorías...');
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        loadProductsByCategory(category);
        
        if (document.querySelector('.filters-section')) {
            setupModernFilters(); // Usar setupModernFilters directamente
            updateResultsCount();
        }
    }
    
    // Handle category card clicks
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            window.location.href = `categories.html?category=${category}`;
        });
    });
    
    // Inicializar filtros cuando el DOM esté listo
    if (document.querySelector('.filters-section')) {
        setupModernFilters();
        updateResultsCount();
    }
});

// Agregar estilos CSS para el estado vacío si no existen
const style = document.createElement('style');
style.textContent = `
    .no-products {
        text-align: center;
        padding: 60px 20px;
        color: #666;
        grid-column: 1 / -1;
    }

    .no-products i {
        font-size: 3rem;
        color: #ccc;
        margin-bottom: 15px;
    }

    .no-products p {
        font-size: 1.1rem;
        margin: 0;
    }

    .featured-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: var(--primary-color);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 600;
    }
`;
document.head.appendChild(style);
