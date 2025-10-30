# LiSport - Catálogo de Ropa Deportiva

## 🚀 Despliegue en Hostinger

### Prerrequisitos

- Cuenta de Hostinger con Node.js hosting
- Base de datos MongoDB (Hostinger o MongoDB Atlas)

### Pasos para el despliegue

1. **Subir archivos via FTP/File Manager**

   - Subir toda la carpeta `lisport/` a la raíz de tu hosting
2. **Configurar base de datos MongoDB**

   - En Panel de Hostinger → Databases → MongoDB
   - Crear nueva base de datos
   - Anotar: `MONGODB_URI`
3. **Configurar variables de entorno**

   - En Panel de Hostinger → Node.js → Environment Variables
   - Agregar:
     - `MONGODB_URI=tu_url_de_mongodb`
     - `JWT_SECRET=tu_clave_secreta_segura`
     - `NODE_ENV=production`
4. **Instalar dependencias**

   - En Panel de Hostinger → Node.js → Console
   - Ejecutar: `npm install`
5. **Iniciar aplicación**

   - En Panel de Hostinger → Node.js
   - Application startup file: `server/index.js`
   - Node.js version: 18+ (recomendado)
   - Click "Restart"
6. **Verificar instalación**

   - Visitar: `tudominio.com`
   - Panel admin: `tudominio.com/admin`

### Credenciales por defecto

- Usuario: `admin`
- Contraseña: `admin123`

### Estructura de URLs

- Sitio principal: `/`
- Catálogo: `/categories.html`
- Productos: `/products.html`
- Admin Login: `/admin-login.html`
- Admin Panel: `/admin-dashboard.html`
- API: `/api/...`
# LiSport
