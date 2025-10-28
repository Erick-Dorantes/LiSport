// API Base URL
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

let currentProducts = [];

// Check authentication and load products
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadProducts();
    setupEventListeners();
    updateDashboardStats();
});

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'admin-login.html';
    }
}

// Setup event listeners
function setupEventListeners() {
    
    // Change password button
    document.getElementById('changePasswordBtn').addEventListener('click', function() {
        toggleForm('changePasswordForm');
    });
    
    // Add product button
    document.getElementById('addProductBtn').addEventListener('click', function() {
        resetProductForm();
        toggleForm('productForm');
    });
    
    // Search functionality
    document.getElementById('searchProduct').addEventListener('input', filterProducts);
    document.getElementById('filterCategory').addEventListener('change', filterProducts);
    document.getElementById('filterStock').addEventListener('change', filterProducts);
    
    // Image preview
    document.getElementById('productImage').addEventListener('change', function(e) {
        previewImage(e.target.files[0]);
    });
    
    // File upload area click
    document.querySelector('.file-upload').addEventListener('click', function() {
        document.getElementById('productImage').click();
    });
    
    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // Password form submission
    document.getElementById('passwordForm').addEventListener('submit', handlePasswordChange);
}

// Toggle form visibility
function toggleForm(formId) {
    const form = document.getElementById(formId);
    form.classList.toggle('active');
    
    // Scroll to form when opening
    if (form.classList.contains('active')) {
        setTimeout(() => {
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    // These would typically come from the API
    const totalProducts = currentProducts.length;
    const featuredProducts = currentProducts.filter(p => p.featured).length;
    const lowStockProducts = currentProducts.filter(p => p.stock < 10).length;
    
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('featuredProducts').textContent = featuredProducts;
    document.getElementById('lowStockProducts').textContent = lowStockProducts;
}

// Load products from API
async function loadProducts() {
    try {
        showLoadingState(true);
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE}/admin/products`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            currentProducts = await response.json();
            displayProducts(currentProducts);
            updateDashboardStats();
        } else if (response.status === 401) {
            logout();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showMessage('Error al cargar los productos', 'error', 'productsMessage');
    } finally {
        showLoadingState(false);
    }
}

// Display products in the table
function displayProducts(products) {
    const productsList = document.getElementById('productsList');
    
    if (products.length === 0) {
        productsList.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">
                    <i class="fas fa-box-open" style="font-size: 3rem; color: #ddd; margin-bottom: 15px; display: block;"></i>
                    <p>No se encontraron productos.</p>
                    <button class="admin-btn" onclick="resetProductForm(); toggleForm('productForm');" style="margin-top: 15px;">
                        <i class="fas fa-plus"></i> Agregar Primer Producto
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    productsList.innerHTML = products.map(product => `
        <tr>
            <td class="product-image-cell">
                <img src="${product.image || 'https://via.placeholder.com/60?text=LiSport'}" 
                     alt="${product.name}" 
                     class="product-image"
                     onerror="this.src='https://via.placeholder.com/60?text=LiSport'">
            </td>
            <td>
                <strong>${product.name}</strong>
                ${product.featured ? '<span class="featured-badge">Destacado</span>' : ''}
                <br>
                <small style="color: #666;">${product.description.substring(0, 50)}...</small>
            </td>
            <td>${getCategoryName(product.category)}</td>
            <td><strong>$${product.price}</strong></td>
            <td>
                <span class="${product.stock < 10 ? 'status-badge status-inactive' : 'status-badge status-active'}">
                    ${product.stock} unidades
                </span>
            </td>
            <td>${product.sizes.join(', ')}</td>
            <td>
                <span class="status-badge ${product.stock > 0 ? 'status-active' : 'status-inactive'}">
                    ${product.stock > 0 ? 'Activo' : 'Sin Stock'}
                </span>
            </td>
            <td>
                <div class="product-actions">
                    <button class="admin-btn small" onclick="editProduct('${product._id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="admin-btn small danger" onclick="deleteProduct('${product._id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Get category display name
function getCategoryName(category) {
    const categories = {
        'conjuntos': 'Conjuntos',
        'leggins': 'Leggings',
        'tops': 'Tops Deportivos',
        'enterizos': 'Enterizos',
        'calcetas': 'Calcetas',
        'sweaters': 'Sudaderas'
    };
    return categories[category] || category;
}

// Filter products based on search, category and stock
function filterProducts() {
    const searchTerm = document.getElementById('searchProduct').value.toLowerCase();
    const categoryFilter = document.getElementById('filterCategory').value;
    const stockFilter = document.getElementById('filterStock').value;
    
    const filteredProducts = currentProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                            product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        const matchesStock = !stockFilter || 
                           (stockFilter === 'low' && product.stock < 10) ||
                           (stockFilter === 'out' && product.stock === 0);
        
        return matchesSearch && matchesCategory && matchesStock;
    });
    
    displayProducts(filteredProducts);
}

// Reset product form for adding new product
function resetProductForm() {
    document.getElementById('productFormTitle').innerHTML = '<i class="fas fa-plus"></i> Agregar Nuevo Producto';
    document.getElementById('productFormElement').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productFormSubmit').innerHTML = '<i class="fas fa-save"></i> Guardar Producto';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('productMessage').style.display = 'none';
    
    // Reset checkboxes
    document.querySelectorAll('input[name="sizes"]').forEach(checkbox => {
        checkbox.checked = false;
    });
}

// Edit product
function editProduct(productId) {
    const product = currentProducts.find(p => p._id === productId);
    if (!product) return;
    
    document.getElementById('productFormTitle').innerHTML = '<i class="fas fa-edit"></i> Editar Producto';
    document.getElementById('productId').value = product._id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productFeatured').checked = product.featured;
    
    // Set checkboxes for sizes
    document.querySelectorAll('input[name="sizes"]').forEach(checkbox => {
        checkbox.checked = product.sizes.includes(checkbox.value);
    });
    
    // Show image preview if exists
    if (product.image) {
        document.getElementById('imagePreview').innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <p>Imagen actual del producto</p>
        `;
    } else {
        document.getElementById('imagePreview').innerHTML = '';
    }
    
    document.getElementById('productFormSubmit').innerHTML = '<i class="fas fa-save"></i> Actualizar Producto';
    toggleForm('productForm');
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE}/admin/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showMessage('Producto eliminado correctamente', 'success', 'productsMessage');
            loadProducts();
        } else {
            const data = await response.json();
            showMessage(data.message, 'error', 'productsMessage');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showMessage('Error al eliminar el producto', 'error', 'productsMessage');
    }
}

// Preview image before upload
function previewImage(file) {
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showMessage('La imagen es demasiado grande. Máximo 5MB.', 'error', 'productMessage');
            return;
        }
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            showMessage('Formato no válido. Use JPG, PNG o GIF.', 'error', 'productMessage');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Vista previa">
                <p>Vista previa de la nueva imagen</p>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
}

// Handle product form submission
document.getElementById('productFormElement').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const productId = document.getElementById('productId').value;
    const isEdit = !!productId;
    
    // Get selected sizes
    const sizes = [];
    document.querySelectorAll('input[name="sizes"]:checked').forEach(checkbox => {
        sizes.push(checkbox.value);
    });
    
    if (sizes.length === 0) {
        showMessage('Selecciona al menos una talla', 'error', 'productMessage');
        return;
    }
    
    // Append sizes as array
    formData.delete('sizes');
    sizes.forEach(size => {
        formData.append('sizes', size);
    });
    
    try {
        const submitBtn = document.getElementById('productFormSubmit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        submitBtn.disabled = true;
        
        const token = localStorage.getItem('adminToken');
        const url = isEdit 
            ? `${API_BASE}/admin/products/${productId}`
            : `${API_BASE}/admin/products`;
        
        const response = await fetch(url, {
            method: isEdit ? 'PUT' : 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            const message = isEdit ? 'Producto actualizado correctamente' : 'Producto agregado correctamente';
            showMessage(message, 'success', 'productMessage');
            
            if (!isEdit) {
                this.reset();
                document.getElementById('imagePreview').innerHTML = '';
            }
            
            loadProducts();
            
            // Auto-close form after successful operation
            setTimeout(() => {
                toggleForm('productForm');
                showMessage('', 'success', 'productMessage'); // Clear message
            }, 2000);
        } else {
            const data = await response.json();
            showMessage(data.message, 'error', 'productMessage');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showMessage('Error al guardar el producto', 'error', 'productMessage');
    } finally {
        const submitBtn = document.getElementById('productFormSubmit');
        submitBtn.innerHTML = isEdit ? '<i class="fas fa-save"></i> Actualizar Producto' : '<i class="fas fa-save"></i> Guardar Producto';
        submitBtn.disabled = false;
    }
});

// Handle password change
async function handlePasswordChange(e) {
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
    
    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
        submitBtn.disabled = true;
        
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE}/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        if (response.ok) {
            showMessage('Contraseña actualizada correctamente', 'success', 'passwordMessage');
            e.target.reset();
            
            setTimeout(() => {
                toggleForm('changePasswordForm');
                showMessage('', 'success', 'passwordMessage');
            }, 2000);
        } else {
            const data = await response.json();
            showMessage(data.message, 'error', 'passwordMessage');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showMessage('Error al cambiar la contraseña', 'error', 'passwordMessage');
    } finally {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Contraseña';
            submitBtn.disabled = false;
        }
    }
}

// Show loading state
function showLoadingState(loading) {
    const productsList = document.getElementById('productsList');
    if (loading) {
        productsList.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-color);"></i>
                    <p style="margin-top: 15px;">Cargando productos...</p>
                </td>
            </tr>
        `;
    }
}

// Show message function
function showMessage(message, type, elementId) {
    const messageElement = document.getElementById(elementId);
    if (!messageElement) return;
    
    if (message) {
        messageElement.textContent = message;
        messageElement.className = `admin-message message-${type}`;
        messageElement.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 5000);
        }
    } else {
        messageElement.style.display = 'none';
    }
}

// Logout function
function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('adminToken');
        window.location.href = 'admin-login.html';
    }
}

// Export products function (placeholder)
function exportProducts() {
    showMessage('Función de exportación en desarrollo', 'info', 'productsMessage');
    // In a real implementation, this would generate a CSV or Excel file
}

// Initialize file upload drag and drop
function initializeFileUpload() {
    const fileUpload = document.querySelector('.file-upload');
    const fileInput = document.getElementById('productImage');
    
    fileUpload.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--primary-color)';
        this.style.background = 'rgba(233, 30, 99, 0.1)';
    });
    
    fileUpload.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = '#ddd';
        this.style.background = '';
    });
    
    fileUpload.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '#ddd';
        this.style.background = '';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            previewImage(files[0]);
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeFileUpload();
});