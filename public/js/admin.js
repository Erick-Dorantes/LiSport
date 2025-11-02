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

// Load Featured Products - FUNCIÓN CORREGIDA
async function loadFeaturedProducts() {
    try {
        console.log('Cargando productos destacados...');
        const response = await fetch(`${API_BASE}/products`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // VERIFICAR que data sea un array
        const products = Array.isArray(data) ? data : (data.products || data.data || []);
        
        console.log('Productos recibidos:', products);
        
        if (!Array.isArray(products)) {
            console.error('Formato inválido - no es array:', data);
            throw new Error('Formato de datos inválido: se esperaba un array');
        }
        
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
        
        // VERIFICAR que data sea un array
        const products = Array.isArray(data) ? data : (data.products || data.data || []);
        
        console.log(`Productos para ${category}:`, products);
        
        if (!Array.isArray(products)) {
            throw new Error('Formato de datos inválido para productos');
        }
        
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
function updateResultsCount() {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        const randomCount = Math.floor(Math.random() * 50) + 1;
        resultsCount.textContent = `${randomCount} productos encontrados`;
    }
}

// Mostrar mensaje de filtro
function showFilterMessage(message) {
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
    
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
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

// Hero Slider
const heroSection = document.querySelector('.hero');
const heroImages = [
    "images/Portada.png"
];

let currentImage = 0;

function changeHeroBackground() {
    if (!heroSection) return;
    
    currentImage = (currentImage + 1) % heroImages.length;
    heroSection.style.backgroundImage = `
        linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
        url('${heroImages[currentImage]}')
    `;
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando LiSport...');
    
    // Setup category navigation
    setupCategoryNavigation();
    updateCategoryTitle();
    
    // Load featured products on home page
    if (document.getElementById('featuredProducts')) {
        console.log('Cargando página de inicio...');
        loadFeaturedProducts();
        
        // Start hero slider if on home page
        if (heroSection) {
            changeHeroBackground();
            setInterval(changeHeroBackground, 5000);
        }
    }
    
    // Load category products on categories page
    if (document.getElementById('productsGrid')) {
        console.log('Cargando página de categorías...');
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        loadProductsByCategory(category);
        
        if (document.querySelector('.filters-section')) {
            setupModernFilters();
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
});

// Add to Cart function (placeholder)
function addToCart(productId) {
    console.log('Agregando al carrito:', productId);
    alert('Producto agregado al carrito: ' + productId);
    // Aquí iría la lógica real del carrito
}

// Setup filters function
function setupFilters() {
    if (document.querySelector('.filters-section')) {
        setupModernFilters();
        updateResultsCount();
    }
}
