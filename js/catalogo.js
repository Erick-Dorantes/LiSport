// ===== CONFIGURACIÓN SUPABASE =====
const SUPABASE_URL = 'https://qlkbqotipjtitrlskacv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsa2Jxb3RpcGp0aXRybHNrYWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjE5NDAsImV4cCI6MjA3Nzk5Nzk0MH0.oYFxx5y1-KlQ4Fqjn_Cub4Dyd-2wC17m59EWyWLKCDA';
let supabaseClient;

// Variables globales
let allProducts = [];
let filteredProducts = [];
let currentModalCarousel = null;
let currentProduct = null;
let isModalOpen = false; 

const WHATSAPP_NUMBER = '5217474597868'; 

// INICIO: Nuevo mapa de colores
const colorMap = {
    // Colores existentes
    'Rojo': '#E53E3E',
    'Negro': '#000000',
    'Navy': '#000080',
    'Charcoal': '#36454F',
    'Berry': '#A01B5B',
    'Gris': '#A0AEC0',
    'Blanco': '#FFFFFF',
    'Azul': '#1E3A8A',
    'Azul Claro': '#3B82F6',
    'Azul Cielo': '#87CEEB',
    'Turquesa': '#1ABC9C',
    'Aqua': '#00FFFF',
    'Verde': '#2F855A',
    'Verde Claro': '#68D391',
    'Verde Oscuro': '#22543D',
    'Amarillo': '#F6E05E',
    'Oro': '#D4AF37',
    'Mostaza': '#FFDB58',
    'Naranja': '#ED8936',
    'Coral': '#FF7F50',
    'Durazno': '#FFE5B4',
    'Rosa': '#F687B3',
    'Magenta': '#FF00FF',
    'Lavanda': '#E6E6FA',
    'Morado': '#6B46C1',
    'Vino': '#722F37',
    'Chocolate': '#7B3F00',
    'Café': '#8B4513',
    'Arena': '#C2B280',
    'Beige': '#F5F5DC',
    'Crema': '#FFFDD0',
    'Plateado': '#C0C0C0',
    'Plata Oscuro': '#A9A9A9',
    'Gris Claro': '#D3D3D3',
    'Grafito': '#2F2F2F'
};
// FIN: Nuevo mapa de colores

// ===== INICIO: NUEVA FUNCIÓN (HELPER) =====
// Función para obtener parámetros de la URL
function getURLParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'); // Corregido: 's' eliminada
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
// ===== FIN: NUEVA FUNCIÓN (HELPER) =====
function generateWhatsAppLink(product) {
    // Mensaje personalizado
    const mensaje = `Hola LiSport!

Me interesa adquirir este producto:
*${product.nombre}*
Precio: $${product.precio}

¿Tienen disponibilidad?`;

    // Codificar el mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);

    // Retornar el enlace completo
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${mensajeCodificado}`;
}
// ===== INICIO: NUEVA FUNCIÓN (APLICAR FILTRO) =====
function applyFilterFromURL() {
    const categoryParam = getURLParameter('categoria');

    if (categoryParam) {
        // Buscar el checkbox que coincide con el valor de la URL
        const categoryCheckbox = document.querySelector(`input[name="category"][value="${categoryParam}"]`);

        if (categoryCheckbox) {
            // Marcarlo como "checked"
            categoryCheckbox.checked = true;
            console.log(`Filtro de URL aplicado: ${categoryParam}`);
        }
    }
}
// ===== FIN: NUEVA FUNCIÓN (APLICAR FILTRO) =====

// Función auxiliar para obtener el estado de móvil
function isMobileView() {
    return window.matchMedia('(max-width: 768px)').matches;
}

// ===== LÓGICA DEL MODAL (Funciones declaradas para evitar el error "is not defined") =====

function generateSizesHTML(product, isDialog = false) {
    let tallas = product.tallas_disponibles;

    if (typeof tallas === 'string') {
        try {
            tallas = JSON.parse(tallas);
        } catch (e) {
            tallas = null;
        }
    }

    if (tallas && Array.isArray(tallas)) {
        const availableSizes = tallas.map(s => s.toUpperCase());
        const allSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
        let sizesHTML = '';

        allSizes.forEach(size => {
            const isAvailable = availableSizes.includes(size);
            const tagClass = `size-tag ${isAvailable ? 'available' : 'unavailable'}`;
            const style = isDialog ? 'padding: 1px 4px; font-size: 0.65rem;' : '';
            sizesHTML += `<span class="${tagClass}" style="${style}">${size}</span>`;
        });

        return sizesHTML;
    } else if (product.talla) {
        const style = isDialog ? 'padding: 1px 4px; font-size: 0.65rem;' : '';
        return `<span class="size-tag available" style="${style}">${product.talla}</span>`;
    }

    return 'N/A';
}
// INICIO: Nueva función para generar colores
function generateColorsHTML(product, isDialog = false) {
    let colores = product.colores_disponibles;

    if (typeof colores === 'string') {
        try {
            colores = JSON.parse(colores);
        } catch (e) {
            colores = null;
        }
    }

    if (colores && Array.isArray(colores) && colores.length > 0) {
        let colorsHTML = '';

        colores.forEach(colorName => {
            const colorHex = colorMap[colorName] || '#E0E0E0'; // Usa gris si no se encuentra

            if (isDialog) {
                // Versión pequeña para el diálogo móvil
                colorsHTML += `<span class="color-swatch-dialog" style="background-color: ${colorHex}" title="${colorName}"></span>`;
            } else {
                // Versión para el panel desktop
                colorsHTML += `
                    <div class="color-option">
                        <span class="color-swatch" style="background-color: ${colorHex}"></span>
                        <span class="color-name">${colorName}</span>
                    </div>
                `;
            }
        });

        return colorsHTML;
    }

    return '<span class="text-sm text-gray-500">No hay información de color.</span>';
}
// FIN: Nueva función para generar colores

function updateProductInfo(product) {

    // 1. Actualizar Panel de Desktop
    document.getElementById('productInfoTitle').textContent = product.nombre || "Producto sin nombre";
    document.getElementById('productInfoPrice').textContent = `$${product.precio || "0"}`;
    document.getElementById('productInfoCategory').textContent = product.categoria || "General";

    // Actualizar stock
    const stockElement = document.getElementById('productInfoStock');
    const stockText = document.getElementById('stockText');
    const cantidad = product.cantidad || 0;
    const waLink = generateWhatsAppLink(product);

    const btnDesktop = document.getElementById('btnWhatsappDesktop');
    const btnMobile = document.getElementById('btnWhatsappMobile');

    if (btnDesktop) btnDesktop.href = waLink;
    if (btnMobile) btnMobile.href = waLink;
    if (cantidad > 0) {
        stockElement.className = 'product-info-stock in-stock';
        stockText.textContent = `${cantidad} disponibles`;
    } else {
        stockElement.className = 'product-info-stock out-of-stock';
        stockText.textContent = 'Agotado';
    }

    // Actualizar descripción
    const descripcion = product.descripcion || "Sin descripción disponible";
    document.getElementById('productInfoDescription').textContent = descripcion;

    // Actualizar tallas
    document.getElementById('productInfoSizes').innerHTML = generateSizesHTML(product);

    // Actualizar colores (Desktop)
    document.getElementById('productInfoColors').innerHTML = generateColorsHTML(product, false);


    // 2. Actualizar Diálogo Móvil
    document.getElementById('dialogTitle').textContent = product.nombre || "Detalles";
    document.getElementById('dialogPrice').textContent = `$${product.precio || "0"}`;
    document.getElementById('dialogDescription').textContent = descripcion;
    document.getElementById('dialogSizes').innerHTML = generateSizesHTML(product, true);
    // Actualizar colores (Móvil)
    document.getElementById('dialogColors').innerHTML = generateColorsHTML(product, true);
}

function closeImageModal(fromBackButton = false) {
    const modal = document.getElementById('imageModal');
    const infoPanel = document.getElementById('productInfoPanel');
    const infoDialog = document.getElementById('productInfoDialog');

    if (!modal.classList.contains('active')) return; // Evita cierres dobles

    modal.classList.remove('active');
    infoPanel.classList.remove('active');
    infoDialog.classList.remove('active');
    document.body.style.overflow = '';

    if (currentModalCarousel) {
        currentModalCarousel.destroy();
        currentModalCarousel = null;
    }

    currentProduct = null;
    isModalOpen = false; // Marcar el modal como cerrado

    if (!fromBackButton) {
        history.back();
    }
}

function toggleProductInfoDialog() {
    const infoDialog = document.getElementById('productInfoDialog');
    if (!isMobileView()) return;

    infoDialog.classList.toggle('active');
}

function openImageModal(images, product) {
    const modal = document.getElementById('imageModal');
    const infoPanel = document.getElementById('productInfoPanel');
    const infoDialog = document.getElementById('productInfoDialog');

    if (images.length === 0 || isModalOpen) return;

    currentProduct = product;
    currentModalCarousel = new ImageModalCarousel(images);
    updateProductInfo(product);

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (!isMobileView()) {
        infoPanel.classList.add('active');
    } else {
        infoPanel.classList.remove('active');
        infoDialog.classList.remove('active');
    }

    isModalOpen = true; // Marcar el modal como abierto
    history.pushState({ modalOpen: true }, '', '#product-modal-open');
}

function addImageModalListeners() {
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        card.addEventListener('click', function () {
            const productData = this.getAttribute('data-product');
            const productImage = this.querySelector('.product-image');
            const imagesData = productImage.getAttribute('data-images');

            if (productData && imagesData) {
                const product = JSON.parse(productData);
                const images = JSON.parse(imagesData);
                if (images.length > 0) {
                    openImageModal(images, product);
                }
            }
        });
    });
}

// La clase puede permanecer igual
class ImageModalCarousel {
    constructor(images) {
        this.images = images;
        this.currentIndex = 0;
        this.modal = document.getElementById('imageModal');
        this.slidesContainer = document.getElementById('modalCarouselSlides');
        this.indicatorsContainer = document.getElementById('modalIndicators');
        this.prevBtn = document.getElementById('modalPrev');
        this.nextBtn = document.getElementById('modalNext');

        this.init();
    }

    init() {
        this.slidesContainer.innerHTML = '';
        this.indicatorsContainer.innerHTML = '';
        this.images.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = `carousel-slide-modal ${index === 0 ? 'active' : ''}`;
            slide.innerHTML = `
                <img src="${image}" alt="Imagen ${index + 1}" class="modal-image">
            `;
            this.slidesContainer.appendChild(slide);

            const indicator = document.createElement('button');
            indicator.className = `carousel-indicator-modal ${index === 0 ? 'active' : ''}`;
            indicator.setAttribute('data-index', index);
            indicator.setAttribute('aria-label', `Ver imagen ${index + 1}`);
            this.indicatorsContainer.appendChild(indicator);
        });

        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        this.indicatorsContainer.querySelectorAll('.carousel-indicator-modal').forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.goToSlide(index);
            });
        });
    }

    showSlide(index) {
        const currentSlide = this.slidesContainer.querySelector('.carousel-slide-modal.active');
        const currentIndicator = this.indicatorsContainer.querySelector('.carousel-indicator-modal.active');
        if (currentSlide) currentSlide.classList.remove('active');
        if (currentIndicator) currentIndicator.classList.remove('active');
        this.currentIndex = index;
        const newSlide = this.slidesContainer.querySelectorAll('.carousel-slide-modal')[index];
        const newIndicator = this.indicatorsContainer.querySelectorAll('.carousel-indicator-modal')[index];
        if (newSlide) newSlide.classList.add('active');
        if (newIndicator) newIndicator.classList.add('active');
    }

    nextSlide() {
        const nextIndex = (this.currentIndex + 1) % this.images.length;
        this.showSlide(nextIndex);
    }

    prevSlide() {
        const prevIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.showSlide(prevIndex);
    }

    goToSlide(index) {
        if (index >= 0 && index < this.images.length) {
            this.showSlide(index);
        }
    }

    destroy() {
        this.prevBtn.replaceWith(this.prevBtn.cloneNode(true));
        this.nextBtn.replaceWith(this.nextBtn.cloneNode(true));
    }
}

// ===== LÓGICA DE CARGA, FILTROS Y AUTOCOMPLETADO (SIN CAMBIOS) =====

function loadAllProducts() {
    const container = document.getElementById('productsGrid');
    const loadingElement = document.getElementById('loading-products');
    const noResultsElement = document.getElementById('noResults');

    (async function () {
        try {
            container.classList.add('loading');
            const { data: products, error } = await supabaseClient
                .from('productos')
                .select('*')
                .order('creado_en', { ascending: false });

            if (error) {
                console.error('Error de Supabase:', error);
                throw error;
            }

            allProducts = products || [];
            filteredProducts = [...allProducts];

            applyFilterFromURL();

            filterProducts();

        } catch (err) {
            console.error('Error al cargar productos:', err);
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                    <p class="text-gray-600 dark:text-gray-400 mb-4">Error al cargar los productos</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mb-4">${err.message}</p>
                    <button onclick="loadAllProducts()" class="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition">
                        Reintentar
                    </button>
                </div>
            `;
        } finally {
            container.classList.remove('loading');
            if (loadingElement) loadingElement.style.display = 'none';
        }
    })();
}

function renderProducts() {
    const container = document.getElementById('productsGrid');
    const noResultsElement = document.getElementById('noResults');

    if (filteredProducts.length === 0) {
        container.innerHTML = '';
        noResultsElement.classList.remove('hidden');
        return;
    }
    noResultsElement.classList.add('hidden');

    container.innerHTML = filteredProducts.map(product => {
        const nombre = product.nombre || "Producto sin nombre";
        const precio = product.precio || "0";
        const cantidad = product.cantidad || 0;
        let imagenes = [];
        if (product.imagenes && Array.isArray(product.imagenes)) {
            imagenes = product.imagenes;
        } else if (product.imagenes) {
            imagenes = [product.imagenes];
        } else {
            imagenes = ['https://via.placeholder.com/400x500?text=Sin+imagen'];
        }

        const imagenPrincipal = imagenes.length > 0 ? imagenes[0] : 'https://via.placeholder.com/400x500?text=Sin+imagen';
        const sizesHTML = generateSizesHTML(product);

        return `
            <div class="product-card" data-product-id="${product.id}" data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}'>
                <div class="product-image-wrapper">
                    <img 
                        src="${imagenPrincipal}" 
                        alt="${nombre}" 
                        class="product-image" 
                        loading="lazy"
                        onerror="this.src='https://via.placeholder.com/400x500?text=Sin+imagen'"
                        data-images='${JSON.stringify(imagenes)}'
                    >
                </div>
                <div class="product-info">
                    <h3 class="product-title">${nombre}</h3>
                    <div class="product-price">$${precio}</div>
                    ${sizesHTML}
                    <div class="product-stock ${cantidad > 0 ? 'in-stock' : 'out-of-stock'}">
                        ${cantidad > 0 ? `${cantidad} disponibles` : 'Agotado'}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    addImageModalListeners();
}

function updateResultsCount() {
    const countElement = document.getElementById('resultsCount');
    const count = filteredProducts.length;
    countElement.textContent = `${count} producto${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(cb => cb.value);
    const selectedSizes = Array.from(document.querySelectorAll('input[name="size"]:checked')).map(cb => cb.value);
    const sortValue = document.getElementById('sortSelect').value;

    filteredProducts = allProducts.filter(product => {
        const nombre = (product.nombre || "").toLowerCase();
        const descripcion = (product.descripcion || "").toLowerCase();
        const matchesSearch = !searchTerm ||
            nombre.includes(searchTerm) ||
            descripcion.includes(searchTerm);

        const productCategory = product.categoria || "";
        const matchesCategory = selectedCategories.length === 0 ||
            selectedCategories.includes(productCategory.toLowerCase());

        let productSizes = product.tallas_disponibles;
        if (typeof productSizes === 'string') {
            try {
                productSizes = JSON.parse(productSizes);
            } catch (e) {
                productSizes = product.talla ? [product.talla] : [];
            }
        }

        const matchesSize = selectedSizes.length === 0 ||
            (productSizes && productSizes.some(size =>
                selectedSizes.includes(size.toUpperCase())
            ));

        return matchesSearch && matchesCategory && matchesSize;
    });

    sortProducts(sortValue);
    updateResultsCount();
    renderProducts();
}

function generateAutocomplete() {
    const inputElement = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('autocomplete-results');
    const searchTerm = inputElement.value.toLowerCase().trim();

    resultsContainer.innerHTML = '';
    resultsContainer.classList.add('hidden');

    if (searchTerm.length < 2) {
        return;
    }

    const uniqueTerms = new Set();
    allProducts.forEach(product => {
        const nombre = (product.nombre || "").toLowerCase();
        const categoria = (product.categoria || "").toLowerCase();

        // Priorizar coincidencias exactas y al inicio de la palabra
        if (nombre.includes(searchTerm)) {
            uniqueTerms.add(nombre);
        }
        if (categoria.includes(searchTerm)) {
            uniqueTerms.add(categoria);
        }
    });

    // Filtramos solo los que coinciden con el término de búsqueda
    const matchingTerms = Array.from(uniqueTerms)
        .filter(term => term.includes(searchTerm))
        .sort((a, b) => a.indexOf(searchTerm) - b.indexOf(searchTerm)) // Ordenar por relevancia
        .slice(0, 7);

    if (matchingTerms.length > 0) {
        let html = '';
        matchingTerms.forEach(term => {
            // Resaltar el término de búsqueda
            const highlightedTerm = term.replace(
                new RegExp(searchTerm, 'gi'),
                match => `<span class="font-semibold text-pink-500">${match}</span>`
            );

            html += `
                <div class="autocomplete-item" data-value="${term}">
                    ${highlightedTerm.charAt(0).toUpperCase() + highlightedTerm.slice(1)}
                </div>
            `;
        });

        resultsContainer.innerHTML = html;
        resultsContainer.classList.remove('hidden');

        resultsContainer.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('click', function () {

                inputElement.value = this.getAttribute('data-value');
                resultsContainer.classList.add('hidden');
                filterProducts();
            });
        });
    }
}

function clearAutocomplete() {
    const resultsContainer = document.getElementById('autocomplete-results');
    resultsContainer.innerHTML = '';
    resultsContainer.classList.add('hidden');
}

function sortProducts(sortBy) {
    switch (sortBy) {
        case 'price_asc':
            filteredProducts.sort((a, b) => (parseFloat(a.precio) || 0) - (parseFloat(b.precio) || 0));
            break;
        case 'price_desc':
            filteredProducts.sort((a, b) => (parseFloat(b.precio) || 0) - (parseFloat(a.precio) || 0));
            break;
        case 'name':
            filteredProducts.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
            break;
        case 'newest':
            filteredProducts.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en));
            break;
        default:
            break;
    }
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('sortSelect').value = 'recommended';
    clearAutocomplete();
    filterProducts();
}

// ===== MODO OSCURO (CLARO POR DEFECTO) =====
function initDarkMode() {
    const body = document.body;
    const darkToggle = document.getElementById('darkToggle');
    
    // Verificamos si el botón existe antes de continuar
    if (!darkToggle) return;

    // 1. LÓGICA CAMBIADA:
    // Solo activamos modo oscuro si hay un valor '1' guardado en localStorage.
    // Si no hay nada guardado (primera visita), será FALSO (Modo Claro).
    const isSavedDark = localStorage.getItem('lisport_dark') === '1';

    // Aplicar el modo inicial
    setDark(isSavedDark);

    // Escuchar el clic del botón
    darkToggle.addEventListener('click', () => {
        // Cambiar al estado opuesto del actual
        setDark(!body.classList.contains('dark'));
    });
}

function setDark(shouldBeDark) {
    const body = document.body;
    const darkIcon = document.getElementById('darkIcon');

    if (shouldBeDark) {
        // Activar Modo Oscuro
        body.classList.add('dark');
        if (darkIcon) darkIcon.textContent = '☀️'; // Icono de sol para volver a claro
        localStorage.setItem('lisport_dark', '1'); // Guardar preferencia
    } else {
        // Activar Modo Claro (Por defecto)
        body.classList.remove('dark');
        if (darkIcon) darkIcon.textContent = '🌙'; // Icono de luna para ir a oscuro
        localStorage.setItem('lisport_dark', '0'); // Guardar preferencia
    }
}
// ===== FILTROS MÓVILES (sin cambios) =====
function toggleMobileFilters() {
    const filtersSidebar = document.getElementById('filtersSidebar');
    filtersSidebar.classList.toggle('mobile-open');

    if (filtersSidebar.classList.contains('mobile-open')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// ===== CONFIGURAR EVENT LISTENERS (Añadido la lógica del menú hamburguesa) =====
function setupEventListeners() {
    const floatingFiltersButton = document.getElementById('floatingFiltersButton');
    const closeFiltersButton = document.getElementById('closeFilters');
    const modalDetailsButton = document.getElementById('modalDetailsButton');
    const imageModal = document.getElementById('imageModal');
    const infoDialog = document.getElementById('productInfoDialog');

    // NUEVOS BOTONES DEL MENÚ HAMBURGUESA PRINCIPAL
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('active');
            // Opcional: Cambiar el icono de hamburguesa a una 'X'
            const icon = mobileMenuButton.querySelector('i');
            if (mobileMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    if (floatingFiltersButton) {
        floatingFiltersButton.addEventListener('click', toggleMobileFilters);
    }
    if (closeFiltersButton) {
        closeFiltersButton.addEventListener('click', toggleMobileFilters);
    }
    if (modalDetailsButton) {
        modalDetailsButton.addEventListener('click', toggleProductInfoDialog);
    }

    // *** FUNCIONALIDAD DE AUTOCOMPLETADO Y FILTRADO INMEDIATO ***
    document.getElementById('searchInput').addEventListener('input', function () {
        generateAutocomplete();
        filterProducts(); // Filtra productos en vivo
    });

    document.querySelectorAll('input[name="category"], input[name="size"]').forEach(input => {
        input.addEventListener('change', filterProducts);
    });

    document.getElementById('sortSelect').addEventListener('change', filterProducts);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    document.getElementById('resetFilters').addEventListener('click', clearFilters);

    document.getElementById('modalClose').addEventListener('click', closeImageModal);

    // En desktop, la X del panel grande cierra el modal completo
    document.getElementById('productInfoClose').addEventListener('click', () => {
        if (!isMobileView()) {
            closeImageModal();
        }
    });

    // Cerrar modal al hacer clic en el fondo (área negra)
    imageModal.addEventListener('click', function (e) {
        // Si el clic es directamente en el fondo del modal (imageModal)
        // O si es en el contenedor del carrusel pero no en uno de sus hijos (es decir, en el fondo oscuro)
        if (e.target === this || e.target.classList.contains('carousel-container-modal')) {
            closeImageModal();
        } else if (isMobileView() && infoDialog.classList.contains('active') && e.target !== modalDetailsButton && !infoDialog.contains(e.target)) {
            // Si es móvil y el diálogo de info está abierto, y el clic no fue en el botón de detalles ni dentro del diálogo
            toggleProductInfoDialog();
        }
    });

    // Cerrar autocompletado si se hace clic fuera
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.filter-group')) {
            clearAutocomplete();
        }
    });

    // Listener para la tecla ESCAPE
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isModalOpen) {
            e.preventDefault(); // Evita que ESC también active el retroceso del navegador
            closeImageModal();
        }
    });

    // Listener para el botón de retroceso del navegador
    window.addEventListener('popstate', function (event) {
        const modal = document.getElementById('imageModal');

        // Si el modal está activo y el estado del historial no tiene la bandera modalOpen, lo cerramos.
        // Esto ocurre cuando el usuario presiona el botón de retroceso del navegador.
        if (modal.classList.contains('active') && (event.state === null || event.state.modalOpen === undefined)) {
            closeImageModal(true); // El 'true' indica que el cierre viene del botón de retroceso
        }
    });
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function () {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    initDarkMode();
    setupEventListeners();
    loadAllProducts();

    // Si la página se carga con el hash del modal, lo quitamos inmediatamente
    if (window.location.hash === '#product-modal-open') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }
});

// Escuchar cambios en las preferencias del sistema
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('lisport_dark')) {
        setDark(e.matches);
    }
});