// Este código maneja el modo oscuro y el menú móvil para contacto.html

// ===== MODO OSCURO (CLARO POR DEFECTO) =====
function initDarkMode() {
    const body = document.body;
    const darkToggle = document.getElementById('darkToggle');
    
    // Verificamos si el botón existe
    if (!darkToggle) return;

    // 1. LÓGICA: Solo activamos modo oscuro si hay un valor '1' guardado.
    const isSavedDark = localStorage.getItem('lisport_dark') === '1';

    // Aplicar el modo inicial
    setDark(isSavedDark);

    // 2. Escuchar el clic del botón
    darkToggle.addEventListener('click', () => {
        setDark(!body.classList.contains('dark'));
    });
}

function setDark(shouldBeDark) {
    const body = document.body;
    const darkIcon = document.getElementById('darkIcon');

    if (shouldBeDark) {
        // Activar Modo Oscuro
        body.classList.add('dark');
        if (darkIcon) darkIcon.textContent = '☀️'; // Sol
        localStorage.setItem('lisport_dark', '1'); // Guardar
    } else {
        // Activar Modo Claro
        body.classList.remove('dark');
        if (darkIcon) darkIcon.textContent = '🌙'; // Luna
        localStorage.setItem('lisport_dark', '0'); // Guardar
    }
}

// ===== MENÚ MÓVIL (FUNCIÓN DE INICIALIZACIÓN) =====
function initMobileMenu() {
    // Definiciones de elementos (dentro de la función para asegurar que existen)
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeMenu = document.getElementById('closeMenu');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');

    if (!mobileMenuBtn) return; // Si el botón principal no existe, salimos

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

    // --- ESCUCHADORES DE EVENTOS ---
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    
    if (closeMenu) closeMenu.addEventListener('click', toggleMobileMenu);
    if (mobileOverlay) mobileOverlay.addEventListener('click', toggleMobileMenu);

    // Cerrar menú al hacer clic en enlaces
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', toggleMobileMenu);
    });

    // Cerrar con Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            toggleMobileMenu();
        }
    });
}

// ===== PUNTO DE ENTRADA (Asegura que el DOM esté cargado) =====
document.addEventListener('DOMContentLoaded', function () {
    initDarkMode(); // Ahora funciona
    initMobileMenu(); // Ahora funciona
});