// ===== DECLARAR LAS VARIABLES PRIMERO =====
let supabaseClient;
let isAuthenticated = false;
let currentProducts = []; // Almacena todos los productos originales
let isEditing = false;
let currentEditId = null;
let imageFiles = [];

// Hash de la contraseña "admin123"
const PASSWORD_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

// Elementos del DOM
const statusEl = document.getElementById('status');
const prodIdInput = document.getElementById('prod-id');
const imagesPreview = document.getElementById('images-preview');
const fileInput = document.getElementById('imagenes-file');
const uploadArea = document.getElementById('upload-area');

// Contenedor de la lista de productos
const productListContainer = document.getElementById('list');
// Filtros
const searchInputAdmin = document.getElementById('search-products-admin');
const filterCategoryAdmin = document.getElementById('filter-category-admin');
const filterFeaturedAdmin = document.getElementById('filter-featured-admin');

// ===== NUEVO: Mapa de colores (tomado de catalogo.js) =====
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


// ===== INICIALIZACIÓN AL CARGAR LA PÁGINA =====
document.addEventListener('DOMContentLoaded', function () {
    // ===== CONFIGURACIÓN SUPABASE =====
    const SUPABASE_URL = 'https://qlkbqotipjtitrlskacv.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsa2Jxb3RpcGp0aXRybHNrYWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjE5NDAsImV4cCI6MjA3Nzk5Nzk0MH0.oYFxx5y1-KlQ4Fqjn_Cub4Dyd-2wC17m59EWyWLKCDA';

    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // ===== CONFIGURACIÓN DE EVENT LISTENERS =====
    document.getElementById('create-btn').addEventListener('click', saveProduct);
    document.getElementById('clear-btn').addEventListener('click', clearForm);
    document.getElementById('refresh-btn').addEventListener('click', loadProductList);
    document.getElementById('admin-password').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') verificarPassword();
    });

    // LISTENERS DE FILTROS EN EL ADMIN
    if (searchInputAdmin) searchInputAdmin.addEventListener('input', applyFilters);
    if (filterCategoryAdmin) filterCategoryAdmin.addEventListener('change', applyFilters);
    if (filterFeaturedAdmin) filterFeaturedAdmin.addEventListener('change', applyFilters);

    // [Inicialización de Dark Mode y Menú Móvil se mantienen]
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedPreference = localStorage.getItem('lisport_dark');

    if (storedPreference === '1' || (!storedPreference && prefersDark)) {
        setDark(true);
    }

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeMenu = document.getElementById('closeMenu');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');

    function toggleMobileMenu() {
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

    const darkToggle = document.getElementById('darkToggle');
    if (darkToggle) {
        darkToggle.addEventListener('click', () => {
            setDark(!document.body.classList.contains('dark'));
        });
    }

    // Efecto RGB interactivo para el login
    initLoginEffects();
});

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

// ===== SISTEMA DE AUTENTICACIÓN CON HASH =====
async function verificarPassword() {
    const inputPassword = document.getElementById('admin-password').value;
    const errorMsg = document.getElementById('error-msg');

    if (!inputPassword) {
        errorMsg.textContent = 'Por favor ingresa una contraseña';
        errorMsg.style.display = 'block';
        return;
    }

    const inputHash = await generarHash(inputPassword);

    if (inputHash === PASSWORD_HASH) {
        isAuthenticated = true;
        document.getElementById('loginBox').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        inicializarPanelAdmin();
    } else {
        errorMsg.style.display = 'block';
        document.getElementById('admin-password').value = '';
        document.getElementById('admin-password').focus();
    }
}

async function generarHash(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function cerrarSesion() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        isAuthenticated = false;
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('loginBox').style.display = 'flex';
        document.getElementById('admin-password').value = '';
        document.getElementById('error-msg').style.display = 'none';
        clearForm();
        showStatus('Sesión cerrada correctamente', 'success');
    }
}

// ===== LÓGICA DE FILTRADO EN ADMIN (NUEVO) =====

function applyFilters() {
    const searchTerm = searchInputAdmin.value.toLowerCase().trim();
    const categoryFilter = filterCategoryAdmin.value;
    const featuredFilter = filterFeaturedAdmin.value;

    // 1. Filtrar los productos cargados
    let filtered = currentProducts.filter(product => {
        const nameMatch = product.nombre.toLowerCase().includes(searchTerm);
        const idMatch = product.id ? product.id.toLowerCase().includes(searchTerm) : false;
        const searchMatch = nameMatch || idMatch;

        const categoryMatch = !categoryFilter || product.categoria === categoryFilter;

        const featuredMatch = !featuredFilter ||
            (featuredFilter === 'true' && product.destacado === true) ||
            (featuredFilter === 'false' && (product.destacado === false || product.destacado === null || product.destacado === undefined));

        return searchMatch && categoryMatch && featuredMatch;
    });

    // 2. Renderizar la lista filtrada
    renderProductList(filtered);
}

// ===== FUNCIONES PRINCIPALES CON SUPABASE (Corregidas) =====

// ===== SISTEMA DE IMÁGENES Y CRUD [Se mantienen las funciones existentes] =====

function inicializarSistemaImagenes() {
    if (!uploadArea || !fileInput) return;

    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('border-pink-400', 'bg-pink-50', 'dark:bg-pink-900/20');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('border-pink-400', 'bg-pink-50', 'dark:bg-pink-900/20');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-pink-400', 'bg-pink-50', 'dark:bg-pink-900/20');
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect();
        }
    });
}

function handleFileSelect() {
    const files = fileInput.files;
    if (files.length === 0) return;

    if (files.length > 10) {
        showStatus('Máximo 10 imágenes permitidas', 'error');
        return;
    }

    const invalidFiles = Array.from(files).filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
        showStatus('Solo se permiten archivos de imagen', 'error');
        return;
    }

    imageFiles = Array.from(files);
    mostrarPreviews();
    showStatus(`${imageFiles.length} imagen(es) seleccionada(s)`, 'success');
}

function mostrarPreviews() {
    if (!imagesPreview) return;
    imagesPreview.innerHTML = '';
    imageFiles.forEach((file, index) => {
        const url = URL.createObjectURL(file);
        addImagePreview(url, file.name, index);
    });
}

function addImagePreview(url, filename, index) {
    if (!imagesPreview) return;

    const preview = document.createElement('div');
    preview.className = 'image-preview';
    preview.innerHTML = `
                <img src="${url}" alt="${filename}" class="w-full h-24 object-cover" onerror="this.src='https://via.placeholder.com/150x100?text=Error'">
                <button class="remove-image-btn" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
                <div class="p-2 text-xs text-medium-contrast truncate bg-white dark:bg-gray-800">${filename.substring(0, 15)}...</div>
            `;
    imagesPreview.appendChild(preview);

    preview.querySelector('.remove-image-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        removeImage(index);
    });
}

function removeImage(index) {
    imageFiles.splice(index, 1);
    mostrarPreviews();
    showStatus('Imagen eliminada', 'success');
}

async function subirImagenes() {
    if (imageFiles.length === 0) return [];

    showStatus('Subiendo imágenes...', 'loading');
    const uploadedUrls = [];

    for (const file of imageFiles) {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `productos/${fileName}`;

            const { data, error } = await supabaseClient.storage
                .from('images')
                .upload(filePath, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabaseClient.storage
                .from('images')
                .getPublicUrl(filePath);

            uploadedUrls.push(publicUrl);

        } catch (error) {
            console.error('Error subiendo imagen:', error);
            showStatus('Error subiendo algunas imágenes', 'error');
        }
    }

    showStatus(`${uploadedUrls.length} imagen(es) subida(s) correctamente`, 'success');
    return uploadedUrls;
}

async function saveProduct() {
    if (!supabaseClient) {
        showStatus('Error: Base de datos no inicializada', 'error');
        return;
    }

    // --- (Toda la validación de campos se queda igual) ---
    const nombre = document.getElementById('nombre')?.value.trim();
    const descripcion = document.getElementById('descripcion')?.value.trim();
    const precio = document.getElementById('precio')?.value.trim();
    const cantidad = document.getElementById('cantidad')?.value.trim();
    const categoria = document.getElementById('categoria')?.value;

    const tallasCheckboxes = document.querySelectorAll('input[name="tallas"]:checked');
    const tallasDisponibles = Array.from(tallasCheckboxes).map(cb => cb.value);
    
    const coloresCheckboxes = document.querySelectorAll('input[name="colores"]:checked');
    const coloresDisponibles = Array.from(coloresCheckboxes).map(cb => cb.value);

    const destacado = document.getElementById('destacado')?.checked || false;

    if (!nombre) { showStatus('El nombre del producto es obligatorio', 'error'); return; }
    if (!precio || isNaN(parseFloat(precio)) || parseFloat(precio) < 0) { showStatus('El precio debe ser un número válido mayor o igual a 0', 'error'); return; }
    if (!cantidad || isNaN(parseInt(cantidad)) || parseInt(cantidad) < 0) { showStatus('La cantidad debe ser un número válido mayor o igual a 0', 'error'); return; }
    if (!categoria) { showStatus('Selecciona una categoría', 'error'); return; }
    if (tallasDisponibles.length === 0) { showStatus('Selecciona al menos una talla disponible', 'error'); return; }


    showStatus(isEditing ? 'Actualizando producto...' : 'Creando producto...', 'loading');

    try {
        
        // --- INICIO DE LA CORRECCIÓN ---

        // 1. Construimos el objeto de datos SIN las imágenes
        const productData = {
            nombre,
            descripcion,
            precio: parseFloat(precio),
            cantidad: parseInt(cantidad),
            categoria,
            tallas_disponibles: tallasDisponibles,
            colores_disponibles: coloresDisponibles,
            destacado: destacado
        };

        if (!isEditing || imageFiles.length > 0) {
            const imagenesUrls = await subirImagenes();
            productData.imagenes = imagenesUrls; 
        }
        
        
        let result;

        if (isEditing) {
            // productData aquí solo contiene 'imagenes' si se subieron nuevas.
            result = await supabaseClient
                .from('productos')
                .update(productData) 
                .eq('id', currentEditId);
        } else {
            // productData aquí siempre contiene 'imagenes' (nuevas o un array vacío).
            result = await supabaseClient
                .from('productos')
                .insert([productData]);
        }

        if (result.error) throw result.error;

        showStatus((isEditing ? 'Producto actualizado' : 'Producto creado') + ' correctamente', 'success');

        await loadProductList();
        clearForm();

    } catch (error) {
        console.error('Error guardando producto:', error);
        showStatus('Error al guardar el producto: ' + error.message, 'error');
    }
}

async function loadProductList() {
    if (!productListContainer) return;

    if (!supabaseClient) {
        console.error('supabaseClient no está inicializado');
        showProductListError(new Error('Conexión a base de datos no disponible'));
        return;
    }

    try {
        productListContainer.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin text-pink-500"></i> Cargando productos...</div>';

        // Cargar TODOS los productos para que el filtro JS funcione correctamente
        const { data: products, error } = await supabaseClient
            .from('productos')
            .select('*')
            .order('creado_en', { ascending: false });

        if (error) throw error;

        currentProducts = products || []; // Almacenamos el master list
        applyFilters(); // Aplicamos los filtros actuales al master list

    } catch (error) {
        console.error('Error cargando productos:', error);
        showProductListError(error);
    }
}

async function deleteProduct(id) {
    const product = currentProducts.find(p => p.id === id);

    if (!product) {
        showStatus('Producto no encontrado', 'error');
        return;
    }

    const productName = product.nombre || 'este producto';

    if (!confirm(`¿Estás seguro de que quieres eliminar "${productName}"? Esta acción no se puede deshacer.`)) {
        return;
    }

    showStatus('Eliminando producto...', 'loading');

    try {
        const { error } = await supabaseClient
            .from('productos')
            .delete()
            .eq('id', id);

        if (error) throw error;

        showStatus('Producto eliminado correctamente', 'success');

        await loadProductList(); // Recarga la lista completa

        if (isEditing && currentEditId === id) {
            clearForm();
        }

    } catch (error) {
        console.error('Error eliminando producto:', error);
        showStatus('Error al eliminar el producto: ' + error.message, 'error');
    }
}

function editProduct(id) {
    const product = currentProducts.find(p => p.id === id);

    if (!product) {
        showStatus('Producto no encontrado', 'error');
        return;
    }

    if (prodIdInput) prodIdInput.value = product.id;
    if (document.getElementById('nombre')) document.getElementById('nombre').value = product.nombre || '';
    if (document.getElementById('descripcion')) document.getElementById('descripcion').value = product.descripcion || '';
    if (document.getElementById('precio')) document.getElementById('precio').value = product.precio || '';
    if (document.getElementById('cantidad')) document.getElementById('cantidad').value = product.cantidad || '';
    if (document.getElementById('categoria')) document.getElementById('categoria').value = product.categoria || '';

    
    // --- INICIO DE LA CORRECCIÓN ---

    // 1. Resetear y marcar Tallas (CON PARSEO)
    document.querySelectorAll('input[name="tallas"]').forEach(cb => {
        cb.checked = false;
    });

    let tallas_array = [];
    if (typeof product.tallas_disponibles === 'string') {
        try { tallas_array = JSON.parse(product.tallas_disponibles); } catch (e) { tallas_array = []; }
    } else if (Array.isArray(product.tallas_disponibles)) {
        tallas_array = product.tallas_disponibles;
    }

    if (tallas_array.length > 0) {
        tallas_array.forEach(talla => {
            const checkbox = document.querySelector(`input[name="tallas"][value="${talla}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }

    // 2. Cargar y marcar Colores (CON PARSEO)
    let colores_array = [];
    if (typeof product.colores_disponibles === 'string') {
        try { colores_array = JSON.parse(product.colores_disponibles); } catch (e) { colores_array = []; }
    } else if (Array.isArray(product.colores_disponibles)) {
        colores_array = product.colores_disponibles;
    }
    
    renderColorCheckboxes(colores_array); // Llamar a la función con el array parseado

    // --- FIN DE LA CORRECCIÓN ---


    if (document.getElementById('destacado')) {
        document.getElementById('destacado').checked = product.destacado || false;
    }

    imageFiles = [];
    if (imagesPreview) imagesPreview.innerHTML = '';

    if (product.imagenes && product.imagenes.length > 0) {
        product.imagenes.forEach((url, index) => {
            addImagePreview(url, `Imagen ${index + 1}`, index);
        });
    }

    isEditing = true;
    currentEditId = product.id;

    showStatus('Editando producto: ' + product.nombre, 'success');
    if (document.getElementById('prod-id')) {
        document.getElementById('prod-id').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// ===== FUNCIONES AUXILIARES DE RENDERIZADO =====

/**
 * NUEVA FUNCIÓN: Renderiza los checkboxes de colores en el formulario.
 * @param {string[]} selectedColors - Un array de nombres de colores a marcar como 'checked'.
 */
function renderColorCheckboxes(selectedColors = []) {
    // El div id="colores-container" debe existir en admin.html
    const coloresContainer = document.getElementById('colores-container');
    if (!coloresContainer) {
        console.error('No se encontró el #colores-container');
        return;
    }

    // Aplicamos la clase base 'sizes-container' para que se vea en varias columnas
    coloresContainer.className = 'sizes-container'; 

    let html = '';
    // Iterar sobre el colorMap en lugar de ALL_COLORS
    for (const colorName in colorMap) {
        const colorHex = colorMap[colorName];
        const isChecked = selectedColors.includes(colorName);
        
        // Lógica especial para bordes en colores claros
        let borderStyle = 'border: 1px solid rgba(0, 0, 0, 0.2);';
        const upperHex = colorHex.toUpperCase();
        if (upperHex === '#FFFFFF' || upperHex === '#FFFDD0' || upperHex === '#F5F5DC' || upperHex === '#E6E6FA' || upperHex === '#FFE5B4') {
            borderStyle = 'border: 1px solid #A0AEC0;'; // Un borde gris para colores muy claros
        }

        html += `
            <label class="color-checkbox-label">
                <input type="checkbox" name="colores" value='${colorName}' class="hidden-checkbox" ${isChecked ? 'checked' : ''}>
                <span class="color-dot" style="background-color: ${colorHex}; ${borderStyle}"></span>
                <span class="color-name">${colorName}</span>
            </label>
        `;
    }
    coloresContainer.innerHTML = html;
    
    // Añadir listeners para el estado visual
    coloresContainer.querySelectorAll('.color-checkbox-label').forEach(label => {
        const input = label.querySelector('input');
        
        function updateVisualState() {
            if (input.checked) {
                label.classList.add('selected');
            } else {
                label.classList.remove('selected');
            }
        }
        
        // Asignar estado inicial
        updateVisualState(); 
        
        // Actualizar al hacer clic
        label.addEventListener('click', (e) => {
            // setTimeout 0 para permitir que el estado 'checked' del navegador se actualice primero
            setTimeout(updateVisualState, 0);
        });
    });
}


function clearForm() {
    if (prodIdInput) prodIdInput.value = '';
    if (document.getElementById('nombre')) document.getElementById('nombre').value = '';
    if (document.getElementById('descripcion')) document.getElementById('descripcion').value = '';
    if (document.getElementById('precio')) document.getElementById('precio').value = '';
    if (document.getElementById('cantidad')) document.getElementById('cantidad').value = '';
    if (document.getElementById('categoria')) document.getElementById('categoria').value = '';

    document.querySelectorAll('input[name="tallas"]').forEach(cb => {
        cb.checked = false;
    });
    
    // --- NUEVO: Limpiar colores con la nueva función ---
    renderColorCheckboxes([]); // Llama con un array vacío para deseleccionar todo

    if (document.getElementById('destacado')) {
        document.getElementById('destacado').checked = false;
    }

    if (imagesPreview) imagesPreview.innerHTML = '';
    imageFiles = [];
    if (fileInput) fileInput.value = '';

    isEditing = false;
    currentEditId = null;

    showStatus('Formulario listo para nuevo producto', 'success');
}

// ==========================================================
// === FUNCIÓN renderProductList (CORREGIDA) ===
// ==========================================================
function renderProductList(products) {
    const list = document.getElementById('list');
    if (!list) return;

    if (products.length === 0) {
        list.innerHTML = `
                <div class="text-center py-8 text-medium-contrast">
                    <i class="fas fa-box-open text-4xl mb-3"></i>
                    <p class="text-lg">No se encontraron productos con estos filtros</p>
                    <p class="text-sm">Intenta buscar por otro nombre o categoría.</p>
                </div>
            `;
        return;
    }

    list.innerHTML = products.map(product => {
        const imagenPrincipal = product.imagenes && product.imagenes.length > 0 ? product.imagenes[0] : '';
        const imageCount = product.imagenes ? product.imagenes.length : 0;
        const hasMultipleImages = imageCount > 1;

        // --- INICIO DE LA CORRECCIÓN DE PARSEO ---
        
        // 1. Parsear Tallas
        let tallas_array = [];
        if (typeof product.tallas_disponibles === 'string') {
            try { tallas_array = JSON.parse(product.tallas_disponibles); } catch (e) { tallas_array = []; }
        } else if (Array.isArray(product.tallas_disponibles)) {
            tallas_array = product.tallas_disponibles;
        }
        
        const allSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL']; // Todas las tallas posibles
        const availableSizes = tallas_array.map(s => s.toUpperCase()); // Tallas del producto

        const tallasHTML = allSizes.map(size => {
            const isAvailable = availableSizes.includes(size);
            // Aplicar estilo 'disponible' o 'no disponible'
            const tagClass = `admin-size-tag ${isAvailable ? 'admin-size-available' : 'admin-size-unavailable'}`;
            return `<span class="${tagClass}">${size}</span>`;
        }).join('');
        
        // 2. Parsear Colores
        let colores_array = [];
        if (typeof product.colores_disponibles === 'string') {
            try { colores_array = JSON.parse(product.colores_disponibles); } catch (e) { colores_array = []; }
        } else if (Array.isArray(product.colores_disponibles)) {
            colores_array = product.colores_disponibles;
        }

        // Generar HTML para los colores (sólo si existen)
        const coloresHTML = (colores_array.length > 0)
            ? colores_array.map(colorName => {
                const colorHex = colorMap[colorName] || '#E0E0E0';
                let borderStyle = 'border: 1px solid rgba(0, 0, 0, 0.2);';
                const upperHex = colorHex.toUpperCase();
                if (['#FFFFFF', '#FFFDD0', '#F5F5DC', '#E6E6FA', '#FFE5B4'].includes(upperHex)) {
                    borderStyle = 'border: 1px solid #A0AEC0;';
                }
                return `
                    <div class="admin-color-display">
                        <span class="admin-color-dot" style="background-color: ${colorHex}; ${borderStyle}"></span>
                        <span class="admin-color-name">${colorName}</span>
                    </div>
                `;
            }).join('')
            : '';

        // --- FIN DE LA CORRECCIÓN DE PARSEO ---

        return `
                <div class="glass-card p-4 rounded-lg border border-gray-200 dark:border-gray-600 product-card">
                    <div class="flex flex-col md:flex-row md:items-center gap-4">
                        <div class="flex-shrink-0 relative">
                            <img src="${imagenPrincipal || 'https://via.placeholder.com/100x75?text=Sin+img'}" 
                                 alt="${product.nombre}" 
                                 class="w-20 h-20 object-cover rounded-lg"
                                 onerror="this.src='https://via.placeholder.com/100x75?text=Error'">
                            ${hasMultipleImages ? `<span class="image-count-badge">+${imageCount - 1}</span>` : ''}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                <div>
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <h3 class="font-semibold text-high-contrast truncate">${product.nombre}</h3>
                                        ${product.destacado ? '<span class="featured-badge"><i class="fas fa-star"></i> Destacado</span>' : ''}
                                        
                                        ${coloresHTML ? `
                                            <div class="flex items-center flex-wrap gap-2 text-sm text-medium-contrast">
                                                <span class="text-xs font-medium whitespace-nowrap">Colores:</span>
                                                <div class="flex items-center gap-2">
                                                    ${coloresHTML}
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                    <p class="text-sm text-medium-contrast mt-1 line-clamp-2">${product.descripcion || 'Sin descripción'}</p>
                                    <div class="flex flex-wrap items-center gap-3 mt-2 text-sm">
                                        <span class="bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 px-2 py-1 rounded-full text-xs font-medium">
                                            ${product.categoria}
                                        </span>
                                        <span class="font-bold text-green-600 dark:text-green-400">$${product.precio}</span>
                                        <span class="font-medium ${product.cantidad > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                                            ${product.cantidad} disponibles
                                        </span>
                                        <span class="text-medium-contrast">ID: ${product.id.substring(0, 8)}...</span>
                                        
                                        <div class="flex items-center flex-wrap gap-1">
                                            ${tallasHTML}
                                        </div>
                                    </div>
                                </div>
                                <div class="flex gap-2">
                                    <button class="edit-btn bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                                            data-id="${product.id}">
                                        <i class="fas fa-edit mr-1"></i>Editar
                                    </button>
                                    <button class="del-btn bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                                            data-id="${product.id}">
                                        <i class="fas fa-trash mr-1"></i>Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }).join('');

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            editProduct(id);
        });
    });

    document.querySelectorAll('.del-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            deleteProduct(id);
        });
    });
}
// ==========================================================
// === FIN DE LA FUNCIÓN CORREGIDA ===
// ==========================================================


function showProductListError(err) {
    const list = document.getElementById('list');
    if (!list) return;

    list.innerHTML = `
            <div class="text-center py-8 text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <i class="fas fa-exclamation-triangle text-2xl mb-3"></i>
                <p class="font-semibold mb-2">Error al cargar productos</p>
                <p class="text-sm mb-3">${err.message}</p>
                <div class="flex flex-col sm:flex-row gap-2 justify-center">
                    <button onclick="loadProductList()" class="bg-pink-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-600 transition">
                        <i class="fas fa-sync-alt mr-2"></i>Reintentar
                    </button>
                    <button onclick="location.reload()" class="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition">
                        <i class="fas fa-redo mr-2"></i>Recargar página
                    </button>
                </div>
            </div>
        `;
}

function showStatus(message, type) {
    const statusEl = document.getElementById('status');
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.className = 'mt-4 text-sm text-center p-3 rounded-lg ';

    switch (type) {
        case 'success':
            statusEl.className += 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700';
            break;
        case 'error':
            statusEl.className += 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700';
            break;
        case 'loading':
            statusEl.className += 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700';
            break;
        default:
            statusEl.className += 'bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }

    if (type === 'success') {
        setTimeout(() => {
            if (statusEl.textContent === message) {
                statusEl.textContent = '';
                statusEl.className = 'mt-4 text-sm text-center p-3 rounded-lg';
            }
        }, 5000);
    }
}


function inicializarPanelAdmin() {
    console.log('Panel admin inicializado con Supabase');

    try {
        inicializarSistemaImagenes();
        renderColorCheckboxes(); // --- NUEVO: Llama para cargar los colores ---
        loadProductList(); // Carga inicial de productos
        showStatus('Panel cargado correctamente con Supabase', 'success');
    } catch (error) {
        console.error('Error inicializando panel:', error);
        showStatus('Error al cargar productos. Verifica tu conexión a internet.', 'error');
    }
}
// Efecto RGB interactivo para el login
function initLoginEffects() {
    const loginContainer = document.querySelector('.login-box-border-rgb'); // Corregido para que coincida con tu HTML
    const passwordInput = document.getElementById('admin-password'); // Corregido para que coincida con tu HTML

    if (loginContainer && passwordInput) {
        // Efecto al enfocar el input
        passwordInput.addEventListener('focus', function () {
            // Puedes añadir clases o estilos aquí
            loginContainer.style.boxShadow = '0 0 15px 5px rgba(255, 76, 122, 0.7)'; // Ejemplo de efecto
        });

        passwordInput.addEventListener('blur', function () {
            // Quitar clases o estilos
            loginContainer.style.boxShadow = 'none'; // Quitar efecto
        });
    }
}