// ===== MODO OSCURO (CLARO POR DEFECTO) =====
function initDarkMode() {
    // Definiciones locales dentro de la función de inicialización
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

// Menú móvil CORREGIDO
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const closeMenu = document.getElementById('closeMenu');
const mobileMenu = document.getElementById('mobileMenu');
const mobileOverlay = document.getElementById('mobileOverlay');

// VERIFICACIÓN: Asegúrate de que estos elementos existan antes de agregar listeners
if (mobileMenuBtn && closeMenu && mobileMenu && mobileOverlay) {
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

    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    closeMenu.addEventListener('click', toggleMobileMenu);
    mobileOverlay.addEventListener('click', toggleMobileMenu);

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


// Animación de aparición para elementos
function animateOnScroll() {
    const elements = document.querySelectorAll('.feature-card, .value-card');

    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
            element.style.opacity = "1";
            element.style.transform = "translateY(0)";
        }
    });
}

// Inicializar todas las funcionalidades al cargar el contenido
document.addEventListener('DOMContentLoaded', function () {
    // **********************************************
    // 🌟 INICIALIZACIÓN DEL MODO OSCURO (CORREGIDO)
    // **********************************************
    initDarkMode();

    // Configurar elementos para animación
    const elements = document.querySelectorAll('.feature-card, .value-card');
    elements.forEach(element => {
        element.style.opacity = "0";
        element.style.transform = "translateY(20px)";
        element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    });

    // Iniciar animación al cargar y al hacer scroll
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);
});