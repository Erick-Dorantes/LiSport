// API Base URL
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// Check if user is already logged in
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (token && window.location.pathname.includes('admin-login')) {
        window.location.href = 'admin-dashboard.html';
    } else if (!token && window.location.pathname.includes('admin-dashboard')) {
        window.location.href = 'admin-login.html';
    }
}

// Login function
async function login(username, password) {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('adminToken', data.token);
            window.location.href = 'admin-dashboard.html';
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Error de conexión', 'error');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'admin-login.html';
}

// Change password function
async function changePassword(currentPassword, newPassword) {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE}/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Contraseña actualizada correctamente', 'success', 'passwordMessage');
            document.getElementById('passwordForm').reset();
        } else {
            showMessage(data.message, 'error', 'passwordMessage');
        }
    } catch (error) {
        console.error('Password change error:', error);
        showMessage('Error de conexión', 'error', 'passwordMessage');
    }
}

// Show message function
function showMessage(message, type, elementId = 'loginMessage') {
    const messageElement = document.getElementById(elementId);
    messageElement.innerHTML = `
        <div style="padding: 10px; border-radius: 5px; background: ${
            type === 'success' ? '#d4edda' : '#f8d7da'
        }; color: ${
            type === 'success' ? '#155724' : '#721c24'
        }; border: 1px solid ${
            type === 'success' ? '#c3e6cb' : '#f5c6cb'
        };">
            ${message}
        </div>
    `;
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageElement.innerHTML = '';
        }, 3000);
    }
}

// Event Listeners for Login Page
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            login(username, password);
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Change password form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword !== confirmPassword) {
                showMessage('Las contraseñas no coinciden', 'error', 'passwordMessage');
                return;
            }
            
            if (newPassword.length < 6) {
                showMessage('La contraseña debe tener al menos 6 caracteres', 'error', 'passwordMessage');
                return;
            }
            
            changePassword(currentPassword, newPassword);
        });
    }
});