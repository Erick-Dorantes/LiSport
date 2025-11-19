// ===== CONFIGURACIÓN SUPABASE / WHATSAPP =====
const SUPABASE_URL = 'https://qlkbqotipjtitrlskacv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsa2Jxb3RpcGp0aXRybHNrYWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjE5NDAsImV4cCI6MjA3Nzk5Nzk0MH0.oYFxx5y1-KlQ4Fqjn_Cub4Dyd-2wC17m59EWyWLKCDA'; 
let supabaseClient;

// 🌟 NÚMERO DE WHATSAPP FINAL
const WHATSAPP_NUMBER = '5217474597868'; 

// ===== MAPA DE COLORES =====
const colorMap = {
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
// ===== FIN: Mapa de colores =====


// ===== VARIABLES GLOBALES DE MODAL Y SELECTORES =====
const productModal = document.getElementById('productModal');
const closeProductModal = document.getElementById('closeProductModal');
const infoCard = document.getElementById('infoCard');
const modalDetailsButton = document.getElementById('modalDetailsButton');
const infoButtonContainer = document.getElementById('infoButtonContainer');


// ===== FUNCIONES AUXILIARES DE PARSEO Y RENDERIZADO (TARJETAS) =====

function parseJsonString(jsonString) {
    if (Array.isArray(jsonString)) {
        return jsonString;
    }
    if (typeof jsonString === 'string') {
        try {
            const cleanedString = jsonString.replace(/'/g, '"');
            const parsed = JSON.parse(cleanedString);
            return Array.isArray(parsed) ? parsed : null;
        } catch (e) {
            console.warn("Error de parseo JSON:", e, "String original:", jsonString);
            return null;
        }
    }
    return null;
}

function generateHomepageSizesHTML(product) {
    const allSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
    const tallas_array = parseJsonString(product.tallas_disponibles);
    
    if (!tallas_array || tallas_array.length === 0) {
        return '';
    }
    
    const availableSizes = tallas_array.map(s => s.toUpperCase());

    return allSizes.map(size => {
        const isAvailable = availableSizes.includes(size);
        const tagClass = `admin-size-tag ${isAvailable ? 'admin-size-available' : 'admin-size-unavailable'}`;
        return `<span class="${tagClass}">${size}</span>`;
    }).join('');
}

function generateHomepageColorsHTML(product) {
    const colores_array = parseJsonString(product.colores_disponibles);
    
    if (!colores_array || colores_array.length === 0) {
        return '';
    }

    return colores_array.map(colorName => {
        const colorHex = colorMap[colorName] || '#E0E0E0';
        let borderStyle = 'border: 1px solid rgba(0, 0, 0, 0.2);';
        const upperHex = colorHex.toUpperCase();
        
        if (['#FFFFFF', '#FFFDD0', '#F5F5DC', '#E6E6FA', '#FFE5B4'].includes(upperHex)) {
            borderStyle = 'border: 1px solid #A0AEC0;';
        }

        return `
            <div class="admin-color-display">
                <span class="admin-color-dot" style="background-color: ${colorHex}; ${borderStyle}"></span>
            </div>
        `;
    }).join('');
}


// ==============================================
// 🌟 LÓGICA DE MANEJO DEL MODAL (Compacto/Columna) 🌟
// ==============================================

function generateModalSizesHTML(tallas_array) {
    const allSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
    if (!tallas_array || tallas_array.length === 0) return '';
    
    const availableSizes = tallas_array.map(s => s.toUpperCase());

    return allSizes.map(size => {
        const isAvailable = availableSizes.includes(size);
        const disabledClass = isAvailable ? 
            'hover:border-pink-500 dark:hover:border-pink-500' : 
            'opacity-50 cursor-not-allowed';
        const activeClass = isAvailable ? 'data-size' : 'disabled';
        
        return `<button class="size-btn px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white transition ${disabledClass}" ${activeClass}="${size}" ${!isAvailable ? 'disabled' : ''}>${size}</button>`;
    }).join('');
}

function generateModalColorsHTML(colores_array) {
    if (!colores_array || colores_array.length === 0) return '';
    
    return colores_array.map((colorName, index) => {
        const colorHex = colorMap[colorName] || '#E0E0E0';
        
        const selectedClass = index === 0 ? 'border-pink-500 border-2' : 'border border-gray-300';
        
        return `
            <div class="flex items-center space-x-1 cursor-pointer" data-color="${colorName}">
                <span class="w-6 h-6 rounded-full ${selectedClass} transition duration-150" style="background-color: ${colorHex}; box-shadow: 0 0 0 1px #fff;" title="${colorName}"></span>
            </div>
        `;
    }).join('');
}

/**
 * 🌟 LÓGICA DE ALTERNANCIA (MOSTRAR/OCULTAR) PARA MÓVIL 🌟
 * Alterna la visibilidad de la tarjeta de información flotante (solo en móvil).
 */
function toggleInfoCard() {
    // Se basa en los selectores globales infoCard y infoButtonContainer
    if (!infoCard || !infoButtonContainer) return;
    
    // Solo permitir la acción en móvil
    if (window.matchMedia('(max-width: 768px)').matches) {
        if (infoCard.classList.contains('hidden')) {
            // Abrir: Mostrar infoCard
            infoCard.classList.remove('hidden');
            // Ocultar el botón 'i'
            infoButtonContainer.classList.add('hidden'); 
        } else {
            // Cerrar: Ocultar infoCard
            infoCard.classList.add('hidden');
            // Mostrar el botón 'i'
            infoButtonContainer.classList.remove('hidden'); 
        }
    }
}


/**
 * Llena el modal de producto con los datos específicos y maneja la visibilidad dual.
 */
function fillProductModal(product) {
    if (!productModal) return;

    // 1. Datos principales
    document.getElementById('productTitle').textContent = product.nombre || 'Producto Desconocido';
    document.getElementById('productPrice').textContent = `$${product.precio ? product.precio.toFixed(2) : '0.00'}`;
    // Se asume que 'product.descripcion' o 'product.sku' es el texto descriptivo
    document.getElementById('productSKU').textContent = product.descripcion || product.sku || ''; 
    document.getElementById('productCategory').textContent = product.categoria || 'sweaters'; 

    // 2. Imagenes
    const imagesArray = parseJsonString(product.imagenes) || [];
    const mainImage = imagesArray.length > 0 ? imagesArray[0] : 'https://via.placeholder.com/1000x1200?text=LiSport';
    
    const productImageElement = document.getElementById('modalProductImage'); 

    if (productImageElement) {
        productImageElement.src = mainImage;
        productImageElement.alt = product.nombre;
    }
    
    // 3. Colores y Tallas
    const tallasArray = parseJsonString(product.tallas_disponibles);
    const coloresArray = parseJsonString(product.colores_disponibles);
    
    const sizeFlexContainer = document.getElementById('sizeOptions')?.querySelector('div.flex');
    const colorFlexContainer = document.getElementById('colorOptions')?.querySelector('div.flex');

    if (sizeFlexContainer) sizeFlexContainer.innerHTML = generateModalSizesHTML(tallasArray);
    if (colorFlexContainer) colorFlexContainer.innerHTML = generateModalColorsHTML(coloresArray);
    
    // 4. Botón de WhatsApp
    const whatsappText = `Hola, quiero el producto: ${product.nombre} ($${product.precio.toFixed(2)}). Color: [Especifique color]. Talla: [Especifique talla].`;
    const whatsappButton = document.getElementById('whatsappButton');
    if (whatsappButton) {
        whatsappButton.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`;
    }
    
    // 🌟🌟🌟 LÓGICA DE VISIBILIDAD DUAL 🌟🌟🌟
    const isDesktop = window.matchMedia('(min-width: 769px)').matches;
    
    if (infoCard && infoButtonContainer) {
        if (isDesktop) {
            // ESCRITORIO: Mostrar la tarjeta (columna), ocultar el botón 'i'
            infoCard.classList.remove('hidden');
            infoButtonContainer.classList.add('hidden');
        } else {
            // MÓVIL: Ocultar la tarjeta por defecto (flotante) y mostrar el botón 'i'
            infoCard.classList.add('hidden');
            infoButtonContainer.classList.remove('hidden'); 
        }
    }
    // 🌟🌟🌟 FIN LÓGICA DE VISIBILIDAD DUAL 🌟🌟🌟

    openProductModal();
}

function openProductModal() {
    if (productModal) {
        productModal.classList.remove('hidden'); 
        document.body.classList.add('overflow-hidden'); 
    }
}

function closeProductModalHandler() {
    if (productModal) {
        productModal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        
        // Asegurar que la tarjeta de info se oculte al cerrar el modal completo (para el próximo uso)
        if (infoCard && infoButtonContainer) {
            infoCard.classList.add('hidden');
            infoButtonContainer.classList.remove('hidden');
        }
    }
}


// ==============================================
// FIN: FUNCIONES DEL MODAL DE VISTA RÁPIDA
// ==============================================


// ===== INICIALIZACIÓN GENERAL =====
document.addEventListener('DOMContentLoaded', function () {
    // Inicializar Supabase
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase inicializado para página principal');

    // Inicializar componentes
    initDarkMode();
    loadFeaturedProducts();
    new HeroCarousel(); 
    
    // Listeners del nuevo Modal de Producto
    if (closeProductModal) {
        closeProductModal.addEventListener('click', closeProductModalHandler);
    }
    
    // 🌟 CORRECCIÓN APLICADA AQUÍ 🌟
    if (modalDetailsButton) {
        // Listener para el botón 'i' (Móvil): ABRE la tarjeta
        modalDetailsButton.addEventListener('click', function(e) {
            // EVITA que el evento de clic se propague al productModal (el fondo),
            // lo cual podría estar cancelando la acción de toggleInfoCard.
            e.stopPropagation(); 
            toggleInfoCard();
        });
    }
    
    if (productModal) {
        // CORRECCIÓN: Cerrar la tarjeta de info al hacer clic fuera de ella (en imagen/fondo)
        productModal.addEventListener('click', (e) => {
            const isClickInsideInfoCard = infoCard && infoCard.contains(e.target);
            const isClickInsideCloseButton = closeProductModal && closeProductModal.contains(e.target);
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            
            // Lógica para cerrar la infoCard si está abierta en móvil y el clic NO fue dentro de ella.
            if (isMobile && !infoCard.classList.contains('hidden')) {
                if (!isClickInsideInfoCard && !isClickInsideCloseButton) {
                    toggleInfoCard();
                    // Importante: No cerramos el modal principal aquí.
                }
            } else if (e.target === productModal || e.target.id === 'modalContentWrapper') {
                // Si el clic fue en el fondo gris/negro principal, cerramos el modal completo.
                closeProductModalHandler();
            }
        });
    }
});

// ===== CARGAR PRODUCTOS DESTACADOS DESDE SUPABASE =====
async function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    const loadingElement = document.getElementById('loading-products');

    try {
        if (loadingElement) {
            container.classList.add('loading');
        }

        const { data: products, error } = await supabaseClient
            .from('productos')
            .select('*')
            .eq('destacado', true)
            .order('creado_en', { ascending: false })
            .limit(8);

        if (error) throw error;

        container.innerHTML = '';

        if (!products || products.length === 0) {
             container.innerHTML = `
                 <div class="col-span-full text-center py-8">
                    <i class="fas fa-star text-gray-400 text-4xl mb-4"></i>
                    <p class="text-gray-600 dark:text-gray-400">No hay productos destacados en este momento</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">Marca productos como destacados desde el panel de administración</p>
                </div>
            `;
            return;
        }

        products.forEach(product => {
            const nombre = product.nombre || "Producto sin nombre";
            const descripcion = product.descripcion || "Sin descripción disponible";
            const precio = product.precio || "0";
            const categoria = product.categoria || "General";
            const cantidad = product.cantidad || 0;
            let imagenes = parseJsonString(product.imagenes) || [];
            if (!Array.isArray(imagenes)) imagenes = [imagenes];

            const imagenPrincipal = imagenes.length > 0 ? imagenes[0] : 'https://via.placeholder.com/400x300?text=Sin+imagen';
            
            const tallasHTML = generateHomepageSizesHTML(product);
            const coloresHTML = generateHomepageColorsHTML(product);

            const card = document.createElement('div');
            card.className = 'product-card bg-white dark:bg-gray-700 rounded-lg shadow p-4 flex flex-col h-full cursor-pointer';
            card.setAttribute('data-product-id', product.id);
            card.setAttribute('data-product-data', JSON.stringify(product).replace(/"/g, '"')); 

            // --- INICIO: HTML DE LA TARJETA ---
            card.innerHTML = `
                <div class="product-image-container mb-4 relative">
                    <img 
                        src="${imagenPrincipal}" 
                        alt="${nombre}" 
                        class="w-full h-48 object-cover rounded-md" 
                        loading="lazy"
                        onerror="this.src='https://via.placeholder.com/400x300?text=Sin+imagen'"
                    >
                    <span class="absolute top-2 left-2 text-xs bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 px-2 py-1 rounded-full">
                        ${categoria}
                    </span>
                    <span class="featured-badge absolute top-2 right-2">
                        <i class="fas fa-star mr-1"></i>Destacado
                    </span>
                    ${imagenes.length > 1 ? `
                        <span class="multiple-images-indicator">
                            <i class="fas fa-images mr-1"></i>${imagenes.length}
                        </span>
                    ` : ''}
                                                <div class="flex justify-between items-center mt-auto">
                        <p class="text-pink-500 font-bold text-lg">$${precio}</p>
                        ${cantidad > 0 ?
                        `<span class="text-sm text-green-600 dark:text-green-400 font-medium">
                                ${cantidad} disponibles
                            </span>` :
                        `<span class="text-sm text-red-600 dark:text-red-400 font-medium">
                                Agotado
                            </span>`
                    }
                    </div>
                </div>
                <div class="flex-1 flex flex-col">
                    <h3 class="text-lg font-semibold mb-2 dark:text-white line-clamp-2">${nombre}</h3>
                    <p class="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2 flex-1">
                        ${descripcion}
                    </p>

                    ${coloresHTML ? `
                    <div class="mb-2">
                        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">Colores:</span>
                        <div class="flex items-center flex-wrap gap-2 mt-1">
                            ${coloresHTML}
                        </div>
                    </div>
                    ` : ''}

                    ${tallasHTML ? `
                    <div class="mb-3">
                        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">Tallas:</span>
                        <div class="flex items-center flex-wrap gap-1 mt-1">
                            ${tallasHTML}
                        </div>
                    </div>
                    ` : ''}
                    
                </div>
            `;
            // --- FIN: HTML DE LA TARJETA ---
            
            card.addEventListener('click', function() {
                const productDataString = this.getAttribute('data-product-data');
                if (productDataString) {
                    const productData = JSON.parse(productDataString.replace(/"/g, '"')); 
                    fillProductModal(productData);
                }
            });
            
            container.appendChild(card);
        });

    } catch (err) {
        console.error('Error al cargar productos destacados:', err);
        container.innerHTML = `
            <div class="col-span-full text-center py-8">
                <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                <p class="text-gray-600 dark:text-gray-400">Error al cargar los productos destacados</p>
                <p class="text-sm text-gray-500 dark:text-gray-500 mb-4">${err.message}</p>
                <button 
                    onclick="loadFeaturedProducts()" 
                    class="mt-2 bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
                >
                    Reintentar
                </button>
            </div>
        `;
    } finally {
        container.classList.remove('loading');
    }
}

// ===== SISTEMA DE MODAL DE IMÁGENES (Mantenido) =====
function addImageModalListeners() {
    const productImages = document.querySelectorAll('.product-image-container img');

    productImages.forEach(img => {
        img.addEventListener('click', function (e) {
            e.stopPropagation();
            const imagesData = this.getAttribute('data-images');
            if (imagesData) {
                const images = JSON.parse(imagesData);
                if (images.length > 0) {
                    openImageModal(images);
                }
            }
        });
    });
}

class ImageModalCarousel {
    constructor(images) {
        this.images = images;
        this.currentIndex = 0;
        this.modal = document.getElementById('imageModal');
        this.slidesContainer = document.getElementById('modalCarouselSlides');
        this.indicatorsContainer = document.getElementById('modalIndicators');
        this.prevBtn = document.getElementById('modalPrev');
        this.nextBtn = document.getElementById('modalNext');

        this.handleKeydown = this.handleKeydown.bind(this);
        
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

        document.addEventListener('keydown', this.handleKeydown);
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

    handleKeydown(e) {
        if (!this.modal.classList.contains('active')) return;

        switch (e.key) {
            case 'ArrowLeft':
                this.prevSlide();
                break;
            case 'ArrowRight':
                this.nextSlide();
                break;
            case 'Escape':
                closeImageModal();
                break;
        }
    }

    destroy() {
        this.prevBtn.replaceWith(this.prevBtn.cloneNode(true));
        this.nextBtn.replaceWith(this.nextBtn.cloneNode(true));
        document.removeEventListener('keydown', this.handleKeydown);
    }
}

let currentModalCarousel = null;

function openImageModal(images) {
    const modal = document.getElementById('imageModal');

    if (images.length === 0) return;

    currentModalCarousel = new ImageModalCarousel(images);

    modal.classList.add('active');
    document.body.style.overflow = '';
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');

    modal.classList.remove('active');
    document.body.style.overflow = '';

    if (currentModalCarousel) {
        currentModalCarousel.destroy();
        currentModalCarousel = null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const modalCloseBtn = document.getElementById('modalClose');
    const imageModal = document.getElementById('imageModal');
    
    if(modalCloseBtn) modalCloseBtn.addEventListener('click', closeImageModal);
    
    if(imageModal) imageModal.addEventListener('click', function (e) {
        if (e.target === this) {
            closeImageModal();
        }
    });
});
// FIN: SISTEMA DE MODAL DE IMÁGENES

// ===== CARRUSEL HERO / MODO OSCURO / MENÚ MÓVIL / BARRA DE ANUNCIOS (Mantenido) =====

class HeroCarousel {
    constructor() {
        this.slides = document.querySelectorAll('.carousel-slide');
        this.indicators = document.querySelectorAll('.carousel-indicator');
        this.prevBtn = document.querySelector('.carousel-prev');
        this.nextBtn = document.querySelector('.carousel-next');
        
        if (!this.slides.length || !this.indicators.length || !this.prevBtn || !this.nextBtn) {
            console.log('Elementos del carrusel Hero no encontrados. Carrusel no inicializado.');
            return;
        }

        this.currentSlide = 0;
        this.slideInterval = null;
        this.slideDuration = 5000;

        this.init();
    }

    init() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        this.startAutoplay();

        const carousel = document.querySelector('.hero-carousel');
        if(carousel) {
            carousel.addEventListener('mouseenter', () => this.stopAutoplay());
            carousel.addEventListener('mouseleave', () => this.startAutoplay());
            carousel.addEventListener('touchstart', () => this.stopAutoplay(), { passive: true });
        }
    }

    showSlide(index) {
        this.slides[this.currentSlide].classList.remove('active');
        this.indicators[this.currentSlide].classList.remove('active');

        this.currentSlide = index;

        this.slides[this.currentSlide].classList.add('active');
        this.indicators[this.currentSlide].classList.add('active');
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(nextIndex);
    }

    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prevIndex);
    }

    goToSlide(index) {
        this.showSlide(index);
    }

    startAutoplay() {
        this.stopAutoplay();
        this.slideInterval = setInterval(() => this.nextSlide(), this.slideDuration);
    }

    stopAutoplay() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }
}

function initDarkMode() {
    const body = document.body;
    const darkToggle = document.getElementById('darkToggle');
    
    if (!darkToggle) return;

    const isSavedDark = localStorage.getItem('lisport_dark') === '1';

    setDark(isSavedDark);

    darkToggle.addEventListener('click', () => {
        setDark(!body.classList.contains('dark'));
    });
}

function setDark(shouldBeDark) {
    const body = document.body;
    const darkIcon = document.getElementById('darkIcon');

    if (shouldBeDark) {
        body.classList.add('dark');
        if (darkIcon) darkIcon.textContent = '☀️';
        localStorage.setItem('lisport_dark', '1');
    } else {
        body.classList.remove('dark');
        if (darkIcon) darkIcon.textContent = '🌙';
        localStorage.setItem('lisport_dark', '0');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeMenu = document.getElementById('closeMenu');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');

    function toggleMobileMenu() {
        if (!mobileMenu || !mobileOverlay) return;
        const isOpening = !mobileMenu.classList.contains('open');

        if (isOpening) {
            mobileMenu.classList.add('open');
            mobileOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        } else {
            mobileMenu.classList.remove('open');
            mobileOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    if (mobileMenuBtn && closeMenu && mobileMenu && mobileOverlay) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        closeMenu.addEventListener('click', toggleMobileMenu);
        mobileOverlay.addEventListener('click', toggleMobileMenu);

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', toggleMobileMenu);
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
            toggleMobileMenu();
        }
    });
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('lisport_dark')) {
        setDark(e.matches);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.announcement-slide');
    if (slides.length === 0) return;

    let currentSlide = 0;
    const intervalTime = 4000;

    function nextAnnouncement() {
        slides[currentSlide].classList.remove('active');
        slides[currentSlide].classList.add('opacity-0');

        currentSlide = (currentSlide + 1) % slides.length;

        slides[currentSlide].classList.remove('opacity-0');
        slides[currentSlide].classList.add('active');
    }

    let slideInterval = setInterval(nextAnnouncement, intervalTime);
});
